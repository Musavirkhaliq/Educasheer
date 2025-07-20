import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Seat, TimeSlot, SeatBooking } from "../models/seat.model.js";
import { Center } from "../models/center.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import QRCode from "qrcode";
import {
    getCurrentISTTime,
    getCurrentISTTimeString,
    getCurrentISTDate,
    getTomorrowISTDate,
    getBookingStatus,
    timeToMinutes,
    formatISTDate,
    formatISTTime
} from "../utils/timezone.js";
import BookingStatusService from "../services/bookingStatusService.js";

// Helper function to generate QR code for a seat
const generateSeatQRCode = async (seatData) => {
    try {
        // Create a direct booking URL for this seat
        const bookingUrl = `${process.env.FRONTEND_URL || 'https://educasheer.in'}/seat-booking/${seatData.center}?seatId=${seatData._id}`;

        const qrCodeImage = await QRCode.toDataURL(bookingUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return {
            qrCode: qrCodeImage,
            qrCodeData: bookingUrl
        };
    } catch (error) {
        console.error('Error generating QR code:', error);
        return {
            qrCode: null,
            qrCodeData: null
        };
    }
};

// Create seats for a center (admin only)
const createSeats = asyncHandler(async (req, res) => {
    try {
        console.log('Creating seats for center:', req.params.centerId);

        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can create seats");
        }

        const { centerId } = req.params;
        const { seats } = req.body; // Array of seat objects

        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            throw new ApiError(400, "Seats array is required");
        }

        // Validate centerId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(centerId)) {
            throw new ApiError(400, "Invalid center ID");
        }

        console.log('Looking for center with ID:', centerId);
        const center = await Center.findById(centerId);
        console.log('Found center:', center ? center.name : 'null');
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        // Validate and create seats
        console.log('Creating seats for center:', centerId, 'Seats data:', seats);
        const createdSeats = [];
        for (const seatData of seats) {
            const { row, column, seatNumber, seatType, facilities, notes } = seatData;

            console.log('Processing seat:', { row, column, seatNumber, seatType });

            if (!row || !column) {
                throw new ApiError(400, "Row and column are required for each seat");
            }

            // Check if seat already exists
            const existingSeat = await Seat.findOne({ center: centerId, row, column });
            if (existingSeat) {
                throw new ApiError(400, `Seat ${row}${column} already exists in this center`);
            }

            const finalSeatNumber = seatNumber || `${row}${column}`;
            console.log('Using seat number:', finalSeatNumber);

            const seat = await Seat.create({
                seatNumber: finalSeatNumber,
                center: centerId,
                row,
                column,
                seatType: seatType || "regular",
                facilities: facilities || [],
                notes: notes || ""
            });

            // Generate QR code for the seat
            const qrCodeData = await generateSeatQRCode(seat);
            if (qrCodeData.qrCode) {
                seat.qrCode = qrCodeData.qrCode;
                seat.qrCodeData = qrCodeData.qrCodeData;
                await seat.save();
            }

            console.log('Created seat:', seat._id, seat.seatNumber);
            createdSeats.push(seat);
        }

        return res.status(201).json(
            new ApiResponse(201, createdSeats, "Seats created successfully")
        );
    } catch (error) {
        console.error('Detailed error in createSeats:', error);
        console.error('Error stack:', error.stack);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create seats");
    }
});

// Get all seats for a center
const getCenterSeats = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;
        const { includeInactive = false } = req.query;

        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        const filter = { center: centerId };
        if (!includeInactive) {
            filter.isActive = true;
        }

        const seats = await Seat.find(filter)
            .sort({ row: 1, column: 1 })
            .populate("center", "name location");

        return res.status(200).json(
            new ApiResponse(200, seats, "Seats fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch seats");
    }
});

// Create time slots for a center (admin only)
const createTimeSlots = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access: Only admins can create time slots");
        }

        const { centerId } = req.params;
        const { name, startTime, endTime, daysOfWeek, maxBookingDuration, price } = req.body;

        if (!name || !startTime || !endTime || !daysOfWeek || !Array.isArray(daysOfWeek)) {
            throw new ApiError(400, "Name, start time, end time, and days of week are required");
        }

        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        const timeSlot = await TimeSlot.create({
            center: centerId,
            name,
            startTime,
            endTime,
            daysOfWeek,
            maxBookingDuration: maxBookingDuration || 180,
            price: price || 0
        });

        return res.status(201).json(
            new ApiResponse(201, timeSlot, "Time slot created successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create time slot");
    }
});

// Get time slots for a center
const getCenterTimeSlots = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;
        const { includeInactive = false } = req.query;

        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        const filter = { center: centerId };
        if (!includeInactive) {
            filter.isActive = true;
        }

        const timeSlots = await TimeSlot.find(filter)
            .sort({ startTime: 1 })
            .populate("center", "name location");

        return res.status(200).json(
            new ApiResponse(200, timeSlots, "Time slots fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch time slots");
    }
});

// Get available seats for a specific date and time slot
const getAvailableSeats = asyncHandler(async (req, res) => {
    try {
        const { centerId, timeSlotId } = req.params;
        const { date, startTime, endTime } = req.query;

        if (!date || !startTime || !endTime) {
            throw new ApiError(400, "Date, start time, and end time are required");
        }

        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        const timeSlot = await TimeSlot.findById(timeSlotId);
        if (!timeSlot) {
            throw new ApiError(404, "Time slot not found");
        }

        // Get all active seats for the center
        const allSeats = await Seat.find({ center: centerId, isActive: true })
            .sort({ row: 1, column: 1 });

        // Get existing bookings for the date and time range
        const bookingDate = new Date(date);
        const existingBookings = await SeatBooking.find({
            bookingDate,
            status: { $in: ["confirmed", "completed"] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        }).populate("seat");

        // Filter out booked seats
        const bookedSeatIds = existingBookings.map(booking => booking.seat._id.toString());
        const availableSeats = allSeats.filter(seat => 
            !bookedSeatIds.includes(seat._id.toString())
        );

        return res.status(200).json(
            new ApiResponse(200, {
                availableSeats,
                totalSeats: allSeats.length,
                bookedSeats: existingBookings.length
            }, "Available seats fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch available seats");
    }
});

// Get available seats for a center without time slot requirement
const getAvailableSeatsSimple = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;
        const { date, startTime, endTime } = req.query;

        console.log('getAvailableSeatsSimple called with:', { centerId, date, startTime, endTime });

        if (!date || !startTime || !endTime) {
            throw new ApiError(400, "Date, start time, and end time are required");
        }

        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        // Get all active seats for the center
        const allSeats = await Seat.find({ center: centerId, isActive: true })
            .sort({ row: 1, column: 1 });

        // Get existing bookings for the date and time range
        const bookingDate = new Date(date);
        const existingBookings = await SeatBooking.find({
            bookingDate,
            status: { $in: ["confirmed", "completed"] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        }).populate("seat");

        // Filter out booked seats
        const bookedSeatIds = existingBookings.map(booking => booking.seat._id.toString());
        const availableSeats = allSeats.filter(seat =>
            !bookedSeatIds.includes(seat._id.toString())
        );

        return res.status(200).json(
            new ApiResponse(200, {
                availableSeats,
                totalSeats: allSeats.length,
                bookedSeats: existingBookings.length
            }, "Available seats fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch available seats");
    }
});

// Handle QR code scan - check seat status and show details
const handleQRCodeScan = asyncHandler(async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            throw new ApiError(400, "QR code data is required");
        }

        // Check if qrData is a URL (new format) or JSON (old format)
        let seatId, centerId;

        if (qrData.startsWith('http')) {
            // New format - direct URL
            const urlParams = new URL(qrData);
            seatId = urlParams.searchParams.get('seatId');
            const pathParts = urlParams.pathname.split('/');
            centerId = pathParts[pathParts.length - 1]; // Last part of path
        } else {
            // Old format - JSON data
            try {
                const parsedData = JSON.parse(qrData);
                if (parsedData.type === 'seat' && parsedData.seatId && parsedData.centerId) {
                    seatId = parsedData.seatId;
                    centerId = parsedData.centerId;
                } else {
                    throw new ApiError(400, "Invalid QR code format");
                }
            } catch (error) {
                throw new ApiError(400, "Invalid QR code format");
            }
        }

        if (!seatId) {
            throw new ApiError(400, "Invalid QR code - missing seat ID");
        }

        // Get seat information with center details
        const seat = await Seat.findById(seatId).populate('center', 'name location');
        if (!seat) {
            throw new ApiError(404, "Seat not found");
        }

        if (!seat.isActive) {
            throw new ApiError(400, "This seat is currently inactive");
        }

        // Check booking status - get comprehensive booking information using IST timezone
        // First update any expired bookings automatically
        await BookingStatusService.updateExpiredBookings();

        const istNow = getCurrentISTTime();
        const istToday = getCurrentISTDate();
        const currentTime = getCurrentISTTimeString();

        // Get seat availability status using the booking status service
        const availabilityStatus = await BookingStatusService.getSeatAvailabilityStatus(seat._id, istToday);

        // Add formatted times for display
        const bookingsWithStatus = availabilityStatus.allBookings.map(booking => ({
            ...booking,
            formattedStartTime: formatISTTime(booking.startTime),
            formattedEndTime: formatISTTime(booking.endTime),
            formattedDate: formatISTDate(booking.bookingDate)
        }));

        // Find currently active booking
        const currentBooking = availabilityStatus.activeBooking ? {
            ...availabilityStatus.activeBooking,
            formattedStartTime: formatISTTime(availabilityStatus.activeBooking.startTime),
            formattedEndTime: formatISTTime(availabilityStatus.activeBooking.endTime),
            formattedDate: formatISTDate(availabilityStatus.activeBooking.bookingDate)
        } : null;

        // Debug logging with IST information
        console.log('QR Scan Debug - Seat ID:', seatId);
        console.log('QR Scan Debug - Center ID:', centerId);
        console.log('QR Scan Debug - Current IST Time:', currentTime);
        console.log('QR Scan Debug - IST Date:', formatISTDate(istToday));
        console.log('QR Scan Debug - Today\'s Bookings Count:', bookingsWithStatus.length);
        console.log('QR Scan Debug - Available Slots:', availabilityStatus.availableSlots?.length || 0);
        console.log('QR Scan Debug - Active Current Booking:', currentBooking ? 'Found' : 'None');
        if (currentBooking) {
            console.log('QR Scan Debug - Booking Time (IST):', `${currentBooking.formattedStartTime} - ${currentBooking.formattedEndTime}`);
        }
        console.log('QR Scan Debug - isBooked will be:', availabilityStatus.isCurrentlyBooked);

        const bookingUrl = `${process.env.FRONTEND_URL || 'https://educasheer.in'}/seat-booking/${centerId}?seatId=${seatId}`;

        const response = {
            seat: {
                _id: seat._id,
                seatNumber: seat.seatNumber,
                row: seat.row,
                column: seat.column,
                seatType: seat.seatType,
                facilities: seat.facilities,
                center: seat.center
            },
            isBooked: availabilityStatus.isCurrentlyBooked,
            currentBooking: currentBooking ? {
                _id: currentBooking._id,
                user: currentBooking.user,
                bookingDate: currentBooking.bookingDate,
                startTime: currentBooking.startTime,
                endTime: currentBooking.endTime,
                formattedStartTime: currentBooking.formattedStartTime,
                formattedEndTime: currentBooking.formattedEndTime,
                formattedDate: currentBooking.formattedDate,
                status: currentBooking.status,
                duration: currentBooking.duration,
                checkedIn: currentBooking.checkedIn,
                checkedOut: currentBooking.checkedOut,
                bookingStatus: currentBooking.bookingStatus,
                bookingNotes: currentBooking.bookingNotes
            } : null,
            // Include all today's bookings with their status and formatted times
            allTodaysBookings: bookingsWithStatus.map(booking => ({
                _id: booking._id,
                user: booking.user,
                startTime: booking.startTime,
                endTime: booking.endTime,
                formattedStartTime: booking.formattedStartTime,
                formattedEndTime: booking.formattedEndTime,
                formattedDate: booking.formattedDate,
                status: booking.status,
                bookingStatus: booking.bookingStatus,
                duration: booking.duration,
                checkedIn: booking.checkedIn,
                checkedOut: booking.checkedOut,
                bookingNotes: booking.bookingNotes
            })),
            redirectUrl: bookingUrl,
            currentTime: currentTime,
            currentISTTime: formatISTTime(currentTime),
            currentISTDate: formatISTDate(istToday),
            timezone: 'IST (UTC+5:30)',
            // Additional availability information
            availableSlots: availabilityStatus.availableSlots || [],
            totalBookingsToday: availabilityStatus.totalBookings,
            seatAvailabilityStatus: {
                isCurrentlyBooked: availabilityStatus.isCurrentlyBooked,
                hasBookingsToday: availabilityStatus.totalBookings > 0,
                availableSlotsCount: availabilityStatus.availableSlots?.length || 0
            }
        };

        console.log('QR Scan Debug - Final Response:', {
            isBooked: response.isBooked,
            hasCurrentBooking: !!response.currentBooking,
            redirectUrl: response.redirectUrl
        });

        return res.status(200).json(
            new ApiResponse(200, response, "QR code scanned successfully")
        );
    } catch (error) {
        console.error("Error handling QR code scan:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to process QR code");
    }
});

// Regenerate QR codes for existing seats (admin only)
const regenerateQRCodes = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;

        // Verify center exists
        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        // Get all seats for this center
        const seats = await Seat.find({ center: centerId });

        if (seats.length === 0) {
            throw new ApiError(404, "No seats found for this center");
        }

        let updatedCount = 0;
        const errors = [];

        for (const seat of seats) {
            try {
                // Generate QR code for the seat
                const qrCodeData = await generateSeatQRCode(seat);
                if (qrCodeData.qrCode) {
                    seat.qrCode = qrCodeData.qrCode;
                    seat.qrCodeData = qrCodeData.qrCodeData;
                    await seat.save();
                    updatedCount++;
                    console.log(`Generated QR code for seat ${seat.seatNumber}`);
                } else {
                    errors.push(`Failed to generate QR code for seat ${seat.seatNumber}`);
                }
            } catch (error) {
                console.error(`Error generating QR code for seat ${seat.seatNumber}:`, error);
                errors.push(`Error for seat ${seat.seatNumber}: ${error.message}`);
            }
        }

        return res.status(200).json(
            new ApiResponse(200, {
                totalSeats: seats.length,
                updatedSeats: updatedCount,
                errors: errors
            }, `QR codes regenerated for ${updatedCount} out of ${seats.length} seats`)
        );
    } catch (error) {
        console.error("Error regenerating QR codes:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to regenerate QR codes");
    }
});

// Get seat booking details for a specific date and time range
const getSeatBookingDetails = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;
        const { date, startTime, endTime } = req.query;

        console.log('getSeatBookingDetails called with:', { centerId, date, startTime, endTime });

        if (!date || !startTime || !endTime) {
            throw new ApiError(400, "Date, start time, and end time are required");
        }

        // Verify center exists
        const center = await Center.findById(centerId);
        if (!center) {
            throw new ApiError(404, "Center not found");
        }

        // Get all seats for this center
        const seats = await Seat.find({ center: centerId, isActive: true });

        // Parse the booking date and time
        const bookingDate = new Date(date);
        const requestStartTime = startTime;
        const requestEndTime = endTime;

        // Find all bookings for this center on the specified date that overlap with the requested time
        const seatIds = seats.map(seat => seat._id);

        const bookings = await SeatBooking.find({
            seat: { $in: seatIds },
            bookingDate: bookingDate,
            status: { $in: ['confirmed', 'completed'] },
            $or: [
                // Booking starts before request ends and ends after request starts (overlap)
                {
                    $and: [
                        { startTime: { $lt: requestEndTime } },
                        { endTime: { $gt: requestStartTime } }
                    ]
                }
            ]
        }).populate('seat', 'seatNumber row column seatType')
          .populate('user', 'fullName email username');

        // Create a map of seat bookings
        const seatBookingMap = {};
        bookings.forEach(booking => {
            seatBookingMap[booking.seat._id.toString()] = {
                _id: booking._id,
                user: booking.user,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: booking.status,
                bookingDate: booking.bookingDate,
                checkedIn: booking.checkedIn,
                checkedOut: booking.checkedOut
            };
        });

        return res.status(200).json(
            new ApiResponse(200, {
                seats,
                bookings: seatBookingMap
            }, "Seat booking details fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching seat booking details:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch seat booking details");
    }
});

export {
    createSeats,
    getCenterSeats,
    createTimeSlots,
    getCenterTimeSlots,
    getAvailableSeats,
    getAvailableSeatsSimple,
    handleQRCodeScan,
    regenerateQRCodes,
    getSeatBookingDetails
};
