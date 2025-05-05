import { Router } from "express";
import { getApprovedTutors } from "../controllers/tutor.controller.js";

const router = Router();

// Public route to get approved tutors
router.route("/").get(getApprovedTutors);

export default router;
