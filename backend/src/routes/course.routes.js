import { Router } from "express";
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByCreator,
    getMyCourses,
    enrollInCourse,
    getEnrolledCourses
} from "../controllers/course.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllCourses);

// Protected routes (require authentication)
router.route("/").post(verifyJWT, createCourse);
router.route("/my/courses").get(verifyJWT, getMyCourses);
router.route("/my/enrolled").get(verifyJWT, getEnrolledCourses);
router.route("/creator/:userId").get(getCoursesByCreator);

// Routes with parameters (must be after specific routes)
router.route("/:courseId").get(verifyJWT, getCourseById);
router.route("/:courseId").patch(verifyJWT, updateCourse);
router.route("/:courseId").delete(verifyJWT, deleteCourse);
router.route("/:courseId/enroll").post(verifyJWT, enrollInCourse);

export default router;
