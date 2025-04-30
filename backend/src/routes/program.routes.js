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
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllPrograms);

// Protected routes (require authentication)
router.route("/").post(varifyJWT, createProgram);
router.route("/my/programs").get(varifyJWT, getMyPrograms);
router.route("/my/enrolled").get(varifyJWT, getEnrolledPrograms);
router.route("/creator/:userId").get(getProgramsByCreator);
router.route("/:programId").get(varifyJWT, getProgramById);
router.route("/:programId").patch(varifyJWT, updateProgram);
router.route("/:programId").delete(varifyJWT, deleteProgram);
router.route("/:programId/enroll").post(varifyJWT, enrollInProgram);

export default router;
