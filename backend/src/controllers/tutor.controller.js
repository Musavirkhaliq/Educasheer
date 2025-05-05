import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { TutorApplication } from "../models/tutorApplication.model.js";

// Get all approved tutors
const getApprovedTutors = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        // Calculate pagination parameters
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Find users with role "tutor" and tutorStatus "approved"
        const tutors = await User.find({ 
            role: "tutor", 
            tutorStatus: "approved" 
        })
            .select("fullName username avatar email")
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ fullName: 1 });

        // Get tutor applications to include qualifications and specialization
        const tutorIds = tutors.map(tutor => tutor._id);
        const tutorApplications = await TutorApplication.find({
            user: { $in: tutorIds },
            status: "approved"
        });

        // Create a map of tutor applications by user ID for easy lookup
        const tutorApplicationMap = {};
        tutorApplications.forEach(app => {
            tutorApplicationMap[app.user.toString()] = app;
        });

        // Combine tutor info with application details
        const tutorsWithDetails = tutors.map(tutor => {
            const tutorObj = tutor.toObject();
            const application = tutorApplicationMap[tutor._id.toString()];
            
            if (application) {
                tutorObj.qualifications = application.qualifications;
                tutorObj.experience = application.experience;
                tutorObj.specialization = application.specialization;
            }
            
            return tutorObj;
        });

        const totalTutors = await User.countDocuments({ 
            role: "tutor", 
            tutorStatus: "approved" 
        });

        return res.status(200).json(
            new ApiResponse(200, {
                tutors: tutorsWithDetails,
                totalTutors,
                currentPage: pageNum,
                totalPages: Math.ceil(totalTutors / limitNum)
            }, "Tutors fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching tutors:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch tutors");
    }
});

export {
    getApprovedTutors
};
