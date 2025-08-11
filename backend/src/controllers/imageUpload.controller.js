import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import path from "path";

/**
 * Upload image for quiz questions or answer options
 * @route POST /api/v1/images/upload
 * @access Admin only
 */
const uploadQuizImage = asyncHandler(async (req, res) => {
    console.log("=== Image Upload Endpoint Hit ===");
    console.log("Request file:", req.file);
    console.log("Request user:", req.user?.email);
    console.log("Request body:", req.body);

    try {
        if (!req.file) {
            console.log("No file in request");
            throw new ApiError(400, "Image file is required");
        }

        console.log("File details:", {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        // Check if the uploads/images directory exists, create if not
        const imageDir = path.join(process.cwd(), 'public', 'uploads', 'images');
        if (!fs.existsSync(imageDir)) {
            console.log("Creating images directory:", imageDir);
            fs.mkdirSync(imageDir, { recursive: true });
        }

        // Generate the URL for the uploaded image
        const imageUrl = `/uploads/images/${req.file.filename}`;
        console.log("Generated image URL:", imageUrl);

        return res.status(200).json(
            new ApiResponse(200, {
                imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }, "Image uploaded successfully")
        );

    } catch (error) {
        console.error("Error in uploadQuizImage:", error);
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        throw new ApiError(error.statusCode || 500, error.message || "Failed to upload image");
    }
});

/**
 * Delete uploaded image
 * @route DELETE /api/v1/images/:filename
 * @access Admin only
 */
const deleteQuizImage = asyncHandler(async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            throw new ApiError(400, "Filename is required");
        }

        const imagePath = path.join(process.cwd(), 'public', 'uploads', 'images', filename);
        
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            return res.status(200).json(
                new ApiResponse(200, null, "Image deleted successfully")
            );
        } else {
            throw new ApiError(404, "Image not found");
        }

    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete image");
    }
});

export {
    uploadQuizImage,
    deleteQuizImage
};
