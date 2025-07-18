import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Center } from "../models/center.model.js";
import { User } from "../models/user.model.js";

// Create a new center (admin only)
const createCenter = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can create centers");
        }

        const { name, location, description, image, capacity, facilities, contactEmail, contactPhone } = req.body;

        // Validate required fields
        if (!name || !location || !description || !image || !contactEmail || !contactPhone) {
            throw new ApiError(400, "All required fields must be provided");
        }

        // Create center
        const center = await Center.create({
            name,
            location,
            description,
            image,
            capacity: capacity || 30,
            facilities: facilities || [],
            contactEmail,
            contactPhone,
            creator: req.user._id
        });

        return res.status(201).json(
            new ApiResponse(201, center, "Center created successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while creating center");
    }
});

// Get all centers
const getAllCenters = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        // Calculate pagination parameters
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const centers = await Center.find({ isActive: true })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .populate("creator", "fullName username avatar");

        const totalCenters = await Center.countDocuments({ isActive: true });

        return res.status(200).json(
            new ApiResponse(200, {
                centers,
                totalCenters,
                currentPage: pageNum,
                totalPages: Math.ceil(totalCenters / limitNum)
            }, "Centers fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching centers:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch centers");
    }
});

// Get center by ID with enrolled students
const getCenterById = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;

        const center = await Center.findById(centerId)
            .populate("creator", "fullName username avatar")
            .populate("enrolledStudents", "fullName username avatar email");

        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        return res.status(200).json(
            new ApiResponse(200, center, "Center fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching center:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch center");
    }
});

// Update center (admin only)
const updateCenter = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can update centers");
        }

        const { centerId } = req.params;
        const { name, location, description, image, capacity, facilities, contactEmail, contactPhone, isActive } = req.body;

        const center = await Center.findById(centerId);

        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        // Update fields if provided
        if (name) center.name = name;
        if (location) center.location = location;
        if (description) center.description = description;
        if (image) center.image = image;
        if (capacity) center.capacity = capacity;
        if (facilities) center.facilities = facilities;
        if (contactEmail) center.contactEmail = contactEmail;
        if (contactPhone) center.contactPhone = contactPhone;
        if (isActive !== undefined) center.isActive = isActive;

        await center.save();

        return res.status(200).json(
            new ApiResponse(200, center, "Center updated successfully")
        );
    } catch (error) {
        console.error("Error updating center:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update center");
    }
});

// Delete center (admin only)
const deleteCenter = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can delete centers");
        }

        const { centerId } = req.params;

        const center = await Center.findByIdAndDelete(centerId);

        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        return res.status(200).json(
            new ApiResponse(200, {}, "Center deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting center:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete center");
    }
});

// Add student to center (admin only)
const addStudentToCenter = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can add students to centers");
        }

        const { centerId } = req.params;
        const { studentId } = req.body;

        if (!studentId) {
            throw new ApiError(400, "Student ID is required");
        }

        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        const student = await User.findById(studentId);
        if (!student) {
            throw new ApiError(404, "Student not found");
        }

        // Check if student is already enrolled
        if (center.enrolledStudents.includes(studentId)) {
            throw new ApiError(400, "Student is already enrolled in this center");
        }

        // Add student to center
        center.enrolledStudents.push(studentId);
        await center.save();

        return res.status(200).json(
            new ApiResponse(200, center, "Student added to center successfully")
        );
    } catch (error) {
        console.error("Error adding student to center:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to add student to center");
    }
});

// Remove student from center (admin only)
const removeStudentFromCenter = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can remove students from centers");
        }

        const { centerId, studentId } = req.params;

        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        // Check if student is enrolled
        if (!center.enrolledStudents.includes(studentId)) {
            throw new ApiError(400, "Student is not enrolled in this center");
        }

        // Remove student from center
        center.enrolledStudents = center.enrolledStudents.filter(
            (id) => id.toString() !== studentId
        );
        await center.save();

        return res.status(200).json(
            new ApiResponse(200, center, "Student removed from center successfully")
        );
    } catch (error) {
        console.error("Error removing student from center:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to remove student from center");
    }
});

export {
    createCenter,
    getAllCenters,
    getCenterById,
    updateCenter,
    deleteCenter,
    addStudentToCenter,
    removeStudentFromCenter
};
