import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaTrash, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import customFetch from '../utils/customFetch';
import { useAuth } from '../context/AuthContext';

const AdminBookingManagementPage = () => {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        centerId: '',
        date: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBookings: 0
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');

    useEffect(() => {
        if (currentUser?.role === 'admin') {
            fetchCenters();
            fetchBookings();
        }
    }, [currentUser, filters, pagination.currentPage]);

    const fetchCenters = async () => {
        try {
            const response = await customFetch('/centers?limit=100');
            setCenters(response.data.data.centers || []);
        } catch (error) {
            console.error('Error fetching centers:', error);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pagination.currentPage,
                limit: 20,
                ...filters
            });

            // Remove empty filters
            Object.keys(filters).forEach(key => {
                if (!filters[key] || filters[key] === 'all') {
                    queryParams.delete(key);
                }
            });

            const response = await customFetch(`/seats/admin/bookings?${queryParams}`);
            setBookings(response.data.data.bookings || []);
            setPagination(response.data.data.pagination || {});
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBooking = async () => {
        if (!bookingToDelete) return;

        setDeleting(bookingToDelete._id);
        try {
            await customFetch(`/seats/admin/bookings/${bookingToDelete._id}`, {
                method: 'DELETE',
                body: JSON.stringify({ deleteReason })
            });

            toast.success('Booking deleted successfully');
            setBookings(bookings.filter(b => b._id !== bookingToDelete._id));
            setShowDeleteModal(false);
            setBookingToDelete(null);
            setDeleteReason('');
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.error('Failed to delete booking');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}:00`).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            confirmed: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return `px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`;
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
                    <p className="mt-2 text-gray-600">Manage all seat bookings across centers</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaSearch className="inline mr-2" />
                                Search User
                            </label>
                            <input
                                type="text"
                                placeholder="Name or email..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaFilter className="inline mr-2" />
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Center Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaMapMarkerAlt className="inline mr-2" />
                                Center
                            </label>
                            <select
                                value={filters.centerId}
                                onChange={(e) => setFilters({...filters, centerId: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Centers</option>
                                {centers.map(center => (
                                    <option key={center._id} value={center._id}>
                                        {center.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaCalendarAlt className="inline mr-2" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters({...filters, date: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <button
                            onClick={() => setFilters({ status: 'all', centerId: '', date: '', search: '' })}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                        <div className="text-sm text-gray-600">
                            Total: {pagination.totalBookings} bookings
                        </div>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading bookings...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600">No bookings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Seat & Center
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time (IST)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.user.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Seat {booking.seat.seatNumber}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.seat.center.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatDate(booking.bookingDate)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(booking.status)}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setBookingToDelete(booking);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    disabled={deleting === booking._id}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                                disabled={!pagination.hasPrevPage}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                                disabled={!pagination.hasNextPage}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && bookingToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Booking
                        </h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Are you sure you want to delete this booking?
                            </p>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                <p><strong>User:</strong> {bookingToDelete.user.fullName}</p>
                                <p><strong>Seat:</strong> {bookingToDelete.seat.seatNumber}</p>
                                <p><strong>Date:</strong> {formatDate(bookingToDelete.bookingDate)}</p>
                                <p><strong>Time:</strong> {formatTime(bookingToDelete.startTime)} - {formatTime(bookingToDelete.endTime)}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for deletion (optional)
                            </label>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Enter reason for deleting this booking..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setBookingToDelete(null);
                                    setDeleteReason('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteBooking}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookingManagementPage;
