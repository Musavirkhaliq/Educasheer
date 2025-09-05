import { QuizAttempt, Quiz } from "../models/quiz.model.js";
import cron from "node-cron";

/**
 * Clean up expired quiz attempts
 * Removes attempts that have been in progress for longer than the quiz time limit + grace period
 */
export const cleanupExpiredAttempts = async () => {
    try {
        console.log("Starting cleanup of expired quiz attempts...");

        // Find all incomplete attempts
        const incompleteAttempts = await QuizAttempt.find({
            isCompleted: false
        }).populate('quiz', 'timeLimit title');

        let cleanedCount = 0;
        const gracePeriodMinutes = 30; // Additional grace period beyond quiz time limit

        for (const attempt of incompleteAttempts) {
            if (!attempt.quiz) {
                // Quiz was deleted, remove orphaned attempt
                await QuizAttempt.findByIdAndDelete(attempt._id);
                cleanedCount++;
                console.log(`Removed orphaned attempt: ${attempt._id}`);
                continue;
            }

            const quiz = attempt.quiz;
            
            // Skip if quiz has no time limit
            if (!quiz.timeLimit || quiz.timeLimit <= 0) {
                continue;
            }

            const startTime = new Date(attempt.startTime);
            const currentTime = new Date();
            const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
            const totalAllowedTime = quiz.timeLimit + gracePeriodMinutes;

            if (elapsedMinutes > totalAllowedTime) {
                await QuizAttempt.findByIdAndDelete(attempt._id);
                cleanedCount++;
                console.log(`Removed expired attempt: ${attempt._id} for quiz "${quiz.title}" (elapsed: ${elapsedMinutes}min, limit: ${totalAllowedTime}min)`);
            }
        }

        console.log(`Cleanup completed. Removed ${cleanedCount} expired attempts.`);
        return cleanedCount;
    } catch (error) {
        console.error("Error during quiz attempt cleanup:", error);
        throw error;
    }
};

/**
 * Clean up very old completed attempts (optional - for data management)
 * Removes completed attempts older than specified days
 */
export const cleanupOldCompletedAttempts = async (daysOld = 365) => {
    try {
        console.log(`Starting cleanup of completed attempts older than ${daysOld} days...`);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await QuizAttempt.deleteMany({
            isCompleted: true,
            endTime: { $lt: cutoffDate }
        });

        console.log(`Cleanup completed. Removed ${result.deletedCount} old completed attempts.`);
        return result.deletedCount;
    } catch (error) {
        console.error("Error during old attempts cleanup:", error);
        throw error;
    }
};

/**
 * Get statistics about quiz attempts
 */
export const getAttemptStatistics = async () => {
    try {
        const stats = await QuizAttempt.aggregate([
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    completedAttempts: {
                        $sum: { $cond: ["$isCompleted", 1, 0] }
                    },
                    incompleteAttempts: {
                        $sum: { $cond: [{ $not: "$isCompleted" }, 1, 0] }
                    },
                    averageScore: {
                        $avg: {
                            $cond: ["$isCompleted", "$percentage", null]
                        }
                    }
                }
            }
        ]);

        return stats[0] || {
            totalAttempts: 0,
            completedAttempts: 0,
            incompleteAttempts: 0,
            averageScore: 0
        };
    } catch (error) {
        console.error("Error getting attempt statistics:", error);
        throw error;
    }
};

/**
 * Initialize cleanup scheduler
 * Runs cleanup every hour
 */
export const initializeCleanupScheduler = () => {
    // Run cleanup every hour
    cron.schedule('0 * * * *', async () => {
        try {
            await cleanupExpiredAttempts();
        } catch (error) {
            console.error("Scheduled cleanup failed:", error);
        }
    });

    // Run old attempts cleanup daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
        try {
            await cleanupOldCompletedAttempts(365); // Remove attempts older than 1 year
        } catch (error) {
            console.error("Scheduled old attempts cleanup failed:", error);
        }
    });

    console.log("Quiz cleanup scheduler initialized");
};

/**
 * Manual cleanup function for admin use
 */
export const performManualCleanup = async (options = {}) => {
    const {
        cleanupExpired = true,
        cleanupOld = false,
        oldAttemptsDays = 365
    } = options;

    const results = {
        expiredCleaned: 0,
        oldCleaned: 0,
        statistics: null
    };

    try {
        if (cleanupExpired) {
            results.expiredCleaned = await cleanupExpiredAttempts();
        }

        if (cleanupOld) {
            results.oldCleaned = await cleanupOldCompletedAttempts(oldAttemptsDays);
        }

        results.statistics = await getAttemptStatistics();

        return results;
    } catch (error) {
        console.error("Manual cleanup failed:", error);
        throw error;
    }
};