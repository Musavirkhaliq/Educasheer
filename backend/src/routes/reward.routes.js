import { Router } from "express";
import {
    createNewReward,
    getAvailableRewards,
    getAllRewardsAdmin,
    redeemUserReward,
    getRedemptionHistory,
    verifyRedemptionCode,
    markRedemptionUsed,
    updateReward
} from "../controllers/reward.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.get("/available", getAvailableRewards);

// User routes (require authentication)
router.use(verifyJWT);
router.get("/history", getRedemptionHistory);
router.post("/redeem/:rewardId", redeemUserReward);

// Admin routes (require admin role)
router.post(
    "/", 
    isAdmin, 
    upload.single("image"), 
    createNewReward
);
router.get("/admin/all", isAdmin, getAllRewardsAdmin);
router.get("/verify/:code", isAdmin, verifyRedemptionCode);
router.patch("/mark-used/:redemptionId", isAdmin, markRedemptionUsed);
router.patch(
    "/:rewardId", 
    isAdmin, 
    upload.single("image"), 
    updateReward
);

export default router;
