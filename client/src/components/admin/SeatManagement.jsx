import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import customFetch from '../../utils/customFetch';
import { seatAPI } from '../../services/seatAPI';

const SeatManagement = () => {
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [seats, setSeats] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('seats');
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedSeatForQR, setSelectedSeatForQR] = useState(null);

    // Form states
    const [showSeatForm, setShowSeatForm] = useState(false);
    const [seatFormData, setSeatFormData] = useState({
        rows: [
            { rowLabel: 'A', seatsCount: 5 },
            { rowLabel: 'B', seatsCount: 5 },
            { rowLabel: 'C', seatsCount: 5 }
        ],
        seatType: 'regular'
    });

    useEffect(() => {
        fetchCenters();
    }, []);

    useEffect(() => {
        if (selectedCenter) {
            fetchCenterData();
        }
    }, [selectedCenter]);

    const fetchCenters = async () => {
        try {
            const response = await customFetch('/centers?limit=100');
            setCenters(response.data.data.centers || []);
        } catch (error) {
            console.error('Error fetching centers:', error);
            toast.error('Failed to fetch centers');
        } finally {
            setLoading(false);
        }
    };

    const fetchCenterData = async () => {
        if (!selectedCenter) return;

        try {
            const [seatsResponse, bookingsResponse] = await Promise.all([
                seatAPI.getCenterSeats(selectedCenter._id, true),
                seatAPI.getCenterBookings(selectedCenter._id, 1, 50)
            ]);

            setSeats(seatsResponse.data.data || []);
            setBookings(bookingsResponse.data.data.bookings || []);
        } catch (error) {
            console.error('Error fetching center data:', error);
            toast.error('Failed to fetch center data');
        }
    };

    const handleCreateSeats = async (e) => {
        e.preventDefault();

        const seats = [];
        let seatNumber = 1;

        for (const rowData of seatFormData.rows) {
            for (let c = 1; c <= rowData.seatsCount; c++) {
                seats.push({
                    row: rowData.rowLabel,
                    column: c,
                    seatNumber: seatNumber.toString(),
                    seatType: seatFormData.seatType
                });
                seatNumber++;
            }
        }

        try {
            console.log('Creating seats:', { centerId: selectedCenter._id, seats });
            await seatAPI.createSeats(selectedCenter._id, seats);
            toast.success('Seats created successfully');
            setShowSeatForm(false);
            fetchCenterData();
        } catch (error) {
            console.error('Error creating seats:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to create seats');
        }
    };



    const handleCheckIn = async (bookingId) => {
        try {
            await seatAPI.checkInUser(bookingId);
            toast.success('User checked in successfully');
            fetchCenterData();
        } catch (error) {
            console.error('Error checking in user:', error);
            toast.error(error.response?.data?.message || 'Failed to check in user');
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            await seatAPI.checkOutUser(bookingId);
            toast.success('User checked out successfully');
            fetchCenterData();
        } catch (error) {
            console.error('Error checking out user:', error);
            toast.error(error.response?.data?.message || 'Failed to check out user');
        }
    };

    const handleViewQRCode = (seat) => {
        setSelectedSeatForQR(seat);
        setShowQRModal(true);
    };

    const handlePrintQRCode = (seat) => {
        if (seat.qrCode) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - Seat ${seat.seatNumber}</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                padding: 20px;
                            }
                            .qr-container {
                                border: 2px solid #000;
                                padding: 20px;
                                display: inline-block;
                                margin: 20px;
                            }
                            .seat-info {
                                margin-bottom: 15px;
                                font-size: 18px;
                                font-weight: bold;
                            }
                            .center-info {
                                margin-bottom: 10px;
                                font-size: 14px;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="qr-container">
                            <div class="center-info">${selectedCenter?.name || 'Center'}</div>
                            <div class="seat-info">Seat ${seat.seatNumber}</div>
                            <div class="seat-info">Row ${seat.row} • ${seat.seatType}</div>
                            <img src="${seat.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
                            <div style="margin-top: 10px; font-size: 12px; color: #888;">
                                Scan to book or view details
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        } else {
            toast.error('QR code not available for this seat');
        }
    };

    const handleRegenerateQRCodes = async () => {
        if (!selectedCenter) {
            toast.error('Please select a center first');
            return;
        }

        try {
            const response = await customFetch(`/seats/centers/${selectedCenter._id}/seats/regenerate-qr`, {
                method: 'POST'
            });

            if (response.data.success) {
                toast.success(`QR codes regenerated for ${response.data.data.updatedSeats} seats`);
                fetchCenterData(); // Refresh the seat data
            } else {
                toast.error('Failed to regenerate QR codes');
            }
        } catch (error) {
            console.error('Error regenerating QR codes:', error);
            toast.error(error.response?.data?.message || 'Failed to regenerate QR codes');
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="seat-management p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Seat Management</h1>
                    <Link
                        to="/admin/bookings"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        📋 Manage All Bookings
                    </Link>
                </div>
                
                {/* Center Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Center
                    </label>
                    <select
                        value={selectedCenter?._id || ''}
                        onChange={(e) => {
                            const center = centers.find(c => c._id === e.target.value);
                            setSelectedCenter(center);
                        }}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a center</option>
                        {centers.map(center => (
                            <option key={center._id} value={center._id}>
                                {center.name} - {center.location}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedCenter && (
                <div>
                    {/* Center Info */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {selectedCenter.name}
                        </h2>
                        <p className="text-gray-600">{selectedCenter.location}</p>
                        <div className="mt-2 text-sm text-gray-600">
                            <span>Capacity: {selectedCenter.capacity}</span>
                            <span className="ml-4">Total Seats: {seats.length}</span>
                            <span className="ml-4">Active Bookings: {bookings.filter(b => b.status === 'confirmed').length}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {['seats', 'bookings'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === tab
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab === 'seats' && 'Seats'}
                                        {tab === 'bookings' && 'Bookings'}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'seats' && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Seats ({seats.length})</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleRegenerateQRCodes}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                                        disabled={!selectedCenter || seats.length === 0}
                                        title="Generate QR codes with direct booking URLs"
                                    >
                                        Regenerate QR Codes
                                    </button>
                                    <button
                                        onClick={() => setShowSeatForm(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Add Seats
                                    </button>
                                </div>
                            </div>

                            {/* Seat Grid Display */}
                            {seats.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-md font-medium text-gray-700">Seats Overview</h4>
                                        <div className="text-sm text-gray-500">
                                            Total: {seats.length} seats
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {seats.map(seat => (
                                            <div
                                                key={seat._id}
                                                className={`p-3 rounded-lg border-2 ${
                                                    seat.isActive
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className={`text-sm font-semibold ${
                                                        seat.isActive ? 'text-green-800' : 'text-gray-500'
                                                    }`}>
                                                        Seat {seat.seatNumber}
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs ${
                                                        seat.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {seat.seatType}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-3">
                                                    Row {seat.row} • Column {seat.column}
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleViewQRCode(seat)}
                                                        className="flex-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                                                        title="View QR Code"
                                                    >
                                                        QR
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrintQRCode(seat)}
                                                        className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                                                        title="Print QR Code"
                                                    >
                                                        Print
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No seats created yet</p>
                            )}

                            {/* Seat Creation Form */}
                            {showSeatForm && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <h3 className="text-lg font-semibold mb-4">Create Seats</h3>
                                        <form onSubmit={handleCreateSeats}>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Configure Rows and Seats
                                                    </label>
                                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                                        {seatFormData.rows.map((row, index) => (
                                                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                                                                <div className="flex-shrink-0">
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Row
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={row.rowLabel}
                                                                        onChange={(e) => {
                                                                            const newRows = [...seatFormData.rows];
                                                                            newRows[index].rowLabel = e.target.value.toUpperCase();
                                                                            setSeatFormData({
                                                                                ...seatFormData,
                                                                                rows: newRows
                                                                            });
                                                                        }}
                                                                        className="w-12 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        maxLength="2"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Seats in this row
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max="20"
                                                                        value={row.seatsCount}
                                                                        onChange={(e) => {
                                                                            const newRows = [...seatFormData.rows];
                                                                            newRows[index].seatsCount = parseInt(e.target.value) || 1;
                                                                            setSeatFormData({
                                                                                ...seatFormData,
                                                                                rows: newRows
                                                                            });
                                                                        }}
                                                                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        required
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (seatFormData.rows.length > 1) {
                                                                            const newRows = seatFormData.rows.filter((_, i) => i !== index);
                                                                            setSeatFormData({
                                                                                ...seatFormData,
                                                                                rows: newRows
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 disabled:text-gray-400"
                                                                    disabled={seatFormData.rows.length <= 1}
                                                                    title="Remove row"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nextRowLabel = String.fromCharCode(65 + seatFormData.rows.length); // A, B, C, etc.
                                                            setSeatFormData({
                                                                ...seatFormData,
                                                                rows: [...seatFormData.rows, { rowLabel: nextRowLabel, seatsCount: 5 }]
                                                            });
                                                        }}
                                                        className="mt-2 w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                                                    >
                                                        + Add Row
                                                    </button>
                                                </div>

                                                {/* Summary */}
                                                <div className="bg-gray-50 p-3 rounded-md">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <div>Total Rows: {seatFormData.rows.length}</div>
                                                        <div>Total Seats: {seatFormData.rows.reduce((total, row) => total + row.seatsCount, 0)}</div>
                                                        <div className="text-xs mt-2">
                                                            Seats will be numbered sequentially: 1, 2, 3, 4...
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Seat Type
                                                    </label>
                                                    <select
                                                        value={seatFormData.seatType}
                                                        onChange={(e) => setSeatFormData({
                                                            ...seatFormData,
                                                            seatType: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="regular">Regular</option>
                                                        <option value="premium">Premium</option>
                                                        <option value="vip">VIP</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSeatForm(false)}
                                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                >
                                                    Create Seats
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}



                    {activeTab === 'bookings' && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Bookings ({bookings.length})</h3>
                            
                            {bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {bookings.map(booking => (
                                        <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">
                                                        {booking.user?.fullName}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">{booking.user?.email}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
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
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                                                    <p className="font-medium text-green-600">₹{booking.totalAmount}</p>
                                                </div>
                                            </div>

                                            {booking.status === 'confirmed' && (
                                                <div className="flex gap-4 text-sm mb-3">
                                                    <span className={`${booking.checkedIn ? 'text-green-600' : 'text-gray-500'}`}>
                                                        Check-in: {booking.checkedIn ? '✓' : '✗'}
                                                    </span>
                                                    <span className={`${booking.checkedOut ? 'text-green-600' : 'text-gray-500'}`}>
                                                        Check-out: {booking.checkedOut ? '✓' : '✗'}
                                                    </span>
                                                </div>
                                            )}

                                            {booking.status === 'confirmed' && (
                                                <div className="flex gap-2">
                                                    {!booking.checkedIn && (
                                                        <button
                                                            onClick={() => handleCheckIn(booking._id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                        >
                                                            Check In
                                                        </button>
                                                    )}
                                                    {booking.checkedIn && !booking.checkedOut && (
                                                        <button
                                                            onClick={() => handleCheckOut(booking._id)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                        >
                                                            Check Out
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No bookings found</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && selectedSeatForQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">QR Code - Seat {selectedSeatForQR.seatNumber}</h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">{selectedCenter?.name}</p>
                                <p className="font-medium">Seat {selectedSeatForQR.seatNumber}</p>
                                <p className="text-sm text-gray-500">Row {selectedSeatForQR.row} • {selectedSeatForQR.seatType}</p>
                            </div>

                            {selectedSeatForQR.qrCode ? (
                                <div className="mb-4">
                                    <img
                                        src={selectedSeatForQR.qrCode}
                                        alt="QR Code"
                                        className="w-64 h-64 mx-auto border border-gray-200 rounded-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Scan this code to go directly to the booking page
                                    </p>
                                    {selectedSeatForQR.qrCodeData && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                                            <strong>URL:</strong> {selectedSeatForQR.qrCodeData}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-4 p-8 bg-gray-100 rounded-lg">
                                    <p className="text-gray-500">QR code not available</p>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handlePrintQRCode(selectedSeatForQR)}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={!selectedSeatForQR.qrCode}
                                >
                                    Print QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatManagement;
