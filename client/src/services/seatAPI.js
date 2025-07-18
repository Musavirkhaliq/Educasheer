import customFetch from '../utils/customFetch';

const API_BASE_URL = '/seats';

// Seat management API calls
export const seatAPI = {
    // Get seats for a center
    getCenterSeats: async (centerId, includeInactive = false) => {
        const response = await customFetch(`${API_BASE_URL}/centers/${centerId}/seats?includeInactive=${includeInactive}`);
        return response;
    },

    // Create seats for a center (admin only)
    createSeats: async (centerId, seats) => {
        const response = await customFetch.post(`${API_BASE_URL}/centers/${centerId}/seats`, { seats });
        return response;
    },

    // Get time slots for a center
    getCenterTimeSlots: async (centerId, includeInactive = false) => {
        const response = await customFetch(`${API_BASE_URL}/centers/${centerId}/time-slots?includeInactive=${includeInactive}`);
        return response;
    },

    // Create time slot for a center (admin only)
    createTimeSlot: async (centerId, timeSlotData) => {
        const response = await customFetch.post(`${API_BASE_URL}/centers/${centerId}/time-slots`, timeSlotData);
        return response;
    },

    // Get available seats for a specific date and time slot
    getAvailableSeats: async (centerId, timeSlotId, date, startTime, endTime) => {
        const params = new URLSearchParams({
            date,
            startTime,
            endTime
        });
        const response = await customFetch(`${API_BASE_URL}/centers/${centerId}/time-slots/${timeSlotId}/available-seats?${params}`);
        return response;
    },

    // Get available seats without time slot requirement
    getAvailableSeatsSimple: async (centerId, date, startTime, endTime) => {
        const params = new URLSearchParams({
            date,
            startTime,
            endTime
        });
        const response = await customFetch(`${API_BASE_URL}/centers/${centerId}/available-seats?${params}`);
        return response;
    },

    // Get seat booking details for a specific date and time
    getSeatBookingDetails: async (centerId, date, startTime, endTime) => {
        const params = new URLSearchParams({
            date,
            startTime,
            endTime
        });
        const response = await customFetch(`${API_BASE_URL}/centers/${centerId}/seat-bookings?${params}`);
        return response;
    },

    // Booking API calls
    createBooking: async (bookingData) => {
        const response = await customFetch.post(`${API_BASE_URL}/bookings`, bookingData);
        return response;
    },

    // Get user's bookings
    getUserBookings: async (page = 1, limit = 10, status = null, upcoming = false) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        
        if (status) params.append('status', status);
        if (upcoming) params.append('upcoming', 'true');

        const response = await customFetch(`${API_BASE_URL}/bookings?${params}`);
        return response;
    },

    // Get booking by ID
    getBookingById: async (bookingId) => {
        const response = await customFetch(`${API_BASE_URL}/bookings/${bookingId}`);
        return response;
    },

    // Cancel booking
    cancelBooking: async (bookingId, cancellationReason = '') => {
        const response = await customFetch.patch(`${API_BASE_URL}/bookings/${bookingId}`, { cancellationReason });
        return response;
    },

    // Admin API calls
    getCenterBookings: async (centerId, page = 1, limit = 10, status = null, date = null) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        
        if (status) params.append('status', status);
        if (date) params.append('date', date);

        const response = await customFetch(`${API_BASE_URL}/centers/${centerId}/bookings?${params}`);
        return response;
    },

    // Check in user (admin only)
    checkInUser: async (bookingId) => {
        const response = await customFetch.patch(`${API_BASE_URL}/bookings/${bookingId}/check-in`);
        return response;
    },

    // Check out user (admin only)
    checkOutUser: async (bookingId) => {
        const response = await customFetch.patch(`${API_BASE_URL}/bookings/${bookingId}/check-out`);
        return response;
    },

    // Self check-in for user's own booking
    selfCheckIn: async (bookingId) => {
        const response = await customFetch.patch(`${API_BASE_URL}/bookings/${bookingId}/self-check-in`);
        return response;
    }
};
