import { Router } from "express";
import {
    getAllUsers,
    updateUserRole,
    enrollUserInCourse,
    createAdminUser,
    getSystemStatus,
    updateBookingStatus,
    controlScheduledTasks,
    getAllOrders,
    getOrderStats,
    getOrderDetails
} from "../controllers/admin.controller.js";
import {
    getCleanupStatistics,
    cleanupExpired,
    cleanupOldAttempts,
    performFullCleanup
} from "../controllers/quizCleanup.controller.js";
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

// Quiz cleanup routes
router.route("/quiz-cleanup/stats").get(verifyJWT, getCleanupStatistics);
router.route("/quiz-cleanup/expired").post(verifyJWT, cleanupExpired);
router.route("/quiz-cleanup/old").post(verifyJWT, cleanupOldAttempts);
router.route("/quiz-cleanup/full").post(verifyJWT, performFullCleanup);

// Order management routes
router.route("/orders").get(verifyJWT, getAllOrders);
router.route("/orders/stats").get(verifyJWT, getOrderStats);
router.route("/orders/:orderId").get(verifyJWT, getOrderDetails);

export default router;
