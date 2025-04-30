import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DiscussionMessage } from "../models/discussion.model.js";
import { Course } from "../models/course.model.js";

// Get all messages for a course
const getDiscussionMessages = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }
    
    // Get all top-level messages (no parentId)
    const messages = await DiscussionMessage.find({ 
        courseId, 
        parentId: null 
    })
    .populate("user", "fullName username avatar")
    .sort({ createdAt: -1 });
    
    // For each message, get replies
    const messagesWithReplies = await Promise.all(messages.map(async (message) => {
        const replies = await DiscussionMessage.find({ 
            parentId: message._id 
        })
        .populate("user", "fullName username avatar")
        .sort({ createdAt: 1 });
        
        return {
            ...message._doc,
            replies
        };
    }));
    
    return res.status(200).json(
        new ApiResponse(200, messagesWithReplies, "Discussion messages retrieved successfully")
    );
});

// Create a new message
const createDiscussionMessage = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { message, parentId } = req.body;
    
    if (!message?.trim()) {
        throw new ApiError(400, "Message is required");
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }
    
    // Check if user is enrolled in the course or is the creator
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isCreator = course.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    
    if (!isEnrolled && !isCreator && !isAdmin) {
        throw new ApiError(403, "You must be enrolled in this course to participate in discussions");
    }
    
    // If parentId is provided, check if parent message exists
    if (parentId) {
        const parentMessage = await DiscussionMessage.findById(parentId);
        if (!parentMessage) {
            throw new ApiError(404, "Parent message not found");
        }
    }
    
    // Create the message
    const newMessage = await DiscussionMessage.create({
        courseId,
        user: req.user._id,
        message,
        parentId: parentId || null,
        isInstructor: isCreator || isAdmin
    });
    
    // Populate user details
    const populatedMessage = await DiscussionMessage.findById(newMessage._id)
        .populate("user", "fullName username avatar");
    
    return res.status(201).json(
        new ApiResponse(201, populatedMessage, "Message posted successfully")
    );
});

// Like/unlike a message
const toggleLikeMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    
    // Check if message exists
    const message = await DiscussionMessage.findById(messageId);
    if (!message) {
        throw new ApiError(404, "Message not found");
    }
    
    // Check if user is enrolled in the course or is the creator
    const course = await Course.findById(message.courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }
    
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isCreator = course.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    
    if (!isEnrolled && !isCreator && !isAdmin) {
        throw new ApiError(403, "You must be enrolled in this course to like messages");
    }
    
    // Check if user has already liked the message
    const hasLiked = message.likes.includes(req.user._id);
    
    if (hasLiked) {
        // Unlike the message
        message.likes = message.likes.filter(
            userId => userId.toString() !== req.user._id.toString()
        );
    } else {
        // Like the message
        message.likes.push(req.user._id);
    }
    
    await message.save();
    
    return res.status(200).json(
        new ApiResponse(
            200, 
            { liked: !hasLiked, likesCount: message.likes.length },
            hasLiked ? "Message unliked successfully" : "Message liked successfully"
        )
    );
});

// Delete a message (only by message creator, course creator, or admin)
const deleteDiscussionMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    
    // Check if message exists
    const message = await DiscussionMessage.findById(messageId);
    if (!message) {
        throw new ApiError(404, "Message not found");
    }
    
    // Check if user is the message creator, course creator, or admin
    const isMessageCreator = message.user.toString() === req.user._id.toString();
    
    const course = await Course.findById(message.courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }
    
    const isCourseCreator = course.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    
    if (!isMessageCreator && !isCourseCreator && !isAdmin) {
        throw new ApiError(403, "You don't have permission to delete this message");
    }
    
    // Delete the message and all its replies
    await DiscussionMessage.deleteMany({ 
        $or: [
            { _id: messageId },
            { parentId: messageId }
        ]
    });
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Message deleted successfully")
    );
});

export {
    getDiscussionMessages,
    createDiscussionMessage,
    toggleLikeMessage,
    deleteDiscussionMessage
};
