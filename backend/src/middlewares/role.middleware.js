import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized: Admin access required");
        }
        next();
    } catch (error) {
        throw new ApiError(403, error.message || "Unauthorized access");
    }
});

export const isTutor = asyncHandler(async (req, res, next) => {
    try {
        if (req.user.role !== "tutor" && req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized: Tutor access required");
        }
        next();
    } catch (error) {
        throw new ApiError(403, error.message || "Unauthorized access");
    }
});
