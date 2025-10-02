import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    createPromoCode,
    getAllPromoCodes,
    validatePromoCode,
    updatePromoCode,
    deletePromoCode
} from "../controllers/promocode.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// User routes
router.route("/validate").post(validatePromoCode);

// Admin routes
router.route("/").post(verifyAdmin, createPromoCode);
router.route("/").get(verifyAdmin, getAllPromoCodes);
router.route("/:id").put(verifyAdmin, updatePromoCode);
router.route("/:id").delete(verifyAdmin, deletePromoCode);

export default router;