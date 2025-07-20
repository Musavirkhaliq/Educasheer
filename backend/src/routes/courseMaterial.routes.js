import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    getCourseMaterials,
    uploadCourseMaterial,
    deleteCourseMaterial
} from "../controllers/courseMaterial.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get all materials for a course
router.get("/courses/:courseId", getCourseMaterials);

// Upload a new material
router.post(
    "/courses/:courseId",
    upload.single("file"),
    uploadCourseMaterial
);

// Delete a material
router.delete("/:materialId", deleteCourseMaterial);

export default router;
