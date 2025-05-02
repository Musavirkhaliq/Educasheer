import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
import { Video } from "../models/video.model.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import mongoose from "mongoose";

// Create a new course (admin and tutor only)
const createCourse = asyncHandler(async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            level,
            price,
            originalPrice,
            videoIds,
            tags,
            courseType,
            location,
            startDate,
            endDate,
            schedule,
            modules,
            maxStudents,
            thumbnail: customThumbnail
        } = req.body;

        // Check if user is admin or tutor
        if (req.user.role !== "admin" && req.user.role !== "tutor") {
            throw new ApiError(403, "Only admins and tutors can create courses");
        }

        // Validate input
        if (!title || !description) {
            throw new ApiError(400, "Title and description are required");
        }

        // Determine if it's an online or offline course
        const isOfflineCourse = courseType === "offline";

        // Validate course type specific requirements
        if (isOfflineCourse) {
            // Validate offline course fields
            if (!location) {
                throw new ApiError(400, "Location is required for offline courses");
            }
            if (!startDate) {
                throw new ApiError(400, "Start date is required for offline courses");
            }
            if (!endDate) {
                throw new ApiError(400, "End date is required for offline courses");
            }
            if (!schedule) {
                throw new ApiError(400, "Schedule is required for offline courses");
            }

            // Modules are optional but recommended for offline courses
        } else {
            // For online courses, videos are required
            if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
                throw new ApiError(400, "At least one video is required for an online course");
            }
        }

        let thumbnail = customThumbnail;
        let videos = [];

        // For online courses, verify videos and set thumbnail
        if (!isOfflineCourse) {
            // Verify all videos exist and user has access to them
            videos = await Video.find({
                _id: { $in: videoIds }
            });

            if (videos.length !== videoIds.length) {
                throw new ApiError(400, "One or more videos not found");
            }

            // If user is not admin, check if they own all the videos
            if (req.user.role !== "admin") {
                const hasAccess = videos.every(video =>
                    video.owner.toString() === req.user._id.toString()
                );

                if (!hasAccess) {
                    throw new ApiError(403, "You can only include videos that you own");
                }
            }

            // Use the first video's thumbnail as the course thumbnail if not provided
            if (!thumbnail && videos.length > 0) {
                thumbnail = videos[0].thumbnail;
            }
        }

        // If no thumbnail is provided or set, use a default one
        if (!thumbnail) {
            thumbnail = "https://placehold.co/600x400?text=Course+Thumbnail";
        }

        // Process tags - handle different formats
        let processedTags = [];
        if (tags) {
            if (typeof tags === 'string') {
                processedTags = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else if (Array.isArray(tags)) {
                processedTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
        }

        // Process price and originalPrice
        const processedPrice = parseFloat(price) || 0;
        const processedOriginalPrice = parseFloat(originalPrice) || processedPrice || 0;

        // Generate a unique slug from the title
        const slug = generateUniqueSlug(title);
        console.log("Generated slug:", slug);

        // Create course with base fields
        const courseData = {
            title,
            slug,
            description,
            thumbnail,
            creator: req.user._id,
            category: category || "Uncategorized",
            level: level || "Mixed",
            price: processedPrice,
            originalPrice: processedOriginalPrice,
            tags: processedTags,
            courseType: isOfflineCourse ? "offline" : "online"
        };

        // Add course type specific fields
        if (isOfflineCourse) {
            // Add offline course fields
            Object.assign(courseData, {
                location,
                startDate,
                endDate,
                schedule,
                modules: modules || [],
                maxStudents: maxStudents || 20
            });
        } else {
            // Add online course fields
            Object.assign(courseData, {
                videos: videoIds
            });
        }

        // Create the course
        const course = await Course.create(courseData);

        return res.status(201).json(
            new ApiResponse(201, course, "Course created successfully")
        );
    } catch (error) {
        console.error("Error creating course:", error);

        if (error instanceof ApiError) {
            throw error;
        }

        // Check for MongoDB validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            throw new ApiError(400, `Validation error: ${validationErrors.join(', ')}`);
        }

        // Check for MongoDB cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            throw new ApiError(400, `Invalid ${error.path}: ${error.value}`);
        }

        throw new ApiError(500, `Something went wrong while creating course: ${error.message}`);
    }
});

// Get all published courses
const getAllCourses = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, category, level, search } = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        const filters = { isPublished: true };

        // Add category filter if provided
        if (category) {
            filters.category = category;
        }

        // Add level filter if provided
        if (level) {
            filters.level = level;
        }

        // Add search filter if provided
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const courses = await Course.find(filters)
            .populate("creator", "fullName username avatar")
            .populate("videos", "title thumbnail duration views")
            .skip((options.page - 1) * options.limit)
            .limit(options.limit)
            .sort(options.sort);

        const totalCourses = await Course.countDocuments(filters);

        return res.status(200).json(
            new ApiResponse(200, {
                courses,
                totalCourses,
                currentPage: options.page,
                totalPages: Math.ceil(totalCourses / options.limit)
            }, "Courses fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching courses");
    }
});

// Get course by ID
const getCourseById = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            throw new ApiError(400, "Course ID is required");
        }

        const course = await Course.findById(courseId)
            .populate("creator", "fullName username avatar")
            .populate("videos", "title thumbnail duration views videoId description");

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // If course is not published, only allow creator or admin to view it
        if (!course.isPublished) {
            // For unauthenticated users, don't show unpublished courses
            if (!req.user) {
                throw new ApiError(403, "This course is not published yet");
            }

            // For authenticated users, check if they're the creator or admin
            if (course.creator._id.toString() !== req.user._id.toString() &&
                req.user.role !== "admin") {
                throw new ApiError(403, "This course is not published yet");
            }
        }

        // Add a flag to indicate if the user is authenticated
        const isAuthenticated = !!req.user;

        // Add a flag to indicate if the user is enrolled (if authenticated)
        let isEnrolled = false;
        if (isAuthenticated) {
            // Debug the types of the IDs
            console.log("DEBUG - Types:", {
                userIdType: typeof req.user._id,
                userIdIsObject: req.user._id instanceof Object,
                userIdIsString: typeof req.user._id === 'string',
                userIdToString: req.user._id.toString(),
                enrolledStudentsTypes: course.enrolledStudents.map(id => ({
                    idType: typeof id,
                    idIsObject: id instanceof Object,
                    idIsString: typeof id === 'string',
                    idToString: id.toString()
                }))
            });

            // Log raw values for comparison
            console.log("DEBUG - Raw values:", {
                userId: req.user._id,
                enrolledStudents: course.enrolledStudents
            });

            // Convert ObjectIds to strings for proper comparison
            isEnrolled = course.enrolledStudents.some(studentId => {
                const studentIdStr = studentId.toString();
                const userIdStr = req.user._id.toString();
                const matches = studentIdStr === userIdStr;

                console.log(`Comparing: ${studentIdStr} === ${userIdStr} => ${matches}`);

                return matches;
            });

            console.log(`Checking enrollment for user ${req.user._id}:`, {
                isEnrolled,
                enrolledStudents: course.enrolledStudents.map(id => id.toString()),
                userIdToString: req.user._id.toString()
            });
        }

        // Create a response object with the course data and authentication flags
        const responseData = {
            ...course.toObject(),
            isAuthenticated,
            isEnrolled
        };

        // Double-check the isEnrolled flag for debugging
        console.log(`Final response for course ${course._id}:`, {
            userId: req.user?._id,
            isAuthenticated,
            isEnrolled,
            enrolledStudentsCount: course.enrolledStudents.length,
            // Force a manual check to verify
            manualCheck: isAuthenticated ?
                course.enrolledStudents.map(id => id.toString()).includes(req.user._id.toString()) : false
        });

        return res.status(200).json(
            new ApiResponse(200, responseData, "Course fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching course");
    }
});

// Update course (admin and creator only)
const updateCourse = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;
        const {
            title,
            description,
            category,
            level,
            price,
            originalPrice,
            videoIds,
            tags,
            isPublished,
            courseType,
            location,
            startDate,
            endDate,
            schedule,
            modules,
            maxStudents,
            thumbnail: customThumbnail
        } = req.body;

        if (!courseId) {
            throw new ApiError(400, "Course ID is required");
        }

        const course = await Course.findById(courseId);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Check if user is admin or course creator
        if (req.user.role !== "admin" && course.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this course");
        }

        // Determine if it's an online or offline course
        const isOfflineCourse = courseType === "offline" || course.courseType === "offline";

        // Handle video updates for online courses
        if (!isOfflineCourse && videoIds && Array.isArray(videoIds) && videoIds.length > 0) {
            const videos = await Video.find({
                _id: { $in: videoIds }
            });

            if (videos.length !== videoIds.length) {
                throw new ApiError(400, "One or more videos not found");
            }

            // If user is not admin, check if they own all the videos
            if (req.user.role !== "admin") {
                const hasAccess = videos.every(video =>
                    video.owner.toString() === req.user._id.toString()
                );

                if (!hasAccess) {
                    throw new ApiError(403, "You can only include videos that you own");
                }
            }

            // Update course thumbnail if videos are changed and no custom thumbnail is provided
            if (videos.length > 0 && !customThumbnail) {
                course.thumbnail = videos[0].thumbnail;
            }

            course.videos = videoIds;
        }

        // Update thumbnail if provided
        if (customThumbnail) {
            course.thumbnail = customThumbnail;
        }

        // Update other fields if provided
        if (title) {
            course.title = title;
            // Update slug when title changes
            course.slug = generateUniqueSlug(title);
        }
        if (description) course.description = description;
        if (category) course.category = category;
        if (level) course.level = level;
        if (price !== undefined) course.price = parseFloat(price) || 0;
        if (originalPrice !== undefined) course.originalPrice = parseFloat(originalPrice) || course.price || 0;
        if (isPublished !== undefined) course.isPublished = isPublished;
        if (courseType) course.courseType = courseType;

        // Update offline course specific fields
        if (isOfflineCourse) {
            if (location) course.location = location;
            if (startDate) course.startDate = startDate;
            if (endDate) course.endDate = endDate;
            if (schedule) course.schedule = schedule;
            if (maxStudents) course.maxStudents = maxStudents;

            // Update modules if provided
            if (modules && Array.isArray(modules)) {
                course.modules = modules;
            }
        }

        // Process tags
        if (tags) {
            if (typeof tags === 'string') {
                course.tags = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else if (Array.isArray(tags)) {
                course.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
        }

        await course.save();

        return res.status(200).json(
            new ApiResponse(200, course, "Course updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating course");
    }
});

// Delete course (admin and creator only)
const deleteCourse = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            throw new ApiError(400, "Course ID is required");
        }

        const course = await Course.findById(courseId);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Check if user is admin or course creator
        if (req.user.role !== "admin" && course.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to delete this course");
        }

        await Course.findByIdAndDelete(courseId);

        return res.status(200).json(
            new ApiResponse(200, {}, "Course deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting course");
    }
});

// Get courses by creator
const getCoursesByCreator = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        const courses = await Course.find({
            creator: userId,
            isPublished: true
        })
            .populate("creator", "fullName username avatar")
            .populate("videos", "title thumbnail duration views")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, courses, "Courses fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching courses");
    }
});

// Get my courses (for logged in user)
const getMyCourses = asyncHandler(async (req, res) => {
    try {
        const courses = await Course.find({ creator: req.user._id })
            .populate("videos", "title thumbnail duration views")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, courses, "Your courses fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching your courses");
    }
});

// Enroll in a course
const enrollInCourse = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            throw new ApiError(400, "Course ID is required");
        }

        const course = await Course.findById(courseId);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        if (!course.isPublished) {
            throw new ApiError(400, "Cannot enroll in an unpublished course");
        }

        // Check if user is already enrolled - convert ObjectIds to strings for proper comparison
        const isAlreadyEnrolled = course.enrolledStudents.some(
            studentId => studentId.toString() === req.user._id.toString()
        );

        if (isAlreadyEnrolled) {
            console.log(`User ${req.user._id} is already enrolled in course ${courseId}`);
            throw new ApiError(400, "You are already enrolled in this course");
        }

        console.log(`Enrolling user ${req.user._id} in course ${courseId}`);

        // Add user to enrolled students
        course.enrolledStudents.push(req.user._id);
        await course.save();

        // Create a response object with the course data and enrollment flag
        const responseData = {
            ...course.toObject(),
            isEnrolled: true
        };

        return res.status(200).json(
            new ApiResponse(200, responseData, "Enrolled in course successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while enrolling in course");
    }
});

// Get enrolled courses
const getEnrolledCourses = asyncHandler(async (req, res) => {
    try {
        const courses = await Course.find({
            enrolledStudents: req.user._id,
            isPublished: true
        })
            .populate("creator", "fullName username avatar")
            .populate("videos", "title thumbnail duration views")
            .sort({ createdAt: -1 });

        // Add isEnrolled flag to each course
        const coursesWithEnrollmentStatus = courses.map(course => {
            const courseObj = course.toObject();
            courseObj.isEnrolled = true; // These are all enrolled courses
            return courseObj;
        });

        console.log("Returning enrolled courses with isEnrolled flag:",
            coursesWithEnrollmentStatus.map(c => ({ id: c._id, title: c.title, isEnrolled: c.isEnrolled }))
        );

        return res.status(200).json(
            new ApiResponse(200, coursesWithEnrollmentStatus, "Enrolled courses fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        throw new ApiError(500, "Something went wrong while fetching enrolled courses");
    }
});

export {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByCreator,
    getMyCourses,
    enrollInCourse,
    getEnrolledCourses
};
