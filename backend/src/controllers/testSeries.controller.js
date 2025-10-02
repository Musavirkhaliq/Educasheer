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
            course: req.body.course || null,
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
 * Get all test series (admin) or filtered test series (authenticated users)
 * @route GET /api/v1/test-series
 * @access Authenticated users (with restrictions for non-admins)
 */
const getAllTestSeries = asyncHandler(async (req, res) => {
    try {
        const { category, published, difficulty, examType, subject, search, course } = req.query;

        const filter = {};

        // Apply filters if provided
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (examType) filter.examType = examType;
        if (subject) filter.subject = subject;
        if (course) filter.course = course;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // For non-admin users, only show published test series
        if (req.user.role !== "admin" && req.user.role !== "tutor") {
            filter.isPublished = true;
        } else {
            // For admin/tutor, respect the published filter if provided
            if (published !== undefined) filter.isPublished = published === 'true';
        }

        let query = TestSeries.find(filter)
            .populate("creator", "username fullName")
            .populate("course", "title")
            .populate("quizzes", "title description timeLimit questions")
            .populate({
                path: "sections.quizzes",
                select: "title description timeLimit questions passingScore quizType difficulty isPublished"
            })
            .sort({ createdAt: -1 });

        const testSeries = await query;

        // For each test series, check if the current user is enrolled
        const testSeriesWithEnrollment = testSeries.map(ts => {
            const isEnrolled = ts.enrolledStudents.some(
                studentId => studentId.toString() === req.user._id.toString()
            );
            
            return {
                ...ts.toObject(),
                isEnrolled
            };
        });

        return res.status(200).json(
            new ApiResponse(200, testSeriesWithEnrollment, "Test series fetched successfully")
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
            .populate("enrolledStudents", "_id") // Populate to ensure count is accurate
            .sort({ createdAt: -1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const testSeries = await query;

        // Transform the data to include enrollment count but not the actual student IDs
        const transformedTestSeries = testSeries.map(series => {
            const seriesObj = series.toObject();
            // Replace enrolledStudents array with just the count for privacy
            seriesObj.enrolledStudentsCount = seriesObj.enrolledStudents?.length || 0;
            delete seriesObj.enrolledStudents;
            return seriesObj;
        });

        return res.status(200).json(
            new ApiResponse(200, transformedTestSeries, "Published test series fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching published test series");
    }
});

/**
 * Get enrolled test series for authenticated user
 * @route GET /api/v1/test-series/enrolled
 * @access Authenticated users
 */
const getEnrolledTestSeries = asyncHandler(async (req, res) => {
    try {
        const { category, difficulty, examType, subject, search } = req.query;
        const userId = req.user._id;

        const filter = { 
            isPublished: true,
            enrolledStudents: userId
        };

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

        const testSeries = await TestSeries.find(filter)
            .populate("creator", "username fullName")
            .populate({
                path: "quizzes",
                select: "title description timeLimit questions passingScore quizType difficulty isPublished"
            })
            .populate({
                path: "sections.quizzes",
                select: "title description timeLimit questions passingScore quizType difficulty isPublished"
            })
            .sort({ createdAt: -1 });

        // Add enrollment status and count
        const testSeriesWithEnrollment = testSeries.map(ts => {
            const tsObj = ts.toObject();
            tsObj.isEnrolled = true;
            tsObj.enrolledStudentsCount = ts.enrolledStudents?.length || 0;
            // Remove actual student IDs for privacy
            delete tsObj.enrolledStudents;
            return tsObj;
        });

        return res.status(200).json(
            new ApiResponse(200, testSeriesWithEnrollment, "Enrolled test series fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching enrolled test series");
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
            })
            .populate({
                path: "sections.quizzes",
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

        console.log('Update test series request:', { testSeriesId, updateData, userId: req.user._id });

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

        console.log('Updating test series with data:', updateData);

        // Update test series
        const updatedTestSeries = await TestSeries.findByIdAndUpdate(
            testSeriesId,
            updateData,
            { new: true, runValidators: true }
        ).populate("creator", "username fullName")
         .populate("quizzes", "title description timeLimit questions")
         .populate({
             path: "sections.quizzes",
             select: "title description timeLimit questions"
         });

        console.log('Test series updated successfully');

        return res.status(200).json(
            new ApiResponse(200, updatedTestSeries, "Test series updated successfully")
        );
    } catch (error) {
        console.error('Error updating test series:', error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            console.error('Validation error details:', error.errors);
            throw new ApiError(400, `Validation error: ${error.message}`);
        }
        if (error instanceof mongoose.Error.CastError) {
            console.error('Cast error details:', error);
            throw new ApiError(400, `Invalid data format: ${error.message}`);
        }
        if (error instanceof ApiError) {
            throw error;
        }
        
        console.error('Unexpected error:', error.stack);
        throw new ApiError(500, `Something went wrong while updating test series: ${error.message}`);
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
 * Enroll in test series (only for free test series)
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

        // Check if test series is paid
        if (testSeries.price > 0) {
            throw new ApiError(400, "This test series requires purchase. Please add it to your cart and complete the payment.");
        }

        // Check if user is already enrolled
        if (testSeries.enrolledStudents.includes(req.user._id)) {
            throw new ApiError(400, "You are already enrolled in this test series");
        }

        // Add user to enrolled students (only for free test series)
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
 * Recalculate test series totals
 */
const recalculateTestSeriesTotals = async (testSeriesId) => {
    try {
        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) return;

        const quizzes = await Quiz.find({ _id: { $in: testSeries.quizzes } });

        const totalQuizzes = quizzes.length;
        const totalQuestions = quizzes.reduce((total, quiz) => total + (quiz.questions?.length || 0), 0);
        const estimatedDuration = quizzes.reduce((total, quiz) => total + (quiz.timeLimit || 0), 0);

        await TestSeries.findByIdAndUpdate(testSeriesId, {
            totalQuizzes,
            totalQuestions,
            estimatedDuration
        });
    } catch (error) {
        console.error('Error recalculating test series totals:', error);
    }
};

/**
 * Add section to test series
 * @route POST /api/v1/test-series/:testSeriesId/sections
 * @access Admin and creator only
 */
const addSectionToTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;
        const { title, description, order } = req.body;

        console.log('Add section request:', { testSeriesId, title, description, order, userId: req.user._id, userRole: req.user.role });

        if (!title) {
            throw new ApiError(400, "Section title is required");
        }

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        console.log('Test series found:', { id: testSeries._id, creator: testSeries.creator });

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            console.log('Permission denied:', { userRole: req.user.role, userId: req.user._id, creator: testSeries.creator });
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Add new section
        const newSection = {
            title,
            description: description || '',
            order: order || testSeries.sections.length,
            quizzes: []
        };

        console.log('Adding new section:', newSection);
        testSeries.sections.push(newSection);
        await testSeries.save();

        console.log('Section added successfully, returning response');
        return res.status(200).json(
            new ApiResponse(200, testSeries, "Section added successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding section");
    }
});

/**
 * Update section in test series
 * @route PUT /api/v1/test-series/:testSeriesId/sections/:sectionId
 * @access Admin and creator only
 */
const updateSectionInTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId, sectionId } = req.params;
        const { title, description, order } = req.body;

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Find and update section
        const section = testSeries.sections.id(sectionId);
        if (!section) {
            throw new ApiError(404, "Section not found");
        }

        if (title) section.title = title;
        if (description !== undefined) section.description = description;
        if (order !== undefined) section.order = order;

        await testSeries.save();

        return res.status(200).json(
            new ApiResponse(200, testSeries, "Section updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating section");
    }
});

/**
 * Delete section from test series
 * @route DELETE /api/v1/test-series/:testSeriesId/sections/:sectionId
 * @access Admin and creator only
 */
const deleteSectionFromTestSeries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId, sectionId } = req.params;

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Find section
        const section = testSeries.sections.id(sectionId);
        if (!section) {
            throw new ApiError(404, "Section not found");
        }

        // Move quizzes from section back to main quizzes array
        if (section.quizzes && section.quizzes.length > 0) {
            section.quizzes.forEach(quizId => {
                if (!testSeries.quizzes.includes(quizId)) {
                    testSeries.quizzes.push(quizId);
                }
            });
        }

        // Remove section
        testSeries.sections.pull(sectionId);
        await testSeries.save();

        return res.status(200).json(
            new ApiResponse(200, testSeries, "Section deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting section");
    }
});

/**
 * Add quiz to section
 * @route POST /api/v1/test-series/:testSeriesId/sections/:sectionId/quizzes/:quizId
 * @access Admin and creator only
 */
const addQuizToSection = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId, sectionId, quizId } = req.params;

        console.log('Add quiz to section request:', { testSeriesId, sectionId, quizId, userId: req.user._id, userRole: req.user.role });

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }

        console.log('Found test series and quiz:', { testSeriesId: testSeries._id, quizId: quiz._id });

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            console.log('Permission denied for quiz to section:', { userRole: req.user.role, userId: req.user._id, creator: testSeries.creator });
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Find section
        const section = testSeries.sections.id(sectionId);
        if (!section) {
            console.log('Section not found:', { sectionId, availableSections: testSeries.sections.map(s => s._id) });
            throw new ApiError(404, "Section not found");
        }

        console.log('Found section:', { sectionId: section._id, title: section.title });

        // Check if quiz is already in this section
        if (section.quizzes.includes(quizId)) {
            throw new ApiError(400, "Quiz is already in this section");
        }

        // Add quiz to section
        section.quizzes.push(quizId);
        console.log('Added quiz to section, section now has:', section.quizzes.length, 'quizzes');

        // Remove quiz from main quizzes array if it exists there
        const originalQuizzesCount = testSeries.quizzes.length;
        testSeries.quizzes = testSeries.quizzes.filter(id => id.toString() !== quizId);
        console.log('Removed quiz from main array:', { originalCount: originalQuizzesCount, newCount: testSeries.quizzes.length });

        // Update quiz to reference this test series
        quiz.testSeries = testSeriesId;

        await Promise.all([testSeries.save(), quiz.save()]);
        console.log('Saved test series and quiz successfully');

        const updatedTestSeries = await TestSeries.findById(testSeriesId)
            .populate({
                path: "sections.quizzes",
                select: "title description timeLimit questions"
            });

        return res.status(200).json(
            new ApiResponse(200, updatedTestSeries, "Quiz added to section successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding quiz to section");
    }
});

/**
 * Remove quiz from section
 * @route DELETE /api/v1/test-series/:testSeriesId/sections/:sectionId/quizzes/:quizId
 * @access Admin and creator only
 */
const removeQuizFromSection = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId, sectionId, quizId } = req.params;

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Find section
        const section = testSeries.sections.id(sectionId);
        if (!section) {
            throw new ApiError(404, "Section not found");
        }

        // Remove quiz from section
        section.quizzes = section.quizzes.filter(id => id.toString() !== quizId);

        // Add quiz back to main quizzes array
        if (!testSeries.quizzes.includes(quizId)) {
            testSeries.quizzes.push(quizId);
        }

        await testSeries.save();

        const updatedTestSeries = await TestSeries.findById(testSeriesId)
            .populate({
                path: "sections.quizzes",
                select: "title description timeLimit questions"
            });

        return res.status(200).json(
            new ApiResponse(200, updatedTestSeries, "Quiz removed from section successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while removing quiz from section");
    }
});

/**
 * Reorder sections
 * @route PUT /api/v1/test-series/:testSeriesId/sections/reorder
 * @access Admin and creator only
 */
const reorderSections = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;
        const { sectionOrders } = req.body; // Array of { sectionId, order }

        if (!sectionOrders || !Array.isArray(sectionOrders)) {
            throw new ApiError(400, "Section orders array is required");
        }

        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user is admin or test series creator
        if (req.user.role !== "admin" && testSeries.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this test series");
        }

        // Update section orders
        sectionOrders.forEach(({ sectionId, order }) => {
            const section = testSeries.sections.id(sectionId);
            if (section) {
                section.order = order;
            }
        });

        await testSeries.save();

        return res.status(200).json(
            new ApiResponse(200, testSeries, "Sections reordered successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while reordering sections");
    }
});

/**
 * Fix test series quizzes array and recalculate totals (migration function)
 * @route POST /api/v1/test-series/fix-quizzes
 * @access Admin only
 */
const fixTestSeriesQuizzes = asyncHandler(async (req, res) => {
    try {
        // Find all quizzes that have testSeries but are not in the test series' quizzes array
        const quizzesWithTestSeries = await Quiz.find({ testSeries: { $exists: true } });

        let fixed = 0;
        const testSeriesToUpdate = new Set();

        for (const quiz of quizzesWithTestSeries) {
            const testSeries = await TestSeries.findById(quiz.testSeries);
            if (testSeries && !testSeries.quizzes.includes(quiz._id)) {
                await TestSeries.findByIdAndUpdate(
                    quiz.testSeries,
                    { $addToSet: { quizzes: quiz._id } }
                );
                testSeriesToUpdate.add(quiz.testSeries.toString());
                fixed++;
            }
        }

        // Recalculate totals for all affected test series
        for (const testSeriesId of testSeriesToUpdate) {
            await recalculateTestSeriesTotals(testSeriesId);
        }

        return res.status(200).json(
            new ApiResponse(200, { fixed }, `Fixed ${fixed} test series quiz assignments and recalculated totals`)
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fixing test series quizzes");
    }
});

export {
    createTestSeries,
    getAllTestSeries,
    getPublishedTestSeries,
    getEnrolledTestSeries,
    getTestSeriesById,
    updateTestSeries,
    deleteTestSeries,
    toggleTestSeriesPublishStatus,
    addQuizToTestSeries,
    removeQuizFromTestSeries,
    enrollInTestSeries,
    addSectionToTestSeries,
    updateSectionInTestSeries,
    deleteSectionFromTestSeries,
    addQuizToSection,
    removeQuizFromSection,
    reorderSections,
    fixTestSeriesQuizzes
};
