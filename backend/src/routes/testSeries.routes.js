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
    addSectionToTestSeries,
    updateSectionInTestSeries,
    deleteSectionFromTestSeries,
    addQuizToSection,
    removeQuizFromSection,
    reorderSections,
    fixTestSeriesQuizzes
} from "../controllers/testSeries.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { TestSeries } from "../models/testSeries.model.js";

const router = Router();

// Apply authentication middleware to all routes in this router
// (Public routes are handled directly in app.js)
router.use(verifyJWT);

// Test series management routes (admin and tutor only)
router.route("/")
    .post(isAdmin, createTestSeries)
    .get(getAllTestSeries); // Allow authenticated users to get test series with filters

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

// Section management routes (admin and creator only)
router.route("/:testSeriesId/sections")
    .post(addSectionToTestSeries);

router.route("/:testSeriesId/sections/reorder")
    .put(reorderSections);

router.route("/:testSeriesId/sections/:sectionId")
    .put(updateSectionInTestSeries)
    .delete(deleteSectionFromTestSeries);

router.route("/:testSeriesId/sections/:sectionId/quizzes/:quizId")
    .post(addQuizToSection)
    .delete(removeQuizFromSection);

// Enrollment routes
router.route("/:testSeriesId/enroll")
    .post(enrollInTestSeries);

// Migration/fix routes
router.route("/fix-quizzes")
    .post(isAdmin, fixTestSeriesQuizzes);

// Debug route to test model
router.route("/debug/:testSeriesId")
    .get(async (req, res) => {
        try {
            const testSeries = await TestSeries.findById(req.params.testSeriesId);
            res.json({ success: true, data: testSeries });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message, stack: error.stack });
        }
    });

export default router;
