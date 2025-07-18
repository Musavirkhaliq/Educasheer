import { Seat, TimeSlot, SeatBooking } from "../models/seat.model.js";
import { Center } from "../models/center.model.js";
import { ApiError } from "../utils/ApiError.js";

// Validation service for seat booking operations
export class SeatBookingValidationService {
    
    // Validate if a seat booking request is valid
    static async validateBookingRequest(bookingData) {
        const { seatId, timeSlotId, bookingDate, startTime, endTime, userId } = bookingData;
        
        // 1. Validate seat exists and is active
        const seat = await Seat.findById(seatId).populate('center');
        if (!seat) {
            throw new ApiError(404, "Seat not found");
        }
        
        if (!seat.isActive) {
            throw new ApiError(400, "Seat is not active");
        }
        
        // 2. Validate time slot exists and is active (if provided)
        let timeSlot = null;
        if (timeSlotId) {
            timeSlot = await TimeSlot.findById(timeSlotId);
            if (!timeSlot) {
                throw new ApiError(404, "Time slot not found");
            }

            if (!timeSlot.isActive) {
                throw new ApiError(400, "Time slot is not active");
            }
        }
        
        // 3. Validate booking date is not in the past
        const bookingDateObj = new Date(bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDateObj < today) {
            throw new ApiError(400, "Cannot book seats for past dates");
        }
        
        // 4. Validate booking date is within allowed range (e.g., max 30 days in advance)
        const maxAdvanceBookingDays = 30;
        const maxBookingDate = new Date();
        maxBookingDate.setDate(maxBookingDate.getDate() + maxAdvanceBookingDays);
        
        if (bookingDateObj > maxBookingDate) {
            throw new ApiError(400, `Cannot book seats more than ${maxAdvanceBookingDays} days in advance`);
        }
        
        // 5. Validate time range
        const duration = this.calculateDuration(startTime, endTime);
        if (duration <= 0) {
            throw new ApiError(400, "End time must be after start time");
        }
        
        // 6. Validate against time slot constraints (if time slot is provided)
        if (timeSlot) {
            if (duration > timeSlot.maxBookingDuration) {
                throw new ApiError(400, `Booking duration cannot exceed ${timeSlot.maxBookingDuration} minutes`);
            }

            // Validate booking time is within time slot range
            if (!this.isTimeWithinSlot(startTime, endTime, timeSlot)) {
                throw new ApiError(400, "Booking time must be within the selected time slot range");
            }

            // Validate day of week
            const dayOfWeek = this.getDayOfWeek(bookingDateObj);
            if (!timeSlot.daysOfWeek.includes(dayOfWeek)) {
                throw new ApiError(400, "Selected time slot is not available on this day");
            }
        } else {
            // Default maximum duration when no time slot (8 hours)
            const maxDurationWithoutSlot = 480; // 8 hours in minutes
            if (duration > maxDurationWithoutSlot) {
                throw new ApiError(400, `Booking duration cannot exceed ${maxDurationWithoutSlot} minutes`);
            }
        }
        
        // 8. Check for conflicting bookings
        await this.checkBookingConflicts(seatId, bookingDateObj, startTime, endTime);
        
        // 9. Check user booking limits
        await this.checkUserBookingLimits(userId, bookingDateObj);
        
        return {
            seat,
            timeSlot,
            duration,
            isValid: true
        };
    }
    
    // Calculate duration in minutes between two time strings
    static calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        return (end - start) / (1000 * 60);
    }
    
    // Check if booking time is within time slot range
    static isTimeWithinSlot(startTime, endTime, timeSlot) {
        const bookingStart = this.timeToMinutes(startTime);
        const bookingEnd = this.timeToMinutes(endTime);
        const slotStart = this.timeToMinutes(timeSlot.startTime);
        const slotEnd = this.timeToMinutes(timeSlot.endTime);
        
        return bookingStart >= slotStart && bookingEnd <= slotEnd;
    }
    
    // Convert time string to minutes since midnight
    static timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // Get day of week as lowercase string
    static getDayOfWeek(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }
    
    // Check for conflicting bookings
    static async checkBookingConflicts(seatId, bookingDate, startTime, endTime) {
        const conflictingBooking = await SeatBooking.findOne({
            seat: seatId,
            bookingDate,
            status: { $in: ["confirmed", "completed"] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });
        
        if (conflictingBooking) {
            throw new ApiError(409, "Seat is already booked for the selected time slot");
        }
    }
    
    // Check user booking limits
    static async checkUserBookingLimits(userId, bookingDate) {
        // Limit: Max 3 bookings per day per user
        const maxBookingsPerDay = 3;
        
        const userBookingsToday = await SeatBooking.countDocuments({
            user: userId,
            bookingDate,
            status: { $in: ["confirmed", "completed"] }
        });
        
        if (userBookingsToday >= maxBookingsPerDay) {
            throw new ApiError(400, `Cannot book more than ${maxBookingsPerDay} seats per day`);
        }
        
        // Limit: Max 10 active bookings per user
        const maxActiveBookings = 10;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeBookings = await SeatBooking.countDocuments({
            user: userId,
            bookingDate: { $gte: today },
            status: "confirmed"
        });
        
        if (activeBookings >= maxActiveBookings) {
            throw new ApiError(400, `Cannot have more than ${maxActiveBookings} active bookings`);
        }
    }
    
    // Validate cancellation request
    static async validateCancellationRequest(bookingId, userId, userRole) {
        const booking = await SeatBooking.findById(bookingId);
        
        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }
        
        // Check ownership or admin privileges
        if (booking.user.toString() !== userId && userRole !== "admin") {
            throw new ApiError(403, "Unauthorized to cancel this booking");
        }
        
        if (booking.status === "cancelled") {
            throw new ApiError(400, "Booking is already cancelled");
        }
        
        if (booking.status === "completed") {
            throw new ApiError(400, "Cannot cancel completed booking");
        }
        
        // Check if booking is in the past (with some grace period)
        const bookingDateTime = new Date(booking.bookingDate);
        const [hours, minutes] = booking.startTime.split(':').map(Number);
        bookingDateTime.setHours(hours, minutes);
        
        const now = new Date();
        const gracePeriodMinutes = 30; // Allow cancellation up to 30 minutes before start time
        const cancellationDeadline = new Date(bookingDateTime.getTime() - (gracePeriodMinutes * 60 * 1000));
        
        if (now > cancellationDeadline && userRole !== "admin") {
            throw new ApiError(400, `Cannot cancel booking less than ${gracePeriodMinutes} minutes before start time`);
        }
        
        return booking;
    }
    
    // Validate check-in request
    static async validateCheckInRequest(bookingId) {
        const booking = await SeatBooking.findById(bookingId);
        
        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }
        
        if (booking.status !== "confirmed") {
            throw new ApiError(400, "Only confirmed bookings can be checked in");
        }
        
        if (booking.checkedIn) {
            throw new ApiError(400, "User is already checked in");
        }
        
        // Check if it's the right time to check in (within 15 minutes of start time)
        const bookingDateTime = new Date(booking.bookingDate);
        const [hours, minutes] = booking.startTime.split(':').map(Number);
        bookingDateTime.setHours(hours, minutes);
        
        const now = new Date();
        const checkInWindowMinutes = 15;
        const earliestCheckIn = new Date(bookingDateTime.getTime() - (checkInWindowMinutes * 60 * 1000));
        const latestCheckIn = new Date(bookingDateTime.getTime() + (checkInWindowMinutes * 60 * 1000));
        
        if (now < earliestCheckIn || now > latestCheckIn) {
            throw new ApiError(400, `Check-in is only allowed within ${checkInWindowMinutes} minutes of booking start time`);
        }
        
        return booking;
    }
    
    // Validate check-out request
    static async validateCheckOutRequest(bookingId) {
        const booking = await SeatBooking.findById(bookingId);
        
        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }
        
        if (!booking.checkedIn) {
            throw new ApiError(400, "User must be checked in before checking out");
        }
        
        if (booking.checkedOut) {
            throw new ApiError(400, "User is already checked out");
        }
        
        return booking;
    }
}

export default SeatBookingValidationService;
