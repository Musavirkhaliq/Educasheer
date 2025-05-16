import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Quiz, QuizAttempt } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { updateCourseProgressForQuiz } from "../services/courseCompletion.service.js";
import mongoose from "mongoose";

/**
 * Create a new quiz
 * @route POST /api/v1/quizzes
 * @access Admin only
 */
const createQuiz = asyncHandler(async (req, res) => {
    try {
        const { title, description, course, questions, timeLimit, passingScore, quizType, maxAttempts } = req.body;

        // Validate required fields
        if (!title || !description || !course || !questions || !Array.isArray(questions) || questions.length === 0) {
            throw new ApiError(400, "Title, description, course ID, and at least one question are required");
        }

        // Check if course exists
        const courseExists = await Course.findById(course);
        if (!courseExists) {
            throw new ApiError(404, "Course not found");
        }

        // Create quiz
        const quiz = await Quiz.create({
            title,
            description,
            course,
            questions,
            timeLimit: timeLimit || 30,
            passingScore: passingScore || 70,
            quizType: quizType || "quiz",
            maxAttempts: maxAttempts || 0,
            creator: req.user._id,
            isPublished: false
        });

        return res.status(201).json(
            new ApiResponse(201, quiz, "Quiz created successfully")
        );
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            throw new ApiError(400, error.message);
        }
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create quiz");
    }
});

/**
 * Get all quizzes (admin)
 * @route GET /api/v1/quizzes
 * @access Admin only
 */
const getAllQuizzes = asyncHandler(async (req, res) => {
    try {
        const { course, published, type } = req.query;
        
        const filter = {};
        
        // Apply filters if provided
        if (course) filter.course = course;
        if (published !== undefined) filter.isPublished = published === 'true';
        if (type) filter.quizType = type;
        
        const quizzes = await Quiz.find(filter)
            .populate("course", "title slug")
            .populate("creator", "username fullName")
            .sort({ createdAt: -1 });
            
        return res.status(200).json(
            new ApiResponse(200, quizzes, "Quizzes fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch quizzes");
    }
});

/**
 * Get quiz by ID
 * @route GET /api/v1/quizzes/:quizId
 * @access Admin for unpublished, authenticated for published
 */
const getQuizById = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findById(quizId)
            .populate("course", "title slug")
            .populate("creator", "username fullName");
            
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Check access permissions
        if (!quiz.isPublished && req.user.role !== "admin" && quiz.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to access this quiz");
        }
        
        return res.status(200).json(
            new ApiResponse(200, quiz, "Quiz fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch quiz");
    }
});

/**
 * Update quiz
 * @route PUT /api/v1/quizzes/:quizId
 * @access Admin only
 */
const updateQuiz = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        const updateData = req.body;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Check if user is admin or quiz creator
        if (req.user.role !== "admin" && quiz.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this quiz");
        }
        
        // Update quiz
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            updateData,
            { new: true, runValidators: true }
        );
        
        return res.status(200).json(
            new ApiResponse(200, updatedQuiz, "Quiz updated successfully")
        );
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            throw new ApiError(400, error.message);
        }
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update quiz");
    }
});

/**
 * Delete quiz
 * @route DELETE /api/v1/quizzes/:quizId
 * @access Admin only
 */
const deleteQuiz = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Check if user is admin or quiz creator
        if (req.user.role !== "admin" && quiz.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to delete this quiz");
        }
        
        // Delete quiz
        await Quiz.findByIdAndDelete(quizId);
        
        // Also delete all attempts for this quiz
        await QuizAttempt.deleteMany({ quiz: quizId });
        
        return res.status(200).json(
            new ApiResponse(200, {}, "Quiz deleted successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete quiz");
    }
});

/**
 * Publish/unpublish quiz
 * @route PATCH /api/v1/quizzes/:quizId/publish
 * @access Admin only
 */
const toggleQuizPublishStatus = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        const { isPublished } = req.body;
        
        if (isPublished === undefined) {
            throw new ApiError(400, "isPublished field is required");
        }
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Check if user is admin or quiz creator
        if (req.user.role !== "admin" && quiz.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this quiz");
        }
        
        // Update publish status
        quiz.isPublished = isPublished;
        await quiz.save();
        
        return res.status(200).json(
            new ApiResponse(200, quiz, `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`)
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update quiz publish status");
    }
});

/**
 * Get quizzes for a course
 * @route GET /api/v1/courses/:courseId/quizzes
 * @access Authenticated
 */
const getCourseQuizzes = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
        
        // Get published quizzes for the course (or all quizzes if admin)
        const filter = { course: courseId };
        if (req.user.role !== "admin" && course.creator.toString() !== req.user._id.toString()) {
            filter.isPublished = true;
        }
        
        const quizzes = await Quiz.find(filter)
            .select("-questions.options.isCorrect -questions.correctAnswer")
            .sort({ createdAt: 1 });
            
        return res.status(200).json(
            new ApiResponse(200, quizzes, "Course quizzes fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch course quizzes");
    }
});

export {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    toggleQuizPublishStatus,
    getCourseQuizzes
};
