/**
 * Timezone utility functions for handling IST (Indian Standard Time)
 * IST is UTC+5:30 (Asia/Kolkata)
 */

/**
 * Get current date and time in IST
 * @returns {Date} Current date and time in IST
 */
export const getCurrentISTTime = () => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    return new Date(utc + istOffset);
};

/**
 * Get current time in HH:MM format in IST
 * @returns {string} Current time in HH:MM format
 */
export const getCurrentISTTimeString = () => {
    const istTime = getCurrentISTTime();
    return istTime.toTimeString().slice(0, 5);
};

/**
 * Get current date in IST (start of day)
 * @returns {Date} Current date in IST with time set to 00:00:00
 */
export const getCurrentISTDate = () => {
    const istTime = getCurrentISTTime();
    const istDate = new Date(istTime);
    istDate.setHours(0, 0, 0, 0);
    return istDate;
};

/**
 * Convert a date to IST
 * @param {Date} date - Date to convert
 * @returns {Date} Date converted to IST
 */
export const convertToIST = (date) => {
    const inputDate = new Date(date);
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const utc = inputDate.getTime() + (inputDate.getTimezoneOffset() * 60 * 1000);
    return new Date(utc + istOffset);
};

/**
 * Convert time string to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
export const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Check if current IST time is within a time range
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} bufferMinutes - Buffer minutes to add to end time (default: 0)
 * @returns {boolean} True if current time is within range
 */
export const isCurrentTimeInRange = (startTime, endTime, bufferMinutes = 0) => {
    const currentTime = getCurrentISTTimeString();
    const currentMinutes = timeToMinutes(currentTime);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime) + bufferMinutes;
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Get booking status based on current IST time
 * @param {string} startTime - Booking start time in HH:MM format
 * @param {string} endTime - Booking end time in HH:MM format
 * @param {string} bookingStatus - Original booking status
 * @param {number} bufferMinutes - Buffer minutes to add to end time (default: 5)
 * @returns {string} Booking status: 'future', 'active', 'expired', 'cancelled'
 */
export const getBookingStatus = (startTime, endTime, bookingStatus, bufferMinutes = 5) => {
    if (bookingStatus === 'cancelled') {
        return 'cancelled';
    }
    
    const currentTime = getCurrentISTTimeString();
    const currentMinutes = timeToMinutes(currentTime);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime) + bufferMinutes;
    
    if (currentMinutes < startMinutes) {
        return 'future';
    } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return 'active';
    } else {
        return 'expired';
    }
};

/**
 * Format date for display in IST
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatISTDate = (date) => {
    const istDate = convertToIST(date);
    return istDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

/**
 * Format time for display in IST
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time string with AM/PM
 */
export const formatISTTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
};

/**
 * Get tomorrow's date in IST
 * @returns {Date} Tomorrow's date in IST with time set to 00:00:00
 */
export const getTomorrowISTDate = () => {
    const today = getCurrentISTDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
};

/**
 * Check if a booking has expired based on IST time
 * @param {string} endTime - Booking end time in HH:MM format
 * @param {Date} bookingDate - Booking date
 * @param {number} bufferMinutes - Buffer minutes to add to end time (default: 5)
 * @returns {boolean} True if booking has expired
 */
export const isBookingExpired = (endTime, bookingDate, bufferMinutes = 5) => {
    const currentISTTime = getCurrentISTTime();
    const currentISTDate = getCurrentISTDate();
    
    // Convert booking date to IST
    const bookingISTDate = convertToIST(bookingDate);
    bookingISTDate.setHours(0, 0, 0, 0);
    
    // If booking is on a future date, it's not expired
    if (bookingISTDate > currentISTDate) {
        return false;
    }
    
    // If booking is on a past date, it's expired
    if (bookingISTDate < currentISTDate) {
        return true;
    }
    
    // If booking is today, check the time
    const endMinutes = timeToMinutes(endTime) + bufferMinutes;
    const currentMinutes = timeToMinutes(getCurrentISTTimeString());
    
    return currentMinutes > endMinutes;
};
