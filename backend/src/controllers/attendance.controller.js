import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AttendanceRecord } from "../models/attendance.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";

// Generate a unique QR code for a class session
const generateQrCode = asyncHandler(async (req, res) => {
    try {
        const { courseId, session, sessionDate, expiryMinutes = 30 } = req.body;

        // Validate input
        if (!courseId || !session || !sessionDate) {
            throw new ApiError(400, "Course ID, session name, and session date are required");
        }

        // Check if user is admin or course creator
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Only course creator or admin can generate QR codes
        if (req.user.role !== "admin" && course.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to generate QR codes for this course");
        }

        // Check if the course is an offline course
        if (course.courseType !== "offline") {
            throw new ApiError(400, "QR code attendance is only available for offline courses");
        }

        // Generate a unique QR code data
        const qrCodeData = crypto.randomBytes(32).toString('hex');
        
        // Calculate expiry time
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + parseInt(expiryMinutes));

        // Check if a record already exists for this session
        let attendanceRecord = await AttendanceRecord.findOne({
            course: courseId,
            session
        });

        if (attendanceRecord) {
            // Update existing record
            attendanceRecord.qrCodeData = qrCodeData;
            attendanceRecord.qrCodeExpiry = expiryTime;
            attendanceRecord.sessionDate = new Date(sessionDate);
            await attendanceRecord.save();
        } else {
            // Create new attendance record
            attendanceRecord = await AttendanceRecord.create({
                course: courseId,
                session,
                sessionDate: new Date(sessionDate),
                qrCodeData,
                qrCodeExpiry: expiryTime,
                attendees: [],
                createdBy: req.user._id
            });
        }

        return res.status(200).json(
            new ApiResponse(200, {
                qrCodeData,
                expiryTime,
                recordId: attendanceRecord._id
            }, "QR code generated successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to generate QR code");
    }
});

// Mark attendance using QR code
const markAttendance = asyncHandler(async (req, res) => {
    try {
        const { qrCodeData } = req.body;

        if (!qrCodeData) {
            throw new ApiError(400, "QR code data is required");
        }

        // Find the attendance record with this QR code
        const attendanceRecord = await AttendanceRecord.findOne({
            qrCodeData,
            qrCodeExpiry: { $gt: new Date() } // Check if QR code is still valid
        });

        if (!attendanceRecord) {
            throw new ApiError(400, "Invalid or expired QR code");
        }

        // Check if the user is enrolled in the course
        const course = await Course.findById(attendanceRecord.course);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        const isEnrolled = course.enrolledStudents.some(
            studentId => studentId.toString() === req.user._id.toString()
        );

        if (!isEnrolled) {
            throw new ApiError(403, "You are not enrolled in this course");
        }

        // Check if the user has already marked attendance
        const alreadyMarked = attendanceRecord.attendees.some(
            attendee => attendee.student.toString() === req.user._id.toString()
        );

        if (alreadyMarked) {
            throw new ApiError(400, "You have already marked your attendance for this session");
        }

        // Add the user to attendees
        attendanceRecord.attendees.push({
            student: req.user._id,
            checkedInAt: new Date()
        });

        await attendanceRecord.save();

        return res.status(200).json(
            new ApiResponse(200, {
                course: course.title,
                session: attendanceRecord.session,
                checkedInAt: new Date()
            }, "Attendance marked successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to mark attendance");
    }
});

// Get attendance records for a course (for instructors)
const getCourseAttendance = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        // Check if user is admin or course creator
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Only course creator or admin can view attendance records
        if (req.user.role !== "admin" && course.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to view attendance records for this course");
        }

        // Get all attendance records for this course
        const attendanceRecords = await AttendanceRecord.find({
            course: courseId
        })
        .populate("attendees.student", "fullName username email")
        .sort({ sessionDate: -1 });

        return res.status(200).json(
            new ApiResponse(200, attendanceRecords, "Attendance records retrieved successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to retrieve attendance records");
    }
});

// Get student's attendance for a course
const getStudentAttendance = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        // Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Check if the user is enrolled in the course
        const isEnrolled = course.enrolledStudents.some(
            studentId => studentId.toString() === req.user._id.toString()
        );

        if (!isEnrolled && req.user.role !== "admin" && course.creator.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not enrolled in this course");
        }

        // Get all attendance records for this course
        const attendanceRecords = await AttendanceRecord.find({
            course: courseId
        }).sort({ sessionDate: -1 });

        // Filter attendance records to show only the student's attendance
        const studentAttendance = attendanceRecords.map(record => {
            const hasAttended = record.attendees.some(
                attendee => attendee.student.toString() === req.user._id.toString()
            );

            return {
                _id: record._id,
                session: record.session,
                sessionDate: record.sessionDate,
                attended: hasAttended,
                checkedInAt: hasAttended ? 
                    record.attendees.find(a => a.student.toString() === req.user._id.toString()).checkedInAt 
                    : null
            };
        });

        return res.status(200).json(
            new ApiResponse(200, studentAttendance, "Student attendance retrieved successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to retrieve student attendance");
    }
});

export {
    generateQrCode,
    markAttendance,
    getCourseAttendance,
    getStudentAttendance
};
