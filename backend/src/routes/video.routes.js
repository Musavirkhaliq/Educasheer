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
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);
router.route("/user/:userId").get(getVideosByOwner);

// Protected routes (require authentication)
router.route("/").post(varifyJWT, addVideo);
router.route("/:videoId").patch(varifyJWT, updateVideo);
router.route("/:videoId").delete(varifyJWT, deleteVideo);
router.route("/my/videos").get(varifyJWT, getMyVideos);

export default router;
