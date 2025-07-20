import { Router } from "express";
import {
    getAllUsers,
    updateUserRole,
    enrollUserInCourse,
    createAdminUser,
    getSystemStatus,
    updateBookingStatus,
    controlScheduledTasks
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Admin routes
router.route("/users").get(verifyJWT, getAllUsers);
router.route("/users/:userId/role").patch(verifyJWT, updateUserRole);
router.route("/users/:userId/enroll").post(verifyJWT, enrollUserInCourse);
router.route("/create-admin").post(createAdminUser);

// System management routes
router.route("/system/status").get(verifyJWT, getSystemStatus);
router.route("/system/booking-status").post(verifyJWT, updateBookingStatus);
router.route("/system/scheduled-tasks").post(verifyJWT, controlScheduledTasks);

export default router;
