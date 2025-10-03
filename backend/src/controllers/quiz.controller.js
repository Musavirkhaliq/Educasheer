import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Quiz, QuizAttempt } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { Category } from "../models/category.model.js";
import { TestSeries } from "../models/testSeries.model.js";
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
        const { title, description, testSeries, questions, timeLimit, passingScore, quizType, maxAttempts } = req.body;

        // Validate required fields
        if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
            throw new ApiError(400, "Title, description, and at least one question are required");
        }

        // Test series is required
        if (!testSeries) {
            throw new ApiError(400, "Test series ID is required - quizzes must belong to a test series");
        }

        // Check if test series exists
        const testSeriesExists = await TestSeries.findById(testSeries);
        if (!testSeriesExists) {
            throw new ApiError(404, "Test series not found");
        }

        // Create quiz
        const quizData = {
            title,
            description,
            testSeries,
            section: req.body.section || undefined, // Add section support
            questions,
            timeLimit: timeLimit || 30,
            passingScore: passingScore || 70,
            quizType: quizType || "quiz",
            maxAttempts: maxAttempts || 0,
            creator: req.user._id,
            isPublished: false,
            // Add other fields that might be in the request
            category: req.body.category || '',
            tags: req.body.tags || [],
            difficulty: req.body.difficulty || 'medium',
            allowReview: req.body.allowReview !== false,
            showCorrectAnswers: req.body.showCorrectAnswers !== false,
            randomizeQuestions: req.body.randomizeQuestions || false
        };

        const quiz = await Quiz.create(quizData);

        // Add quiz to the test series' quizzes array (for backward compatibility)
        await TestSeries.findByIdAndUpdate(
            testSeries,
            { $addToSet: { quizzes: quiz._id } },
            { new: true }
        );

        // Note: Section assignment is handled separately via the test series section endpoints
        // This allows for better control and validation of section assignments

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
        const { course, testSeries, published, type, category, search } = req.query;

        const filter = {};

        // Apply filters if provided
        if (testSeries) filter.testSeries = testSeries;
        if (published !== undefined) filter.isPublished = published === 'true';
        if (type) filter.quizType = type;
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // If course filter is provided, find test series belonging to that course first
        if (course) {
            const courseTestSeries = await TestSeries.find({ course }).select('_id');
            const testSeriesIds = courseTestSeries.map(ts => ts._id);
            
            if (testSeriesIds.length > 0) {
                filter.testSeries = { $in: testSeriesIds };
            } else {
                // No test series found for this course, return empty result
                return res.status(200).json(
                    new ApiResponse(200, [], "No quizzes found for the selected course")
                );
            }
        }

        const quizzes = await Quiz.find(filter)
            .populate({
                path: "testSeries",
                select: "title slug course sections",
                populate: {
                    path: "course",
                    select: "title slug"
                }
            })
            .populate("creator", "username fullName")
            .sort({ createdAt: -1 });

        // Add section title to quizzes that have a section assigned
        const quizzesWithSectionInfo = quizzes.map(quiz => {
            const quizObj = quiz.toObject();
            if (quizObj.section && quizObj.testSeries?.sections) {
                const section = quizObj.testSeries.sections.find(s => s._id.toString() === quizObj.section.toString());
                if (section) {
                    quizObj.sectionTitle = section.title;
                }
            }
            return quizObj;
        });

        return res.status(200).json(
            new ApiResponse(200, quizzesWithSectionInfo, "Quizzes fetched successfully")
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
            .populate({
                path: "testSeries",
                select: "title slug isPublished enrolledStudents course sections",
                populate: {
                    path: "course",
                    select: "title slug"
                }
            })
            .populate("creator", "username fullName");

        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }

        // Check access permissions
        let hasAccess = false;
        let accessMessage = "";
        let requiresLogin = false;
        let requiresPurchase = false;

        // If user is not authenticated
        if (!req.user) {
            if (quiz.testSeries && quiz.testSeries.isPublished) {
                if (quiz.testSeries.price > 0) {
                    accessMessage = "Please login and purchase this test series to access the quiz.";
                    requiresLogin = true;
                    requiresPurchase = true;
                } else {
                    accessMessage = "Please login and enroll in this free test series to access the quiz.";
                    requiresLogin = true;
                }
            } else {
                accessMessage = "This quiz is not available.";
            }
        }
        // If user is authenticated
        else {
            // Admin and creator always have access
            if (req.user.role === "admin" || quiz.creator.toString() === req.user._id.toString()) {
                hasAccess = true;
            }
            // For test series quizzes, check if test series is published and user is enrolled
            else if (quiz.testSeries) {
                const testSeries = quiz.testSeries;
                if (testSeries.isPublished) {
                    if (testSeries.enrolledStudents.includes(req.user._id)) {
                        hasAccess = true;
                    } else {
                        if (testSeries.price > 0) {
                            accessMessage = `You need to purchase the test series "${testSeries.title}" to access this quiz.`;
                            requiresPurchase = true;
                        } else {
                            accessMessage = `You need to enroll in the test series "${testSeries.title}" to access this quiz.`;
                        }
                    }
                } else {
                    accessMessage = "This quiz is not published yet.";
                }
            }
        }

        // Add section title if quiz has a section assigned
        const quizObj = quiz.toObject();
        if (quizObj.section && quizObj.testSeries?.sections) {
            const section = quizObj.testSeries.sections.find(s => s._id.toString() === quizObj.section.toString());
            if (section) {
                quizObj.sectionTitle = section.title;
            }
        }

        // Add access information
        quizObj.hasAccess = hasAccess;
        quizObj.accessMessage = accessMessage;
        quizObj.requiresLogin = requiresLogin;
        quizObj.requiresPurchase = requiresPurchase;
        quizObj.requiresEnrollment = !hasAccess && quiz.testSeries && req.user && !quiz.testSeries.enrolledStudents.includes(req.user._id);

        return res.status(200).json(
            new ApiResponse(200, quizObj, "Quiz fetched successfully")
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

        // Clean up expired attempts before allowing edit
        try {
            const { cleanupExpiredAttempts } = await import("../services/quizCleanup.service.js");
            await cleanupExpiredAttempts();
        } catch (cleanupError) {
            console.warn("Failed to cleanup expired attempts:", cleanupError);
            // Continue with update even if cleanup fails
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
        console.log('getPublishedQuizzes called with params:', req.query);
        
        const { category, type, search, tags, difficulty, page = 1, limit = 12 } = req.query;

        // Simplified approach - just get quizzes that belong to published test series
        const publishedTestSeries = await TestSeries.find({ isPublished: true }).select('_id');
        const publishedTestSeriesIds = publishedTestSeries.map(ts => ts._id);

        console.log('Found published test series:', publishedTestSeriesIds.length);

        // Simple filter - just get quizzes from published test series
        const filter = {
            testSeries: { $in: publishedTestSeriesIds }
        };

        // Apply additional filters if provided
        if (category && category !== '') filter.category = category;
        if (type && type !== '') filter.quizType = type;
        if (difficulty && difficulty !== '') filter.difficulty = difficulty;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Using filter:', JSON.stringify(filter, null, 2));

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const quizzes = await Quiz.find(filter)
            .populate("testSeries", "title slug")
            .populate("creator", "username fullName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Quiz.countDocuments(filter);

        console.log('Found quizzes:', quizzes.length, 'Total:', total);

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
        console.error('Error in getPublishedQuizzes:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch published quizzes",
            error: error.message
        });
    }
});

/**
 * Get enrolled quizzes for authenticated user
 * @route GET /api/v1/quizzes/enrolled
 * @access Authenticated users
 */
const getEnrolledQuizzes = asyncHandler(async (req, res) => {
    try {
        const { category, type, search, tags, difficulty, page = 1, limit = 12 } = req.query;
        const userId = req.user._id;

        // Get test series where user is enrolled
        const enrolledTestSeries = await TestSeries.find({ 
            isPublished: true,
            enrolledStudents: userId 
        }).select('_id');
        
        const enrolledTestSeriesIds = enrolledTestSeries.map(ts => ts._id);

        if (enrolledTestSeriesIds.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, { quizzes: [], pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 } }, "No enrolled quizzes found")
            );
        }

        // Filter quizzes from enrolled test series
        const filter = {
            testSeries: { $in: enrolledTestSeriesIds }
        };

        // Apply additional filters if provided
        if (category && category !== '') filter.category = category;
        if (type && type !== '') filter.quizType = type;
        if (difficulty && difficulty !== '') filter.difficulty = difficulty;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const quizzes = await Quiz.find(filter)
            .populate({
                path: "testSeries",
                select: "title slug enrolledStudents"
            })
            .populate("creator", "username fullName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Quiz.countDocuments(filter);

        // Add enrollment status to each quiz
        const quizzesWithEnrollment = quizzes.map(quiz => {
            const quizObj = quiz.toObject();
            quizObj.isEnrolledInTestSeries = true;
            return quizObj;
        });

        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        };

        return res.status(200).json(
            new ApiResponse(200, { quizzes: quizzesWithEnrollment, pagination }, "Enrolled quizzes fetched successfully")
        );
    } catch (error) {
        console.error('Error in getEnrolledQuizzes:', error);
        throw new ApiError(500, "Failed to fetch enrolled quizzes");
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
    getEnrolledQuizzes,
    getQuizCategories,
    getQuizTags,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    toggleQuizPublishStatus,
    getCourseQuizzes,
    uploadQuestionsFromJSON
};
