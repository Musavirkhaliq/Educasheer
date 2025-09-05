import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { 
    cleanupExpiredAttempts, 
    cleanupOldCompletedAttempts, 
    getAttemptStatistics,
    performManualCleanup
} from "../services/quizCleanup.service.js";

/**
 * Get quiz attempt statistics
 * @route GET /api/v1/admin/quiz-cleanup/stats
 * @access Admin only
 */
const getCleanupStatistics = asyncHandler(async (req, res) => {
    try {
        const stats = await getAttemptStatistics();
        
        return res.status(200).json(
            new ApiResponse(200, stats, "Quiz attempt statistics fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch statistics");
    }
});

/**
 * Manually trigger cleanup of expired attempts
 * @route POST /api/v1/admin/quiz-cleanup/expired
 * @access Admin only
 */
const cleanupExpired = asyncHandler(async (req, res) => {
    try {
        const cleanedCount = await cleanupExpiredAttempts();
        
        return res.status(200).json(
            new ApiResponse(200, { cleanedCount }, `Successfully cleaned up ${cleanedCount} expired attempts`)
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to cleanup expired attempts");
    }
});

/**
 * Manually trigger cleanup of old completed attempts
 * @route POST /api/v1/admin/quiz-cleanup/old
 * @access Admin only
 */
const cleanupOldAttempts = asyncHandler(async (req, res) => {
    try {
        const { daysOld = 365 } = req.body;
        
        if (daysOld < 30) {
            throw new ApiError(400, "Cannot delete attempts newer than 30 days");
        }
        
        const cleanedCount = await cleanupOldCompletedAttempts(daysOld);
        
        return res.status(200).json(
            new ApiResponse(200, { cleanedCount }, `Successfully cleaned up ${cleanedCount} old attempts (older than ${daysOld} days)`)
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to cleanup old attempts");
    }
});

/**
 * Perform comprehensive cleanup
 * @route POST /api/v1/admin/quiz-cleanup/full
 * @access Admin only
 */
const performFullCleanup = asyncHandler(async (req, res) => {
    try {
        const { 
            cleanupExpired = true, 
            cleanupOld = false, 
            oldAttemptsDays = 365 
        } = req.body;
        
        const results = await performManualCleanup({
            cleanupExpired,
            cleanupOld,
            oldAttemptsDays
        });
        
        return res.status(200).json(
            new ApiResponse(200, results, "Cleanup completed successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to perform cleanup");
    }
});

export {
    getCleanupStatistics,
    cleanupExpired,
    cleanupOldAttempts,
    performFullCleanup
};