import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TestSeries } from "../models/testSeries.model.js";
import { Quiz } from "../models/quiz.model.js";
import mongoose from "mongoose";

/**
 * Create a new test series
 * @route POST /api/v1/test-series
 * @access Admin only
 */
const createTestSeries = asyncHandler(async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            tags,
            difficulty,
            examType,
            subject,
            price,
            originalPrice,
            instructions,
            allowReview,
            showResults,
            randomizeQuizOrder,
            maxAttempts,
            validFrom,
            validUntil,
            thumbnail
        } = req.body;

        // Validate required fields
        if (!title || !description) {
            throw new ApiError(400, "Title and description are required");
        }

        // Check if user is admin or tutor
        if (req.user.role !== "admin" && req.user.role !== "tutor") {
            throw new ApiError(403, "Only admins and tutors can create test series");
        }

        // Create test series
        const testSeries = await TestSeries.create({
            title,
            description,
            category: category || 'General',
            tags: tags || [],
            difficulty: difficulty || 'medium',
            examType: examType || '',
            subject: subject || '',
            price: price || 0,
            originalPrice: originalPrice || 0,
            instructions: instructions || '',
            allowReview: allowReview !== false,
            showResults: showResults !== false,
            randomizeQuizOrder: randomizeQuizOrder || false,
            maxAttempts: maxAttempts || 0,
            validFrom: validFrom || new Date(),
            validUntil: validUntil || null,
            thumbnail: thumbnail || '',
            creator: req.user._id,
            isPublished: false
        });

        return res.status(201).json(
            new ApiResponse(201, testSeries, "Test series created successfully")
        );
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            throw new ApiError(400, error.message);
        }
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create test series");
    }
});

/**
 * Get all test series (admin)
 * @route GET /api/v1/test-series
 * @access Admin only
 */
const getAllTestSeries = asyncHandler(async (req, res) => {
    try {
        const { category, published, difficulty, examType, subject, search } = req.query;

        const filter = {};

        // Apply filters if provided
        if (category) filter.category = category;
        if (published !== undefined) filter.isPublished = published === 'true';
        if (difficulty) filter.difficulty = difficulty;
        if (examType) filter.examType = examType;
        if (subject) filter.subject = subject;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const testSeries = await TestSeries.find(filter)
            .populate("creator", "username fullName")
            .populate("quizzes", "title description timeLimit questions")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, testSeries, "Test series fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching test series");
    }
});

/**
 * Get published test series (public)
 * @route GET /api/v1/public/test-series
 * @access Public
 */
const getPublishedTestSeries = asyncHandler(async (req, res) => {
    try {
        const { category, difficulty, examType, subject, search, limit } = req.query;

        const filter = { isPublished: true };

        // Apply filters if provided
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (examType) filter.examType = examType;
        if (subject) filter.subject = subject;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let query = TestSeries.find(filter)
            .populate("creator", "username fullName")
            .select("-enrolledStudents")
            .sort({ createdAt: -1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const testSeries = await query;

        return res.status(200).json(
            new ApiResponse(200, testSeries, "Published test series fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching published test series");
    }
});

/**
 * Get test series by ID
 * @route GET /api/v1/test-series/:testSeriesId
 * @access Public (published) / Admin (all)
 */
const getTestSeriesById = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;

        if (!testSeriesId) {
            throw new ApiError(400, "Test series ID is required");
        }

        const testSeries = await TestSeries.findById(testSeriesId)
            .populate("creator", "username fullName")
            .populate({
                path: "quizzes",
                select: "title description timeLimit questions passingScore quizType difficulty isPublished",
                populate: {
                    path: "questions",
                    select: "text type points"
                }
            });

        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user can access this test series
        const isAuthenticated = req.user ? true : false;
        const isAdmin = req.user && req.user.role === "admin";
        const isCreator = req.user && testSeries.creator._id.toString() === req.user._id.toString();

        if (!testSeries.isPublished && !isAdmin && !isCreator) {
            throw new ApiError(403, "This test series is not published");
        }

        // Check if user is enrolled (for authenticated users)
        let isEnrolled = false;
        if (isAuthenticated) {
            isEnrolled = testSeries.enrolledStudents.some(
                studentId => studentId.toString() === req.user._id.toString()
            );
        }

        const responseData = {
            ...testSeries.toObject(),
            isEnrolled
        };

        return res.status(200).json(
            new ApiResponse(200, responseData, "Test series fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching test series");
    }
});

/**
 * Update test series
 * @route PUT /api/v1/test-series/:testSeriesId
 * @access Admin and creator only
 */
const updateTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;
        const updateData = req.body;

        if (!testSeriesId) {
            throw new ApiError(400, "Test series ID is required");
        }

        const testSeries = await TestSeries.findById(testSeriesId);

        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Update test series
        const updatedTestSeries = await TestSeries.findByIdAndUpdate(
            testSeriesId,
            updateData,
            { new: true, runValidators: true }
        ).populate("creator", "username fullName")
         .populate("quizzes", "title description timeLimit questions");

        return res.status(200).json(
            new ApiResponse(200, updatedTestSeries, "Test series updated successfully")
        );
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            throw new ApiError(400, error.message);
        }
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating test series");
    }
});

/**
 * Delete test series
 * @route DELETE /api/v1/test-series/:testSeriesId
 * @access Admin and creator only
 */
const deleteTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;

        if (!testSeriesId) {
            throw new ApiError(400, "Test series ID is required");
        }

        const testSeries = await TestSeries.findById(testSeriesId);

        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to delete this test series");
        }

        await TestSeries.findByIdAndDelete(testSeriesId);

        return res.status(200).json(
            new ApiResponse(200, {}, "Test series deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting test series");
    }
});

/**
 * Toggle test series publish status
 * @route PATCH /api/v1/test-series/:testSeriesId/publish
 * @access Admin and creator only
 */
const toggleTestSeriesPublishStatus = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;
        const { isPublished } = req.body;

        if (isPublished === undefined) {
            throw new ApiError(400, "isPublished field is required");
        }

        const testSeries = await TestSeries.findById(testSeriesId);

        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        testSeries.isPublished = isPublished;
        await testSeries.save();

        return res.status(200).json(
            new ApiResponse(200, testSeries, `Test series ${isPublished ? 'published' : 'unpublished'} successfully`)
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating test series publish status");
    }
});

/**
 * Add quiz to test series
 * @route POST /api/v1/test-series/:testSeriesId/quizzes/:quizId
 * @access Admin and creator only
 */
const addQuizToTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId, quizId } = req.params;

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Check if quiz is already in the test series
        if (testSeries.quizzes.includes(quizId)) {
            throw new ApiError(400, "Quiz is already in this test series");
        }

        // Add quiz to test series
        testSeries.quizzes.push(quizId);

        // Update quiz to reference this test series
        quiz.testSeries = testSeriesId;

        await Promise.all([testSeries.save(), quiz.save()]);

        const updatedTestSeries = await TestSeries.findById(testSeriesId)
            .populate("quizzes", "title description timeLimit questions");

        return res.status(200).json(
            new ApiResponse(200, updatedTestSeries, "Quiz added to test series successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding quiz to test series");
    }
});

/**
 * Remove quiz from test series
 * @route DELETE /api/v1/test-series/:testSeriesId/quizzes/:quizId
 * @access Admin and creator only
 */
const removeQuizFromTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId, quizId } = req.params;

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Remove quiz from test series
        testSeries.quizzes = testSeries.quizzes.filter(id => id.toString() !== quizId);

        // Remove test series reference from quiz
        await Quiz.findByIdAndUpdate(quizId, { $unset: { testSeries: 1 } });

        await testSeries.save();

        const updatedTestSeries = await TestSeries.findById(testSeriesId)
            .populate("quizzes", "title description timeLimit questions");

        return res.status(200).json(
            new ApiResponse(200, updatedTestSeries, "Quiz removed from test series successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while removing quiz from test series");
    }
});

/**
 * Enroll in test series
 * @route POST /api/v1/test-series/:testSeriesId/enroll
 * @access Authenticated users
 */
const enrollInTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        if (!testSeries.isPublished) {
            throw new ApiError(400, "Cannot enroll in unpublished test series");
        }

        // Check if user is already enrolled
        if (testSeries.enrolledStudents.includes(req.user._id)) {
            throw new ApiError(400, "You are already enrolled in this test series");
        }

        // Add user to enrolled students
        testSeries.enrolledStudents.push(req.user._id);
        await testSeries.save();

        return res.status(200).json(
            new ApiResponse(200, {}, "Successfully enrolled in test series")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while enrolling in test series");
    }
});

/**
 * Fix test series quizzes array (migration function)
 * @route POST /api/v1/test-series/fix-quizzes
 * @access Admin only
 */
const fixTestSeriesQuizzes = asyncHandler(async (req, res) => {
    try {
        // Find all quizzes that have testSeries but are not in the test series' quizzes array
        const quizzesWithTestSeries = await Quiz.find({ testSeries: { $exists: true } });

        let fixed = 0;

        for (const quiz of quizzesWithTestSeries) {
            const testSeries = await TestSeries.findById(quiz.testSeries);
            if (testSeries && !testSeries.quizzes.includes(quiz._id)) {
                await TestSeries.findByIdAndUpdate(
                    quiz.testSeries,
                    { $addToSet: { quizzes: quiz._id } }
                );
                fixed++;
            }
        }

        return res.status(200).json(
            new ApiResponse(200, { fixed }, `Fixed ${fixed} test series quiz assignments`)
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fixing test series quizzes");
    }
});

export {
    createTestSeries,
    getAllTestSeries,
    getPublishedTestSeries,
    getTestSeriesById,
    updateTestSeries,
    deleteTestSeries,
    toggleTestSeriesPublishStatus,
    addQuizToTestSeries,
    removeQuizFromTestSeries,
    enrollInTestSeries,
    fixTestSeriesQuizzes
};
