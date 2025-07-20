import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Seat, TimeSlot, SeatBooking } from "../models/seat.model.js";
import { Center } from "../models/center.model.js";
import { User } from "../models/user.model.js";
import { SeatBookingValidationService } from "../services/seatBookingValidation.service.js";
import { SeatBookingNotificationService } from "../services/seatBookingNotification.service.js";

// Create a seat booking
const createSeatBooking = asyncHandler(async (req, res) => {
    try {
        const { seatId, timeSlotId, bookingDate, startTime, endTime, bookingNotes } = req.body;

        if (!seatId || !bookingDate || !startTime || !endTime) {
            throw new ApiError(400, "Seat ID, booking date, start time, and end time are required");
        }

        // Use validation service to validate the booking request
        const validationResult = await SeatBookingValidationService.validateBookingRequest({
            seatId,
            timeSlotId,
            bookingDate,
            startTime,
            endTime,
            userId: req.user._id
        });

        const { seat, timeSlot, duration } = validationResult;

        // Create the booking
        const bookingDateObj = new Date(bookingDate);
        const bookingData = {
            seat: seatId,
            user: req.user._id,
            bookingDate: bookingDateObj,
            startTime,
            endTime,
            duration,
            bookingNotes: bookingNotes || ""
        };

        // Add time slot only if provided
        if (timeSlotId) {
            bookingData.timeSlot = timeSlotId;
        }

        const booking = await SeatBooking.create(bookingData);

        // Populate the booking with related data
        const populatedBooking = await SeatBooking.findById(booking._id)
            .populate("seat", "seatNumber row column seatType")
            .populate("user", "fullName email")
            .populate("timeSlot", "name startTime endTime price")
            .populate({
                path: "seat",
                populate: {
                    path: "center",
                    select: "name location"
                }
            });

        // Send booking confirmation notification (async, don't wait)
        SeatBookingNotificationService.sendBookingConfirmation(booking._id)
            .catch(error => console.error("Failed to send booking confirmation:", error));

        return res.status(201).json(
            new ApiResponse(201, populatedBooking, "Seat booked successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create booking");
    }
});

// Get user's bookings
const getUserBookings = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, status, upcoming } = req.query;
        
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        let filter = { user: req.user._id };
        
        if (status) {
            filter.status = status;
        }

        if (upcoming === 'true') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filter.bookingDate = { $gte: today };
            filter.status = { $in: ["confirmed"] };
        }

        const bookings = await SeatBooking.find(filter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ bookingDate: -1, startTime: -1 })
            .populate("seat", "seatNumber row column seatType")
            .populate("timeSlot", "name startTime endTime price")
            .populate({
                path: "seat",
                populate: {
                    path: "center",
                    select: "name location"
                }
            });

        const totalBookings = await SeatBooking.countDocuments(filter);

        return res.status(200).json(
            new ApiResponse(200, {
                bookings,
                totalBookings,
                currentPage: pageNum,
                totalPages: Math.ceil(totalBookings / limitNum)
            }, "User bookings fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch user bookings");
    }
});

// Cancel a booking
const cancelBooking = asyncHandler(async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { cancellationReason } = req.body;

        // Use validation service to validate the cancellation request
        const booking = await SeatBookingValidationService.validateCancellationRequest(
            bookingId,
            req.user._id.toString(),
            req.user.role
        );

        // Update booking status
        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.cancellationReason = cancellationReason || "";
        await booking.save();

        // Send cancellation notification (async, don't wait)
        SeatBookingNotificationService.sendBookingCancellation(booking._id, cancellationReason)
            .catch(error => console.error("Failed to send cancellation notification:", error));

        return res.status(200).json(
            new ApiResponse(200, booking, "Booking cancelled successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to cancel booking");
    }
});

// Get booking by ID
const getBookingById = asyncHandler(async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await SeatBooking.findById(bookingId)
            .populate("seat", "seatNumber row column seatType facilities")
            .populate("user", "fullName email")
            .populate("timeSlot", "name startTime endTime price")
            .populate({
                path: "seat",
                populate: {
                    path: "center",
                    select: "name location contactEmail contactPhone"
                }
            });

        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }

        // Check if user owns the booking or is admin
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized to view this booking");
        }

        return res.status(200).json(
            new ApiResponse(200, booking, "Booking fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch booking");
    }
});

// Get all bookings for a center (admin only)
const getCenterBookings = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can view center bookings");
        }

        const { centerId } = req.params;
        const { page = 1, limit = 10, status, date } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Verify center exists
        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        // Build filter for bookings
        let filter = {};

        // Get all seats for this center
        const centerSeats = await Seat.find({ center: centerId });
        const seatIds = centerSeats.map(seat => seat._id);
        filter.seat = { $in: seatIds };

        if (status) {
            filter.status = status;
        }

        if (date) {
            const bookingDate = new Date(date);
            filter.bookingDate = bookingDate;
        }

        const bookings = await SeatBooking.find(filter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ bookingDate: -1, startTime: -1 })
            .populate("seat", "seatNumber row column seatType")
            .populate("user", "fullName email")
            .populate("timeSlot", "name startTime endTime price");

        const totalBookings = await SeatBooking.countDocuments(filter);

        return res.status(200).json(
            new ApiResponse(200, {
                bookings,
                totalBookings,
                currentPage: pageNum,
                totalPages: Math.ceil(totalBookings / limitNum),
                center: center.name
            }, "Center bookings fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch center bookings");
    }
});

// Check-in a user (admin only)
const checkInUser = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can check-in users");
        }

        const { bookingId } = req.params;

        // Use validation service to validate the check-in request
        const booking = await SeatBookingValidationService.validateCheckInRequest(bookingId);

        // Update booking
        booking.checkedIn = true;
        booking.checkedInAt = new Date();
        await booking.save();

        return res.status(200).json(
            new ApiResponse(200, booking, "User checked in successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to check in user");
    }
});

// Check-out a user (admin only)
const checkOutUser = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can check-out users");
        }

        const { bookingId } = req.params;

        // Use validation service to validate the check-out request
        const booking = await SeatBookingValidationService.validateCheckOutRequest(bookingId);

        // Update booking
        booking.checkedOut = true;
        booking.checkedOutAt = new Date();
        booking.status = "completed";
        await booking.save();

        return res.status(200).json(
            new ApiResponse(200, booking, "User checked out successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to check out user");
    }
});

// Helper function to convert time string to minutes
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Self check-in for user's own booking
const selfCheckIn = asyncHandler(async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find the booking and verify ownership
        const booking = await SeatBooking.findById(bookingId)
            .populate('seat', 'seatNumber row column seatType')
            .populate({
                path: 'seat',
                populate: {
                    path: 'center',
                    select: 'name location'
                }
            });

        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }

        // Check if user owns the booking
        if (booking.user.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Unauthorized: You can only check-in to your own bookings");
        }

        // Check if booking is confirmed
        if (booking.status !== 'confirmed') {
            throw new ApiError(400, "Only confirmed bookings can be checked in");
        }

        // Check if already checked in
        if (booking.checkedIn) {
            throw new ApiError(400, "You are already checked in to this booking");
        }

        // Check if booking is for today and within time range
        const today = new Date();
        const bookingDate = new Date(booking.bookingDate);

        // Check if booking is for today
        if (bookingDate.toDateString() !== today.toDateString()) {
            throw new ApiError(400, "You can only check-in on the booking date");
        }

        // Check if current time is within 30 minutes of start time
        const currentTime = today.toTimeString().slice(0, 5); // HH:MM format
        const startTime = booking.startTime;

        const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
        const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);

        // Allow check-in 30 minutes before start time and any time after
        if (currentMinutes < startMinutes - 30) {
            throw new ApiError(400, "Check-in is only available 30 minutes before your booking start time");
        }

        // Update booking
        booking.checkedIn = true;
        booking.checkedInAt = new Date();
        await booking.save();

        return res.status(200).json(
            new ApiResponse(200, booking, "Successfully checked in to your booking")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to check in");
    }
});

// Admin delete booking (permanent deletion)
const adminDeleteBooking = asyncHandler(async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { deleteReason } = req.body;

        // Find the booking
        const booking = await SeatBooking.findById(bookingId)
            .populate('user', 'fullName email')
            .populate('seat', 'seatNumber row center')
            .populate({
                path: 'seat',
                populate: {
                    path: 'center',
                    select: 'name'
                }
            });

        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }

        // Store booking details for response
        const bookingDetails = {
            _id: booking._id,
            user: booking.user,
            seat: booking.seat,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            deleteReason: deleteReason || 'Deleted by admin'
        };

        // Permanently delete the booking
        await SeatBooking.findByIdAndDelete(bookingId);

        console.log(`Admin deleted booking ${bookingId} - User: ${booking.user.fullName}, Seat: ${booking.seat.seatNumber}, Reason: ${deleteReason || 'No reason provided'}`);

        return res.status(200).json(
            new ApiResponse(200, bookingDetails, "Booking deleted successfully by admin")
        );
    } catch (error) {
        console.error('Admin delete booking error:', error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete booking");
    }
});

// Get all bookings for admin management
const getAllBookingsForAdmin = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            centerId,
            date,
            search
        } = req.query;

        const skip = (page - 1) * limit;
        const query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by center
        if (centerId) {
            // First get all seats for this center
            const seats = await Seat.find({ center: centerId }).select('_id');
            const seatIds = seats.map(seat => seat._id);
            query.seat = { $in: seatIds };
        }

        // Filter by date
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.bookingDate = {
                $gte: startDate,
                $lt: endDate
            };
        }

        // Search by user name or email
        if (search) {
            const users = await User.find({
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map(user => user._id);
            query.user = { $in: userIds };
        }

        const bookings = await SeatBooking.find(query)
            .populate('user', 'fullName email username')
            .populate({
                path: 'seat',
                select: 'seatNumber row column seatType center',
                populate: {
                    path: 'center',
                    select: 'name location'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalBookings = await SeatBooking.countDocuments(query);
        const totalPages = Math.ceil(totalBookings / limit);

        return res.status(200).json(
            new ApiResponse(200, {
                bookings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalBookings,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, "Admin bookings retrieved successfully")
        );
    } catch (error) {
        console.error('Get admin bookings error:', error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch bookings for admin");
    }
});

export {
    createSeatBooking,
    getUserBookings,
    cancelBooking,
    getBookingById,
    getCenterBookings,
    checkInUser,
    checkOutUser,
    selfCheckIn,
    adminDeleteBooking,
    getAllBookingsForAdmin
};
