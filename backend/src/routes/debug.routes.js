import { Router } from "express";
import { validateVideoIds } from "../controllers/debug.controller.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Debug routes
router.route("/validate-video-ids").post(varifyJWT, validateVideoIds);

export default router;
