import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { seatAPI } from '../../services/seatAPI';

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cancellingBooking, setCancellingBooking] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [checkingInBooking, setCheckingInBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [currentPage, filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const status = filter === 'all' ? null : filter;
            const upcoming = filter === 'upcoming';
            
            const response = await seatAPI.getUserBookings(currentPage, 10, status, upcoming);
            setBookings(response.data.data.bookings || []);
            setTotalPages(response.data.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setCancellingBooking(bookingId);
        try {
            await seatAPI.cancelBooking(bookingId, cancellationReason);
            toast.success('Booking cancelled successfully');
            setCancellationReason('');
            fetchBookings(); // Refresh the list
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingBooking(null);
        }
    };

    const handleCheckIn = async (bookingId) => {
        setCheckingInBooking(bookingId);
        try {
            await seatAPI.selfCheckIn(bookingId);
            toast.success('Successfully checked in!');
            fetchBookings(); // Refresh the list to show updated status
        } catch (error) {
            console.error('Error checking in:', error);
            toast.error(error.response?.data?.message || 'Failed to check in');
        } finally {
            setCheckingInBooking(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            no_show: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const canCancelBooking = (booking) => {
        if (booking.status !== 'confirmed') return false;
        
        const bookingDateTime = new Date(booking.bookingDate);
        const [hours, minutes] = booking.startTime.split(':').map(Number);
        bookingDateTime.setHours(hours, minutes);
        
        return bookingDateTime > new Date();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="user-bookings">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
                    
                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Bookings</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No bookings found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {booking.seat?.center?.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {booking.seat?.center?.location}
                                        </p>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Seat</p>
                                        <p className="font-medium">{booking.seat?.seatNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                                        <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                                        <p className="font-medium">
                                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                                        <p className="font-medium">{booking.durationHours}h</p>
                                    </div>
                                </div>

                                {booking.totalAmount > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                                        <p className="font-medium text-green-600">₹{booking.totalAmount}</p>
                                    </div>
                                )}

                                {booking.bookingNotes && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p>
                                        <p className="text-sm text-gray-700">{booking.bookingNotes}</p>
                                    </div>
                                )}

                                {booking.status === 'cancelled' && booking.cancellationReason && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Cancellation Reason</p>
                                        <p className="text-sm text-red-600">{booking.cancellationReason}</p>
                                    </div>
                                )}

                                {/* Check-in/Check-out status */}
                                {booking.status === 'confirmed' && (
                                    <div className="flex gap-4 text-sm">
                                        <span className={`${booking.checkedIn ? 'text-green-600' : 'text-gray-500'}`}>
                                            Check-in: {booking.checkedIn ? '✓' : '✗'}
                                        </span>
                                        <span className={`${booking.checkedOut ? 'text-green-600' : 'text-gray-500'}`}>
                                            Check-out: {booking.checkedOut ? '✓' : '✗'}
                                        </span>
                                    </div>
                                )}

                                {/* Check-in button */}
                                {booking.status === 'confirmed' &&
                                 !booking.checkedIn &&
                                 new Date(booking.bookingDate).toDateString() === new Date().toDateString() && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleCheckIn(booking._id)}
                                            disabled={checkingInBooking === booking._id}
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {checkingInBooking === booking._id ? 'Checking In...' : 'Check In Now'}
                                        </button>
                                    </div>
                                )}

                                {/* Cancel button */}
                                {canCancelBooking(booking) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        {cancellingBooking === booking._id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={cancellationReason}
                                                    onChange={(e) => setCancellationReason(e.target.value)}
                                                    placeholder="Please provide a reason for cancellation..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                                    >
                                                        Confirm Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCancellingBooking(null);
                                                            setCancellationReason('');
                                                        }}
                                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setCancellingBooking(booking._id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-2 text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserBookings;
