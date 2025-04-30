import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { FaQrcode, FaCalendarAlt, FaClock } from 'react-icons/fa';

const QRCodeGenerator = ({ courseId, courseName }) => {
  const [session, setSession] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [expiryTime, setExpiryTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateQRCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!session || !sessionDate) {
        throw new Error('Session name and date are required');
      }

      const response = await axios.post(
        '/api/v1/attendance/generate-qr',
        {
          courseId,
          session,
          sessionDate,
          expiryMinutes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setQrCodeData(response.data.data.qrCodeData);
      setExpiryTime(new Date(response.data.data.expiryTime));
      setSuccess('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // Format the expiry time
  const formatExpiryTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString();
  };

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!expiryTime) return '';
    
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMins}m ${diffSecs}s`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <FaQrcode className="text-[#00bcd4]" />
          Generate Attendance QR Code
        </h3>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={generateQRCode} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="session">
              Session Name *
            </label>
            <input
              type="text"
              id="session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="e.g. Module 1: Introduction"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sessionDate">
              Session Date *
            </label>
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <input
                type="date"
                id="sessionDate"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiryMinutes">
              QR Code Validity (minutes)
            </label>
            <div className="flex items-center">
              <FaClock className="text-gray-500 mr-2" />
              <input
                type="number"
                id="expiryMinutes"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 30)}
                min="5"
                max="120"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The QR code will be valid for this many minutes after generation.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors disabled:bg-gray-300"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </form>

        {qrCodeData && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center">
              <h4 className="font-medium text-gray-800 mb-4">Attendance QR Code for {courseName}</h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <QRCode value={qrCodeData} size={200} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Session: <span className="font-medium">{session}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Date: <span className="font-medium">{new Date(sessionDate).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Expires at: <span className="font-medium">{formatExpiryTime(expiryTime)}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Time remaining: <span className="font-medium">{getRemainingTime()}</span>
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 text-center">
                  Ask students to scan this QR code to mark their attendance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
