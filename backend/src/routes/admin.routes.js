import { Router } from "express";
import {
    getAllUsers,
    updateUserRole,
    enrollUserInCourse,
    createAdminUser
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Admin routes
router.route("/users").get(verifyJWT, getAllUsers);
router.route("/users/:userId/role").patch(verifyJWT, updateUserRole);
router.route("/users/:userId/enroll").post(verifyJWT, enrollUserInCourse);
router.route("/create-admin").post(createAdminUser);

export default router;
