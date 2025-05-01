import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { getYouTubeVideoDetails } from "../utils/youtubeAPI.js";
import mongoose from "mongoose";

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

// Add a new video (admin and tutor only)
const addVideo = asyncHandler(async (req, res) => {
    try {
        const { videoUrl, title, description, category, tags } = req.body;

        // Check if user is admin or tutor
        if (req.user.role !== "admin" && req.user.role !== "tutor") {
            throw new ApiError(403, "Only admins and tutors can add videos");
        }

        // Validate input
        if (!videoUrl) {
            throw new ApiError(400, "Video URL is required");
        }

        // Extract YouTube video ID
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) {
            throw new ApiError(400, "Invalid YouTube URL");
        }

        // Check if video already exists
        const existingVideo = await Video.findOne({ videoId });
        if (existingVideo) {
            throw new ApiError(409, "Video already exists");
        }

        // Get video details from YouTube
        let videoDetails;
        try {
            videoDetails = await getYouTubeVideoDetails(videoId);
        } catch (error) {
            throw new ApiError(500, "Failed to fetch video details from YouTube");
        }

        // Create video
        const video = await Video.create({
            videoUrl,
            videoId,
            title: title || videoDetails.title,
            description: description || videoDetails.description,
            thumbnail: videoDetails.thumbnail,
            duration: videoDetails.duration,
            owner: req.user._id,
            category: category || "Uncategorized",
            tags: tags ? tags.split(",").map(tag => tag.trim()) : []
        });

        return res.status(201).json(
            new ApiResponse(201, video, "Video added successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding video");
    }
});

// Get all videos
const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        const filters = { isPublished: true };

        // Add category filter if provided
        if (category) {
            filters.category = category;
        }

        // Add search filter if provided
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const videos = await Video.find(filters)
            .populate("owner", "fullName username avatar")
            .skip((options.page - 1) * options.limit)
            .limit(options.limit)
            .sort(options.sort);

        const totalVideos = await Video.countDocuments(filters);

        return res.status(200).json(
            new ApiResponse(200, {
                videos,
                totalVideos,
                currentPage: options.page,
                totalPages: Math.ceil(totalVideos / options.limit)
            }, "Videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching videos");
    }
});

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            throw new ApiError(400, "Video ID is required");
        }

        const video = await Video.findById(videoId)
            .populate("owner", "fullName username avatar");

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // If video is not published, only allow owner or admin to view it
        if (!video.isPublished) {
            // For unauthenticated users, don't show unpublished videos
            if (!req.user) {
                throw new ApiError(403, "This video is not published yet");
            }

            // For authenticated users, check if they're the owner or admin
            if (video.owner._id.toString() !== req.user._id.toString() &&
                req.user.role !== "admin") {
                throw new ApiError(403, "This video is not published yet");
            }
        }

        // Increment view count
        video.views += 1;
        await video.save();

        // Add a flag to indicate if the user is authenticated
        const isAuthenticated = !!req.user;

        // Create a response object with the video data and authentication flag
        const responseData = {
            ...video.toObject(),
            isAuthenticated
        };

        return res.status(200).json(
            new ApiResponse(200, responseData, "Video fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching video");
    }
});

// Update video (admin and owner only)
const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { title, description, category, tags, isPublished } = req.body;

        if (!videoId) {
            throw new ApiError(400, "Video ID is required");
        }

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Check if user is admin or video owner
        if (req.user.role !== "admin" && video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this video");
        }

        // Update fields
        if (title) video.title = title;
        if (description) video.description = description;
        if (category) video.category = category;
        if (tags) video.tags = tags.split(",").map(tag => tag.trim());
        if (isPublished !== undefined) video.isPublished = isPublished;

        await video.save();

        return res.status(200).json(
            new ApiResponse(200, video, "Video updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating video");
    }
});

// Delete video (admin and owner only)
const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            throw new ApiError(400, "Video ID is required");
        }

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Check if user is admin or video owner
        if (req.user.role !== "admin" && video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to delete this video");
        }

        await Video.findByIdAndDelete(videoId);

        return res.status(200).json(
            new ApiResponse(200, {}, "Video deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting video");
    }
});

// Get videos by owner
const getVideosByOwner = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        const videos = await Video.find({ owner: userId, isPublished: true })
            .populate("owner", "fullName username avatar")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, videos, "Videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching videos");
    }
});

// Get my videos (for logged in user)
const getMyVideos = asyncHandler(async (req, res) => {
    try {
        const videos = await Video.find({ owner: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, videos, "Your videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching your videos");
    }
});

export {
    addVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    getVideosByOwner,
    getMyVideos
};
