import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  BiTime,
  BiBook,
  BiLock,
  BiPlay,
  BiEdit
} from 'react-icons/bi';
import {
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineVideoCamera,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './comments';
import CourseMaterials from './CourseMaterials';
import CourseTestSeries from './CourseTestSeries';
import customFetch from '../utils/customFetch';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Effect to track when authentication is complete
  useEffect(() => {
    if (!authLoading) {
      console.log('CourseDetail - Auth loading complete, auth state:', {
        isAuthenticated,
        currentUser: currentUser ? { id: currentUser._id, role: currentUser.role } : null
      });
      setAuthChecked(true);
    }
  }, [authLoading, isAuthenticated, currentUser]);

  // Effect to fetch course details after authentication is checked
  useEffect(() => {
    // Only fetch course details after authentication check is complete
    if (!authChecked) {
      console.log('CourseDetail - Waiting for auth check to complete');
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        // Log authentication status for debugging
        console.log('CourseDetail - Authentication status:', {
          isAuthenticated,
          currentUser: currentUser ? {
            id: currentUser._id,
            role: currentUser.role
          } : null,
          hasToken: !!localStorage.getItem('accessToken')
        });

        // Use customFetch which includes auth token if user is logged in
        const response = await customFetch.get(`/courses/${courseId}`);
        console.log('Course data:', response.data.data);

        // Log enrollment status for debugging
        const courseData = response.data.data;
        console.log('CourseDetail - Enrollment status:', {
          isEnrolledFlag: courseData.isEnrolled,
          enrolledStudents: courseData.enrolledStudents?.length,
          currentUserInList: currentUser ? courseData.enrolledStudents?.some(
            id => id.toString() === currentUser._id.toString()
          ) : false
        });

        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError(error.response?.data?.message || 'Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, currentUser, isAuthenticated, authChecked]);

  // Calculate total duration of all videos
  const calculateTotalDuration = () => {
    if (!course?.videos) return '0 hours';

    const totalSeconds = course.videos.reduce((total, video) => {
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
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} min` : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      console.log('CourseDetail - No user logged in, redirecting to login');
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    console.log('CourseDetail - Starting enrollment process');
    setEnrolling(true);

    try {
      // Use customFetch which includes auth token in headers
      console.log('CourseDetail - Sending enrollment request');
      const response = await customFetch.post(`/courses/${courseId}/enroll`);
      console.log('CourseDetail - Enrollment successful:', response.data);

      // Show different messages based on course type
      if (course.courseType === 'offline') {
        alert('Successfully enrolled in the offline course! You can now access course materials and class information.');
      } else {
        alert('Successfully enrolled in the course! You can now access all videos.');
      }

      // Fetch the updated course data
      console.log('CourseDetail - Fetching updated course data');
      try {
        const updatedResponse = await customFetch.get(`/courses/${courseId}`);
        const updatedCourse = updatedResponse.data.data;

        console.log('CourseDetail - Updated course data received:', {
          isEnrolled: updatedCourse.isEnrolled,
          enrolledStudents: updatedCourse.enrolledStudents?.length
        });

        // Make sure the isEnrolled flag is set correctly
        if (!updatedCourse.isEnrolled && currentUser) {
          console.log('CourseDetail - Fixing isEnrolled flag manually');
          updatedCourse.isEnrolled = true;
        }

        setCourse(updatedCourse);
      } catch (fetchError) {
        console.error('Error fetching updated course data:', fetchError);

        // If fetching updated data fails, update the course state locally
        const updatedCourse = {
          ...course,
          isEnrolled: true,
          enrolledStudents: [...(course.enrolledStudents || []), currentUser._id]
        };

        console.log('CourseDetail - Using local course update as fallback');
        setCourse(updatedCourse);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = () => {
    // Log enrollment check for debugging
    console.log('CourseDetail - Checking enrollment status:', {
      isEnrolledFlag: course?.isEnrolled,
      hasCurrentUser: !!currentUser,
      currentUserId: currentUser?._id,
      enrolledStudents: course?.enrolledStudents?.length,
      enrolledStudentsArray: course?.enrolledStudents
    });

    // Manual check if user's ID is in the enrolledStudents array
    if (currentUser && course?.enrolledStudents && Array.isArray(course.enrolledStudents)) {
      // First convert all IDs to strings for proper comparison
      const userIdStr = currentUser._id.toString();
      const enrolledStudentIds = course.enrolledStudents.map(id =>
        typeof id === 'string' ? id : id.toString()
      );

      // Check if user's ID is in the array
      const isUserEnrolled = enrolledStudentIds.includes(userIdStr);

      console.log('CourseDetail - Manual enrollment check:', {
        userIdStr,
        enrolledStudentIds,
        isUserEnrolled
      });

      // If we found the user is enrolled, override the backend flag
      if (isUserEnrolled) {
        return true;
      }
    }

    // Use the isEnrolled flag from the backend if available
    if (course?.isEnrolled !== undefined) {
      console.log('CourseDetail - Using isEnrolled flag from backend:', course.isEnrolled);
      return course.isEnrolled;
    }

    // Not enrolled if no user or no course data
    return false;
  };

  const canEdit = () => {
    return currentUser && (
      currentUser.role === 'admin' ||
      (course?.creator?._id === currentUser._id)
    );
  };

  if (loading || authLoading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4] mb-4"></div>
          <p className="text-gray-600">
            {authLoading || !authChecked ? 'Checking authentication...' : 'Loading course details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12">
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
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="inline-block bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg hover:bg-[#01427a] transition-all duration-300">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
                {course.courseType === 'offline' && (
                  <span className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    Offline
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {course.title}
              </h1>

              <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                {course.description?.substring(0, 200)}...
              </p>

              <button
                onClick={() => setShowCourseModal(true)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-medium border border-white/20 hover:border-white/40"
              >
                <HiOutlineBookOpen className="w-5 h-5" />
                Know More
              </button>

              {/* Instructor Info */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <img
                  src={course.creator?.avatar}
                  alt={course.creator?.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <p className="text-white font-medium">{course.creator?.fullName}</p>
                  <p className="text-blue-200 text-sm">Course Instructor</p>
                </div>
              </div>
            </div>

            {/* Course Stats Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ₹{course.price.toFixed(2)}
                  {course.originalPrice > course.price && (
                    <span className="text-lg text-gray-400 line-through ml-2">
                      ₹{course.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {course.price === 0 && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Free Course
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineVideoCamera className="w-5 h-5" />
                    <span className="text-sm">Videos</span>
                  </div>
                  <span className="font-medium">{course.videos?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineClock className="w-5 h-5" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="font-medium">{calculateTotalDuration()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineUsers className="w-5 h-5" />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="font-medium">{course.enrolledStudents?.length || 0}</span>
                </div>
              </div>

              {/* Enrollment Button */}
              {isEnrolled() ? (
                <div className="space-y-3">
                  <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 cursor-default">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                    Enrolled
                  </button>
                  {course.courseType !== 'offline' && course.videos?.length > 0 && (
                    <Link
                      to={`/courses/${course._id}/video/${course.videos[0]._id}`}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <BiPlay className="w-5 h-5" />
                      Continue Learning
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !course.isPublished}
                  className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${!course.isPublished
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {enrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <HiOutlineAcademicCap className="w-5 h-5" />
                      Enroll Now
                    </>
                  )}
                </button>
              )}

              {canEdit() && (
                <Link
                  to={`/courses/edit/${course._id}`}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <BiEdit className="w-5 h-5" />
                  Edit Course
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!course.isPublished && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl mb-12 flex items-center gap-3 shadow-sm">
            <div className="w-5 h-5 text-amber-500">⚠️</div>
            <span className="font-medium">This course is not published yet. Only you can see it.</span>
          </div>
        )}

        <div className="space-y-12">


          {/* Topics/Tags */}
          {course.tags?.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-10 shadow-lg border border-gray-100 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-20 -translate-x-20 opacity-40"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-100 to-indigo-100 rounded-full translate-y-16 translate-x-16 opacity-40"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <BiBook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Topics Covered</h2>
                    <p className="text-gray-600 mt-1">Key areas you'll master in this course</p>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {course.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                          <span className="text-gray-700 font-medium text-sm group-hover:text-indigo-700 transition-colors">
                            {tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offline Course Details */}
          {course.courseType === 'offline' && (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg">
                  <HiOutlineLocationMarker className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Offline Course Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <HiOutlineLocationMarker className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                      <p className="text-gray-600">{course.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <HiOutlineClock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Schedule</h3>
                      <p className="text-gray-600">{course.schedule}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <HiOutlineUsers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Class Size</h3>
                      <p className="text-gray-600">
                        {course.enrolledStudents?.length || 0} / {course.maxStudents || 20} students
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((course.enrolledStudents?.length || 0) / (course.maxStudents || 20)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <HiOutlineCalendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Start Date</h3>
                      <p className="text-gray-600">{new Date(course.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <HiOutlineCalendar className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">End Date</h3>
                      <p className="text-gray-600">{new Date(course.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrollment Status for Offline Courses */}
              {isEnrolled() && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">You're Enrolled!</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Next Class</h4>
                      <p className="text-gray-700 text-sm">
                        {new Date() < new Date(course.startDate)
                          ? `Starting ${new Date(course.startDate).toLocaleDateString()}`
                          : `As per schedule: ${course.schedule}`
                        }
                      </p>
                    </div>

                    <div className="bg-white/60 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Instructor</h4>
                      <p className="text-gray-700 text-sm">{course.creator?.fullName}</p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Important Reminders</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Arrive 10 minutes early</li>
                      <li>• Bring required materials</li>
                      <li>• Contact instructor for absences</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Course Syllabus/Modules */}
          {course.modules && course.modules.length > 0 && (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-lg">
                  <HiOutlineBookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Course Syllabus</h2>
              </div>

              <div className="space-y-6">
                {course.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 p-3 rounded-xl">
                            <span className="text-blue-600 font-bold text-lg">{moduleIndex + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                            {module.duration && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <BiTime className="w-4 h-4" />
                                <span className="text-sm">{module.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-700 mb-4 leading-relaxed">{module.description}</p>

                      {module.topics && module.topics.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BiBook className="w-4 h-4 text-blue-600" />
                            Topics Covered
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {module.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-center gap-2 text-gray-600">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                <span className="text-sm">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Content Sections */}
          <div className="space-y-16">
            {/* Course Content Section */}
            <section className="border-b border-gray-200 pb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <HiOutlineVideoCamera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Course Content</h2>
                  <p className="text-gray-600">Overview and learning structure</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Stats */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <HiOutlineVideoCamera className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{course.videos?.length || 0} Video Lessons</p>
                          <p className="text-sm text-gray-600">Total duration: {calculateTotalDuration()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                          <HiOutlineAcademicCap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{course.level} Level</p>
                          <p className="text-sm text-gray-600">Suitable for {course.level.toLowerCase()} learners</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-purple-600 p-2 rounded-lg">
                          <HiOutlineUsers className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{course.enrolledStudents?.length || 0} Students</p>
                          <p className="text-sm text-gray-600">Join the learning community</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-orange-600 p-2 rounded-lg">
                          <HiOutlineBookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{course.category}</p>
                          <p className="text-sm text-gray-600">Course category</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Features */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-gray-700">
                          {course.courseType === 'offline' ? 'In-person classes' : 'Online video lessons'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-gray-700">Downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-gray-700">Practice tests & quizzes</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span className="text-gray-700">Community discussion</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-gray-700">Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <span className="text-gray-700">Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Panel */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h3>

                    {isEnrolled() ? (
                      <div className="space-y-4">
                        <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-700 mb-2">
                            <HiOutlineCheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Enrolled</span>
                          </div>
                          <p className="text-sm text-green-600">You have access to all course content</p>
                        </div>

                        {course.courseType !== 'offline' && course.videos?.length > 0 && (
                          <Link
                            to={`/courses/${course._id}/video/${course.videos[0]._id}`}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <BiPlay className="w-5 h-5" />
                            Start Learning
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ₹{course.price.toFixed(2)}
                            {course.originalPrice > course.price && (
                              <span className="text-lg text-gray-400 line-through ml-2">
                                ₹{course.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {course.price === 0 && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              Free Course
                            </span>
                          )}
                        </div>

                        <button
                          onClick={handleEnroll}
                          disabled={enrolling || !course.isPublished}
                          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${!course.isPublished
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                          {enrolling ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <HiOutlineAcademicCap className="w-5 h-5" />
                              Enroll Now
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Instructor Info */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={course.creator?.avatar}
                        alt={course.creator?.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{course.creator?.fullName}</p>
                        <p className="text-sm text-gray-500">@{course.creator?.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Test Series Section */}
            <section className="border-b border-gray-200 pb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-purple-600 p-3 rounded-xl">
                  <HiOutlineAcademicCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Test Series</h2>
                  <p className="text-gray-600">Practice tests and assessments</p>
                </div>
              </div>
              <CourseTestSeries
                courseId={course._id}
                courseName={course.title}
                isInstructor={canEdit()}
              />
            </section>

            {/* Study Materials Section */}
            <section className="border-b border-gray-200 pb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-green-600 p-3 rounded-xl">
                  <HiOutlineBookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Study Materials</h2>
                  <p className="text-gray-600">Notes, PDFs, and resources</p>
                </div>
              </div>
              {isEnrolled() ? (
                <CourseMaterials
                  courseId={course._id}
                  isInstructor={canEdit()}
                />
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="bg-gray-200 p-4 rounded-xl mb-4 inline-block">
                    <BiLock className="w-8 h-8 text-gray-400 mx-auto" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Premium Materials</h4>
                  <p className="text-gray-600 mb-6">Enroll to access study materials</p>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>
              )}
            </section>

            {/* Discussion Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-600 p-3 rounded-xl">
                  <HiOutlineUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Discussion</h2>
                  <p className="text-gray-600">Ask questions and share insights</p>
                </div>
              </div>
              <CommentSection courseId={course._id} type="course" />
            </section>
          </div>

        </div>


      </div>

      {/* Course Details Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <HiOutlineBookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    <p className="text-blue-100">Complete Course Details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Course Description */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>
                </div>
              </div>

              {/* Course Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-2xl p-6 text-center">
                  <div className="bg-blue-600 p-3 rounded-xl mb-3 inline-block">
                    <HiOutlineVideoCamera className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{course.videos?.length || 0}</div>
                  <div className="text-sm text-gray-600">Video Lessons</div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 text-center">
                  <div className="bg-green-600 p-3 rounded-xl mb-3 inline-block">
                    <HiOutlineClock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{calculateTotalDuration()}</div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>

                <div className="bg-purple-50 rounded-2xl p-6 text-center">
                  <div className="bg-purple-600 p-3 rounded-xl mb-3 inline-block">
                    <HiOutlineUsers className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{course.enrolledStudents?.length || 0}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>

                <div className="bg-orange-50 rounded-2xl p-6 text-center">
                  <div className="bg-orange-600 p-3 rounded-xl mb-3 inline-block">
                    <HiOutlineAcademicCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{course.level}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
              </div>

              {/* Course Features */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      {course.courseType === 'offline' ? 'In-person classes' : 'Online video lessons'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Practice tests & quizzes</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Community discussion</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Certificate of completion</span>
                  </div>
                </div>
              </div>

              {/* Topics Covered */}
              {course.tags?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Topics Covered</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {course.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-center"
                      >
                        <span className="text-blue-700 font-medium text-sm">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h3>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={course.creator?.avatar}
                      alt={course.creator?.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{course.creator?.fullName}</h4>
                      <p className="text-gray-600">@{course.creator?.username}</p>
                      <p className="text-sm text-gray-500 mt-1">Course Instructor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offline Course Details */}
              {course.courseType === 'offline' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Class Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <HiOutlineLocationMarker className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Location</h4>
                      </div>
                      <p className="text-gray-700">{course.location}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <HiOutlineClock className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">Schedule</h4>
                      </div>
                      <p className="text-gray-700">{course.schedule}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <HiOutlineCalendar className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">Start Date</h4>
                      </div>
                      <p className="text-gray-700">{new Date(course.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <HiOutlineCalendar className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-gray-900">End Date</h4>
                      </div>
                      <p className="text-gray-700">{new Date(course.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{course.price.toFixed(2)}
                  {course.originalPrice > course.price && (
                    <span className="text-lg text-gray-400 line-through ml-2">
                      ₹{course.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {!isEnrolled() ? (
                  <button
                    onClick={() => {
                      setShowCourseModal(false);
                      handleEnroll();
                    }}
                    disabled={enrolling || !course.isPublished}
                    className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors ${!course.isPublished
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <HiOutlineAcademicCap className="w-5 h-5" />
                    Enroll Now
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Already Enrolled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
