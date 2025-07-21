import { Router } from "express";
import {
    createTestSeries,
    getAllTestSeries,
    getPublishedTestSeries,
    getTestSeriesById,
    updateTestSeries,
    deleteTestSeries,
    toggleTestSeriesPublishStatus,
    addQuizToTestSeries,
    removeQuizFromTestSeries,
    enrollInTestSeries,
    fixTestSeriesQuizzes
} from "../controllers/testSeries.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Apply authentication middleware to all routes in this router
// (Public routes are handled directly in app.js)
router.use(verifyJWT);

// Test series management routes (admin and tutor only)
router.route("/")
    .post(isAdmin, createTestSeries)
    .get(isAdmin, getAllTestSeries);

router.route("/:testSeriesId")
    .get(getTestSeriesById)
    .put(isAdmin, updateTestSeries)
    .delete(isAdmin, deleteTestSeries);

router.route("/:testSeriesId/publish")
    .patch(isAdmin, toggleTestSeriesPublishStatus);

// Quiz management within test series (admin and creator only)
router.route("/:testSeriesId/quizzes/:quizId")
    .post(isAdmin, addQuizToTestSeries)
    .delete(isAdmin, removeQuizFromTestSeries);

// Enrollment routes
router.route("/:testSeriesId/enroll")
    .post(enrollInTestSeries);

// Migration/fix routes
router.route("/fix-quizzes")
    .post(isAdmin, fixTestSeriesQuizzes);

export default router;
