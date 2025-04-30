import { Router } from "express";
import {
    addVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    getVideosByOwner,
    getMyVideos
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);

// Protected routes (require authentication)
router.route("/").post(verifyJWT, addVideo);
router.route("/my/videos").get(verifyJWT, getMyVideos);
router.route("/user/:userId").get(getVideosByOwner);

// Routes with parameters (must be after specific routes)
router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(verifyJWT, updateVideo);
router.route("/:videoId").delete(verifyJWT, deleteVideo);

export default router;
