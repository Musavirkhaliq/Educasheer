import { Router } from "express";
import {
    getTestSeriesLeaderboard,
    updateUserLeaderboard,
    getUserPerformance,
    refreshLeaderboard,
    ensureLeaderboardEntries,
    debugLeaderboard
} from "../controllers/leaderboard.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Public/semi-public leaderboard routes (with optional authentication)
router.route("/test-series/:testSeriesId")
    .get(optionalVerifyJWT, getTestSeriesLeaderboard);

// Authenticated user routes
router.use(verifyJWT); // Apply authentication to all routes below

router.route("/test-series/:testSeriesId/update")
    .post(updateUserLeaderboard);

router.route("/test-series/:testSeriesId/user")
    .get(getUserPerformance);

// Admin only routes
router.route("/test-series/:testSeriesId/refresh")
    .post(isAdmin, refreshLeaderboard);

router.route("/test-series/:testSeriesId/ensure")
    .post(isAdmin, ensureLeaderboardEntries);

router.route("/test-series/:testSeriesId/debug")
    .get(isAdmin, debugLeaderboard);

export default router;