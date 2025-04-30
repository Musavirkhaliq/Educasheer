import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaUserCheck, FaUserTimes, FaDownload, FaSearch } from 'react-icons/fa';

const AttendanceRecords = ({ courseId, courseName, enrolledStudents }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');

  useEffect(() => {
    fetchAttendanceRecords();
  }, [courseId]);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(`/api/v1/attendance/course/${courseId}`, {
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

  // Filter records based on search term and selected session
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSession = selectedSession === 'all' || record.session === selectedSession;
    const matchesSearch = !searchTerm || 
      record.attendees.some(attendee => 
        attendee.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.student?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSession && matchesSearch;
  });

  // Get unique sessions for the filter dropdown
  const uniqueSessions = [...new Set(attendanceRecords.map(record => record.session))];

  // Calculate attendance statistics
  const calculateStats = () => {
    if (attendanceRecords.length === 0 || !enrolledStudents) return { average: 0, highest: 0, lowest: 0 };
    
    const totalStudents = enrolledStudents.length;
    const attendanceRates = attendanceRecords.map(record => 
      (record.attendees.length / totalStudents) * 100
    );
    
    const average = attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length;
    const highest = Math.max(...attendanceRates);
    const lowest = Math.min(...attendanceRates);
    
    return {
      average: Math.round(average),
      highest: Math.round(highest),
      lowest: Math.round(lowest)
    };
  };

  const stats = calculateStats();

  // Export attendance to CSV
  const exportToCSV = () => {
    if (attendanceRecords.length === 0) return;
    
    // Create headers
    let csvContent = "Session,Date,Student Name,Username,Email,Check-in Time\n";
    
    // Add data rows
    attendanceRecords.forEach(record => {
      record.attendees.forEach(attendee => {
        const row = [
          record.session,
          formatDate(record.sessionDate),
          attendee.student?.fullName || 'Unknown',
          attendee.student?.username || 'Unknown',
          attendee.student?.email || 'Unknown',
          formatTime(attendee.checkedInAt)
        ];
        csvContent += row.map(item => `"${item}"`).join(',') + "\n";
      });
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${courseName.replace(/\s+/g, '_')}_attendance.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <FaCalendarAlt className="text-[#00bcd4]" />
          Attendance Records for {courseName}
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
        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="text-blue-700 text-sm font-medium">Average Attendance</h4>
            <p className="text-2xl font-bold text-blue-800">{stats.average}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h4 className="text-green-700 text-sm font-medium">Highest Attendance</h4>
            <p className="text-2xl font-bold text-green-800">{stats.highest}%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <h4 className="text-yellow-700 text-sm font-medium">Lowest Attendance</h4>
            <p className="text-2xl font-bold text-yellow-800">{stats.lowest}%</p>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            >
              <option value="all">All Sessions</option>
              {uniqueSessions.map(session => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={exportToCSV}
            className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors flex items-center gap-2"
          >
            <FaDownload />
            Export to CSV
          </button>
        </div>

        {/* Attendance Records Table */}
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No attendance records found for this course.</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No records match your search criteria.</p>
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
                    Attendance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students Present
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.session}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(record.sessionDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {enrolledStudents ? (
                          <>
                            <span className="font-medium">{record.attendees.length}</span>
                            <span className="text-gray-500"> / {enrolledStudents.length} students</span>
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {Math.round((record.attendees.length / enrolledStudents.length) * 100)}%
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">{record.attendees.length} students</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {record.attendees.map((attendee) => (
                          <span 
                            key={attendee._id} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            title={`Checked in at ${formatTime(attendee.checkedInAt)}`}
                          >
                            <FaUserCheck className="mr-1" />
                            {attendee.student?.fullName || attendee.student?.username || 'Unknown'}
                          </span>
                        ))}
                        
                        {enrolledStudents && enrolledStudents.filter(student => 
                          !record.attendees.some(attendee => 
                            attendee.student?._id === student._id
                          )
                        ).map((absentStudent) => (
                          <span 
                            key={absentStudent._id} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            <FaUserTimes className="mr-1" />
                            {absentStudent.fullName || absentStudent.username || 'Unknown'}
                          </span>
                        ))}
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
  );
};

export default AttendanceRecords;
