import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaChalkboardTeacher } from 'react-icons/fa';
import { FiVideo } from 'react-icons/fi';
import { BiTime, BiCategory } from 'react-icons/bi';

const ProgramCard = ({ program, showControls, onDelete }) => {
  const { currentUser } = useAuth();
  const canEdit = showControls && (currentUser?.role === 'admin' || currentUser?._id === program.creator?._id);

  // Check if user is enrolled in this program
  const isEnrolled = () => {
    // First check if the backend already provided the enrollment status
    if (program.isEnrolled !== undefined) {
      return program.isEnrolled;
    }
    // Otherwise check if the user's ID is in the enrolledStudents array
    return currentUser && program.enrolledStudents?.includes(currentUser._id);
  };

  // Add debugging to help identify enrollment issues
  console.debug(`Program ${program.title} (${program._id}):`, {
    isEnrolled: isEnrolled(),
    hasIsEnrolledFlag: program.isEnrolled !== undefined,
    enrolledStudents: program.enrolledStudents,
    currentUserId: currentUser?._id
  });
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <Link to={`/programs/${program._id}`} className="block relative">
        <div className="overflow-hidden">
          <img
            src={program.thumbnail}
            alt={program.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 w-full">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              View Program
            </span>
          </div>
        </div>

        {/* Program level badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-[#01427a]/90 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
            {program.level}
          </span>
        </div>

        {/* Status badges on the right side */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {/* Draft badge */}
          {!program.isPublished && (
            <span className="bg-yellow-500/90 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
              Draft
            </span>
          )}

          {/* Enrolled badge */}
          {isEnrolled() && (
            <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
              Enrolled
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <FaChalkboardTeacher className="w-3 h-3" />
            <span>{program.totalCourses || program.courses?.length || 0} courses</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <BiTime className="w-3 h-3" />
            <span>{program.duration}</span>
          </div>
        </div>

        <Link to={`/programs/${program._id}`}>
          <h3 className="font-semibold text-lg mb-3 text-gray-800 hover:text-[#01427a] transition-colors line-clamp-2">{program.title}</h3>
        </Link>

        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={program.creator?.avatar}
              alt={program.creator?.fullName}
              className="w-8 h-8 rounded-full border border-gray-200"
            />
            <span className="text-sm text-gray-600">{program.creator?.fullName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {program.price === 0 ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <>
                <span className="text-lg font-bold text-[#01427a]">₹{program.price.toFixed(2)}</span>
                {program.originalPrice > program.price && (
                  <span className="text-sm text-gray-400 line-through ml-2">₹{program.originalPrice.toFixed(2)}</span>
                )}
              </>
            )}
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <Link
                to={`/programs/edit/${program._id}`}
                className="bg-[#00bcd4]/10 text-[#00bcd4] p-2 rounded-full hover:bg-[#00bcd4]/20 transition-colors"
                title="Edit Program"
              >
                <FaEdit className="w-4 h-4" />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(program._id);
                }}
                className="bg-red-100 text-red-500 p-2 rounded-full hover:bg-red-200 transition-colors"
                title="Delete Program"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgramList = ({
  userId,
  limit,
  showControls = false,
  showCreateButton = false,
  enrolledOnly = false,
  title = "Programs"
}) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        let url = '/api/v1/programs';
        const params = {};

        if (limit) {
          params.limit = limit;
        }

        if (userId) {
          url = `/api/v1/programs/creator/${userId}`;
        } else if (showControls) {
          url = '/api/v1/programs/my/programs';
        } else if (enrolledOnly) {
          url = '/api/v1/programs/my/enrolled';
        }

        const response = await axios.get(url, {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        setPrograms(response.data.data.programs || response.data.data);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Failed to load programs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [userId, limit, showControls, enrolledOnly]);

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/programs/${programId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      setPrograms(programs.filter(program => program._id !== programId));
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4] mb-4"></div>
          <p className="text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-sm" role="alert">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error</span>
        </div>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 relative inline-block">
          {title}
          <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
        </h2>

        {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
          <Link
            to="/programs/create"
            className="bg-[#01427a] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#01427a]/80 transition-all duration-300 shadow-sm hover:shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Program
          </Link>
        )}
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No programs found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {showCreateButton ? "You haven't created any programs yet." : "There are no programs available at the moment."}
          </p>
          {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
            <Link
              to="/programs/create"
              className="inline-block bg-[#01427a] text-white px-6 py-3 rounded-lg hover:bg-[#01427a]/80 transition-all duration-300 shadow-sm hover:shadow"
            >
              Create Your First Program
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <ProgramCard
              key={program._id}
              program={program}
              showControls={showControls}
              onDelete={handleDeleteProgram}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramList;
