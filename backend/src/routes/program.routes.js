import { Router } from "express";
import {
    createProgram,
    getAllPrograms,
    getProgramById,
    updateProgram,
    deleteProgram,
    getProgramsByCreator,
    getMyPrograms,
    enrollInProgram,
    getEnrolledPrograms
} from "../controllers/program.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllPrograms);

// Protected routes (require authentication)
router.route("/").post(verifyJWT, createProgram);
router.route("/my/programs").get(verifyJWT, getMyPrograms);
router.route("/my/enrolled").get(verifyJWT, getEnrolledPrograms);
router.route("/creator/:userId").get(getProgramsByCreator);
router.route("/:programId").get(verifyJWT, getProgramById);
router.route("/:programId").patch(verifyJWT, updateProgram);
router.route("/:programId").delete(verifyJWT, deleteProgram);
router.route("/:programId/enroll").post(verifyJWT, enrollInProgram);

export default router;
