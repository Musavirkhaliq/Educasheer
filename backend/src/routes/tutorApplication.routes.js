import { Router } from "express";
import {
    submitTutorApplication,
    getUserTutorApplication,
    getAllTutorApplications,
    reviewTutorApplication
} from "../controllers/tutorApplication.controller.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// User routes
router.route("/submit").post(varifyJWT, submitTutorApplication);
router.route("/my-application").get(varifyJWT, getUserTutorApplication);

// Admin routes
router.route("/all").get(varifyJWT, getAllTutorApplications);
router.route("/review/:applicationId").patch(varifyJWT, reviewTutorApplication);

export default router;
