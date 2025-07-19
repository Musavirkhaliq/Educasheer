import { Router } from "express";
import {
    createQuiz,
    getAllQuizzes,
    getPublishedQuizzes,
    getQuizCategories,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    toggleQuizPublishStatus,
    getCourseQuizzes,
    uploadQuestionsFromJSON
} from "../controllers/quiz.controller.js";
import {
    startQuizAttempt,
    submitQuizAttempt,
    getQuizAttempt,
    getQuizAttempts,
    getUserQuizAttempts,
    getQuizLeaderboard,
    getAllQuizAttempts
} from "../controllers/quizAttempt.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply authentication middleware to all routes in this router
// (Public routes are handled directly in app.js)
router.use(verifyJWT);

// Quiz management routes (admin only)
router.route("/")
    .post(isAdmin, createQuiz)
    .get(isAdmin, getAllQuizzes);

// JSON upload route for bulk question import (admin only)
router.route("/upload-questions")
    .post(isAdmin, upload.single("jsonFile"), uploadQuestionsFromJSON);

router.route("/:quizId")
    .get(getQuizById)
    .put(isAdmin, updateQuiz)
    .delete(isAdmin, deleteQuiz);

router.route("/:quizId/publish")
    .patch(isAdmin, toggleQuizPublishStatus);

// Course quizzes route
router.route("/course/:courseId")
    .get(getCourseQuizzes);

// Admin route to get all quiz attempts across all quizzes
router.route("/attempts/all")
    .get(isAdmin, getAllQuizAttempts);

// Quiz attempt routes
router.route("/:quizId/attempts")
    .post(startQuizAttempt)
    .get(isAdmin, getQuizAttempts);

router.route("/:quizId/my-attempts")
    .get(getUserQuizAttempts);

router.route("/:quizId/leaderboard")
    .get(getQuizLeaderboard);

router.route("/attempts/:attemptId")
    .get(getQuizAttempt);

router.route("/attempts/:attemptId/submit")
    .post(submitQuizAttempt);

export default router;
