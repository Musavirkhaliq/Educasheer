import { Router } from "express";
import {
    getUserProfile,
    getUserBadges,
    getUserPointsHistory,
    getUserStreak,
    getUserChallenges,
    getGamificationLeaderboard,
    getLeaderboardStreaks,
    updateDisplayedBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    adminAwardBadge,
    adminAwardPoints,
    getAllBadges,
    getAllChallenges,
    getGamificationStats,
    forceUpdateStreak
} from "../controllers/gamification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// User routes (require authentication)
router.get("/profile", verifyJWT, getUserProfile);
router.get("/badges", verifyJWT, getUserBadges);
router.get("/points-history", verifyJWT, getUserPointsHistory);
router.get("/streak", verifyJWT, getUserStreak);
router.get("/challenges", verifyJWT, getUserChallenges);
router.patch("/displayed-badges", verifyJWT, updateDisplayedBadges);
router.post("/force-update-streak", verifyJWT, forceUpdateStreak);

// Public routes
router.get("/leaderboard", getGamificationLeaderboard);
router.post("/leaderboard-streaks", getLeaderboardStreaks);

// Admin routes (require admin role)
// Badge management
router.post("/badges", verifyJWT, isAdmin, createBadge);
router.put("/badges/:badgeId", verifyJWT, isAdmin, updateBadge);
router.delete("/badges/:badgeId", verifyJWT, isAdmin, deleteBadge);
router.get("/admin/badges", verifyJWT, isAdmin, getAllBadges);

// Challenge management
router.post("/challenges", verifyJWT, isAdmin, createChallenge);
router.put("/challenges/:challengeId", verifyJWT, isAdmin, updateChallenge);
router.delete("/challenges/:challengeId", verifyJWT, isAdmin, deleteChallenge);
router.get("/admin/challenges", verifyJWT, isAdmin, getAllChallenges);

// User rewards
router.post("/award-badge", verifyJWT, isAdmin, adminAwardBadge);
router.post("/award-points", verifyJWT, isAdmin, adminAwardPoints);

// Statistics
router.get("/admin/stats", verifyJWT, isAdmin, getGamificationStats);

export default router;
