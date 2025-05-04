import { Router } from "express";
import {
  updateVideoProgress,
  updateQuizProgress,
  getUserCourseProgress,
  getAllUserCourseProgress
} from "../controllers/courseProgress.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get all course progress for the user
router.get("/", getAllUserCourseProgress);

// Get course progress for a specific course
router.get("/:courseId", getUserCourseProgress);

// Update course progress for a video
router.post("/:courseId/videos/:videoId", updateVideoProgress);

// Update course progress for a quiz
router.post("/:courseId/quizzes/:quizId", updateQuizProgress);

export default router;
