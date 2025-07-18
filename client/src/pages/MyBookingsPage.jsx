import React from 'react';
import { Link } from 'react-router-dom';
import UserBookings from '../components/seat/UserBookings';

const MyBookingsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="mt-2 text-gray-600">
                            View and manage your seat bookings.
                        </p>
                    </div>
                    
                    <Link
                        to="/seat-booking"
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        Book New Seat
                    </Link>
                </div>

                <UserBookings />
            </div>
        </div>
    );
};

export default MyBookingsPage;
