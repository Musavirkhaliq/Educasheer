import { Router } from "express";
import { validateVideoIds } from "../controllers/debug.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Debug routes
router.route("/validate-video-ids").post(verifyJWT, validateVideoIds);

export default router;
