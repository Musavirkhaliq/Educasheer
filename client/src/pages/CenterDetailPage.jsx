import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaUsers, FaEdit, FaTrash, FaArrowLeft, FaPlus, FaChair, FaCalendarAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SeatBookingForm from '../components/seat/SeatBookingForm';
import { toast } from 'react-hot-toast';

const CenterDetailPage = () => {
  const { centerId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showSeatBooking, setShowSeatBooking] = useState(false);

  useEffect(() => {
    const fetchCenterDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/centers/${centerId}`);
        setCenter(response.data.data);
      } catch (err) {
        console.error('Error fetching center details:', err);
        setError('Failed to load center details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCenterDetails();
  }, [centerId]);

  const fetchAvailableStudents = async () => {
    if (currentUser?.role !== 'admin') return;
    
    try {
      const response = await axios.get('/api/v1/admin/users?role=learner', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const enrolledIds = center.enrolledStudents.map(student => student._id);
      const filteredStudents = response.data.data.filter(
        student => !enrolledIds.includes(student._id)
      );
      
      setAvailableStudents(filteredStudents);
    } catch (err) {
      console.error('Error fetching available students:', err);
      alert('Failed to load available students. Please try again.');
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    
    setAddingStudent(true);
    try {
      await axios.post(`/api/v1/centers/${centerId}/students`, 
        { studentId: selectedStudent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      const response = await axios.get(`/api/v1/centers/${centerId}`);
      setCenter(response.data.data);
      
      setShowAddStudentModal(false);
      setSelectedStudent('');
    } catch (err) {
      console.error('Error adding student to center:', err);
      alert('Failed to add student to center. Please try again.');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the center?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/v1/centers/${centerId}/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const response = await axios.get(`/api/v1/centers/${centerId}`);
      setCenter(response.data.data);
    } catch (err) {
      console.error('Error removing student from center:', err);
      alert('Failed to remove student from center. Please try again.');
    }
  };

  const handleDeleteCenter = async () => {
    if (!window.confirm('Are you sure you want to delete this center? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/v1/centers/${centerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      navigate('/centers');
    } catch (err) {
      console.error('Error deleting center:', err);
      alert('Failed to delete center. Please try again.');
    }
  };

  const handleBookingSuccess = (booking) => {
    toast.success('Seat booked successfully!');
    setShowSeatBooking(false);
    // Optionally navigate to bookings page
    // navigate('/my-bookings');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-red-500 mb-6">{error || 'Center not found'}</p>
          <Link
            to="/centers"
            className="inline-flex items-center px-6 py-3 bg-[#00bcd4] text-white rounded-lg hover:bg-[#01427a] transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Centers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/centers"
            className="inline-flex items-center text-[#00bcd4] hover:text-[#01427a] transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Centers
          </Link>
        </div>

        {/* --- Main Center Card --- */}
        <div className="bg-white rounded-xl overflow-hidden shadow-md mb-8">
          {/* Center Header Image and Info */}
          <div className="relative h-64 md:h-80">
            <img
              src={center.image}
              alt={center.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{center.name}</h1>
                <div className="flex items-center text-white/90 mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{center.location}</span>
                </div>
                {center.isActive ? (
                  <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Active
                  </span>
                ) : (
                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {currentUser?.role === 'admin' && (
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-b border-gray-100">
              <Link
                to={`/centers/${centerId}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEdit className="mr-2" />
                Edit Center
              </Link>
              <button
                onClick={handleDeleteCenter}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTrash className="mr-2" />
                Delete Center
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#00bcd4] text-[#00bcd4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaMapMarkerAlt className="inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('booking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'booking'
                    ? 'border-[#00bcd4] text-[#00bcd4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaChair className="inline mr-2" />
                Book a Seat
              </button>
            </nav>
          </div>

          {/* --- Tab Content --- */}
          
          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Center Details Section */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">About this Center</h2>
                    <p className="text-gray-600 mb-6">{center.description}</p>
                    {center.facilities && center.facilities.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {center.facilities.map((facility, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaEnvelope className="text-[#00bcd4] mr-3" />
                        <span className="text-gray-600">{center.contactEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <FaPhone className="text-[#00bcd4] mr-3" />
                        <span className="text-gray-600">{center.contactPhone}</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Capacity</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Students</span>
                        <span className="font-medium">{center.enrolledStudents.length} / {center.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#00bcd4] h-2.5 rounded-full"
                          style={{ width: `${(center.enrolledStudents.length / center.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Students Section */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Enrolled Students ({center.enrolledStudents.length})
                  </h2>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        fetchAvailableStudents();
                        setShowAddStudentModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#01427a] transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Add Student
                    </button>
                  )}
                </div>
                {center.enrolledStudents.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <FaUsers className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Students Enrolled</h3>
                    <p className="text-gray-500">This center doesn't have any enrolled students yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                          {currentUser?.role === 'admin' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {center.enrolledStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full object-cover" src={student.avatar} alt={student.fullName} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{student.email}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">@{student.username}</div></td>
                            {currentUser?.role === 'admin' && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleRemoveStudent(student._id)} className="text-red-600 hover:text-red-900">Remove</button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Seat Booking Tab Content */}
          {activeTab === 'booking' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Book a Seat</h2>
                <p className="text-gray-600">Reserve your seat at {center.name} for focused study sessions.</p>
              </div>
              <SeatBookingForm center={center} onBookingSuccess={handleBookingSuccess} />
            </div>
          )}
        </div> {/* --- End of Main Center Card --- */}
        
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Student to Center</h3>
            {availableStudents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">No available students to add.</p>
                <button onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                  <select
                    id="student"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                  >
                    <option value="">-- Select a student --</option>
                    {availableStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.fullName} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                  <button
                    onClick={handleAddStudent}
                    disabled={!selectedStudent || addingStudent}
                    className={`px-4 py-2 bg-[#00bcd4] text-white rounded-lg transition-colors ${
                      !selectedStudent || addingStudent ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#01427a]'
                    }`}
                  >
                    {addingStudent ? 'Adding...' : 'Add Student'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterDetailPage;