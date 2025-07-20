import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getDiscussionMessages,
    createDiscussionMessage,
    toggleLikeMessage,
    deleteDiscussionMessage
} from "../controllers/discussion.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get all messages for a course
router.get("/courses/:courseId", getDiscussionMessages);

// Create a new message
router.post("/courses/:courseId", createDiscussionMessage);

// Like/unlike a message
router.patch("/:messageId/like", toggleLikeMessage);

// Delete a message
router.delete("/:messageId", deleteDiscussionMessage);

export default router;
