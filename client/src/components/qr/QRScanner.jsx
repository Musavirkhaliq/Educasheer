import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import customFetch from '../../utils/customFetch';

const QRScanner = ({ onScanResult, onClose }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanner, setScanner] = useState(null);

    useEffect(() => {
        if (isScanning) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isScanning]);

    const startScanner = () => {
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 2,
            },
            false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        setScanner(html5QrcodeScanner);
    };

    const stopScanner = () => {
        if (scanner) {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner:", error);
            });
            setScanner(null);
        }
    };

    const onScanSuccess = async (decodedText, decodedResult) => {
        console.log(`QR Code scanned: ${decodedText}`);

        try {
            // Stop scanning
            setIsScanning(false);

            // Always process through backend to check seat status
            const response = await customFetch('/seats/qr-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qrData: decodedText
                })
            });

            if (response.data.success) {
                const data = response.data.data;

                // If seat is booked, show booking details
                if (data.isBooked && data.currentBooking) {
                    onScanResult(data);
                    toast.success('Seat is currently booked - showing details');
                } else {
                    // If seat is available, redirect to booking page
                    toast.success('Redirecting to booking page...');
                    window.location.href = data.redirectUrl;
                }
            } else {
                toast.error('Failed to process QR code');
                setIsScanning(true); // Resume scanning
            }
        } catch (error) {
            console.error('Error processing QR code:', error);
            toast.error(error.response?.data?.message || 'Failed to process QR code');
            setIsScanning(true); // Resume scanning
        }
    };

    const onScanFailure = (error) => {
        // Handle scan failure silently - this is called frequently
        console.debug("QR scan error:", error);
    };

    const handleStartScanning = () => {
        setIsScanning(true);
    };

    const handleStopScanning = () => {
        setIsScanning(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Scan QR Code</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="text-center">
                    {!isScanning ? (
                        <div className="space-y-4">
                            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                                <div className="text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M4 7V4a1 1 0 011-1h3M4 17v3a1 1 0 001 1h3m10-18h3a1 1 0 011 1v3m0 10v3a1 1 0 01-1 1h-3" />
                                    </svg>
                                    <p className="text-sm">Click to start scanning</p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartScanning}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Start QR Scanner
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div id="qr-reader" className="w-full"></div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleStopScanning}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Stop Scanning
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">
                                Position the QR code within the frame to scan
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Point your camera at the seat's QR code</li>
                        <li>• Make sure the QR code is clearly visible</li>
                        <li>• Hold steady until the code is scanned</li>
                        <li>• If seat is available, you can proceed to book</li>
                        <li>• If seat is booked, you'll see booking details</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
