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
        const quizWithoutAnswers = await Quiz.findById(quizId)
            .select("-questions.options.isCorrect -questions.correctAnswer");
            
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
        
        // Update course progress
        await updateCourseProgressForQuiz(userId, quiz.course, quiz._id, percentage);
        
        // Award points based on performance
        if (isPassed) {
            let pointsToAward = 50; // Base points for passing
            
            // Bonus points for high scores
            if (percentage >= 90) {
                pointsToAward += 50; // Bonus for excellent score
            } else if (percentage >= 75) {
                pointsToAward += 25; // Bonus for good score
            }
            
            await awardPoints(userId, pointsToAward, "quiz", `Completed ${quiz.title} with ${percentage.toFixed(1)}% score`);
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
            .populate("quiz", "title description timeLimit passingScore showCorrectAnswers");
            
        if (!attempt) {
            throw new ApiError(404, "Quiz attempt not found");
        }
        
        // Check if this attempt belongs to the user or user is admin
        if (attempt.user.toString() !== userId.toString() && req.user.role !== "admin") {
            throw new ApiError(403, "You don't have permission to view this attempt");
        }
        
        return res.status(200).json(
            new ApiResponse(200, attempt, "Quiz attempt fetched successfully")
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

export {
    startQuizAttempt,
    submitQuizAttempt,
    getQuizAttempt,
    getQuizAttempts,
    getUserQuizAttempts
};
