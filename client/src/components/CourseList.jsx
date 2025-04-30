import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BiTime } from 'react-icons/bi';
import { FiVideo } from 'react-icons/fi';
import { FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CourseCard = ({ course, showControls, onDelete }) => {
  const { currentUser } = useAuth();
  const canEdit = showControls && (currentUser?.role === 'admin' || currentUser?._id === course.creator?._id);

  // Check if it's an offline course
  const isOfflineCourse = course.courseType === 'offline';

  // Format date for offline courses
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate total duration of all videos for online courses
  const totalDuration = !isOfflineCourse ? (course.videos?.reduce((total, video) => {
    // Parse duration in format "H:MM:SS" or "MM:SS"
    const parts = video.duration?.split(':').map(Number);
    let seconds = 0;

    if (parts?.length === 3) {
      // Format: H:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts?.length === 2) {
      // Format: MM:SS
      seconds = parts[0] * 60 + parts[1];
    }

    return total + seconds;
  }, 0) || 0) : 0;

  // Convert seconds to hours and minutes
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  // Format duration in a more readable way
  let formattedDuration;
  if (hours > 0) {
    formattedDuration = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  } else {
    formattedDuration = `${minutes}m`;
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <Link to={`/courses/${course._id}`} className="block relative">
        <div className="overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-3 sm:p-4 w-full">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
              View Course
            </span>
          </div>
        </div>

        {/* Course level badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <span className="bg-[#00bcd4]/90 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs backdrop-blur-sm">
            {course.level}
          </span>
        </div>

        {/* Course type badge */}
        <div className="absolute top-2 sm:top-3 left-20 sm:left-24">
          <span className={`${isOfflineCourse ? 'bg-purple-500/90' : 'bg-blue-500/90'} text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs backdrop-blur-sm`}>
            {isOfflineCourse ? 'Offline' : 'Online'}
          </span>
        </div>

        {/* Draft badge */}
        {!course.isPublished && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <span className="bg-yellow-500/90 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs backdrop-blur-sm">
              Draft
            </span>
          </div>
        )}
      </Link>

      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
          {isOfflineCourse ? (
            <>
              <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <FaMapMarkerAlt className="w-3 h-3" />
                <span>{course.location}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <FaCalendarAlt className="w-3 h-3" />
                <span>{formatDate(course.startDate)}</span>
              </div>
              {course.modules && (
                <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <FaGraduationCap className="w-3 h-3" />
                  <span>{course.modules.length} modules</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <FiVideo className="w-3 h-3" />
                <span>{course.videos?.length || 0} videos</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <BiTime className="w-3 h-3" />
                <span>{formattedDuration}</span>
              </div>
            </>
          )}
        </div>

        <Link to={`/courses/${course._id}`}>
          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-800 hover:text-[#00bcd4] transition-colors line-clamp-2">{course.title}</h3>
        </Link>

        <div className="flex justify-between items-center mb-3 pb-3 sm:mb-4 sm:pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={course.creator?.avatar}
              alt={course.creator?.fullName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200"
            />
            <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-[150px]">{course.creator?.fullName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {course.price === 0 ? (
              <span className="text-base sm:text-lg font-bold text-green-600">Free</span>
            ) : (
              <>
                <span className="text-base sm:text-lg font-bold text-[#01427a]">${course.price.toFixed(2)}</span>
                {course.originalPrice > course.price && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through ml-2">${course.originalPrice.toFixed(2)}</span>
                )}
              </>
            )}
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <Link
                to={`/courses/edit/${course._id}`}
                className="bg-[#00bcd4]/10 text-[#00bcd4] p-1.5 sm:p-2 rounded-full hover:bg-[#00bcd4]/20 transition-colors"
                title="Edit Course"
              >
                <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(course._id);
                }}
                className="bg-red-100 text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-red-200 transition-colors"
                title="Delete Course"
              >
                <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseList = ({
  userId,
  limit,
  showControls = false,
  showCreateButton = false,
  enrolledOnly = false,
  title = "Courses",
  search = ""
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let url = '/api/v1/courses';
        const params = {};

        if (limit) {
          params.limit = limit;
        }

        if (search) {
          params.search = search;
        }

        if (userId) {
          url = `/api/v1/courses/creator/${userId}`;
        } else if (showControls) {
          url = '/api/v1/courses/my/courses';
        } else if (enrolledOnly) {
          url = '/api/v1/courses/my/enrolled';
        }

        const response = await axios.get(url, {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        setCourses(response.data.data.courses || response.data.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, limit, showControls, enrolledOnly, search]);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Remove the deleted course from the list
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4] mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
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
          <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
        </h2>

        {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
          <Link
            to="/courses/create"
            className="bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {showCreateButton ? "You haven't created any courses yet." : "There are no courses available at the moment."}
          </p>
          {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
            <Link
              to="/courses/create"
              className="inline-block bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
            >
              Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              showControls={showControls}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
