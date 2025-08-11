import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Quiz, QuizAttempt } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { Category } from "../models/category.model.js";
import { updateCourseProgressForQuiz } from "../services/courseCompletion.service.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

/**
 * Create a new quiz
 * @route POST /api/v1/quizzes
 * @access Admin only
 */
const createQuiz = asyncHandler(async (req, res) => {
    try {
        const { title, description, course, testSeries, questions, timeLimit, passingScore, quizType, maxAttempts } = req.body;

        // Validate required fields
        if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
            throw new ApiError(400, "Title, description, and at least one question are required");
        }

        // Either course or testSeries must be provided
        if (!course && !testSeries) {
            throw new ApiError(400, "Either course ID or test series ID is required");
        }

        // Check if course exists (if provided)
        if (course) {
            const courseExists = await Course.findById(course);
            if (!courseExists) {
                throw new ApiError(404, "Course not found");
            }
        }

        // Check if test series exists (if provided)
        if (testSeries) {
            const { TestSeries } = await import("../models/testSeries.model.js");
            const testSeriesExists = await TestSeries.findById(testSeries);
            if (!testSeriesExists) {
                throw new ApiError(404, "Test series not found");
            }
        }

        // Create quiz
        const quizData = {
            title,
            description,
            questions,
            timeLimit: timeLimit || 30,
            passingScore: passingScore || 70,
            quizType: quizType || "quiz",
            maxAttempts: maxAttempts || 0,
            creator: req.user._id,
            isPublished: false
        };

        // Add course or testSeries reference
        if (course) {
            quizData.course = course;
        }
        if (testSeries) {
            quizData.testSeries = testSeries;
        }

        const quiz = await Quiz.create(quizData);

        // If quiz is assigned to a test series, add it to the test series' quizzes array and recalculate totals
        if (testSeries) {
            const { TestSeries } = await import("../models/testSeries.model.js");
            await TestSeries.findByIdAndUpdate(
                testSeries,
                { $addToSet: { quizzes: quiz._id } },
                { new: true }
            );

            // Recalculate test series totals
            const testSeriesDoc = await TestSeries.findById(testSeries);
            if (testSeriesDoc) {
                const quizzes = await Quiz.find({ _id: { $in: testSeriesDoc.quizzes } });
                const totalQuizzes = quizzes.length;
                const totalQuestions = quizzes.reduce((total, q) => total + (q.questions?.length || 0), 0);
                const estimatedDuration = quizzes.reduce((total, q) => total + (q.timeLimit || 0), 0);

                await TestSeries.findByIdAndUpdate(testSeries, {
                    totalQuizzes,
                    totalQuestions,
                    estimatedDuration
                });
            }
        }

        return res.status(201).json(
            new ApiResponse(201, quiz, "Quiz created successfully")
        );
    } catch (error) {
        console.error("Error creating quiz:", error);
        console.error("Quiz data size:", JSON.stringify(req.body).length, "bytes");
        console.error("Number of questions:", req.body.questions?.length || 0);

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
        const { course, published, type, category, search } = req.query;

        const filter = {};

        // Apply filters if provided
        if (course) filter.course = course;
        if (published !== undefined) filter.isPublished = published === 'true';
        if (type) filter.quizType = type;
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

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
            .populate("testSeries", "title slug isPublished enrolledStudents")
            .populate("creator", "username fullName");

        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }

        // Check access permissions
        let hasAccess = false;

        // Admin and creator always have access
        if (req.user.role === "admin" || quiz.creator.toString() === req.user._id.toString()) {
            hasAccess = true;
        }
        // For course quizzes, check if quiz is published
        else if (quiz.course && quiz.isPublished) {
            hasAccess = true;
        }
        // For test series quizzes, check if test series is published and user is enrolled
        else if (quiz.testSeries) {
            const testSeries = quiz.testSeries;
            if (testSeries.isPublished && testSeries.enrolledStudents.includes(req.user._id)) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
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

        // Handle test series assignment changes
        const oldTestSeries = quiz.testSeries;
        const newTestSeries = updateData.testSeries;

        // Update quiz
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            updateData,
            { new: true, runValidators: true }
        );

        // Handle test series changes and recalculate totals
        if (oldTestSeries || newTestSeries) {
            const { TestSeries } = await import("../models/testSeries.model.js");

            // Remove from old test series if it existed and changed
            if (oldTestSeries && oldTestSeries.toString() !== newTestSeries?.toString()) {
                await TestSeries.findByIdAndUpdate(
                    oldTestSeries,
                    { $pull: { quizzes: quizId } }
                );

                // Recalculate old test series totals
                const oldTestSeriesDoc = await TestSeries.findById(oldTestSeries);
                if (oldTestSeriesDoc) {
                    const quizzes = await Quiz.find({ _id: { $in: oldTestSeriesDoc.quizzes } });
                    const totalQuizzes = quizzes.length;
                    const totalQuestions = quizzes.reduce((total, q) => total + (q.questions?.length || 0), 0);
                    const estimatedDuration = quizzes.reduce((total, q) => total + (q.timeLimit || 0), 0);

                    await TestSeries.findByIdAndUpdate(oldTestSeries, {
                        totalQuizzes,
                        totalQuestions,
                        estimatedDuration
                    });
                }
            }

            // Add to new test series if it exists and is different
            if (newTestSeries && oldTestSeries?.toString() !== newTestSeries.toString()) {
                await TestSeries.findByIdAndUpdate(
                    newTestSeries,
                    { $addToSet: { quizzes: quizId } }
                );

                // Recalculate new test series totals
                const newTestSeriesDoc = await TestSeries.findById(newTestSeries);
                if (newTestSeriesDoc) {
                    const quizzes = await Quiz.find({ _id: { $in: newTestSeriesDoc.quizzes } });
                    const totalQuizzes = quizzes.length;
                    const totalQuestions = quizzes.reduce((total, q) => total + (q.questions?.length || 0), 0);
                    const estimatedDuration = quizzes.reduce((total, q) => total + (q.timeLimit || 0), 0);

                    await TestSeries.findByIdAndUpdate(newTestSeries, {
                        totalQuizzes,
                        totalQuestions,
                        estimatedDuration
                    });
                }
            }
        }

        return res.status(200).json(
            new ApiResponse(200, updatedQuiz, "Quiz updated successfully")
        );
    } catch (error) {
        console.error("Error updating quiz:", error);
        console.error("Quiz data size:", JSON.stringify(req.body).length, "bytes");
        console.error("Number of questions:", req.body.questions?.length || 0);

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

        // Remove quiz from test series if it belongs to one and recalculate totals
        if (quiz.testSeries) {
            const { TestSeries } = await import("../models/testSeries.model.js");
            await TestSeries.findByIdAndUpdate(
                quiz.testSeries,
                { $pull: { quizzes: quizId } }
            );

            // Recalculate test series totals
            const testSeriesDoc = await TestSeries.findById(quiz.testSeries);
            if (testSeriesDoc) {
                const quizzes = await Quiz.find({ _id: { $in: testSeriesDoc.quizzes } });
                const totalQuizzes = quizzes.length;
                const totalQuestions = quizzes.reduce((total, q) => total + (q.questions?.length || 0), 0);
                const estimatedDuration = quizzes.reduce((total, q) => total + (q.timeLimit || 0), 0);

                await TestSeries.findByIdAndUpdate(quiz.testSeries, {
                    totalQuizzes,
                    totalQuestions,
                    estimatedDuration
                });
            }
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
        console.log(`Updating quiz ${quizId} publish status to: ${isPublished}`);

        // Use findByIdAndUpdate to ensure the update is applied
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            { isPublished: isPublished },
            { new: true, runValidators: true }
        );

        console.log(`Quiz after update: isPublished=${updatedQuiz.isPublished}`);

        // Return the updated quiz
        return res.status(200).json(
            new ApiResponse(200, updatedQuiz, `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`)
        );

        // Response is sent in the code above
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update quiz publish status");
    }
});

/**
 * Get quizzes for a course
 * @route GET /api/v1/quizzes/course/:courseId
 * @access Authenticated
 */
const getCourseQuizzes = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        console.log(`Fetching quizzes for course: ${courseId}`);
        console.log(`User role: ${req.user.role}, User ID: ${req.user._id}`);

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            console.log(`Course not found: ${courseId}`);
            throw new ApiError(404, "Course not found");
        }

        console.log(`Course creator: ${course.creator}`);

        // Get published quizzes for the course (or all quizzes if admin)
        const filter = { course: courseId };
        const isAdmin = req.user.role === "admin";
        const isCreator = course.creator && course.creator.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            // For regular students, only show published quizzes
            filter.isPublished = true;
        }

        console.log(`Filter applied:`, filter);
        console.log(`Is admin: ${isAdmin}, Is creator: ${isCreator}`);

        // Debug: Check if there are any quizzes for this course at all
        const allQuizzes = await Quiz.find({ course: courseId });
        console.log(`Total quizzes for course (unfiltered): ${allQuizzes.length}`);
        if (allQuizzes.length > 0) {
            console.log(`Published status of quizzes:`, allQuizzes.map(q => ({ id: q._id, title: q.title, isPublished: q.isPublished })));
        }

        const quizzes = await Quiz.find(filter)
            .select("-questions.options.isCorrect -questions.correctAnswer")
            .sort({ createdAt: 1 });

        console.log(`Quizzes found: ${quizzes.length}`);

        return res.status(200).json(
            new ApiResponse(200, quizzes, "Course quizzes fetched successfully")
        );
    } catch (error) {
        console.error("Error in getCourseQuizzes:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch course quizzes");
    }
});

/**
 * Upload questions from JSON file
 * @route POST /api/v1/quizzes/upload-questions
 * @access Admin only
 */
const uploadQuestionsFromJSON = asyncHandler(async (req, res) => {
    console.log("=== Upload endpoint hit ===");
    console.log("Request file:", req.file);
    console.log("Request user:", req.user?.role);
    console.log("Request body:", req.body);

    try {
        if (!req.file) {
            console.log("No file in request");
            throw new ApiError(400, "JSON file is required");
        }

        // Check if file is JSON
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (fileExtension !== '.json') {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            throw new ApiError(400, "Only JSON files are allowed");
        }

        // Read and parse JSON file
        let questionsData;
        try {
            const fileContent = fs.readFileSync(req.file.path, 'utf8');
            questionsData = JSON.parse(fileContent);
        } catch (parseError) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            throw new ApiError(400, "Invalid JSON format");
        }

        // Clean up uploaded file after reading
        fs.unlinkSync(req.file.path);

        // Validate JSON structure
        if (!Array.isArray(questionsData)) {
            throw new ApiError(400, "JSON must contain an array of questions");
        }

        if (questionsData.length === 0) {
            throw new ApiError(400, "JSON file must contain at least one question");
        }

        // Validate each question
        const validatedQuestions = [];
        for (let i = 0; i < questionsData.length; i++) {
            const question = questionsData[i];

            // Required fields validation
            if (!question.text || typeof question.text !== 'string') {
                throw new ApiError(400, `Question ${i + 1}: 'text' field is required and must be a string`);
            }

            if (!question.type) {
                question.type = 'multiple_choice'; // Default type
            }

            if (!['multiple_choice', 'true_false', 'short_answer', 'essay'].includes(question.type)) {
                throw new ApiError(400, `Question ${i + 1}: Invalid question type. Must be one of: multiple_choice, true_false, short_answer, essay`);
            }

            // Validate options for multiple choice questions
            if (question.type === 'multiple_choice') {
                if (!Array.isArray(question.options) || question.options.length < 2) {
                    throw new ApiError(400, `Question ${i + 1}: Multiple choice questions must have at least 2 options`);
                }

                let hasCorrectAnswer = false;
                for (let j = 0; j < question.options.length; j++) {
                    const option = question.options[j];
                    if (!option.text || typeof option.text !== 'string') {
                        throw new ApiError(400, `Question ${i + 1}, Option ${j + 1}: 'text' field is required and must be a string`);
                    }
                    if (typeof option.isCorrect !== 'boolean') {
                        throw new ApiError(400, `Question ${i + 1}, Option ${j + 1}: 'isCorrect' field is required and must be a boolean`);
                    }
                    if (option.isCorrect) {
                        hasCorrectAnswer = true;
                    }
                }

                if (!hasCorrectAnswer) {
                    throw new ApiError(400, `Question ${i + 1}: At least one option must be marked as correct`);
                }
            }

            // Validate true/false questions
            if (question.type === 'true_false') {
                if (!Array.isArray(question.options) || question.options.length !== 2) {
                    // Auto-generate true/false options if not provided
                    question.options = [
                        { text: 'True', isCorrect: false },
                        { text: 'False', isCorrect: false }
                    ];
                }

                let hasCorrectAnswer = false;
                for (const option of question.options) {
                    if (option.isCorrect) {
                        hasCorrectAnswer = true;
                        break;
                    }
                }

                if (!hasCorrectAnswer) {
                    throw new ApiError(400, `Question ${i + 1}: True/False question must have one correct answer`);
                }
            }

            // Validate short answer questions
            if (question.type === 'short_answer') {
                if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
                    throw new ApiError(400, `Question ${i + 1}: Short answer questions must have a 'correctAnswer' field`);
                }
            }

            // Set default points if not provided
            if (typeof question.points !== 'number' || question.points < 0) {
                question.points = 1;
            }

            // Explanation is optional but should be a string if provided
            if (question.explanation && typeof question.explanation !== 'string') {
                throw new ApiError(400, `Question ${i + 1}: 'explanation' field must be a string if provided`);
            }

            validatedQuestions.push({
                text: question.text.trim(),
                type: question.type,
                image: question.image || '',
                options: question.options || [],
                correctAnswer: question.correctAnswer || '',
                points: question.points,
                explanation: question.explanation ? question.explanation.trim() : ''
            });
        }

        return res.status(200).json(
            new ApiResponse(200, {
                questions: validatedQuestions,
                count: validatedQuestions.length
            }, "Questions validated successfully")
        );

    } catch (error) {
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        throw new ApiError(error.statusCode || 500, error.message || "Failed to process JSON file");
    }
});

/**
 * Get published quizzes for students (public access)
 * @route GET /api/v1/quizzes/public
 * @access Public
 */
const getPublishedQuizzes = asyncHandler(async (req, res) => {
    try {
        const { category, type, search, tags, difficulty, page = 1, limit = 12 } = req.query;

        // First, get published test series IDs
        const { TestSeries } = await import("../models/testSeries.model.js");
        const publishedTestSeries = await TestSeries.find({ isPublished: true }).select('_id');
        const publishedTestSeriesIds = publishedTestSeries.map(ts => ts._id);

        // Create filter for quizzes that are either:
        // 1. Published and belong to a course, OR
        // 2. Belong to a published test series
        const filter = {
            $or: [
                { isPublished: true, course: { $exists: true } },
                { testSeries: { $in: publishedTestSeriesIds } }
            ]
        };

        // Apply additional filters if provided
        if (category && category !== '') filter.category = category;
        if (type && type !== '') filter.quizType = type;
        if (difficulty && difficulty !== '') filter.difficulty = difficulty;

        // Handle tags filter (can be comma-separated string or array)
        if (tags && tags !== '') {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim().toLowerCase());
            if (tagArray.length > 0) {
                filter.tags = { $in: tagArray };
            }
        }

        if (search) {
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } }
                ]
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [quizzes, total] = await Promise.all([
            Quiz.find(filter)
                .populate("course", "title slug")
                .populate("testSeries", "title slug")
                .populate("creator", "username fullName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Quiz.countDocuments(filter)
        ]);

        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        };

        return res.status(200).json(
            new ApiResponse(200, { quizzes, pagination }, "Published quizzes fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch published quizzes");
    }
});

/**
 * Get quiz categories with counts
 * @route GET /api/v1/quizzes/categories
 * @access Public
 */
const getQuizCategories = asyncHandler(async (req, res) => {
    try {
        const { includeEmpty = false } = req.query;

        // Get categories from Category model
        const categories = await Category.find({ isActive: true })
            .sort({ order: 1, name: 1 });

        // Get quiz counts for each category
        const categoryStats = await Quiz.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Create a map for quick lookup
        const statsMap = categoryStats.reduce((acc, stat) => {
            acc[stat._id || ''] = stat.count;
            return acc;
        }, {});

        // Combine category data with counts
        let result = categories.map(category => ({
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            color: category.color,
            icon: category.icon,
            count: statsMap[category.name] || 0
        }));

        // Add uncategorized if there are quizzes without category
        const uncategorizedCount = statsMap[''] || 0;
        if (uncategorizedCount > 0 || includeEmpty === 'true') {
            result.unshift({
                _id: null,
                name: 'Uncategorized',
                slug: 'uncategorized',
                description: 'Quizzes without a specific category',
                color: '#6b7280',
                icon: 'FaQuestion',
                count: uncategorizedCount
            });
        }

        // Filter out categories with no quizzes if includeEmpty is false
        if (includeEmpty !== 'true') {
            result = result.filter(category => category.count > 0);
        }

        return res.status(200).json(
            new ApiResponse(200, result, "Quiz categories fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch quiz categories");
    }
});

// Get all quiz tags with counts
const getQuizTags = asyncHandler(async (req, res) => {
    try {
        const { includeEmpty = 'false' } = req.query;

        // Get all published quizzes and extract tags
        const quizzes = await Quiz.find({ isPublished: true }).select('tags');

        // Count tag occurrences
        const tagCounts = {};
        quizzes.forEach(quiz => {
            if (quiz.tags && quiz.tags.length > 0) {
                quiz.tags.forEach(tag => {
                    if (tag && tag.trim()) {
                        const normalizedTag = tag.toLowerCase().trim();
                        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
                    }
                });
            }
        });

        // Convert to array and sort by count (descending) then by name
        let result = Object.entries(tagCounts).map(([tag, count]) => ({
            name: tag,
            count: count
        })).sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count; // Sort by count descending
            }
            return a.name.localeCompare(b.name); // Then by name ascending
        });

        // Filter out tags with no quizzes if includeEmpty is false
        if (includeEmpty !== 'true') {
            result = result.filter(tag => tag.count > 0);
        }

        return res.status(200).json(
            new ApiResponse(200, result, "Quiz tags fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch quiz tags");
    }
});

export {
    createQuiz,
    getAllQuizzes,
    getPublishedQuizzes,
    getQuizCategories,
    getQuizTags,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    toggleQuizPublishStatus,
    getCourseQuizzes,
    uploadQuestionsFromJSON
};
