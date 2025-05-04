import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { 
  updateCourseProgressForVideo, 
  updateCourseProgressForQuiz, 
  getCourseProgress,
  getAllCourseProgress
} from "../services/courseCompletion.service.js";

/**
 * Update course progress for a video
 */
const updateVideoProgress = asyncHandler(async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const userId = req.user._id;

    if (!courseId || !videoId) {
      throw new ApiError(400, "Course ID and Video ID are required");
    }

    const courseProgress = await updateCourseProgressForVideo(userId, courseId, videoId);

    return res.status(200).json(
      new ApiResponse(200, courseProgress, "Course progress updated successfully")
    );
  } catch (error) {
    console.error("Error updating course progress:", error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, error.message || "Something went wrong while updating course progress");
  }
});

/**
 * Update course progress for a quiz
 */
const updateQuizProgress = asyncHandler(async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { score } = req.body;
    const userId = req.user._id;

    if (!courseId || !quizId) {
      throw new ApiError(400, "Course ID and Quiz ID are required");
    }

    if (score === undefined || score < 0 || score > 100) {
      throw new ApiError(400, "Valid score percentage (0-100) is required");
    }

    const courseProgress = await updateCourseProgressForQuiz(userId, courseId, quizId, score);

    return res.status(200).json(
      new ApiResponse(200, courseProgress, "Course progress updated successfully")
    );
  } catch (error) {
    console.error("Error updating course progress for quiz:", error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, error.message || "Something went wrong while updating course progress");
  }
});

/**
 * Get course progress for a user
 */
const getUserCourseProgress = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!courseId) {
      throw new ApiError(400, "Course ID is required");
    }

    const courseProgress = await getCourseProgress(userId, courseId);

    return res.status(200).json(
      new ApiResponse(200, courseProgress, "Course progress fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching course progress:", error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, error.message || "Something went wrong while fetching course progress");
  }
});

/**
 * Get all course progress for a user
 */
const getAllUserCourseProgress = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    const courseProgress = await getAllCourseProgress(userId);

    return res.status(200).json(
      new ApiResponse(200, courseProgress, "All course progress fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching all course progress:", error);
    throw new ApiError(500, "Something went wrong while fetching course progress");
  }
});

export {
  updateVideoProgress,
  updateQuizProgress,
  getUserCourseProgress,
  getAllUserCourseProgress
};
