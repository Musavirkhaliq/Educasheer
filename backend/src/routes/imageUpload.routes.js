import { Router } from "express";
import {
    uploadQuizImage,
    deleteQuizImage
} from "../controllers/imageUpload.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Image upload routes (temporarily allow any authenticated user for testing)
router.route("/upload")
    .post(uploadImage.single("image"), uploadQuizImage);

router.route("/:filename")
    .delete(isAdmin, deleteQuizImage);

export default router;
