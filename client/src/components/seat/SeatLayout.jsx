import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { seatAPI } from '../../services/seatAPI';

const SeatLayout = ({
    seats = [],
    availableSeats = [],
    seatBookings = {},
    selectedSeat,
    onSeatSelect,
    showAvailabilityOnly = false
}) => {
    const { currentUser } = useAuth();
    const [seatGrid, setSeatGrid] = useState({});
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedSeatQR, setSelectedSeatQR] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);

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
            // Show booking details instead of error
            const booking = seatBookings[seat._id];
            if (booking) {
                setSelectedBooking({ seat, booking });
                setShowBookingModal(true);
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Seat Already Booked</h3>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Seat Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2">Seat Details</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Seat Number:</strong> {selectedBooking.seat.seatNumber}</p>
                                    <p><strong>Row:</strong> {selectedBooking.seat.row}</p>
                                    <p><strong>Type:</strong> {selectedBooking.seat.seatType}</p>
                                </div>
                            </div>

                            {/* Booking Information */}
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                <h4 className="font-semibold text-red-800 mb-2">Current Booking</h4>
                                <div className="text-sm text-red-700 space-y-1">
                                    <p><strong>Booked by:</strong> {selectedBooking.booking.user.fullName}</p>
                                    {selectedBooking.booking.user.email && (
                                        <p><strong>Email:</strong> {selectedBooking.booking.user.email}</p>
                                    )}
                                    <p><strong>Date:</strong> {new Date(selectedBooking.booking.bookingDate).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {selectedBooking.booking.startTime} - {selectedBooking.booking.endTime}</p>
                                    <p><strong>Status:</strong> <span className="capitalize">{selectedBooking.booking.status}</span></p>
                                    {selectedBooking.booking.checkedIn && (
                                        <p className="text-green-600"><strong>✓ Checked In</strong></p>
                                    )}
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-gray-600 mb-4">This seat is not available for the selected time slot.</p>

                                {/* Check-in button for user's own booking */}
                                {currentUser &&
                                 selectedBooking.booking.user._id === currentUser._id &&
                                 !selectedBooking.booking.checkedIn &&
                                 selectedBooking.booking.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleSelfCheckIn(selectedBooking.booking._id)}
                                        disabled={checkingIn}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
                                    >
                                        {checkingIn ? 'Checking In...' : 'Check In Now'}
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatLayout;
