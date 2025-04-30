import { Router } from "express";
import {
    submitTutorApplication,
    getUserTutorApplication,
    getAllTutorApplications,
    reviewTutorApplication
} from "../controllers/tutorApplication.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// User routes
router.route("/submit").post(verifyJWT, submitTutorApplication);
router.route("/my-application").get(verifyJWT, getUserTutorApplication);

// Admin routes
router.route("/all").get(verifyJWT, getAllTutorApplications);
router.route("/review/:applicationId").patch(verifyJWT, reviewTutorApplication);

export default router;
