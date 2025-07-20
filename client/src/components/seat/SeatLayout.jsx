import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { seatAPI } from '../../services/seatAPI';
import customFetch from '../../utils/customFetch';

const SeatLayout = ({
    seats = [],
    availableSeats = [],
    seatBookings = {},
    selectedSeat,
    onSeatSelect,
    showAvailabilityOnly = false
}) => {
    const { currentUser } = useAuth();

    // Helper functions for formatting (similar to QRScanResult)
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
        if (timeString && (timeString.includes('AM') || timeString.includes('PM'))) {
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
        if (status === 'cancelled') {
            return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
        }

        switch (bookingStatus) {
            case 'active':
                return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
            case 'future':
                return 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800';
            case 'expired':
                return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
            default:
                return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (bookingStatus, status) => {
        if (status === 'cancelled') return 'Cancelled';

        switch (bookingStatus) {
            case 'active': return '🟢 Active Now';
            case 'future': return '🔵 Upcoming';
            case 'expired': return '⚪ Completed';
            default: return status;
        }
    };
    const [seatGrid, setSeatGrid] = useState({});
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedSeatQR, setSelectedSeatQR] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [comprehensiveBookingData, setComprehensiveBookingData] = useState(null);
    const [loadingComprehensiveData, setLoadingComprehensiveData] = useState(false);

    useEffect(() => {
        // Organize seats into a grid structure
        const grid = {};
        seats.forEach(seat => {
            if (!grid[seat.row]) {
                grid[seat.row] = {};
            }
            grid[seat.row][seat.column] = seat;
        });
        setSeatGrid(grid);
    }, [seats]);

    const getSeatStatus = (seat) => {
        if (!seat.isActive) return 'inactive';
        
        if (showAvailabilityOnly) {
            const isAvailable = availableSeats.some(availableSeat => 
                availableSeat._id === seat._id
            );
            return isAvailable ? 'available' : 'booked';
        }
        
        return 'available';
    };

    const getSeatClassName = (seat, status) => {
        const baseClasses = 'w-12 h-12 m-1 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-sm font-semibold';
        
        const isSelected = selectedSeat && selectedSeat._id === seat._id;
        
        if (isSelected) {
            return `${baseClasses} bg-blue-500 border-blue-600 text-white shadow-lg transform scale-105`;
        }
        
        switch (status) {
            case 'available':
                return `${baseClasses} bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400`;
            case 'booked':
                return `${baseClasses} bg-red-100 border-red-300 text-red-800 cursor-not-allowed`;
            case 'inactive':
                return `${baseClasses} bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`;
            default:
                return `${baseClasses} bg-gray-100 border-gray-300 text-gray-600`;
        }
    };

    const handleSeatClick = (seat) => {
        const status = getSeatStatus(seat);

        if (status === 'inactive') {
            toast.error('This seat is not available');
            return;
        }

        if (status === 'booked') {
            // Fetch comprehensive booking details instead of just basic info
            const booking = seatBookings[seat._id];
            if (booking) {
                // Set basic booking info first for immediate display
                setSelectedBooking({ seat, booking });
                setShowBookingModal(true);

                // Then fetch comprehensive data in the background
                fetchComprehensiveBookingData(seat);
            } else {
                toast.error('This seat is already booked');
            }
            return;
        }

        if (onSeatSelect) {
            onSeatSelect(seat);
        }
    };

    const getSeatTypeIcon = (seatType) => {
        switch (seatType) {
            case 'premium':
                return '⭐';
            case 'vip':
                return '👑';
            default:
                return '';
        }
    };

    const handleViewQRCode = (seat) => {
        setSelectedSeatQR(seat);
        setShowQRModal(true);
    };

    const handleSelfCheckIn = async (bookingId) => {
        setCheckingIn(true);
        try {
            await seatAPI.selfCheckIn(bookingId);
            toast.success('Successfully checked in!');

            // Update the booking in the modal
            if (selectedBooking) {
                setSelectedBooking({
                    ...selectedBooking,
                    booking: {
                        ...selectedBooking.booking,
                        checkedIn: true,
                        checkedInAt: new Date().toISOString()
                    }
                });
            }
        } catch (error) {
            console.error('Error checking in:', error);
            toast.error(error.response?.data?.message || 'Failed to check in');
        } finally {
            setCheckingIn(false);
        }
    };

    // Fetch comprehensive booking data for a seat (similar to QR scan)
    const fetchComprehensiveBookingData = async (seat) => {
        setLoadingComprehensiveData(true);
        try {
            const response = await customFetch(`/seats/qr-scan/${seat._id}`, {
                method: 'GET',
            });

            if (response.success) {
                setComprehensiveBookingData(response.data);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch comprehensive booking data');
            }
        } catch (error) {
            console.error('Error fetching comprehensive booking data:', error);
            toast.error('Failed to load detailed booking information');
            return null;
        } finally {
            setLoadingComprehensiveData(false);
        }
    };

    const rows = Object.keys(seatGrid).sort();
    
    if (rows.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No seats available for this center
            </div>
        );
    }

    return (
        <div className="seat-layout">
            {/* Legend */}
            <div className="mb-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                    <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                    <span className="text-sm text-gray-600">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
                    <span className="text-sm text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-600">Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">QR</div>
                    <span className="text-sm text-gray-600">Hover for QR Code</span>
                </div>
            </div>

            {/* Seat Grid */}
            <div className="seat-grid bg-white p-6 rounded-lg border border-gray-200 overflow-x-auto">
                <div className="min-w-max">
                    {rows.map(row => {
                        const rowSeats = seatGrid[row];
                        const columns = Object.keys(rowSeats).sort((a, b) => parseInt(a) - parseInt(b));
                        
                        return (
                            <div key={row} className="flex items-center mb-2">
                                {/* Row label */}
                                <div className="w-8 h-12 flex items-center justify-center font-bold text-gray-600 mr-2">
                                    {row}
                                </div>
                                
                                {/* Seats in row */}
                                <div className="flex">
                                    {columns.map(column => {
                                        const seat = rowSeats[column];
                                        const status = getSeatStatus(seat);
                                        
                                        return (
                                            <div key={`${row}-${column}`} className="relative group">
                                                <div
                                                    className={getSeatClassName(seat, status)}
                                                    onClick={() => handleSeatClick(seat)}
                                                    title={`Seat ${seat.seatNumber} (${seat.seatType})`}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-xs">
                                                            {getSeatTypeIcon(seat.seatType)}
                                                        </div>
                                                        <div>{seat.seatNumber}</div>
                                                    </div>
                                                </div>

                                                {/* QR Code Button - appears on hover */}
                                                {seat.qrCode && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewQRCode(seat);
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-blue-700"
                                                        title="View QR Code"
                                                    >
                                                        QR
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected seat info */}
            {selectedSeat && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Selected Seat</h4>
                    <div className="text-sm text-blue-700">
                        <p><strong>Seat:</strong> {selectedSeat.seatNumber}</p>
                        <p><strong>Type:</strong> {selectedSeat.seatType}</p>
                        {selectedSeat.facilities && selectedSeat.facilities.length > 0 && (
                            <p><strong>Facilities:</strong> {selectedSeat.facilities.join(', ')}</p>
                        )}
                        {selectedSeat.notes && (
                            <p><strong>Notes:</strong> {selectedSeat.notes}</p>
                        )}
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && selectedSeatQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">QR Code - Seat {selectedSeatQR.seatNumber}</h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="mb-4">
                                <p className="font-medium">Seat {selectedSeatQR.seatNumber}</p>
                                <p className="text-sm text-gray-500">Row {selectedSeatQR.row} • {selectedSeatQR.seatType}</p>
                            </div>

                            {selectedSeatQR.qrCode ? (
                                <div className="mb-4">
                                    <img
                                        src={selectedSeatQR.qrCode}
                                        alt="QR Code"
                                        className="w-64 h-64 mx-auto border border-gray-200 rounded-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Scan this code to book the seat or view details
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-4 p-8 bg-gray-100 rounded-lg">
                                    <p className="text-gray-500">QR code not available</p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowQRModal(false)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Details Modal */}
            {showBookingModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">📅 Comprehensive Seat Information</h3>
                            <button
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setComprehensiveBookingData(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {loadingComprehensiveData && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading comprehensive booking information...</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Seat Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">🪑 Seat Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Seat Number:</span>
                                        <span className="ml-2 font-medium">{selectedBooking.seat.seatNumber}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Row:</span>
                                        <span className="ml-2 font-medium">{selectedBooking.seat.row}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Type:</span>
                                        <span className="ml-2 font-medium">{selectedBooking.seat.seatType}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Center:</span>
                                        <span className="ml-2 font-medium">{selectedBooking.seat.center?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                {selectedBooking.seat.facilities && selectedBooking.seat.facilities.length > 0 && (
                                    <div className="mt-3">
                                        <span className="text-gray-600">Facilities:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedBooking.seat.facilities.map((facility, index) => (
                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {facility}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Current Time Display with IST */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-800 font-medium">Current Time (IST):</span>
                                    <div className="text-right">
                                        <span className="text-blue-600 font-mono block">
                                            {comprehensiveBookingData?.currentISTTime || new Date().toLocaleTimeString('en-IN', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                                timeZone: 'Asia/Kolkata'
                                            })}
                                        </span>
                                        <span className="text-blue-500 text-xs">
                                            {comprehensiveBookingData?.currentISTDate || formatDate(new Date())}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-blue-600 text-center">
                                    🌏 IST (UTC+5:30)
                                </div>
                            </div>

                            {/* Current Booking Information */}
                            {comprehensiveBookingData?.currentBooking ? (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <h4 className="font-semibold text-red-800 mb-3">🔴 Currently Active Booking</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {comprehensiveBookingData.currentBooking.user.fullName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {comprehensiveBookingData.currentBooking.user.email}
                                                </p>
                                            </div>
                                            <span className={getStatusBadge(comprehensiveBookingData.currentBooking.bookingStatus, comprehensiveBookingData.currentBooking.status)}>
                                                {getStatusText(comprehensiveBookingData.currentBooking.bookingStatus, comprehensiveBookingData.currentBooking.status)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Date & Time (IST)</p>
                                            <p className="font-medium">{comprehensiveBookingData.currentBooking.formattedDate || formatDate(comprehensiveBookingData.currentBooking.bookingDate)}</p>
                                            <p className="text-sm text-gray-500">
                                                {comprehensiveBookingData.currentBooking.formattedStartTime || formatTime(comprehensiveBookingData.currentBooking.startTime)} - {comprehensiveBookingData.currentBooking.formattedEndTime || formatTime(comprehensiveBookingData.currentBooking.endTime)}
                                            </p>
                                            {comprehensiveBookingData.currentBooking.bookingNotes && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    📝 {comprehensiveBookingData.currentBooking.bookingNotes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <h4 className="font-semibold text-red-800 mb-2">Current Booking</h4>
                                    <div className="text-sm text-red-700 space-y-1">
                                        <p><strong>Booked by:</strong> {selectedBooking.booking.user.fullName}</p>
                                        {selectedBooking.booking.user.email && (
                                            <p><strong>Email:</strong> {selectedBooking.booking.user.email}</p>
                                        )}
                                        <p><strong>Date:</strong> {formatDate(selectedBooking.booking.bookingDate)}</p>
                                        <p><strong>Time (IST):</strong> {selectedBooking.booking.startTime} - {selectedBooking.booking.endTime}</p>
                                        <p><strong>Status:</strong> <span className="capitalize">{selectedBooking.booking.status}</span></p>
                                        {selectedBooking.booking.checkedIn && (
                                            <p className="text-green-600"><strong>✓ Checked In</strong></p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Complete Daily Schedule */}
                            {comprehensiveBookingData?.allTodaysBookings && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                        📅 Today's Complete Booking Schedule ({comprehensiveBookingData.allTodaysBookings.length} bookings)
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        All times shown in Indian Standard Time (IST)
                                    </p>

                                    {comprehensiveBookingData.allTodaysBookings.length > 0 ? (
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                            {comprehensiveBookingData.allTodaysBookings.map((booking, index) => (
                                                <div
                                                    key={booking._id}
                                                    className={`border rounded-lg p-4 ${
                                                        booking.bookingStatus === 'active'
                                                            ? 'border-green-300 bg-green-50'
                                                            : booking.bookingStatus === 'future'
                                                            ? 'border-blue-300 bg-blue-50'
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
                                                        {booking.checkedIn && (
                                                            <div className="text-green-600 text-xs">
                                                                ✓ Checked In at {new Date(booking.checkedInAt).toLocaleTimeString('en-IN', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                    hour12: true,
                                                                    timeZone: 'Asia/Kolkata'
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No bookings for today</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Available Slots Information */}
                            {comprehensiveBookingData?.availableSlots && comprehensiveBookingData.availableSlots.length > 0 && (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                                    <h4 className="font-semibold text-green-800 mb-3">✅ Available Time Slots Today</h4>
                                    <div className="space-y-2">
                                        {comprehensiveBookingData.availableSlots.map((slot, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <span className="text-green-700">
                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                </span>
                                                <span className="text-green-600 text-xs">
                                                    {Math.round(slot.duration / 60 * 10) / 10}h available
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                                    <p className="text-blue-800 font-medium mb-2">💡 Want to book this seat?</p>
                                    <p className="text-blue-700 text-sm">
                                        {comprehensiveBookingData?.availableSlots && comprehensiveBookingData.availableSlots.length > 0
                                            ? 'Check the available time slots above and select a different time in the booking form.'
                                            : 'This seat is fully booked today. Try selecting a different date or another seat.'
                                        }
                                    </p>
                                    <p className="text-blue-700 text-sm mt-2">
                                        📍 All booking times are in Indian Standard Time (IST). Current time: {comprehensiveBookingData?.currentISTTime || 'Loading...'}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    {/* Check-in button for user's own booking */}
                                    {currentUser &&
                                     ((comprehensiveBookingData?.currentBooking && comprehensiveBookingData.currentBooking.user._id === currentUser._id) ||
                                      (selectedBooking.booking.user._id === currentUser._id)) &&
                                     !((comprehensiveBookingData?.currentBooking && comprehensiveBookingData.currentBooking.checkedIn) || selectedBooking.booking.checkedIn) &&
                                     ((comprehensiveBookingData?.currentBooking && comprehensiveBookingData.currentBooking.status === 'confirmed') || selectedBooking.booking.status === 'confirmed') && (
                                        <button
                                            onClick={() => handleSelfCheckIn(comprehensiveBookingData?.currentBooking?._id || selectedBooking.booking._id)}
                                            disabled={checkingIn}
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {checkingIn ? 'Checking In...' : '✓ Check In Now'}
                                        </button>
                                    )}

                                    {/* Refresh data button */}
                                    <button
                                        onClick={() => fetchComprehensiveBookingData(selectedBooking.seat)}
                                        disabled={loadingComprehensiveData}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loadingComprehensiveData ? 'Refreshing...' : '🔄 Refresh Schedule'}
                                    </button>

                                    {/* QR Code button */}
                                    {selectedBooking.seat.qrCode && (
                                        <button
                                            onClick={() => {
                                                setShowBookingModal(false);
                                                setComprehensiveBookingData(null);
                                                handleViewQRCode(selectedBooking.seat);
                                            }}
                                            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            📱 View QR Code
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowBookingModal(false);
                                            setComprehensiveBookingData(null);
                                        }}
                                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatLayout;
