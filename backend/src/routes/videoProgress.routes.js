import { Router } from "express";
import {
  updateVideoProgress,
  getVideoProgress,
  getAllVideoProgress
} from "../controllers/videoProgress.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Update video progress
router.post("/:videoId", updateVideoProgress);

// Get video progress for a specific video
router.get("/:videoId", getVideoProgress);

// Get all video progress for the user
router.get("/", getAllVideoProgress);

export default router;
