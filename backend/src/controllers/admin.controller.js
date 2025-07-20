import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { TutorApplication } from "../models/tutorApplication.model.js";
import { Course } from "../models/course.model.js";
import BookingStatusService from "../services/bookingStatusService.js";
import scheduledTasksService from "../services/scheduledTasks.js";
import { getCurrentISTTimeString, formatISTDate, getCurrentISTDate } from "../utils/timezone.js";

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access");
        }

        const { role, search } = req.query;
        const filter = {};

        // Filter by role if provided
        if (role) {
            filter.role = role;
        }

        // Search by name or email if provided
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, users, "Users retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving users");
    }
});

// Update user role (admin only)
const updateUserRole = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access");
        }

        const { userId } = req.params;
        const { role } = req.body;

        if (!["learner", "tutor", "admin"].includes(role)) {
            throw new ApiError(400, "Invalid role");
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // If setting user as tutor, update tutor status
        if (role === "tutor") {
            user.tutorStatus = "approved";
            await user.save();
        }

        return res.status(200).json(
            new ApiResponse(200, user, "User role updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating user role");
    }
});

// Enroll user in a course (admin only)
const enrollUserInCourse = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access. Only admins can enroll users in courses");
        }

        const { userId } = req.params;
        const { courseId } = req.body;

        if (!userId || !courseId) {
            throw new ApiError(400, "User ID and Course ID are required");
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Check if user is already enrolled
        if (course.enrolledStudents.includes(userId)) {
            throw new ApiError(400, "User is already enrolled in this course");
        }

        // Add user to enrolled students
        course.enrolledStudents.push(userId);
        await course.save();

        return res.status(200).json(
            new ApiResponse(200, course, "User enrolled in course successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while enrolling user in course");
    }
});

// Create admin user (for seeding the database)
const createAdminUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            throw new ApiError(400, "Admin user already exists");
        }

        // Create admin user
        const user = await User.create({
            fullName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            role: "admin",
            avatar: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        return res.status(201).json(
            new ApiResponse(201, createdUser, "Admin user created successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while creating admin user");
    }
});

// Get system status including scheduled tasks
const getSystemStatus = asyncHandler(async (req, res) => {
    try {
        const scheduledTasksStatus = scheduledTasksService.getStatus();

        const systemStatus = {
            currentTime: getCurrentISTTimeString(),
            currentDate: formatISTDate(getCurrentISTDate()),
            timezone: 'IST (UTC+5:30)',
            scheduledTasks: scheduledTasksStatus,
            server: {
                uptime: process.uptime(),
                nodeVersion: process.version,
                platform: process.platform,
                environment: process.env.NODE_ENV || 'development'
            }
        };

        return res.status(200).json(
            new ApiResponse(200, systemStatus, "System status retrieved successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to get system status");
    }
});

// Manually trigger booking status update
const updateBookingStatus = asyncHandler(async (req, res) => {
    try {
        const updatedCount = await BookingStatusService.updateExpiredBookings();

        const result = {
            updatedBookings: updatedCount,
            timestamp: getCurrentISTTimeString(),
            message: updatedCount > 0
                ? `Successfully updated ${updatedCount} expired bookings to completed status`
                : 'No expired bookings found to update'
        };

        return res.status(200).json(
            new ApiResponse(200, result, "Booking status update completed")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update booking status");
    }
});

// Control scheduled tasks
const controlScheduledTasks = asyncHandler(async (req, res) => {
    try {
        const { action, taskName } = req.body;

        if (!action) {
            throw new ApiError(400, "Action is required (start, stop, trigger, status)");
        }

        let result = {};

        switch (action) {
            case 'start':
                scheduledTasksService.start();
                result = {
                    action: 'start',
                    message: 'Scheduled tasks started',
                    status: scheduledTasksService.getStatus()
                };
                break;

            case 'stop':
                scheduledTasksService.stop();
                result = {
                    action: 'stop',
                    message: 'Scheduled tasks stopped',
                    status: scheduledTasksService.getStatus()
                };
                break;

            case 'trigger':
                if (!taskName) {
                    throw new ApiError(400, "Task name is required for trigger action");
                }
                await scheduledTasksService.triggerTask(taskName);
                result = {
                    action: 'trigger',
                    taskName,
                    message: `Task ${taskName} triggered successfully`,
                    timestamp: getCurrentISTTimeString()
                };
                break;

            case 'status':
                result = {
                    action: 'status',
                    status: scheduledTasksService.getStatus(),
                    timestamp: getCurrentISTTimeString()
                };
                break;

            default:
                throw new ApiError(400, "Invalid action. Use: start, stop, trigger, or status");
        }

        return res.status(200).json(
            new ApiResponse(200, result, `Scheduled tasks ${action} completed successfully`)
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to control scheduled tasks");
    }
});

export {
    getAllUsers,
    updateUserRole,
    enrollUserInCourse,
    createAdminUser,
    getSystemStatus,
    updateBookingStatus,
    controlScheduledTasks
};
