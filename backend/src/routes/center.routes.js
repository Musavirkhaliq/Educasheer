import { Router } from "express";
import {
    createCenter,
    getAllCenters,
    getCenterById,
    updateCenter,
    deleteCenter,
    addStudentToCenter,
    removeStudentFromCenter
} from "../controllers/center.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllCenters);
router.route("/:centerId").get(getCenterById);

// Admin routes (require authentication and admin role)
router.route("/").post(verifyJWT, isAdmin, createCenter);
router.route("/:centerId").patch(verifyJWT, isAdmin, updateCenter);
router.route("/:centerId").delete(verifyJWT, isAdmin, deleteCenter);
router.route("/:centerId/students").post(verifyJWT, isAdmin, addStudentToCenter);
router.route("/:centerId/students/:studentId").delete(verifyJWT, isAdmin, removeStudentFromCenter);

export default router;
