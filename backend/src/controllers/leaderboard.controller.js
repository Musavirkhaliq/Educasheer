import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { LeaderboardEntry } from "../models/leaderboard.model.js";
import { TestSeries } from "../models/testSeries.model.js";
import { QuizAttempt } from "../models/quiz.model.js";

/**
 * Get leaderboard for a test series
 * @route GET /api/v1/leaderboard/test-series/:testSeriesId
 * @access Public (for enrolled users)
 */
const getTestSeriesLeaderboard = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;
        const { limit = 50, page = 1 } = req.query;

        // Verify test series exists
        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Check if user has access to this test series
        const isEnrolled = req.user && testSeries.enrolledStudents.includes(req.user._id);
        const isAdmin = req.user && req.user.role === "admin";
        const isCreator = req.user && testSeries.creator.toString() === req.user._id.toString();

        if (!testSeries.isPublished && !isAdmin && !isCreator) {
            throw new ApiError(403, "Test series is not published");
        }

        // For non-enrolled users, only show limited leaderboard
        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        const skip = (pageNum - 1) * limitNum;

        // Get all leaderboard entries for debugging
        let query = LeaderboardEntry.find({
            testSeries: testSeriesId
        })
            .populate('user', 'username fullName avatar')
            .sort({ rank: 1 });

        // If user is not enrolled, limit to top performers only
        if (!isEnrolled && !isAdmin && !isCreator) {
            query = query.limit(10); // Show only top 10 for non-enrolled users
        } else {
            query = query.skip(skip).limit(limitNum);
        }

        const leaderboard = await query;

        // Get total count for pagination
        const totalEntries = await LeaderboardEntry.countDocuments({
            testSeries: testSeriesId
        });

        // Find current user's position if enrolled
        let userPosition = null;
        if (req.user && (isEnrolled || isAdmin || isCreator)) {
            const userEntry = await LeaderboardEntry.findOne({
                testSeries: testSeriesId,
                user: req.user._id
            });
            if (userEntry) {
                userPosition = {
                    rank: userEntry.rank,
                    averagePercentage: userEntry.averagePercentage,
                    completionPercentage: userEntry.completionPercentage,
                    completedQuizzes: userEntry.completedQuizzes,
                    totalQuizzes: userEntry.totalQuizzes
                };
            }
        }

        // Format response data - filter out entries with 0 completed quizzes for display
        const formattedLeaderboard = leaderboard
            .filter(entry => entry.completedQuizzes > 0)
            .map(entry => ({
                rank: entry.rank,
                user: {
                    id: entry.user._id,
                    username: entry.user.username,
                    fullName: entry.user.fullName,
                    avatar: entry.user.avatar
                },
                averagePercentage: entry.averagePercentage,
                completionPercentage: entry.completionPercentage,
                completedQuizzes: entry.completedQuizzes,
                totalQuizzes: entry.totalQuizzes,
                totalTimeSpent: entry.totalTimeSpent,
                averageTimePerQuiz: entry.averageTimePerQuiz,
                lastUpdated: entry.lastUpdated
            }));

        return res.status(200).json(
            new ApiResponse(200, {
                leaderboard: formattedLeaderboard,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalEntries / limitNum),
                    totalEntries,
                    hasNext: pageNum * limitNum < totalEntries,
                    hasPrev: pageNum > 1
                },
                userPosition,
                testSeries: {
                    id: testSeries._id,
                    title: testSeries.title,
                    totalQuizzes: testSeries.totalQuizzes
                }
            }, "Leaderboard fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching leaderboard");
    }
});

/**
 * Update user's leaderboard entry after quiz completion
 * @route POST /api/v1/leaderboard/update/:testSeriesId
 * @access Authenticated users (internal use)
 */
const updateUserLeaderboard = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;
        const userId = req.user._id;

        // Verify test series exists and user is enrolled
        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        if (!testSeries.enrolledStudents.includes(userId)) {
            throw new ApiError(403, "User is not enrolled in this test series");
        }

        // Find or create leaderboard entry
        let leaderboardEntry = await LeaderboardEntry.findOne({
            testSeries: testSeriesId,
            user: userId
        });

        if (!leaderboardEntry) {
            leaderboardEntry = new LeaderboardEntry({
                testSeries: testSeriesId,
                user: userId
            });
        }

        // Update stats
        console.log(`Updating leaderboard stats for user ${userId} in test series ${testSeriesId}`);
        await leaderboardEntry.updateStats();
        console.log(`Updated stats: ${leaderboardEntry.completedQuizzes} completed quizzes, ${leaderboardEntry.averagePercentage}% average`);

        // Update ranks for the entire test series
        await LeaderboardEntry.updateRanks(testSeriesId);

        return res.status(200).json(
            new ApiResponse(200, {
                completedQuizzes: leaderboardEntry.completedQuizzes,
                averagePercentage: leaderboardEntry.averagePercentage,
                rank: leaderboardEntry.rank
            }, "Leaderboard updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating leaderboard");
    }
});

/**
 * Get user's detailed performance in a test series
 * @route GET /api/v1/leaderboard/user/:testSeriesId
 * @access Authenticated users (enrolled only)
 */
const getUserPerformance = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;
        const userId = req.user._id;

        // Verify test series exists and user is enrolled
        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        const isEnrolled = testSeries.enrolledStudents.includes(userId);
        const isAdmin = req.user.role === "admin";
        const isCreator = testSeries.creator.toString() === userId.toString();

        if (!isEnrolled && !isAdmin && !isCreator) {
            throw new ApiError(403, "User is not enrolled in this test series");
        }

        // Get user's leaderboard entry
        const leaderboardEntry = await LeaderboardEntry.findOne({
            testSeries: testSeriesId,
            user: userId
        }).populate('bestAttempts.quiz', 'title timeLimit')
            .populate('bestAttempts.attempt', 'score percentage timeSpent createdAt');

        if (!leaderboardEntry) {
            // Create entry if it doesn't exist
            const newEntry = new LeaderboardEntry({
                testSeries: testSeriesId,
                user: userId
            });
            await newEntry.updateStats();

            return res.status(200).json(
                new ApiResponse(200, {
                    rank: 0,
                    averagePercentage: 0,
                    completionPercentage: 0,
                    completedQuizzes: 0,
                    totalQuizzes: testSeries.totalQuizzes,
                    totalTimeSpent: 0,
                    averageTimePerQuiz: 0,
                    bestAttempts: [],
                    lastUpdated: new Date()
                }, "User performance fetched successfully")
            );
        }

        // Format detailed performance data
        const performanceData = {
            rank: leaderboardEntry.rank,
            averagePercentage: leaderboardEntry.averagePercentage,
            completionPercentage: leaderboardEntry.completionPercentage,
            completedQuizzes: leaderboardEntry.completedQuizzes,
            totalQuizzes: leaderboardEntry.totalQuizzes,
            totalScore: leaderboardEntry.totalScore,
            totalMaxScore: leaderboardEntry.totalMaxScore,
            totalTimeSpent: leaderboardEntry.totalTimeSpent,
            averageTimePerQuiz: leaderboardEntry.averageTimePerQuiz,
            bestAttempts: leaderboardEntry.bestAttempts.map(attempt => ({
                quiz: {
                    id: attempt.quiz._id,
                    title: attempt.quiz.title,
                    timeLimit: attempt.quiz.timeLimit
                },
                score: attempt.score,
                percentage: attempt.percentage,
                timeSpent: attempt.timeSpent,
                completedAt: attempt.attempt?.createdAt
            })),
            lastUpdated: leaderboardEntry.lastUpdated
        };

        return res.status(200).json(
            new ApiResponse(200, performanceData, "User performance fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching user performance");
    }
});

/**
 * Debug leaderboard entries for a test series
 * @route GET /api/v1/leaderboard/debug/:testSeriesId
 * @access Admin only
 */
const debugLeaderboard = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;

        // Check admin permission
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Only admins can debug leaderboards");
        }

        // Get test series
        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Get all leaderboard entries
        const entries = await LeaderboardEntry.find({ testSeries: testSeriesId })
            .populate('user', 'username fullName')
            .sort({ rank: 1 });

        // Get quiz attempts for this test series

        // Collect all quiz IDs from test series
        let allQuizIds = [...(testSeries.quizzes || [])];
        if (testSeries.sections) {
            testSeries.sections.forEach(section => {
                if (section.quizzes) {
                    allQuizIds = allQuizIds.concat(section.quizzes);
                }
            });
        }
        allQuizIds = [...new Set(allQuizIds.map(id => id.toString()))];

        const attempts = await QuizAttempt.find({
            quiz: { $in: allQuizIds },
            isCompleted: true
        }).populate('user', 'username fullName').populate('quiz', 'title');

        // Get all quiz attempts for this test series (regardless of completion)
        const allAttempts = await QuizAttempt.find({
            quiz: { $in: allQuizIds }
        }).populate('user', 'username fullName').populate('quiz', 'title');

        return res.status(200).json(
            new ApiResponse(200, {
                testSeries: {
                    id: testSeries._id,
                    title: testSeries.title,
                    enrolledStudents: testSeries.enrolledStudents.length,
                    totalQuizzes: allQuizIds.length,
                    quizIds: allQuizIds
                },
                leaderboardEntries: entries.length,
                entries: entries.map(entry => ({
                    user: entry.user.username || entry.user.fullName,
                    completedQuizzes: entry.completedQuizzes,
                    totalQuizzes: entry.totalQuizzes,
                    averagePercentage: entry.averagePercentage,
                    rank: entry.rank
                })),
                completedAttempts: attempts.length,
                allAttempts: allAttempts.length,
                sampleAttempts: allAttempts.slice(0, 5).map(attempt => ({
                    user: attempt.user.username || attempt.user.fullName,
                    quiz: attempt.quiz.title,
                    quizId: attempt.quiz._id,
                    percentage: attempt.percentage,
                    isCompleted: attempt.isCompleted
                }))
            }, "Debug data fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while debugging leaderboard");
    }
});

/**
 * Ensure leaderboard entries exist for all enrolled users
 * @route POST /api/v1/leaderboard/ensure/:testSeriesId
 * @access Admin only
 */
const ensureLeaderboardEntries = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;

        // Check admin permission
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Only admins can manage leaderboards");
        }

        // Verify test series exists
        const testSeries = await TestSeries.findById(testSeriesId).populate('quizzes sections.quizzes');
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Collect all quiz IDs from test series
        let allQuizIds = [...(testSeries.quizzes || [])];
        if (testSeries.sections) {
            testSeries.sections.forEach(section => {
                if (section.quizzes) {
                    allQuizIds = allQuizIds.concat(section.quizzes);
                }
            });
        }
        allQuizIds = [...new Set(allQuizIds.map(id => id.toString()))];

        // Find all users who have completed at least one quiz in this test series
        const usersWithAttempts = await QuizAttempt.distinct('user', {
            quiz: { $in: allQuizIds },
            isCompleted: true
        });

        console.log(`Found ${usersWithAttempts.length} users with attempts for ${allQuizIds.length} quizzes`);

        let createdCount = 0;

        // Create leaderboard entries for users who don't have them
        for (const userId of usersWithAttempts) {
            const existingEntry = await LeaderboardEntry.findOne({
                testSeries: testSeriesId,
                user: userId
            });

            if (!existingEntry) {
                const newEntry = new LeaderboardEntry({
                    testSeries: testSeriesId,
                    user: userId,
                    totalQuizzes: allQuizIds.length
                });
                await newEntry.save();
                createdCount++;
                console.log(`Created leaderboard entry for user ${userId}`);
            }
        }

        return res.status(200).json(
            new ApiResponse(200, {
                createdCount,
                usersWithAttempts: usersWithAttempts.length,
                totalQuizzes: allQuizIds.length
            }, `Ensured leaderboard entries exist. Created ${createdCount} new entries.`)
        );
    } catch (error) {
        console.error('Error ensuring leaderboard entries:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while ensuring leaderboard entries");
    }
});

/**
 * Refresh leaderboard for a test series (admin only)
 * @route POST /api/v1/leaderboard/refresh/:testSeriesId
 * @access Admin only
 */
const refreshLeaderboard = asyncHandler(async (req, res) => {
    try {
        const { testSeriesId } = req.params;

        // Check admin permission
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Only admins can refresh leaderboards");
        }

        // Verify test series exists
        const testSeries = await TestSeries.findById(testSeriesId);
        if (!testSeries) {
            throw new ApiError(404, "Test series not found");
        }

        // Use a more robust approach to find quiz attempts
        // Instead of relying on potentially corrupted quiz IDs in test series,
        // find all quizzes that belong to this test series directly from Quiz collection
        const { Quiz } = await import("../models/quiz.model.js");
        const quizzesInSeries = await Quiz.find({ testSeries: testSeriesId }).select('_id');
        const validQuizIds = quizzesInSeries.map(quiz => quiz._id.toString());

        console.log(`Found ${validQuizIds.length} quizzes directly from Quiz collection for test series ${testSeriesId}`);

        // Find all users who have completed at least one quiz in this test series
        const usersWithAttempts = await QuizAttempt.distinct('user', {
            quiz: { $in: validQuizIds },
            isCompleted: true
        });

        console.log(`Found ${usersWithAttempts.length} users with attempts in test series ${testSeriesId}`);

        // Update leaderboard entries for all users with attempts
        let processedCount = 0;
        let errorCount = 0;
        let createdCount = 0;

        for (const userId of usersWithAttempts) {
            try {
                let leaderboardEntry = await LeaderboardEntry.findOne({
                    testSeries: testSeriesId,
                    user: userId
                });

                if (!leaderboardEntry) {
                    leaderboardEntry = new LeaderboardEntry({
                        testSeries: testSeriesId,
                        user: userId,
                        totalQuizzes: validQuizIds.length
                    });
                    await leaderboardEntry.save();
                    createdCount++;
                    console.log(`Created new leaderboard entry for user ${userId}`);
                }

                // Manually update stats using the direct quiz IDs approach
                await updateLeaderboardStatsDirectly(leaderboardEntry, validQuizIds);
                console.log(`Updated stats for user ${userId}: ${leaderboardEntry.completedQuizzes} completed quizzes`);
                processedCount++;
            } catch (userError) {
                console.error(`Error processing user ${userId}:`, userError.message);
                errorCount++;
            }
        }

        // Update ranks for the entire test series
        await LeaderboardEntry.updateRanks(testSeriesId);

        return res.status(200).json(
            new ApiResponse(200, {
                usersWithAttempts: usersWithAttempts.length,
                processedCount,
                createdCount,
                errorCount,
                totalQuizzes: validQuizIds.length
            }, "Leaderboard refreshed successfully")
        );
    } catch (error) {
        console.error('Error refreshing leaderboard:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while refreshing leaderboard");
    }
});

/**
 * Helper function to update leaderboard stats directly using quiz IDs
 */
async function updateLeaderboardStatsDirectly(leaderboardEntry, validQuizIds) {
    try {
        // Get all attempts for this user in this test series
        const attempts = await QuizAttempt.find({
            user: leaderboardEntry.user,
            quiz: { $in: validQuizIds },
            isCompleted: true
        }).populate('quiz', 'title');

        console.log(`Found ${attempts.length} completed attempts for user ${leaderboardEntry.user}`);

        // Group attempts by quiz and get best attempt for each
        const bestAttemptsByQuiz = {};
        let totalScore = 0;
        let totalMaxScore = 0;
        let totalTimeSpent = 0;

        attempts.forEach(attempt => {
            const quizId = attempt.quiz._id.toString();

            if (!bestAttemptsByQuiz[quizId] || attempt.percentage > bestAttemptsByQuiz[quizId].percentage) {
                bestAttemptsByQuiz[quizId] = attempt;
            }
        });

        // Calculate stats from best attempts
        const bestAttempts = Object.values(bestAttemptsByQuiz);
        console.log(`Processing ${bestAttempts.length} best attempts`);

        bestAttempts.forEach(attempt => {
            totalScore += attempt.score || 0;
            totalMaxScore += attempt.maxScore || 0;
            totalTimeSpent += attempt.timeSpent || 0;
        });

        console.log(`Calculated totals: score=${totalScore}, maxScore=${totalMaxScore}, time=${totalTimeSpent}`);

        // Update leaderboard entry
        leaderboardEntry.totalScore = totalScore;
        leaderboardEntry.totalMaxScore = totalMaxScore;
        leaderboardEntry.averagePercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
        leaderboardEntry.completedQuizzes = bestAttempts.length;
        leaderboardEntry.totalQuizzes = validQuizIds.length;
        leaderboardEntry.completionPercentage = validQuizIds.length > 0 ? Math.round((bestAttempts.length / validQuizIds.length) * 100) : 0;
        leaderboardEntry.totalTimeSpent = totalTimeSpent;
        leaderboardEntry.averageTimePerQuiz = bestAttempts.length > 0 ? Math.round(totalTimeSpent / bestAttempts.length) : 0;
        leaderboardEntry.bestAttempts = bestAttempts.map(attempt => ({
            quiz: attempt.quiz._id,
            attempt: attempt._id,
            score: attempt.score || 0,
            percentage: attempt.percentage || 0,
            timeSpent: attempt.timeSpent || 0
        }));
        leaderboardEntry.lastUpdated = new Date();

        console.log(`Saving leaderboard entry with ${leaderboardEntry.completedQuizzes} completed quizzes`);
        await leaderboardEntry.save();

        return leaderboardEntry;
    } catch (error) {
        console.error('Error updating leaderboard stats directly:', error);
        throw error;
    }
}

export {
    getTestSeriesLeaderboard,
    updateUserLeaderboard,
    getUserPerformance,
    refreshLeaderboard,
    ensureLeaderboardEntries,
    debugLeaderboard
};