import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TutorApplication } from "../models/tutorApplication.model.js";
import { User } from "../models/user.model.js";

// Submit a tutor application
const submitTutorApplication = asyncHandler(async (req, res) => {
    try {
        const { qualifications, experience, specialization } = req.body;
        const userId = req.user._id;

        // Check if user already has an application
        const existingApplication = await TutorApplication.findOne({ user: userId });
        if (existingApplication) {
            throw new ApiError(400, "You already have a pending application");
        }

        // Check if user is already a tutor
        const user = await User.findById(userId);
        if (user.role === "tutor") {
            throw new ApiError(400, "You are already a tutor");
        }

        // Create application
        const application = await TutorApplication.create({
            user: userId,
            qualifications,
            experience,
            specialization,
            status: "pending"
        });

        // Update user's tutor status
        await User.findByIdAndUpdate(userId, { tutorStatus: "pending" });

        return res.status(201).json(
            new ApiResponse(201, application, "Tutor application submitted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while submitting application");
    }
});

// Get user's tutor application
const getUserTutorApplication = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const application = await TutorApplication.findOne({ user: userId });
        if (!application) {
            throw new ApiError(404, "No application found");
        }

        return res.status(200).json(
            new ApiResponse(200, application, "Application retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving application");
    }
});

// Admin: Get all tutor applications
const getAllTutorApplications = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access");
        }

        const { status } = req.query;
        const filter = {};
        
        if (status) {
            filter.status = status;
        }

        const applications = await TutorApplication.find(filter)
            .populate("user", "username email fullName avatar")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, applications, "Applications retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving applications");
    }
});

// Admin: Review tutor application
const reviewTutorApplication = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access");
        }

        const { applicationId } = req.params;
        const { status, adminFeedback } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            throw new ApiError(400, "Invalid status");
        }

        // Find application
        const application = await TutorApplication.findById(applicationId);
        if (!application) {
            throw new ApiError(404, "Application not found");
        }

        // Update application
        application.status = status;
        application.adminFeedback = adminFeedback || "";
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        await application.save();

        // Update user's role and status
        const userUpdate = {
            tutorStatus: status
        };

        if (status === "approved") {
            userUpdate.role = "tutor";
        }

        await User.findByIdAndUpdate(application.user, userUpdate);

        return res.status(200).json(
            new ApiResponse(200, application, `Application ${status} successfully`)
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while reviewing application");
    }
});

export {
    submitTutorApplication,
    getUserTutorApplication,
    getAllTutorApplications,
    reviewTutorApplication
};
