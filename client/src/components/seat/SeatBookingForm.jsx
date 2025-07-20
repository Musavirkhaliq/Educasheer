import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { seatAPI } from '../../services/seatAPI';
import SeatLayout from './SeatLayout';
import { useAuth } from '../../context/AuthContext';

const SeatBookingForm = ({ center, onBookingSuccess, preSelectedSeatId }) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [seats, setSeats] = useState([]);
    const [availableSeats, setAvailableSeats] = useState([]);
    const [seatBookings, setSeatBookings] = useState({});
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    useEffect(() => {
        if (center) {
            fetchSeats();
        }
    }, [center]);

    useEffect(() => {
        if (bookingDate && startTime && endTime && center) {
            fetchAvailableSeats();
        }
    }, [bookingDate, startTime, endTime, center]);

    // Handle pre-selected seat from QR code
    useEffect(() => {
        if (preSelectedSeatId && seats.length > 0) {
            const preSelectedSeat = seats.find(seat => seat._id === preSelectedSeatId);
            if (preSelectedSeat) {
                setSelectedSeat(preSelectedSeat);
                toast.success(`Seat ${preSelectedSeat.seatNumber} selected from QR code! Choose your preferred date and time to see availability.`);

                // Only set default date, let user choose their preferred time
                if (!bookingDate) {
                    setBookingDate(getTodayDate());
                }
                // Don't pre-fill time - let user choose their preferred time slots
                // This allows them to see comprehensive booking information for different times
            }
        }
    }, [preSelectedSeatId, seats]);

    // Auto-fetch availability when user selects date and time (including QR code scenarios)
    // This will show comprehensive booking information when user chooses their preferred time
    useEffect(() => {
        if (bookingDate && startTime && endTime && center) {
            fetchAvailableSeats();
        }
    }, [bookingDate, startTime, endTime, center]);



    const fetchSeats = async () => {
        try {
            console.log('Fetching seats for center:', center._id);
            const response = await seatAPI.getCenterSeats(center._id);
            console.log('Seats response:', response.data);
            setSeats(response.data.data || []);
        } catch (error) {
            console.error('Error fetching seats:', error);
            toast.error('Failed to fetch seats');
        }
    };

    const fetchAvailableSeats = async () => {
        if (!bookingDate || !startTime || !endTime || !center) {
            console.log('Missing required data for availability check:', { bookingDate, startTime, endTime, center: !!center });
            return;
        }

        console.log('Fetching seat availability with:', {
            centerId: center._id,
            bookingDate,
            startTime,
            endTime
        });

        setLoadingAvailability(true);
        try {
            // First, fetch available seats (this is the critical one)
            const availabilityResponse = await seatAPI.getAvailableSeatsSimple(
                center._id,
                bookingDate,
                startTime,
                endTime
            );

            setAvailableSeats(availabilityResponse.data.data.availableSeats || []);

            // Then try to fetch booking details (optional, for enhanced UX)
            try {
                const bookingDetailsResponse = await seatAPI.getSeatBookingDetails(
                    center._id,
                    bookingDate,
                    startTime,
                    endTime
                );
                setSeatBookings(bookingDetailsResponse.data.data.bookings || {});
            } catch (bookingError) {
                console.warn('Could not fetch booking details (feature may not be available):', bookingError);
                setSeatBookings({});
            }

            // Reset selected seat if it's no longer available
            // Only show warning if the seat was previously available but now isn't
            if (selectedSeat && !availabilityResponse.data.data.availableSeats.some(seat => seat._id === selectedSeat._id)) {
                // Check if this seat was previously available (to avoid warning for intentionally selected booked seats)
                const wasPreviouslyAvailable = availableSeats.some(seat => seat._id === selectedSeat._id);

                setSelectedSeat(null);

                // Only show warning if the seat was available before but isn't now (someone else booked it)
                if (wasPreviouslyAvailable) {
                    toast('Selected seat is no longer available for the chosen time', {
                        icon: '⚠️',
                        style: {
                            background: '#FEF3C7',
                            color: '#92400E',
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching seat availability:', error);
            // Fall back to showing all seats as available
            setAvailableSeats(seats);
            setSeatBookings({});

            // Show a more user-friendly error message
            if (error.response?.status === 404) {
                toast.error('Center not found. Please try again.');
            } else if (error.response?.status === 400) {
                toast.error('Invalid booking parameters. Please check your date and time.');
            } else {
                // Check if this is from a QR scan redirect
                const urlParams = new URLSearchParams(window.location.search);
                const isFromQRScan = urlParams.has('seatId');

                if (isFromQRScan) {
                    // More helpful and less alarming message for QR scan scenarios
                    toast('Could not verify current seat availability. You can still proceed with booking. Check the seat schedule in the QR scan details for more information.', {
                        icon: '⚠️',
                        style: {
                            background: '#FEF3C7',
                            color: '#92400E',
                        },
                        duration: 6000,
                    });
                } else {
                    toast.error('Unable to check seat availability. All seats are shown as available.');
                }
            }
        } finally {
            setLoadingAvailability(false);
        }
    };



    const calculateDuration = () => {
        if (!startTime || !endTime) return 0;
        
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        
        return Math.max(0, (end - start) / (1000 * 60)); // Duration in minutes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Please log in to book a seat');
            return;
        }

        if (!selectedSeat || !bookingDate || !startTime || !endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        const duration = calculateDuration();
        if (duration <= 0) {
            toast.error('End time must be after start time');
            return;
        }

        // Default maximum duration (8 hours)
        const maxDuration = 480;
        if (duration > maxDuration) {
            toast.error(`Booking duration cannot exceed ${maxDuration} minutes (8 hours)`);
            return;
        }

        setLoading(true);
        try {
            const bookingData = {
                seatId: selectedSeat._id,
                bookingDate,
                startTime,
                endTime,
                bookingNotes
            };

            const response = await seatAPI.createBooking(bookingData);
            toast.success('Seat booked successfully!');
            
            if (onBookingSuccess) {
                onBookingSuccess(response.data);
            }
            
            // Reset form
            setSelectedSeat(null);
            setBookingNotes('');
            
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error(error.response?.data?.message || 'Failed to book seat');
        } finally {
            setLoading(false);
        }
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login prompt if user is not authenticated
    if (!currentUser) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Login Required</h3>
                    <p className="text-gray-600 mb-4">Please log in to book a seat</p>
                    <a
                        href="/login"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="seat-booking-form">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {preSelectedSeatId ? '📱 QR Code Booking - Choose Your Time' : 'Book a Seat'}
                </h2>

                {/* QR Code Booking Notice */}
                {preSelectedSeatId && selectedSeat && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    Seat Selected via QR Code
                                </h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>✅ Perfect! You've selected Seat {selectedSeat.seatNumber} via QR code.</p>
                                    <p className="mt-1">📅 <strong>Next:</strong> Choose your date and time below to see comprehensive booking information and available slots.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Center Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800">{center.name}</h3>
                        <p className="text-gray-600">{center.location}</p>
                    </div>

                    {/* Selected Seat Details - Always show when seat is selected */}
                    {selectedSeat && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h4 className="text-lg font-semibold text-blue-800 mb-2">
                                        Selected Seat: {selectedSeat.seatNumber}
                                        {preSelectedSeatId && <span className="text-sm font-normal text-blue-600 ml-2">(via QR Code)</span>}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-blue-700">Row:</span>
                                            <span className="ml-1 text-blue-600">{selectedSeat.row}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-blue-700">Type:</span>
                                            <span className="ml-1 text-blue-600 capitalize">{selectedSeat.seatType}</span>
                                        </div>
                                        {selectedSeat.facilities && selectedSeat.facilities.length > 0 && (
                                            <div className="col-span-2">
                                                <span className="font-medium text-blue-700">Facilities:</span>
                                                <span className="ml-1 text-blue-600">{selectedSeat.facilities.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                    {selectedSeat.notes && (
                                        <div className="mt-2 text-sm">
                                            <span className="font-medium text-blue-700">Notes:</span>
                                            <span className="ml-1 text-blue-600">{selectedSeat.notes}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedSeat(null);
                                            if (preSelectedSeatId) {
                                                // Remove the seatId from URL when changing from QR selection
                                                const url = new URL(window.location);
                                                url.searchParams.delete('seatId');
                                                window.history.replaceState({}, '', url);
                                            }
                                        }}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {preSelectedSeatId ? 'Choose a different seat' : 'Change seat'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Information */}
                    {currentUser && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Booking for:</h4>
                            <div className="text-sm text-green-700">
                                <p><strong>Name:</strong> {currentUser.fullName}</p>
                                <p><strong>Email:</strong> {currentUser.email}</p>
                                {currentUser.username && <p><strong>Username:</strong> {currentUser.username}</p>}
                            </div>
                        </div>
                    )}

                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Booking Date *
                        </label>
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={getTodayDate()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>



                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time *
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Duration Display */}
                    {startTime && endTime && (
                        <div className="text-sm text-gray-600">
                            Duration: {Math.floor(calculateDuration() / 60)}h {calculateDuration() % 60}m
                        </div>
                    )}

                    {/* Seat Layout - Always show, even when seat is pre-selected from QR code */}
                    {bookingDate && startTime && endTime && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Seat *
                            </label>
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                                <p className="text-blue-800 text-sm">
                                    {preSelectedSeatId ? (
                                        <>
                                            📱 <strong>QR Code Seat Selected:</strong> Your scanned seat is highlighted.
                                            Click on any seat (including booked ones) to see comprehensive booking information and available time slots.
                                        </>
                                    ) : (
                                        <>
                                            💡 <strong>Tip:</strong> Green seats are available for your selected time.
                                            Click on red (booked) seats to see their booking details and find alternative time slots.
                                        </>
                                    )}
                                </p>
                            </div>
                            {loadingAvailability ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Checking availability...</p>
                                </div>
                            ) : (
                                <SeatLayout
                                    seats={seats}
                                    availableSeats={availableSeats}
                                    seatBookings={seatBookings}
                                    selectedSeat={selectedSeat}
                                    onSeatSelect={setSelectedSeat}
                                    showAvailabilityOnly={true}
                                />
                            )}
                        </div>
                    )}



                    {/* Booking Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any special requirements or notes..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !selectedSeat}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Booking...' : 'Book Seat'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SeatBookingForm;
