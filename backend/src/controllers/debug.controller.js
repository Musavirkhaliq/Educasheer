import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

// Debug endpoint to validate video IDs
const validateVideoIds = asyncHandler(async (req, res) => {
    try {
        const { videoIds } = req.body;

        if (!videoIds || !Array.isArray(videoIds)) {
            throw new ApiError(400, "videoIds must be an array");
        }

        // Check if all IDs are valid MongoDB ObjectIds
        const validIds = videoIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        const invalidIds = videoIds.filter(id => !mongoose.Types.ObjectId.isValid(id));

        // Find videos that exist
        const existingVideos = await Video.find({
            _id: { $in: validIds }
        }).select('_id title');

        const existingIds = existingVideos.map(video => video._id.toString());
        const nonExistingIds = validIds.filter(id => !existingIds.includes(id));

        return res.status(200).json(
            new ApiResponse(200, {
                totalIds: videoIds.length,
                validIds: validIds.length,
                invalidIds,
                existingVideos,
                nonExistingIds
            }, "Video IDs validation result")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Error validating video IDs: ${error.message}`);
    }
});

export {
    validateVideoIds
};
