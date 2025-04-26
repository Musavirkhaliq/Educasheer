import { Router } from "express";
import {
    getAllUsers,
    updateUserRole,
    createAdminUser
} from "../controllers/admin.controller.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Admin routes
router.route("/users").get(varifyJWT, getAllUsers);
router.route("/users/:userId/role").patch(varifyJWT, updateUserRole);
router.route("/create-admin").post(createAdminUser);

export default router;
