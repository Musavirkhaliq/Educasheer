import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { seatAPI } from '../../services/seatAPI';

const QRScanResult = ({ scanData, onClose }) => {
    const { currentUser } = useAuth();
    const [checkingIn, setCheckingIn] = useState(false);

    const {
        seat,
        isBooked,
        currentBooking,
        allTodaysBookings,
        currentTime,
        currentISTTime,
        currentISTDate,
        timezone
    } = scanData;

    const handleSelfCheckIn = async () => {
        setCheckingIn(true);
        try {
            await seatAPI.selfCheckIn(currentBooking._id);
            toast.success('Successfully checked in!');
            onClose();
        } catch (error) {
            console.error('Error checking in:', error);
            toast.error(error.response?.data?.message || 'Failed to check in');
        } finally {
            setCheckingIn(false);
        }
    };

    const handleGoToBooking = () => {
        // Redirect to booking page for available seat
        window.location.href = scanData.redirectUrl;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    };

    const formatTime = (timeString) => {
        // If formatted time is already provided, use it
        if (timeString && timeString.includes('AM') || timeString.includes('PM')) {
            return timeString;
        }
        // Otherwise format the time
        return new Date(`2000-01-01T${timeString}:00`).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    };

    const getStatusBadge = (bookingStatus, status) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

        if (status === 'cancelled') {
            return `${baseClasses} bg-gray-100 text-gray-600`;
        }

        switch (bookingStatus) {
            case 'active':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'expired':
                return `${baseClasses} bg-red-100 text-red-600`;
            case 'future':
                return `${baseClasses} bg-blue-100 text-blue-600`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-600`;
        }
    };

    const getStatusText = (bookingStatus, status) => {
        if (status === 'cancelled') return 'Cancelled';

        switch (bookingStatus) {
            case 'active':
                return 'Currently Active';
            case 'expired':
                return 'Expired';
            case 'future':
                return 'Upcoming';
            default:
                return status;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">
                        {isBooked ? 'Seat Currently Booked' : 'Seat Available'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Current Time Display with IST */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">Current Time (IST):</span>
                        <div className="text-right">
                            <span className="text-blue-600 font-mono block">{currentISTTime || formatTime(currentTime)}</span>
                            <span className="text-blue-500 text-xs">{currentISTDate || formatDate(new Date())}</span>
                        </div>
                    </div>
                    {timezone && (
                        <div className="mt-2 text-xs text-blue-600 text-center">
                            🌏 {timezone}
                        </div>
                    )}
                </div>

                {/* Seat Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">{seat.center.name}</h4>
                            <p className="text-gray-600 text-sm mb-1">📍 {seat.center.location}</p>
                            <p className="text-gray-600 text-sm">
                                Seat {seat.seatNumber} • Row {seat.row} • {seat.seatType}
                            </p>
                        </div>
                        <div className="flex items-center justify-end">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isBooked
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {isBooked ? 'Currently Booked' : 'Available'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Today's Bookings */}
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        📅 Today's Booking Schedule ({allTodaysBookings?.length || 0} bookings)
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                        All times shown in Indian Standard Time (IST)
                    </p>

                    {allTodaysBookings && allTodaysBookings.length > 0 ? (
                        <div className="space-y-3">
                            {allTodaysBookings.map((booking, index) => (
                                <div
                                    key={booking._id}
                                    className={`border rounded-lg p-4 ${
                                        booking.bookingStatus === 'active'
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {booking.user.fullName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {booking.user.email}
                                            </p>
                                        </div>
                                        <span className={getStatusBadge(booking.bookingStatus, booking.status)}>
                                            {getStatusText(booking.bookingStatus, booking.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">🕐 Time (IST):</span>
                                            <span className="ml-2 font-medium">
                                                {booking.formattedStartTime || formatTime(booking.startTime)} - {booking.formattedEndTime || formatTime(booking.endTime)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <span className="text-gray-600">⏱️ Duration:</span>
                                                <span className="ml-2 font-medium">
                                                    {Math.round(booking.duration / 60 * 10) / 10}h
                                                </span>
                                            </div>
                                            {booking.bookingNotes && (
                                                <div className="text-right">
                                                    <span className="text-gray-600">📝 Notes:</span>
                                                    <span className="ml-2 text-gray-800 text-xs">
                                                        {booking.bookingNotes}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {booking.checkedIn && (
                                        <div className="mt-2 text-sm">
                                            <span className="text-green-600 font-medium">✓ Checked In</span>
                                            {booking.checkedOut && (
                                                <span className="text-gray-600 ml-4">• Checked Out</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-600">No bookings scheduled for today</p>
                            <p className="text-sm text-gray-500 mt-1">This seat is available for booking</p>
                        </div>
                    )}
                </div>

                {isBooked ? (
                    /* Show current booking details */
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800">Current Booking Details</h4>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Booked by</p>
                                    <p className="font-medium">{currentBooking.user.fullName}</p>
                                    <p className="text-sm text-gray-500">{currentBooking.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date & Time (IST)</p>
                                    <p className="font-medium">{currentBooking.formattedDate || formatDate(currentBooking.bookingDate)}</p>
                                    <p className="text-sm text-gray-500">
                                        {currentBooking.formattedStartTime || formatTime(currentBooking.startTime)} - {currentBooking.formattedEndTime || formatTime(currentBooking.endTime)}
                                    </p>
                                    {currentBooking.bookingNotes && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            📝 {currentBooking.bookingNotes}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-red-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium capitalize">{currentBooking.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Check-in Status</p>
                                        <p className={`font-medium ${currentBooking.checkedIn ? 'text-green-600' : 'text-gray-500'}`}>
                                            {currentBooking.checkedIn ? '✓ Checked In' : '✗ Not Checked In'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            {/* Check-in button for user's own booking */}
                            {currentUser &&
                             currentBooking.user._id === currentUser._id &&
                             !currentBooking.checkedIn &&
                             currentBooking.status === 'confirmed' && (
                                <button
                                    onClick={handleSelfCheckIn}
                                    disabled={checkingIn}
                                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
                                >
                                    {checkingIn ? 'Checking In...' : 'Check In Now'}
                                </button>
                            )}

                            {/* Message for user's own booking vs others */}
                            {currentUser && currentBooking.user._id === currentUser._id ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-blue-800 font-medium">
                                        ✓ This is your booking
                                    </p>
                                    <p className="text-blue-600 text-sm mt-1">
                                        You can check in when you arrive at the center.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                    <p className="text-orange-800 font-medium mb-2">
                                        🚫 This seat is currently unavailable
                                    </p>
                                    <p className="text-orange-700 text-sm mb-2">
                                        This seat is already booked by another user for the selected time.
                                    </p>
                                    <p className="text-orange-600 text-sm font-medium">
                                        💡 Please find another available seat and scan its QR code to book.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close & Find Another Seat
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Show available seat options */
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800">Seat Available for Booking</h4>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 mb-3">
                                {allTodaysBookings && allTodaysBookings.length > 0
                                    ? '✅ This seat is currently available! Check the schedule above to see when it\'s booked today and plan your booking accordingly.'
                                    : '🎉 This seat is completely free today! You can book it for any time slot you need.'
                                }
                            </p>
                            <p className="text-green-700 text-sm mb-3">
                                📍 All booking times are in Indian Standard Time (IST). Current time: {currentISTTime || formatTime(currentTime)}
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleGoToBooking}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Book This Seat
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRScanResult;
