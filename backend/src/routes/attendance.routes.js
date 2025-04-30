import { Router } from "express";
import { 
    generateQrCode, 
    markAttendance, 
    getCourseAttendance, 
    getStudentAttendance 
} from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Generate QR code for attendance (instructor only)
router.post("/generate-qr", generateQrCode);

// Mark attendance using QR code (student)
router.post("/mark", markAttendance);

// Get attendance records for a course (instructor)
router.get("/course/:courseId", getCourseAttendance);

// Get student's attendance for a course
router.get("/student/:courseId", getStudentAttendance);

export default router;
