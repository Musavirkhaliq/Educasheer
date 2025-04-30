import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarCheck, FaCalendarTimes, FaQrcode, FaClock } from 'react-icons/fa';
import QRCodeScanner from './QRCodeScanner';

const StudentAttendance = ({ courseId, courseName }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [courseId]);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(`/api/v1/attendance/student/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      setAttendanceRecords(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Calculate attendance rate
  const calculateAttendanceRate = () => {
    if (attendanceRecords.length === 0) return 0;
    
    const attendedSessions = attendanceRecords.filter(record => record.attended).length;
    return Math.round((attendedSessions / attendanceRecords.length) * 100);
  };

  const attendanceRate = calculateAttendanceRate();

  // Toggle QR code scanner
  const toggleScanner = () => {
    setShowScanner(!showScanner);
  };

  // Refresh attendance records after successful scan
  const handleSuccessfulScan = () => {
    fetchAttendanceRecords();
    setShowScanner(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bcd4]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showScanner ? (
        <QRCodeScanner 
          courseId={courseId} 
          courseName={courseName} 
          onSuccess={handleSuccessfulScan}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <FaCalendarCheck className="text-[#00bcd4]" />
              Your Attendance for {courseName}
            </h3>
          </div>

          {error && (
            <div className="p-5">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          <div className="p-5">
            {/* Attendance Summary */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800">Attendance Summary</h4>
                  <p className="text-gray-600">
                    You've attended {attendanceRecords.filter(record => record.attended).length} out of {attendanceRecords.length} sessions
                  </p>
                </div>
                
                <button
                  onClick={toggleScanner}
                  className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors flex items-center gap-2"
                >
                  <FaQrcode />
                  Scan QR Code
                </button>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-grow">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          attendanceRate >= 80 ? 'bg-green-600' : 
                          attendanceRate >= 60 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className="font-medium text-gray-700">{attendanceRate}%</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {attendanceRate >= 80 ? (
                    <span className="text-green-600">Excellent attendance!</span>
                  ) : attendanceRate >= 60 ? (
                    <span className="text-yellow-600">Good attendance, but try to attend more sessions.</span>
                  ) : (
                    <span className="text-red-600">Your attendance is low. Please try to attend more sessions.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No attendance records found for this course yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.session}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(record.sessionDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.attended ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <FaCalendarCheck className="mr-1" /> Present
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              <FaCalendarTimes className="mr-1" /> Absent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {record.checkedInAt ? (
                              <span className="flex items-center">
                                <FaClock className="mr-1" />
                                {formatTime(record.checkedInAt)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
