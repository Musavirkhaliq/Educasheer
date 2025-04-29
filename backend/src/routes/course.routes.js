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
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllCourses);

// Protected routes (require authentication)
router.route("/").post(varifyJWT, createCourse);
router.route("/my/courses").get(varifyJWT, getMyCourses);
router.route("/my/enrolled").get(varifyJWT, getEnrolledCourses);
router.route("/creator/:userId").get(getCoursesByCreator);

// Routes with parameters (must be after specific routes)
router.route("/:courseId").get(varifyJWT, getCourseById);
router.route("/:courseId").patch(varifyJWT, updateCourse);
router.route("/:courseId").delete(varifyJWT, deleteCourse);
router.route("/:courseId/enroll").post(varifyJWT, enrollInCourse);

export default router;
