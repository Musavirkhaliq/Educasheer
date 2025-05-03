import { Router } from "express";
import {
    submitTestimonial,
    getApprovedTestimonials,
    getAllTestimonials,
    reviewTestimonial,
    deleteTestimonial
} from "../controllers/testimonial.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getApprovedTestimonials);

// Protected routes (require authentication)
router.route("/").post(verifyJWT, submitTestimonial);
router.route("/:testimonialId").delete(verifyJWT, deleteTestimonial);

// Admin routes
router.route("/all").get(verifyJWT, isAdmin, getAllTestimonials);
router.route("/:testimonialId/review").patch(verifyJWT, isAdmin, reviewTestimonial);

export default router;
