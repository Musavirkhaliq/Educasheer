import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Material } from "../models/material.model.js";
import { Video } from "../models/video.model.js";
import { Course } from "../models/course.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";

// Add a new material for a video (admin and tutor only)
const addMaterial = asyncHandler(async (req, res) => {
    try {
        const { title, description, videoId } = req.body;
        const materialFile = req.file;

        // Check if user is admin or tutor
        if (req.user.role !== "admin" && req.user.role !== "tutor") {
            throw new ApiError(403, "Only admins and tutors can add materials");
        }

        // Validate input
        if (!title) {
            throw new ApiError(400, "Title is required");
        }

        if (!videoId) {
            throw new ApiError(400, "Video ID is required");
        }

        if (!materialFile) {
            throw new ApiError(400, "Material file is required");
        }

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Check if user is admin or video owner
        if (req.user.role !== "admin" && video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to add materials to this video");
        }

        // Get file details
        const fileSize = materialFile.size;
        const fileName = materialFile.originalname;
        const fileType = path.extname(fileName).substring(1).toLowerCase();

        // Upload file to cloudinary
        let fileUrl;
        try {
            const uploadResult = await uploadOnCloudinary(materialFile.path);
            if (!uploadResult || !uploadResult.url) {
                throw new Error("Failed to upload file to cloudinary");
            }
            fileUrl = uploadResult.url;
        } catch (error) {
            console.error("Error uploading to cloudinary:", error);
            
            // If cloudinary upload fails, use local file path as fallback
            const localPath = materialFile.path.replace(/\\/g, '/');
            fileUrl = `/${localPath.replace('public/', '')}`;
        }

        // Create material
        const material = await Material.create({
            title,
            description: description || "",
            fileUrl,
            fileType,
            fileSize,
            fileName,
            video: videoId,
            uploader: req.user._id
        });

        return res.status(201).json(
            new ApiResponse(201, material, "Material added successfully")
        );
    } catch (error) {
        // Clean up the uploaded file if there was an error
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding material");
    }
});

// Get all materials for a video
const getMaterialsByVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            throw new ApiError(400, "Video ID is required");
        }

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Get materials for the video
        const materials = await Material.find({ video: videoId })
            .populate("uploader", "fullName username avatar")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, materials, "Materials fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching materials");
    }
});

// Get material by ID
const getMaterialById = asyncHandler(async (req, res) => {
    try {
        const { materialId } = req.params;

        if (!materialId) {
            throw new ApiError(400, "Material ID is required");
        }

        const material = await Material.findById(materialId)
            .populate("uploader", "fullName username avatar")
            .populate("video", "title thumbnail duration views videoId");

        if (!material) {
            throw new ApiError(404, "Material not found");
        }

        return res.status(200).json(
            new ApiResponse(200, material, "Material fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching material");
    }
});

// Update material (admin and owner only)
const updateMaterial = asyncHandler(async (req, res) => {
    try {
        const { materialId } = req.params;
        const { title, description } = req.body;
        const materialFile = req.file;

        if (!materialId) {
            throw new ApiError(400, "Material ID is required");
        }

        const material = await Material.findById(materialId);

        if (!material) {
            throw new ApiError(404, "Material not found");
        }

        // Check if user is admin or material uploader
        if (req.user.role !== "admin" && material.uploader.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this material");
        }

        // Update fields
        if (title) {
            material.title = title;
        }

        if (description !== undefined) {
            material.description = description;
        }

        // If new file is uploaded, update file details
        if (materialFile) {
            // Upload new file to cloudinary
            let fileUrl;
            try {
                const uploadResult = await uploadOnCloudinary(materialFile.path);
                if (!uploadResult || !uploadResult.url) {
                    throw new Error("Failed to upload file to cloudinary");
                }
                fileUrl = uploadResult.url;
            } catch (error) {
                console.error("Error uploading to cloudinary:", error);
                
                // If cloudinary upload fails, use local file path as fallback
                const localPath = materialFile.path.replace(/\\/g, '/');
                fileUrl = `/${localPath.replace('public/', '')}`;
            }

            // Update file details
            material.fileUrl = fileUrl;
            material.fileType = path.extname(materialFile.originalname).substring(1).toLowerCase();
            material.fileSize = materialFile.size;
            material.fileName = materialFile.originalname;
        }

        await material.save();

        return res.status(200).json(
            new ApiResponse(200, material, "Material updated successfully")
        );
    } catch (error) {
        // Clean up the uploaded file if there was an error
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating material");
    }
});

// Delete material (admin and owner only)
const deleteMaterial = asyncHandler(async (req, res) => {
    try {
        const { materialId } = req.params;

        if (!materialId) {
            throw new ApiError(400, "Material ID is required");
        }

        const material = await Material.findById(materialId);

        if (!material) {
            throw new ApiError(404, "Material not found");
        }

        // Check if user is admin or material uploader
        if (req.user.role !== "admin" && material.uploader.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to delete this material");
        }

        await Material.findByIdAndDelete(materialId);

        return res.status(200).json(
            new ApiResponse(200, {}, "Material deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting material");
    }
});

// Get all materials for a course
const getMaterialsByCourse = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            throw new ApiError(400, "Course ID is required");
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Get all videos in the course
        const videoIds = course.videos;

        // Get materials for all videos in the course
        const materials = await Material.find({ video: { $in: videoIds } })
            .populate("uploader", "fullName username avatar")
            .populate("video", "title thumbnail duration views videoId")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, materials, "Materials fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching materials");
    }
});

export {
    addMaterial,
    getMaterialsByVideo,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    getMaterialsByCourse
};
