import { Router } from "express";
import {
    addMaterial,
    getMaterialsByVideo,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    getMaterialsByCourse
} from "../controllers/material.controller.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Material routes for videos
router.route("/video/:videoId").get(getMaterialsByVideo);
router.route("/video").post(varifyJWT, upload.single("material"), addMaterial);

// Material routes for courses
router.route("/course/:courseId").get(getMaterialsByCourse);

// Routes with parameters (must be after specific routes)
router.route("/:materialId").get(getMaterialById);
router.route("/:materialId").patch(varifyJWT, upload.single("material"), updateMaterial);
router.route("/:materialId").delete(varifyJWT, deleteMaterial);

export default router;
