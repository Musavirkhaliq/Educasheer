import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { seatAPI } from '../../services/seatAPI';

const QRScanResult = ({ scanData, onClose }) => {
    const { currentUser } = useAuth();
    const [checkingIn, setCheckingIn] = useState(false);

    const { seat, isBooked, currentBooking } = scanData;

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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}:00`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
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
                                    <p className="text-sm text-gray-600">Date & Time</p>
                                    <p className="font-medium">{formatDate(currentBooking.bookingDate)}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatTime(currentBooking.startTime)} - {formatTime(currentBooking.endTime)}
                                    </p>
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

                            <p className="text-gray-600 mb-4">
                                {currentUser && currentBooking.user._id === currentUser._id
                                    ? 'This is your booking.'
                                    : 'This seat is currently unavailable for booking.'}
                            </p>

                            <button
                                onClick={onClose}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Show available seat options */
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800">Seat Available for Booking</h4>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 mb-3">
                                This seat is currently available! You can book it now.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleGoToBooking}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Go to Booking Page
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
