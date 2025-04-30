import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Program } from "../models/program.model.js";
import { Course } from "../models/course.model.js";
import { generateUniqueSlug } from "../utils/generateSlug.js";

// Helper function to calculate total duration of all courses in a program
const calculateProgramDuration = async (courseIds) => {
    try {
        const courses = await Course.find({ _id: { $in: courseIds } }).populate("videos", "duration");
        
        let totalSeconds = 0;
        
        courses.forEach(course => {
            course.videos.forEach(video => {
                // Parse duration in format "H:MM:SS" or "MM:SS"
                const parts = video.duration?.split(':').map(Number);
                
                if (parts?.length === 3) {
                    // Format: H:MM:SS
                    totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
                } else if (parts?.length === 2) {
                    // Format: MM:SS
                    totalSeconds += parts[0] * 60 + parts[1];
                }
            });
        });
        
        // Convert to hours and minutes
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        return `${hours}h ${minutes}m`;
    } catch (error) {
        console.error("Error calculating program duration:", error);
        return "0h 0m";
    }
};

// Create a new program (admin and tutor only)
const createProgram = asyncHandler(async (req, res) => {
    try {
        const { title, description, category, level, price, originalPrice, courseIds, tags } = req.body;

        // Check if user is admin or tutor
        if (req.user.role !== "admin" && req.user.role !== "tutor") {
            throw new ApiError(403, "Only admins and tutors can create programs");
        }

        // Validate input
        if (!title || !description) {
            throw new ApiError(400, "Title and description are required");
        }

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            throw new ApiError(400, "At least one course is required for a program");
        }

        // Verify all courses exist and user has access to them
        const courses = await Course.find({
            _id: { $in: courseIds }
        });

        if (courses.length !== courseIds.length) {
            throw new ApiError(400, "One or more courses not found");
        }

        // If user is not admin, check if they own all the courses
        if (req.user.role !== "admin") {
            const hasAccess = courses.every(course =>
                course.creator.toString() === req.user._id.toString()
            );

            if (!hasAccess) {
                throw new ApiError(403, "You can only include courses that you own");
            }
        }

        // Use the first course's thumbnail as the program thumbnail
        const thumbnail = courses[0].thumbnail;

        // Process tags
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

        // Calculate program duration
        const duration = await calculateProgramDuration(courseIds);

        // Create program
        const program = await Program.create({
            title,
            slug,
            description,
            thumbnail,
            courses: courseIds,
            creator: req.user._id,
            category: category || "Uncategorized",
            level: level || "Mixed",
            price: processedPrice,
            originalPrice: processedOriginalPrice,
            tags: processedTags,
            duration,
            totalCourses: courseIds.length
        });

        return res.status(201).json(
            new ApiResponse(201, program, "Program created successfully")
        );
    } catch (error) {
        console.error("Error creating program:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create program");
    }
});

// Get all programs
const getAllPrograms = asyncHandler(async (req, res) => {
    try {
        const { limit = 10, page = 1, category, level, search } = req.query;
        
        const query = { isPublished: true };
        
        if (category && category !== "all") {
            query.category = category;
        }
        
        if (level && level !== "all") {
            query.level = level;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { tags: { $in: [new RegExp(search, "i")] } }
            ];
        }
        
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
            populate: [
                { path: "creator", select: "fullName username avatar" },
                { path: "courses", select: "title thumbnail" }
            ]
        };
        
        const programs = await Program.find(query)
            .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
            .limit(parseInt(limit, 10))
            .sort({ createdAt: -1 })
            .populate("creator", "fullName username avatar")
            .populate("courses", "title thumbnail");
            
        const totalPrograms = await Program.countDocuments(query);
        
        return res.status(200).json(
            new ApiResponse(200, {
                programs,
                totalPrograms,
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalPrograms / parseInt(limit, 10))
            }, "Programs fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching programs:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch programs");
    }
});

// Get program by ID
const getProgramById = asyncHandler(async (req, res) => {
    try {
        const { programId } = req.params;

        if (!programId) {
            throw new ApiError(400, "Program ID is required");
        }

        const program = await Program.findById(programId)
            .populate("creator", "fullName username avatar")
            .populate({
                path: "courses",
                select: "title thumbnail description videos level category price",
                populate: {
                    path: "videos",
                    select: "title thumbnail duration views videoId description"
                }
            });

        if (!program) {
            throw new ApiError(404, "Program not found");
        }

        // If program is not published, only allow creator or admin to view it
        if (!program.isPublished &&
            program.creator._id.toString() !== req.user?._id?.toString() &&
            req.user?.role !== "admin") {
            throw new ApiError(403, "This program is not published yet");
        }

        return res.status(200).json(
            new ApiResponse(200, program, "Program fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching program:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch program");
    }
});

// Update program (admin and creator only)
const updateProgram = asyncHandler(async (req, res) => {
    try {
        const { programId } = req.params;
        const {
            title,
            description,
            category,
            level,
            price,
            originalPrice,
            courseIds,
            tags,
            isPublished
        } = req.body;

        if (!programId) {
            throw new ApiError(400, "Program ID is required");
        }

        const program = await Program.findById(programId);

        if (!program) {
            throw new ApiError(404, "Program not found");
        }

        // Check if user is admin or program creator
        if (req.user.role !== "admin" && program.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this program");
        }

        // If courseIds is provided, verify all courses exist and user has access to them
        if (courseIds && Array.isArray(courseIds) && courseIds.length > 0) {
            const courses = await Course.find({
                _id: { $in: courseIds }
            });

            if (courses.length !== courseIds.length) {
                throw new ApiError(400, "One or more courses not found");
            }

            // If user is not admin, check if they own all the courses
            if (req.user.role !== "admin") {
                const hasAccess = courses.every(course =>
                    course.creator.toString() === req.user._id.toString()
                );

                if (!hasAccess) {
                    throw new ApiError(403, "You can only include courses that you own");
                }
            }

            program.courses = courseIds;
            program.totalCourses = courseIds.length;
            
            // Recalculate program duration
            program.duration = await calculateProgramDuration(courseIds);
        }

        // Update other fields if provided
        if (title) {
            program.title = title;
            // Update slug when title changes
            program.slug = generateUniqueSlug(title);
        }
        if (description) program.description = description;
        if (category) program.category = category;
        if (level) program.level = level;
        if (price !== undefined) program.price = parseFloat(price) || 0;
        if (originalPrice !== undefined) program.originalPrice = parseFloat(originalPrice) || program.price || 0;
        if (isPublished !== undefined) program.isPublished = isPublished;

        // Process tags
        if (tags) {
            if (typeof tags === 'string') {
                program.tags = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else if (Array.isArray(tags)) {
                program.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
        }

        await program.save();

        return res.status(200).json(
            new ApiResponse(200, program, "Program updated successfully")
        );
    } catch (error) {
        console.error("Error updating program:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update program");
    }
});

// Delete program (admin and creator only)
const deleteProgram = asyncHandler(async (req, res) => {
    try {
        const { programId } = req.params;

        if (!programId) {
            throw new ApiError(400, "Program ID is required");
        }

        const program = await Program.findById(programId);

        if (!program) {
            throw new ApiError(404, "Program not found");
        }

        // Check if user is admin or program creator
        if (req.user.role !== "admin" && program.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to delete this program");
        }

        await Program.findByIdAndDelete(programId);

        return res.status(200).json(
            new ApiResponse(200, {}, "Program deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting program:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete program");
    }
});

// Get programs by creator
const getProgramsByCreator = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }
        
        const programs = await Program.find({ 
            creator: userId,
            isPublished: true 
        })
        .populate("creator", "fullName username avatar")
        .populate("courses", "title thumbnail");
        
        return res.status(200).json(
            new ApiResponse(200, programs, "Programs fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching programs by creator:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch programs");
    }
});

// Get my programs (for logged in creator)
const getMyPrograms = asyncHandler(async (req, res) => {
    try {
        const programs = await Program.find({ 
            creator: req.user._id 
        })
        .populate("creator", "fullName username avatar")
        .populate("courses", "title thumbnail");
        
        return res.status(200).json(
            new ApiResponse(200, programs, "My programs fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching my programs:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch my programs");
    }
});

// Enroll in a program
const enrollInProgram = asyncHandler(async (req, res) => {
    try {
        const { programId } = req.params;
        
        if (!programId) {
            throw new ApiError(400, "Program ID is required");
        }
        
        const program = await Program.findById(programId);
        
        if (!program) {
            throw new ApiError(404, "Program not found");
        }
        
        if (!program.isPublished) {
            throw new ApiError(403, "This program is not published yet");
        }
        
        // Check if user is already enrolled
        if (program.enrolledStudents.includes(req.user._id)) {
            throw new ApiError(400, "You are already enrolled in this program");
        }
        
        // Add user to enrolled students
        program.enrolledStudents.push(req.user._id);
        await program.save();
        
        // Also enroll the user in all courses in the program
        await Course.updateMany(
            { _id: { $in: program.courses } },
            { $addToSet: { enrolledStudents: req.user._id } }
        );
        
        return res.status(200).json(
            new ApiResponse(200, program, "Enrolled in program successfully")
        );
    } catch (error) {
        console.error("Error enrolling in program:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to enroll in program");
    }
});

// Get enrolled programs
const getEnrolledPrograms = asyncHandler(async (req, res) => {
    try {
        const programs = await Program.find({ 
            enrolledStudents: req.user._id 
        })
        .populate("creator", "fullName username avatar")
        .populate("courses", "title thumbnail");
        
        return res.status(200).json(
            new ApiResponse(200, programs, "Enrolled programs fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching enrolled programs:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch enrolled programs");
    }
});

export {
    createProgram,
    getAllPrograms,
    getProgramById,
    updateProgram,
    deleteProgram,
    getProgramsByCreator,
    getMyPrograms,
    enrollInProgram,
    getEnrolledPrograms
};
