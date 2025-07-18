import { Router } from "express";
import {
    createSeats,
    getCenterSeats,
    createTimeSlots,
    getCenterTimeSlots,
    getAvailableSeats,
    getAvailableSeatsSimple,
    handleQRCodeScan,
    regenerateQRCodes,
    getSeatBookingDetails
} from "../controllers/seat.controller.js";
import {
    createSeatBooking,
    getUserBookings,
    cancelBooking,
    getBookingById,
    getCenterBookings,
    checkInUser,
    checkOutUser,
    selfCheckIn
} from "../controllers/seatBooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Seat management routes (admin only)
router.route("/centers/:centerId/seats")
    .post(isAdmin, createSeats)
    .get(getCenterSeats);

// Regenerate QR codes for seats (admin only)
router.route("/centers/:centerId/seats/regenerate-qr")
    .post(isAdmin, regenerateQRCodes);

// Time slot management routes (admin only)
router.route("/centers/:centerId/time-slots")
    .post(isAdmin, createTimeSlots)
    .get(getCenterTimeSlots);

// Available seats route
router.route("/centers/:centerId/time-slots/:timeSlotId/available-seats")
    .get(getAvailableSeats);

// Available seats route without time slot requirement
router.route("/centers/:centerId/available-seats")
    .get(getAvailableSeatsSimple);

// Get seat booking details for a specific date and time
router.route("/centers/:centerId/seat-bookings")
    .get(getSeatBookingDetails);

// QR code scan route
router.route("/qr-scan")
    .post(handleQRCodeScan);

// Booking routes
router.route("/bookings")
    .post(createSeatBooking)
    .get(getUserBookings);

router.route("/bookings/:bookingId")
    .get(getBookingById)
    .patch(cancelBooking);

// Admin routes for managing bookings
router.route("/centers/:centerId/bookings")
    .get(isAdmin, getCenterBookings);

router.route("/bookings/:bookingId/check-in")
    .patch(isAdmin, checkInUser);

router.route("/bookings/:bookingId/check-out")
    .patch(isAdmin, checkOutUser);

// Self check-in route for users
router.route("/bookings/:bookingId/self-check-in")
    .patch(selfCheckIn);

export default router;
