import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Course } from "../models/course.model.js";
import { Blog } from "../models/blog.model.js";
import mongoose from "mongoose";

// Add a comment to a video
const addVideoComment = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            throw new ApiError(400, "Comment content is required");
        }

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Create comment
        const comment = await Comment.create({
            content,
            video: videoId,
            owner: req.user._id
        });

        // Populate owner details
        const populatedComment = await Comment.findById(comment._id).populate("owner", "fullName username avatar");

        return res.status(201).json(
            new ApiResponse(201, populatedComment, "Comment added successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding comment");
    }
});

// Add a comment to a course
const addCourseComment = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            throw new ApiError(400, "Comment content is required");
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Create comment
        const comment = await Comment.create({
            content,
            course: courseId,
            owner: req.user._id
        });

        // Populate owner details
        const populatedComment = await Comment.findById(comment._id).populate("owner", "fullName username avatar");

        return res.status(201).json(
            new ApiResponse(201, populatedComment, "Comment added successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding comment");
    }
});

// Add a reply to a comment
const addReply = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            throw new ApiError(400, "Reply content is required");
        }

        // Check if parent comment exists
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            throw new ApiError(404, "Parent comment not found");
        }

        // Create reply
        const reply = await Comment.create({
            content,
            owner: req.user._id,
            parentComment: commentId,
            isReply: true,
            // Copy the video, course, or blog reference from parent comment
            video: parentComment.video,
            course: parentComment.course,
            blog: parentComment.blog
        });

        // Populate owner details
        const populatedReply = await Comment.findById(reply._id).populate("owner", "fullName username avatar");

        return res.status(201).json(
            new ApiResponse(201, populatedReply, "Reply added successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding reply");
    }
});

// Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        // Get top-level comments only (not replies)
        const comments = await Comment.find({
            video: videoId,
            isReply: false
        })
        .populate("owner", "fullName username avatar")
        .populate({
            path: "replies",
            populate: {
                path: "owner",
                select: "fullName username avatar"
            },
            options: { sort: { createdAt: 1 } }
        })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .sort(options.sort);

        const totalComments = await Comment.countDocuments({
            video: videoId,
            isReply: false
        });

        return res.status(200).json(
            new ApiResponse(200, {
                comments,
                totalComments,
                currentPage: options.page,
                totalPages: Math.ceil(totalComments / options.limit)
            }, "Comments fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching comments");
    }
});

// Get all comments for a course
const getCourseComments = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        // Get top-level comments only (not replies)
        const comments = await Comment.find({
            course: courseId,
            isReply: false
        })
        .populate("owner", "fullName username avatar")
        .populate({
            path: "replies",
            populate: {
                path: "owner",
                select: "fullName username avatar"
            },
            options: { sort: { createdAt: 1 } }
        })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .sort(options.sort);

        const totalComments = await Comment.countDocuments({
            course: courseId,
            isReply: false
        });

        return res.status(200).json(
            new ApiResponse(200, {
                comments,
                totalComments,
                currentPage: options.page,
                totalPages: Math.ceil(totalComments / options.limit)
            }, "Comments fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching comments");
    }
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            throw new ApiError(400, "Comment content is required");
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Check if user is the owner of the comment
        if (comment.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this comment");
        }

        // Update comment
        comment.content = content;
        await comment.save();

        return res.status(200).json(
            new ApiResponse(200, comment, "Comment updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating comment");
    }
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Check if user is the owner of the comment or an admin
        if (comment.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            throw new ApiError(403, "You don't have permission to delete this comment");
        }

        // If it's a parent comment, delete all replies
        if (!comment.isReply) {
            await Comment.deleteMany({ parentComment: commentId });
        }

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json(
            new ApiResponse(200, {}, "Comment deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting comment");
    }
});

// Like a comment
const likeComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Increment like count
        comment.likes += 1;
        await comment.save();

        return res.status(200).json(
            new ApiResponse(200, { likes: comment.likes }, "Comment liked successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while liking comment");
    }
});

// Add a comment to a blog
const addBlogComment = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            throw new ApiError(400, "Comment content is required");
        }

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        // Create comment
        const comment = await Comment.create({
            content,
            blog: blogId,
            owner: req.user._id
        });

        // Populate owner details
        const populatedComment = await Comment.findById(comment._id).populate("owner", "fullName username avatar");

        return res.status(201).json(
            new ApiResponse(201, populatedComment, "Comment added successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding comment");
    }
});

// Get all comments for a blog
const getBlogComments = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        // Get top-level comments only (not replies)
        const comments = await Comment.find({
            blog: blogId,
            isReply: false
        })
        .populate("owner", "fullName username avatar")
        .populate({
            path: "replies",
            populate: {
                path: "owner",
                select: "fullName username avatar"
            },
            options: { sort: { createdAt: 1 } }
        })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .sort(options.sort);

        const totalComments = await Comment.countDocuments({
            blog: blogId,
            isReply: false
        });

        return res.status(200).json(
            new ApiResponse(200, {
                comments,
                totalComments,
                currentPage: options.page,
                totalPages: Math.ceil(totalComments / options.limit)
            }, "Comments fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching comments");
    }
});

export {
    addVideoComment,
    addCourseComment,
    addBlogComment,
    addReply,
    getVideoComments,
    getCourseComments,
    getBlogComments,
    updateComment,
    deleteComment,
    likeComment
};
