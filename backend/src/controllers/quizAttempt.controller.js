import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Quiz, QuizAttempt } from "../models/quiz.model.js";
import { updateCourseProgressForQuiz } from "../services/courseCompletion.service.js";
import { awardPoints } from "../services/gamification.service.js";
import mongoose from "mongoose";

/**
 * Start a quiz attempt
 * @route POST /api/v1/quizzes/:quizId/attempts
 * @access Authenticated
 */
const startQuizAttempt = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user._id;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Check if quiz is published
        if (!quiz.isPublished) {
            throw new ApiError(403, "This quiz is not available for attempts");
        }
        
        // Check if user has reached maximum attempts
        if (quiz.maxAttempts > 0) {
            const attemptCount = await QuizAttempt.countDocuments({
                quiz: quizId,
                user: userId,
                isCompleted: true
            });
            
            if (attemptCount >= quiz.maxAttempts) {
                throw new ApiError(400, `You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz`);
            }
        }
        
        // Check if user has an incomplete attempt
        const incompleteAttempt = await QuizAttempt.findOne({
            quiz: quizId,
            user: userId,
            isCompleted: false
        });
        
        if (incompleteAttempt) {
            return res.status(200).json(
                new ApiResponse(200, incompleteAttempt, "Continuing previous quiz attempt")
            );
        }
        
        // Create a new attempt
        const quizAttempt = await QuizAttempt.create({
            quiz: quizId,
            user: userId,
            startTime: new Date(),
            answers: [],
            maxScore: quiz.questions.reduce((total, q) => total + q.points, 0)
        });
        
        // Return the quiz with questions but without correct answers
        const quizWithoutAnswers = await Quiz.findById(quizId).lean();

        // Remove correct answers from the quiz data
        if (quizWithoutAnswers && quizWithoutAnswers.questions) {
            quizWithoutAnswers.questions = quizWithoutAnswers.questions.map(question => {
                const questionCopy = { ...question };

                // Remove correct answer field for short answer questions
                delete questionCopy.correctAnswer;

                // Remove isCorrect field from options
                if (questionCopy.options) {
                    questionCopy.options = questionCopy.options.map(option => {
                        const optionCopy = { ...option };
                        delete optionCopy.isCorrect;
                        return optionCopy;
                    });
                }

                return questionCopy;
            });
        }
            
        return res.status(201).json(
            new ApiResponse(201, {
                attempt: quizAttempt,
                quiz: quizWithoutAnswers
            }, "Quiz attempt started successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to start quiz attempt");
    }
});

/**
 * Submit a quiz attempt
 * @route POST /api/v1/quizzes/attempts/:attemptId/submit
 * @access Authenticated
 */
const submitQuizAttempt = asyncHandler(async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body;
        const userId = req.user._id;

        console.log("Quiz submission started:", { attemptId, userId, answersCount: answers?.length });

        if (!answers || !Array.isArray(answers)) {
            throw new ApiError(400, "Answers are required");
        }
        
        // Find the attempt
        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt) {
            throw new ApiError(404, "Quiz attempt not found");
        }
        
        // Check if this attempt belongs to the user
        if (attempt.user.toString() !== userId.toString()) {
            throw new ApiError(403, "You don't have permission to submit this attempt");
        }
        
        // Check if attempt is already completed
        if (attempt.isCompleted) {
            throw new ApiError(400, "This quiz attempt has already been submitted");
        }
        
        // Find the quiz
        const quiz = await Quiz.findById(attempt.quiz);
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Process answers and calculate score
        let totalPoints = 0;
        let earnedPoints = 0;
        
        const processedAnswers = answers.map(answer => {
            const question = quiz.questions.id(answer.questionId);
            
            if (!question) {
                return null;
            }
            
            totalPoints += question.points;
            let isCorrect = false;
            let pointsEarned = 0;
            
            // Check if answer is correct based on question type
            if (question.type === "multiple_choice") {
                // For multiple choice, check if selected options match correct options
                const correctOptions = question.options
                    .filter(opt => opt.isCorrect)
                    .map(opt => opt._id.toString());
                
                const selectedOptions = answer.selectedOptions || [];
                
                // Check if arrays have same elements (regardless of order)
                isCorrect = correctOptions.length === selectedOptions.length &&
                    correctOptions.every(opt => selectedOptions.includes(opt));
                
                if (isCorrect) {
                    pointsEarned = question.points;
                }
            } else if (question.type === "true_false") {
                // For true/false, check if selected option is correct
                const correctOption = question.options.find(opt => opt.isCorrect);
                isCorrect = answer.selectedOptions && 
                    answer.selectedOptions[0] === correctOption._id.toString();
                
                if (isCorrect) {
                    pointsEarned = question.points;
                }
            } else if (question.type === "short_answer") {
                // For short answer, check if text matches correct answer (case insensitive)
                isCorrect = answer.textAnswer && 
                    answer.textAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
                
                if (isCorrect) {
                    pointsEarned = question.points;
                }
            } else if (question.type === "essay") {
                // For essay, mark as pending review
                isCorrect = null;
                pointsEarned = 0;
            }
            
            earnedPoints += pointsEarned;
            
            return {
                question: question._id,
                selectedOptions: answer.selectedOptions || [],
                textAnswer: answer.textAnswer || "",
                isCorrect,
                pointsEarned
            };
        }).filter(answer => answer !== null);
        
        // Calculate score percentage
        const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const isPassed = percentage >= quiz.passingScore;
        
        // Update attempt
        attempt.answers = processedAnswers;
        attempt.endTime = new Date();
        attempt.score = earnedPoints;
        attempt.maxScore = totalPoints;
        attempt.percentage = percentage;
        attempt.isPassed = isPassed;
        attempt.isCompleted = true;
        attempt.timeSpent = Math.floor((attempt.endTime - attempt.startTime) / 1000); // in seconds
        
        await attempt.save();
        
        console.log("Quiz submission processed successfully:", {
            earnedPoints,
            totalPoints,
            percentage,
            isPassed
        });

        // Update course progress
        try {
            await updateCourseProgressForQuiz(userId, quiz.course, quiz._id, percentage);
        } catch (courseProgressError) {
            console.error("Error updating course progress:", courseProgressError);
            // Continue with quiz submission even if course progress fails
        }

        // Award points based on performance
        if (isPassed) {
            try {
                let pointsToAward = 50; // Base points for passing

                // Bonus points for high scores
                if (percentage >= 90) {
                    pointsToAward += 50; // Bonus for excellent score
                } else if (percentage >= 75) {
                    pointsToAward += 25; // Bonus for good score
                }

                await awardPoints(userId, pointsToAward, "quiz", `Completed ${quiz.title} with ${percentage.toFixed(1)}% score`);
            } catch (gamificationError) {
                console.error("Error awarding points:", gamificationError);
                // Continue with quiz submission even if gamification fails
            }
        }
        
        return res.status(200).json(
            new ApiResponse(200, {
                attempt,
                isPassed,
                score: {
                    earned: earnedPoints,
                    total: totalPoints,
                    percentage
                }
            }, "Quiz attempt submitted successfully")
        );
    } catch (error) {
        console.error("Error in submitQuizAttempt:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to submit quiz attempt");
    }
});

/**
 * Get quiz attempt by ID
 * @route GET /api/v1/quizzes/attempts/:attemptId
 * @access Authenticated (own attempts only)
 */
const getQuizAttempt = asyncHandler(async (req, res) => {
    try {
        const { attemptId } = req.params;
        const userId = req.user._id;
        
        // Find the attempt
        const attempt = await QuizAttempt.findById(attemptId)
            .populate("quiz");

        if (!attempt) {
            throw new ApiError(404, "Quiz attempt not found");
        }

        // Check if this attempt belongs to the user or user is admin
        if (attempt.user.toString() !== userId.toString() && req.user.role !== "admin") {
            throw new ApiError(403, "You don't have permission to view this attempt");
        }

        // If quiz allows showing correct answers or user is admin, include full quiz data
        // Otherwise, hide correct answers for security
        let quizData = attempt.quiz;
        if (!attempt.quiz.showCorrectAnswers && req.user.role !== "admin") {
            // Remove correct answer information for security
            quizData = {
                ...attempt.quiz.toObject(),
                questions: attempt.quiz.questions.map(q => ({
                    ...q.toObject(),
                    options: q.options.map(opt => ({
                        _id: opt._id,
                        text: opt.text
                        // Remove isCorrect field
                    })),
                    correctAnswer: undefined // Remove correct answer for short answer questions
                }))
            };
        }

        const responseData = {
            ...attempt.toObject(),
            quiz: quizData
        };

        return res.status(200).json(
            new ApiResponse(200, responseData, "Quiz attempt fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch quiz attempt");
    }
});

/**
 * Get all attempts for a quiz
 * @route GET /api/v1/quizzes/:quizId/attempts
 * @access Admin only
 */
const getQuizAttempts = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Check if user is admin or quiz creator
        if (req.user.role !== "admin" && quiz.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to view these attempts");
        }
        
        // Get all attempts for this quiz
        const attempts = await QuizAttempt.find({ quiz: quizId })
            .populate("user", "username fullName email")
            .sort({ createdAt: -1 });
            
        return res.status(200).json(
            new ApiResponse(200, attempts, "Quiz attempts fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch quiz attempts");
    }
});

/**
 * Get user's attempts for a quiz
 * @route GET /api/v1/quizzes/:quizId/my-attempts
 * @access Authenticated
 */
const getUserQuizAttempts = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user._id;
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }
        
        // Get user's attempts for this quiz
        const attempts = await QuizAttempt.find({
            quiz: quizId,
            user: userId
        }).sort({ createdAt: -1 });
        
        return res.status(200).json(
            new ApiResponse(200, attempts, "User quiz attempts fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch user quiz attempts");
    }
});

/**
 * Get quiz leaderboard - top 10 performers
 * @route GET /api/v1/quizzes/:quizId/leaderboard
 * @access Public (for enrolled students) / Admin
 */
const getQuizLeaderboard = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;

        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            throw new ApiError(404, "Quiz not found");
        }

        // Check if quiz is published (unless user is admin)
        if (!quiz.isPublished && req.user.role !== "admin") {
            throw new ApiError(403, "This quiz is not available");
        }

        // Get top 10 performers for this quiz
        const leaderboard = await QuizAttempt.aggregate([
            {
                $match: {
                    quiz: new mongoose.Types.ObjectId(quizId),
                    isCompleted: true
                }
            },
            {
                $group: {
                    _id: "$user",
                    bestScore: { $max: "$score" },
                    bestPercentage: { $max: "$percentage" },
                    bestAttempt: { $first: "$$ROOT" },
                    totalAttempts: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        { $project: { username: 1, fullName: 1, email: 1 } }
                    ]
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    user: 1,
                    bestScore: 1,
                    bestPercentage: 1,
                    totalAttempts: 1,
                    completedAt: "$bestAttempt.endTime"
                }
            },
            { $sort: { bestPercentage: -1, bestScore: -1, completedAt: 1 } },
            { $limit: 10 }
        ]);

        // Add ranking
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        return res.status(200).json(
            new ApiResponse(200, rankedLeaderboard, "Quiz leaderboard fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch quiz leaderboard");
    }
});

/**
 * Get all quiz attempts across all quizzes (admin only)
 * @route GET /api/v1/quizzes/attempts/all
 * @access Admin only
 */
const getAllQuizAttempts = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "You don't have permission to view all quiz attempts");
        }

        const { page = 1, limit = 20, quiz, user, course, status } = req.query;

        // Build filter object
        const filter = {};

        if (quiz) {
            filter.quiz = quiz;
        }

        if (user) {
            filter.user = user;
        }

        if (status) {
            if (status === 'completed') {
                filter.isCompleted = true;
            } else if (status === 'in-progress') {
                filter.isCompleted = false;
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build aggregation pipeline
        const pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        { $project: { username: 1, fullName: 1, email: 1 } }
                    ]
                }
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quiz",
                    pipeline: [
                        { $project: { title: 1, quizType: 1, course: 1 } }
                    ]
                }
            },
            { $unwind: "$quiz" },
            {
                $lookup: {
                    from: "courses",
                    localField: "quiz.course",
                    foreignField: "_id",
                    as: "course",
                    pipeline: [
                        { $project: { title: 1 } }
                    ]
                }
            },
            { $unwind: "$course" },
            {
                $addFields: {
                    "quiz.course": "$course"
                }
            },
            { $project: { course: 0 } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ];

        // Add course filter if specified
        if (course) {
            pipeline.unshift({
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quizInfo"
                }
            });
            pipeline.unshift({ $unwind: "$quizInfo" });
            pipeline.unshift({
                $match: {
                    "quizInfo.course": new mongoose.Types.ObjectId(course)
                }
            });
        }

        // Get attempts with populated data
        const attempts = await QuizAttempt.aggregate(pipeline);

        // Get total count for pagination
        const totalCountPipeline = [
            { $match: filter }
        ];

        if (course) {
            totalCountPipeline.unshift({
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quizInfo"
                }
            });
            totalCountPipeline.unshift({ $unwind: "$quizInfo" });
            totalCountPipeline.unshift({
                $match: {
                    "quizInfo.course": new mongoose.Types.ObjectId(course)
                }
            });
        }

        totalCountPipeline.push({ $count: "total" });
        const totalResult = await QuizAttempt.aggregate(totalCountPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        const totalPages = Math.ceil(total / parseInt(limit));

        return res.status(200).json(
            new ApiResponse(200, {
                attempts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }, "All quiz attempts fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch all quiz attempts");
    }
});

/**
 * Get all quiz attempts for the current user across all quizzes
 * @route GET /api/v1/quizzes/my-attempts/all
 * @access Authenticated
 */
const getUserAllQuizAttempts = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, status, quizType } = req.query;

        // Build filter object
        const filter = { user: userId };

        if (status) {
            if (status === 'completed') {
                filter.isCompleted = true;
            } else if (status === 'in-progress') {
                filter.isCompleted = false;
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build aggregation pipeline
        const pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quiz",
                    pipeline: [
                        { $project: { title: 1, quizType: 1, course: 1, passingScore: 1, timeLimit: 1 } }
                    ]
                }
            },
            { $unwind: "$quiz" },
            {
                $lookup: {
                    from: "courses",
                    localField: "quiz.course",
                    foreignField: "_id",
                    as: "course",
                    pipeline: [
                        { $project: { title: 1, _id: 1 } }
                    ]
                }
            },
            { $unwind: "$course" },
            {
                $addFields: {
                    "quiz.course": "$course"
                }
            },
            { $project: { course: 0 } }
        ];

        // Add quiz type filter if specified
        if (quizType) {
            pipeline.push({
                $match: { "quiz.quizType": quizType }
            });
        }

        // Add sorting and pagination
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        const attempts = await QuizAttempt.aggregate(pipeline);

        // Get total count for pagination
        const totalCountPipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quiz"
                }
            },
            { $unwind: "$quiz" }
        ];

        if (quizType) {
            totalCountPipeline.push({
                $match: { "quiz.quizType": quizType }
            });
        }

        totalCountPipeline.push({ $count: "total" });
        const totalResult = await QuizAttempt.aggregate(totalCountPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        const totalPages = Math.ceil(total / parseInt(limit));

        // Calculate user statistics
        const statsResult = await QuizAttempt.aggregate([
            { $match: { user: userId, isCompleted: true } },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quiz"
                }
            },
            { $unwind: "$quiz" },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    totalPassed: { $sum: { $cond: ["$isPassed", 1, 0] } },
                    averageScore: { $avg: "$percentage" },
                    totalQuizzes: { $sum: { $cond: [{ $eq: ["$quiz.quizType", "quiz"] }, 1, 0] } },
                    totalExams: { $sum: { $cond: [{ $eq: ["$quiz.quizType", "exam"] }, 1, 0] } },
                    quizzesPassed: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$quiz.quizType", "quiz"] }, "$isPassed"] },
                                1,
                                0
                            ]
                        }
                    },
                    examsPassed: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$quiz.quizType", "exam"] }, "$isPassed"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const stats = statsResult.length > 0 ? statsResult[0] : {
            totalAttempts: 0,
            totalPassed: 0,
            averageScore: 0,
            totalQuizzes: 0,
            totalExams: 0,
            quizzesPassed: 0,
            examsPassed: 0
        };

        return res.status(200).json(
            new ApiResponse(200, {
                attempts,
                stats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }, "User quiz attempts fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch user quiz attempts");
    }
});

export {
    startQuizAttempt,
    submitQuizAttempt,
    getQuizAttempt,
    getQuizAttempts,
    getUserQuizAttempts,
    getQuizLeaderboard,
    getAllQuizAttempts,
    getUserAllQuizAttempts
};
