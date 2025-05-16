import { Router } from "express";
import {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    toggleQuizPublishStatus,
    getCourseQuizzes
} from "../controllers/quiz.controller.js";
import {
    startQuizAttempt,
    submitQuizAttempt,
    getQuizAttempt,
    getQuizAttempts,
    getUserQuizAttempts
} from "../controllers/quizAttempt.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Quiz management routes (admin only)
router.route("/")
    .post(isAdmin, createQuiz)
    .get(isAdmin, getAllQuizzes);

router.route("/:quizId")
    .get(getQuizById)
    .put(isAdmin, updateQuiz)
    .delete(isAdmin, deleteQuiz);

router.route("/:quizId/publish")
    .patch(isAdmin, toggleQuizPublishStatus);

// Course quizzes route
router.route("/course/:courseId")
    .get(getCourseQuizzes);

// Quiz attempt routes
router.route("/:quizId/attempts")
    .post(startQuizAttempt)
    .get(isAdmin, getQuizAttempts);

router.route("/:quizId/my-attempts")
    .get(getUserQuizAttempts);

router.route("/attempts/:attemptId")
    .get(getQuizAttempt);

router.route("/attempts/:attemptId/submit")
    .post(submitQuizAttempt);

export default router;
