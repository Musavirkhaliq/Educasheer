import { SeatBooking } from "../models/seat.model.js";
import { 
    getCurrentISTTime, 
    getCurrentISTDate, 
    isBookingExpired,
    getBookingStatus
} from "../utils/timezone.js";

/**
 * Service to handle automatic booking status updates based on IST timezone
 */
class BookingStatusService {
    
    /**
     * Update expired bookings to 'completed' status
     * This should be called periodically or before checking seat availability
     */
    static async updateExpiredBookings() {
        try {
            const currentISTDate = getCurrentISTDate();
            const yesterday = new Date(currentISTDate);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Find all confirmed bookings from yesterday and today
            const bookingsToCheck = await SeatBooking.find({
                status: 'confirmed',
                bookingDate: {
                    $gte: yesterday,
                    $lte: currentISTDate
                }
            });

            const expiredBookings = [];
            
            for (const booking of bookingsToCheck) {
                if (isBookingExpired(booking.endTime, booking.bookingDate)) {
                    expiredBookings.push(booking._id);
                }
            }

            if (expiredBookings.length > 0) {
                const result = await SeatBooking.updateMany(
                    { _id: { $in: expiredBookings } },
                    { 
                        status: 'completed',
                        updatedAt: new Date()
                    }
                );

                console.log(`Updated ${result.modifiedCount} expired bookings to completed status`);
                return result.modifiedCount;
            }

            return 0;
        } catch (error) {
            console.error('Error updating expired bookings:', error);
            throw error;
        }
    }

    /**
     * Get current booking status for a seat considering IST timezone
     * @param {string} seatId - Seat ID
     * @param {Date} date - Date to check (optional, defaults to today)
     * @returns {Object} Seat availability information
     */
    static async getSeatAvailabilityStatus(seatId, date = null) {
        try {
            const checkDate = date || getCurrentISTDate();
            const tomorrow = new Date(checkDate);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // First update any expired bookings
            await this.updateExpiredBookings();

            // Get all bookings for the specified date
            const bookings = await SeatBooking.find({
                seat: seatId,
                bookingDate: {
                    $gte: checkDate,
                    $lt: tomorrow
                },
                status: { $in: ['confirmed', 'completed'] }
            }).populate('user', 'fullName email').sort({ startTime: 1 });

            const bookingsWithStatus = bookings.map(booking => {
                const bookingStatus = getBookingStatus(
                    booking.startTime, 
                    booking.endTime, 
                    booking.status
                );

                return {
                    ...booking.toObject(),
                    bookingStatus
                };
            });

            // Find currently active booking
            const activeBooking = bookingsWithStatus.find(
                booking => booking.bookingStatus === 'active'
            );

            return {
                isCurrentlyBooked: !!activeBooking,
                activeBooking,
                allBookings: bookingsWithStatus,
                totalBookings: bookingsWithStatus.length,
                availableSlots: this.calculateAvailableSlots(bookingsWithStatus)
            };
        } catch (error) {
            console.error('Error getting seat availability status:', error);
            throw error;
        }
    }

    /**
     * Calculate available time slots between bookings
     * @param {Array} bookings - Array of bookings with status
     * @returns {Array} Available time slots
     */
    static calculateAvailableSlots(bookings) {
        const confirmedBookings = bookings
            .filter(booking => booking.status === 'confirmed' && booking.bookingStatus !== 'expired')
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const availableSlots = [];
        let lastEndTime = '00:00';

        for (const booking of confirmedBookings) {
            if (booking.startTime > lastEndTime) {
                availableSlots.push({
                    startTime: lastEndTime,
                    endTime: booking.startTime,
                    duration: this.calculateSlotDuration(lastEndTime, booking.startTime)
                });
            }
            lastEndTime = booking.endTime;
        }

        // Add slot from last booking to end of day if applicable
        if (lastEndTime < '23:59') {
            availableSlots.push({
                startTime: lastEndTime,
                endTime: '23:59',
                duration: this.calculateSlotDuration(lastEndTime, '23:59')
            });
        }

        return availableSlots.filter(slot => slot.duration > 30); // Only show slots longer than 30 minutes
    }

    /**
     * Calculate duration between two time strings in minutes
     * @param {string} startTime - Start time in HH:MM format
     * @param {string} endTime - End time in HH:MM format
     * @returns {number} Duration in minutes
     */
    static calculateSlotDuration(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        return endTotalMinutes - startTotalMinutes;
    }

    /**
     * Check if a seat is available for a specific time range
     * @param {string} seatId - Seat ID
     * @param {string} startTime - Start time in HH:MM format
     * @param {string} endTime - End time in HH:MM format
     * @param {Date} date - Date to check (optional, defaults to today)
     * @returns {boolean} True if seat is available
     */
    static async isSeatAvailableForTimeRange(seatId, startTime, endTime, date = null) {
        try {
            const availability = await this.getSeatAvailabilityStatus(seatId, date);
            
            // Check if the requested time conflicts with any confirmed bookings
            const hasConflict = availability.allBookings.some(booking => {
                if (booking.status !== 'confirmed' || booking.bookingStatus === 'expired') {
                    return false;
                }
                
                return this.timeRangesOverlap(
                    startTime, endTime,
                    booking.startTime, booking.endTime
                );
            });

            return !hasConflict;
        } catch (error) {
            console.error('Error checking seat availability for time range:', error);
            throw error;
        }
    }

    /**
     * Check if two time ranges overlap
     * @param {string} start1 - Start time of first range
     * @param {string} end1 - End time of first range
     * @param {string} start2 - Start time of second range
     * @param {string} end2 - End time of second range
     * @returns {boolean} True if ranges overlap
     */
    static timeRangesOverlap(start1, end1, start2, end2) {
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const start1Minutes = timeToMinutes(start1);
        const end1Minutes = timeToMinutes(end1);
        const start2Minutes = timeToMinutes(start2);
        const end2Minutes = timeToMinutes(end2);

        return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
    }

    /**
     * Auto-complete bookings that have ended
     * This can be called as a scheduled job
     */
    static async autoCompleteEndedBookings() {
        try {
            const result = await this.updateExpiredBookings();
            console.log(`Auto-completed ${result} ended bookings`);
            return result;
        } catch (error) {
            console.error('Error in auto-complete ended bookings:', error);
            throw error;
        }
    }
}

export default BookingStatusService;
