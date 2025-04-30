import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CourseMaterial } from "../models/courseMaterial.model.js";
import { Course } from "../models/course.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// Get all materials for a course
const getCourseMaterials = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Check if user is enrolled in the course or is the creator or admin
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isCreator = course.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isEnrolled && !isCreator && !isAdmin) {
        throw new ApiError(403, "You must be enrolled in this course to access materials");
    }

    // Get all materials for the course
    const materials = await CourseMaterial.find({
        courseId,
        $or: [
            { isPublic: true },
            { uploadedBy: req.user._id }
        ]
    })
    .populate("uploadedBy", "fullName username")
    .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, materials, "Course materials retrieved successfully")
    );
});

// Upload a new material
const uploadCourseMaterial = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { title, description, isPublic } = req.body;

    // Validate input
    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    if (!req.file) {
        throw new ApiError(400, "File is required");
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Check if user is the course creator or admin
    const isCreator = course.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
        throw new ApiError(403, "Only course creators and admins can upload materials");
    }

    // Determine file type
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let fileType = "other";

    if (["pdf"].includes(fileExtension)) {
        fileType = "pdf";
    } else if (["doc", "docx"].includes(fileExtension)) {
        fileType = "doc";
    } else if (["ppt", "pptx"].includes(fileExtension)) {
        fileType = "ppt";
    } else if (["xls", "xlsx", "csv"].includes(fileExtension)) {
        fileType = "xls";
    } else if (["jpg", "jpeg", "png", "gif", "svg"].includes(fileExtension)) {
        fileType = "image";
    } else if (["mp4", "avi", "mov", "wmv"].includes(fileExtension)) {
        fileType = "video";
    } else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
        fileType = "audio";
    }

    // Upload file to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

    // Delete local file
    fs.unlinkSync(req.file.path);

    if (!cloudinaryResponse || !cloudinaryResponse.url) {
        throw new ApiError(500, "File upload failed");
    }

    // Create material
    const material = await CourseMaterial.create({
        courseId,
        title,
        description: description || "",
        fileUrl: cloudinaryResponse.url,
        fileType,
        fileSize: req.file.size,
        uploadedBy: req.user._id,
        isPublic: isPublic === "false" ? false : true
    });

    // Populate user details
    const populatedMaterial = await CourseMaterial.findById(material._id)
        .populate("uploadedBy", "fullName username");

    return res.status(201).json(
        new ApiResponse(201, populatedMaterial, "Material uploaded successfully")
    );
});

// Delete a material
const deleteCourseMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    // Check if material exists
    const material = await CourseMaterial.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Material not found");
    }

    // Check if user is the uploader, course creator, or admin
    const isUploader = material.uploadedBy.toString() === req.user._id.toString();

    const course = await Course.findById(material.courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    const isCourseCreator = course.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isUploader && !isCourseCreator && !isAdmin) {
        throw new ApiError(403, "You don't have permission to delete this material");
    }

    // Delete file from Cloudinary
    // Extract public ID from Cloudinary URL
    let publicId;
    try {
        // Parse the Cloudinary URL to extract the public ID
        const urlParts = material.fileUrl.split('/');
        const fileNameWithExtension = urlParts.pop();

        // Find the upload part in the URL
        const uploadIndex = urlParts.findIndex(part => part === 'upload');

        if (uploadIndex !== -1) {
            // Get all parts after 'upload' and before the filename
            const folderPath = urlParts.slice(uploadIndex + 1).join('/');

            // Remove file extension
            const fileName = fileNameWithExtension.split('.')[0];

            // Combine folder path and filename to get the full public ID
            publicId = folderPath ? `${folderPath}/${fileName}` : fileName;
        } else {
            // Fallback to simple extraction if URL format is different
            publicId = fileNameWithExtension.split('.')[0];
        }

        console.log(`Extracted public ID: ${publicId} from URL: ${material.fileUrl}`);
    } catch (error) {
        console.error(`Error extracting public ID from URL: ${material.fileUrl}`, error);
        // Fallback to simple extraction
        publicId = material.fileUrl.split('/').pop().split('.')[0];
    }

    // Determine resource type based on file type
    let resourceType = "image";
    if (material.fileType === "video") {
        resourceType = "video";
    } else if (material.fileType === "audio") {
        resourceType = "video"; // Cloudinary stores audio under video resource type
    } else if (["pdf", "doc", "ppt", "xls", "other"].includes(material.fileType)) {
        resourceType = "raw";
    }

    try {
        const deleteResult = await deleteFromCloudinary(publicId, resourceType);

        if (deleteResult && deleteResult.error) {
            console.log(`Warning: Error deleting file from Cloudinary: ${deleteResult.error}`);
            // Continue with deletion from database even if Cloudinary deletion fails
        }
    } catch (error) {
        console.error("Error during Cloudinary file deletion:", error);
        // Continue with deletion from database even if Cloudinary deletion fails
    }

    // Delete material
    await CourseMaterial.findByIdAndDelete(materialId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Material deleted successfully")
    );
});

export {
    getCourseMaterials,
    uploadCourseMaterial,
    deleteCourseMaterial
};
