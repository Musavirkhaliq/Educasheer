import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { awardPoints, updateUserStreak, updateChallengeProgress } from "../services/gamification.service.js";
import mongoose from "mongoose";

// Create a schema for video progress if it doesn't exist
const VideoProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only have one progress record per video
VideoProgressSchema.index({ user: 1, video: 1 }, { unique: true });

// Create the model if it doesn't exist
const VideoProgress = mongoose.models.VideoProgress || mongoose.model("VideoProgress", VideoProgressSchema);

// Update video progress
const updateVideoProgress = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { progress } = req.body;
    const userId = req.user._id;

    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }

    if (progress === undefined || progress < 0 || progress > 100) {
      throw new ApiError(400, "Valid progress percentage (0-100) is required");
    }

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Find or create progress record
    let videoProgress = await VideoProgress.findOne({ user: userId, video: videoId });
    
    const isFirstWatch = !videoProgress;
    const wasCompleted = videoProgress?.completed || false;
    
    if (!videoProgress) {
      videoProgress = new VideoProgress({
        user: userId,
        video: videoId,
        progress: progress,
        completed: progress >= 90, // Mark as completed if progress is 90% or more
        lastWatched: new Date()
      });
    } else {
      // Update existing progress
      videoProgress.progress = Math.max(videoProgress.progress, progress); // Only update if new progress is higher
      videoProgress.completed = progress >= 90; // Mark as completed if progress is 90% or more
      videoProgress.lastWatched = new Date();
    }

    await videoProgress.save();

    // Award points for watching video if this is first time watching or completing
    if (isFirstWatch) {
      // Award points for starting a new video
      await awardPoints(
        userId,
        10,
        "video_watch",
        `Started watching video: ${video.title}`,
        {
          itemId: video._id,
          itemType: "Video"
        }
      );
      
      // Update streak and challenges
      await updateUserStreak(userId, ["video_watch"]);
      await updateChallengeProgress(userId, "video_watch", 1, {
        itemId: video._id,
        itemType: "Video"
      });
    }
    
    // Award additional points for completing the video (90% or more)
    if (!wasCompleted && videoProgress.completed) {
      await awardPoints(
        userId,
        25,
        "video_watch",
        `Completed video: ${video.title}`,
        {
          itemId: video._id,
          itemType: "Video"
        }
      );
    }

    return res.status(200).json(
      new ApiResponse(200, videoProgress, "Video progress updated successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Something went wrong while updating video progress");
  }
});

// Get video progress for a user
const getVideoProgress = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }

    // Find progress record
    const videoProgress = await VideoProgress.findOne({ user: userId, video: videoId });

    if (!videoProgress) {
      return res.status(200).json(
        new ApiResponse(200, { progress: 0, completed: false }, "No progress found for this video")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, videoProgress, "Video progress fetched successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Something went wrong while fetching video progress");
  }
});

// Get all video progress for a user
const getAllVideoProgress = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all progress records for the user
    const videoProgress = await VideoProgress.find({ user: userId })
      .populate("video", "title thumbnail duration videoId")
      .sort({ lastWatched: -1 });

    return res.status(200).json(
      new ApiResponse(200, videoProgress, "All video progress fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while fetching video progress");
  }
});

export {
  updateVideoProgress,
  getVideoProgress,
  getAllVideoProgress
};
