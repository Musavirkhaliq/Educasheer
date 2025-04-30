import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { FaQrcode, FaCheck, FaTimes } from 'react-icons/fa';
import './QRCodeScanner.css';

const QRCodeScanner = ({ courseId, courseName, onSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentCamera, setCurrentCamera] = useState('environment');

  const html5QrCodeRef = useRef(null);
  const scannerDivRef = useRef(null);

  // Clean up scanner when component unmounts
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(err => {
          console.error('Error stopping scanner:', err);
        });
      }
    };
  }, []);

  const handleScan = async (decodedText) => {
    if (!scanned && !loading) {
      setLoading(true);
      setError('');

      try {
        // Stop scanning
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.stop();
        }

        // Send the QR code data to the server
        const response = await axios.post(
          '/api/v1/attendance/mark',
          { qrCodeData: decodedText },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );

        setScanned(true);
        setSuccess(`Attendance marked successfully for ${response.data.data.course}!`);
        setScanning(false);

        // Call onSuccess callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      } catch (error) {
        console.error('Error marking attendance:', error);
        setError(error.response?.data?.message || error.message || 'Failed to mark attendance');

        // Restart scanning if there was an error
        startScanner();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Error accessing camera. Please make sure you have given camera permissions.');
  };

  const toggleCamera = async () => {
    // Stop current scanner
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
    }

    // Toggle camera
    const newCamera = currentCamera === 'environment' ? 'user' : 'environment';
    setCurrentCamera(newCamera);

    // Restart scanner with new camera
    startScanner(newCamera);
  };

  const startScanner = async (cameraId = currentCamera) => {
    setError('');

    if (!scannerDivRef.current) return;

    try {
      // Create new scanner instance if it doesn't exist
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      const facingMode = cameraId === 'user' ? { exact: 'user' } : { exact: 'environment' };
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        { facingMode },
        config,
        handleScan,
        handleError
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to start camera. Please make sure you have given camera permissions.');
    }
  };

  const startScanning = () => {
    setScanning(true);
    setScanned(false);
    setError('');
    setSuccess('');

    // Start scanner in the next tick to ensure the div is rendered
    setTimeout(() => {
      startScanner();
    }, 100);
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <FaQrcode className="text-[#00bcd4]" />
          Scan Attendance QR Code
        </h3>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaCheck className="text-green-700" />
            {success}
          </div>
        )}

        <div className="text-center mb-4">
          <p className="text-gray-600">
            Scan the QR code provided by your instructor to mark your attendance for {courseName}.
          </p>
        </div>

        {scanning ? (
          <div className="mb-4">
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-lg">
              <div
                id="qr-reader"
                ref={scannerDivRef}
                className="w-full h-64"
                style={{ position: 'relative' }}
              ></div>
              <div className="absolute inset-0 border-2 border-[#00bcd4] rounded-lg pointer-events-none"></div>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={toggleCamera}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Switch Camera
              </button>
              <button
                onClick={stopScanning}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={startScanning}
              disabled={loading}
              className="bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#01427a] transition-colors disabled:bg-gray-300 flex items-center gap-2"
            >
              <FaQrcode />
              {loading ? 'Processing...' : 'Start Scanning'}
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm">
            <li>Click "Start Scanning" to open your camera</li>
            <li>Point your camera at the QR code shown by your instructor</li>
            <li>Hold steady until the code is recognized</li>
            <li>Your attendance will be marked automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
