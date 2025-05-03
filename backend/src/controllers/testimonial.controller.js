import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Testimonial } from "../models/testimonial.model.js";

// Submit a new testimonial
const submitTestimonial = asyncHandler(async (req, res) => {
    try {
        const { content, rating } = req.body;
        const userId = req.user._id;
        const userName = req.user.fullName;

        if (!content?.trim()) {
            throw new ApiError(400, "Testimonial content is required");
        }

        if (!rating || rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }

        const testimonial = await Testimonial.create({
            content,
            author: userId,
            authorName: userName,
            rating
        });

        return res.status(201).json(
            new ApiResponse(201, testimonial, "Testimonial submitted successfully and pending approval")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while submitting testimonial");
    }
});

// Get all approved testimonials
const getApprovedTestimonials = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const testimonials = await Testimonial.find({ isApproved: true })
            .sort({ approvedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("author", "fullName username avatar");

        const totalTestimonials = await Testimonial.countDocuments({ isApproved: true });

        return res.status(200).json(
            new ApiResponse(200, {
                testimonials,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalTestimonials,
                    totalPages: Math.ceil(totalTestimonials / limit)
                }
            }, "Testimonials fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching testimonials");
    }
});

// Get all testimonials (for admin)
const getAllTestimonials = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const filter = {};
        if (status === "approved") {
            filter.isApproved = true;
        } else if (status === "pending") {
            filter.isApproved = false;
        }
        
        const testimonials = await Testimonial.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("author", "fullName username avatar")
            .populate("approvedBy", "fullName username");

        const totalTestimonials = await Testimonial.countDocuments(filter);

        return res.status(200).json(
            new ApiResponse(200, {
                testimonials,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalTestimonials,
                    totalPages: Math.ceil(totalTestimonials / limit)
                }
            }, "All testimonials fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching testimonials");
    }
});

// Approve or reject a testimonial (admin only)
const reviewTestimonial = asyncHandler(async (req, res) => {
    try {
        const { testimonialId } = req.params;
        const { isApproved } = req.body;
        
        if (isApproved === undefined) {
            throw new ApiError(400, "Approval status is required");
        }

        const testimonial = await Testimonial.findById(testimonialId);
        
        if (!testimonial) {
            throw new ApiError(404, "Testimonial not found");
        }

        testimonial.isApproved = isApproved;
        
        if (isApproved) {
            testimonial.approvedBy = req.user._id;
            testimonial.approvedAt = new Date();
        } else {
            testimonial.approvedBy = null;
            testimonial.approvedAt = null;
        }

        await testimonial.save();

        return res.status(200).json(
            new ApiResponse(200, testimonial, `Testimonial ${isApproved ? 'approved' : 'rejected'} successfully`)
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while reviewing testimonial");
    }
});

// Delete a testimonial (admin or owner)
const deleteTestimonial = asyncHandler(async (req, res) => {
    try {
        const { testimonialId } = req.params;
        
        const testimonial = await Testimonial.findById(testimonialId);
        
        if (!testimonial) {
            throw new ApiError(404, "Testimonial not found");
        }

        // Check if user is admin or the owner of the testimonial
        if (req.user.role !== "admin" && testimonial.author.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to delete this testimonial");
        }

        await Testimonial.findByIdAndDelete(testimonialId);

        return res.status(200).json(
            new ApiResponse(200, {}, "Testimonial deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting testimonial");
    }
});

export {
    submitTestimonial,
    getApprovedTestimonials,
    getAllTestimonials,
    reviewTestimonial,
    deleteTestimonial
};
