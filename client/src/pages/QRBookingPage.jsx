import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRScanner from '../components/qr/QRScanner';
import QRScanResult from '../components/qr/QRScanResult';

const QRBookingPage = () => {
    const navigate = useNavigate();
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    const handleScanResult = (result) => {
        setScanResult(result);
        setShowScanner(false);
    };

    const handleCloseScanner = () => {
        setShowScanner(false);
    };

    const handleCloseResult = () => {
        setScanResult(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">QR Code Booking</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Scan the QR code on any seat to quickly book it or view current booking details. 
                        This is the fastest way to reserve your preferred seat!
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-8">
                        {/* QR Scanner Section */}
                        <div className="text-center mb-8">
                            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M4 7V4a1 1 0 011-1h3M4 17v3a1 1 0 001 1h3m10-18h3a1 1 0 011 1v3m0 10v3a1 1 0 01-1 1h-3" />
                                </svg>
                            </div>
                            
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Scan Seat QR Code
                            </h2>
                            
                            <p className="text-gray-600 mb-6">
                                Scan the QR code on any seat to go directly to the booking page for that seat
                            </p>
                            
                            <button
                                onClick={() => setShowScanner(true)}
                                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                Start QR Scanner
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue-600 font-bold text-lg">1</span>
                                    </div>
                                    <h4 className="font-medium text-gray-800 mb-2">Find a Seat</h4>
                                    <p className="text-sm text-gray-600">
                                        Locate a seat with a QR code displayed on or near it
                                    </p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue-600 font-bold text-lg">2</span>
                                    </div>
                                    <h4 className="font-medium text-gray-800 mb-2">Scan QR Code</h4>
                                    <p className="text-sm text-gray-600">
                                        Use the scanner above to scan the seat's QR code
                                    </p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue-600 font-bold text-lg">3</span>
                                    </div>
                                    <h4 className="font-medium text-gray-800 mb-2">Book Instantly</h4>
                                    <p className="text-sm text-gray-600">
                                        Get redirected directly to the booking page with the seat pre-selected
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Alternative Options */}
                        <div className="border-t border-gray-200 pt-8 mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Other booking options:</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/seat-booking"
                                    className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg text-center hover:bg-gray-200 transition-colors"
                                >
                                    Browse Centers & Seats
                                </Link>
                                <Link
                                    to="/my-bookings"
                                    className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg text-center hover:bg-gray-200 transition-colors"
                                >
                                    View My Bookings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Quick & Easy</h3>
                        </div>
                        <p className="text-gray-600">
                            No need to browse through centers and seats. Just scan and book in seconds!
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Real-time Status</h3>
                        </div>
                        <p className="text-gray-600">
                            See if a seat is available or view current booking details instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRScanner
                    onScanResult={handleScanResult}
                    onClose={handleCloseScanner}
                />
            )}

            {/* Scan Result Modal - for booked seats */}
            {scanResult && (
                <QRScanResult
                    scanData={scanResult}
                    onClose={handleCloseResult}
                />
            )}
        </div>
    );
};

export default QRBookingPage;
