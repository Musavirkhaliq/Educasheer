import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiTime, BiCategory } from 'react-icons/bi';
import { FiVideo } from 'react-icons/fi';
import { FaEdit, FaPlay, FaChalkboardTeacher, FaSignal, FaLock, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaBook, FaListUl } from 'react-icons/fa';
import QRCodeGenerator from './QRCodeGenerator';
import AttendanceRecords from './AttendanceRecords';
import StudentAttendance from './StudentAttendance';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './comments';
import DiscussionForum from './DiscussionForum';
import CourseMaterials from './CourseMaterials';
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
      {/* Course Header with Background Image */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${course.thumbnail})`,
            filter: 'blur(2px)',
            transform: 'scale(1.1)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
        <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">{course.title}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="bg-[#00bcd4]/90 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {course.level}
              </span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {course.category}
              </span>
            </div>
          </div>

          {canEdit() && (
            <Link
              to={`/courses/edit/${course._id}`}
              className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <FaEdit className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Course Info Section */}
        <div className="lg:col-span-2">
          {!course.isPublished && (
            <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg mb-6 border border-yellow-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>This course is not published yet. Only you can see it.</span>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <img
              src={course.creator?.avatar}
              alt={course.creator?.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#00bcd4]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{course.creator?.fullName}</h3>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">Instructor</span>
              </div>
              <p className="text-sm text-gray-500">@{course.creator?.username}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 inline-block relative">
              About This Course
              <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{course.description}</p>
          </div>

          {course.tags?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 inline-block relative">
                Topics Covered
                <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-[#00bcd4]/10 hover:border-[#00bcd4]/30 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Offline Course Details Section */}
          {course.courseType === 'offline' && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-6 inline-block relative">
                Offline Course Details
                <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
              </h2>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow transition-all duration-300 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg flex-shrink-0">
                      <FaMapMarkerAlt className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Location</h3>
                      <p className="text-gray-600 mt-1">{course.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg flex-shrink-0">
                      <FaClock className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Schedule</h3>
                      <p className="text-gray-600 mt-1">{course.schedule}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg flex-shrink-0">
                      <FaCalendarAlt className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Start Date</h3>
                      <p className="text-gray-600 mt-1">{new Date(course.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg flex-shrink-0">
                      <FaCalendarAlt className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">End Date</h3>
                      <p className="text-gray-600 mt-1">{new Date(course.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg flex-shrink-0">
                      <FaChalkboardTeacher className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Class Size</h3>
                      <p className="text-gray-600 mt-1">
                        {course.enrolledStudents?.length || 0} / {course.maxStudents || 20} students enrolled
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enrollment button for offline courses */}
                {!isEnrolled() && !canEdit() && course.isPublished && (
                  <div className="mt-4 mb-2">
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-[#00bcd4] text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
                    >
                      {enrolling ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                          Enroll in this Offline Course
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Enrolled Student Information for Offline Courses */}
                {isEnrolled() && (
                  <div className="mt-4 mb-2 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">You are enrolled in this course</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-green-100 p-1 rounded-full mt-0.5">
                          <FaCalendarAlt className="w-3 h-3 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Next Class</p>
                          <p className="text-sm text-gray-600">
                            {new Date() < new Date(course.startDate)
                              ? `Starting on ${new Date(course.startDate).toLocaleDateString()}`
                              : `Next session according to schedule: ${course.schedule}`
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="bg-green-100 p-1 rounded-full mt-0.5">
                          <FaMapMarkerAlt className="w-3 h-3 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-sm text-gray-600">{course.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="bg-green-100 p-1 rounded-full mt-0.5">
                          <FaChalkboardTeacher className="w-3 h-3 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Instructor Contact</p>
                          <p className="text-sm text-gray-600">{course.creator?.fullName} (@{course.creator?.username})</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-green-200">
                      <p className="text-sm text-gray-700 mb-2">Important Notes:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Please arrive 10 minutes before the scheduled time</li>
                        <li>Bring necessary materials as mentioned in the syllabus</li>
                        <li>Contact the instructor if you need to miss a class</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Syllabus/Modules Section */}
              {course.modules && course.modules.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-6 inline-block relative">
                    Course Syllabus
                    <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
                  </h2>

                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow transition-all duration-300">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-[#00bcd4]/10 p-2 rounded-lg flex-shrink-0">
                            <FaBook className="w-5 h-5 text-[#00bcd4]" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-800">Module {moduleIndex + 1}: {module.title}</h3>
                            {module.duration && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <BiTime className="w-4 h-4" />
                                <span>{module.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-12">
                          <p className="text-gray-600 mb-3">{module.description}</p>

                          {module.topics && module.topics.length > 0 && (
                            <div className="mt-3">
                              <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                <FaListUl className="w-4 h-4 text-[#00bcd4]" />
                                Topics Covered:
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                                {module.topics.map((topic, topicIndex) => (
                                  <li key={topicIndex}>{topic}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Materials Section for Enrolled Students */}
              {isEnrolled() && (
                <>
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-6 inline-block relative">
                      Course Materials
                      <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
                    </h2>

                    <CourseMaterials
                      courseId={course._id}
                      isInstructor={canEdit()}
                    />
                  </div>

                  {/* Class Discussion Section */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-6 inline-block relative">
                      Class Discussion
                      <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
                    </h2>

                    <DiscussionForum courseId={course._id} />
                  </div>

                  {/* Attendance Tracking Section */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-6 inline-block relative">
                      Attendance
                      <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
                    </h2>

                    {/* Show different attendance components based on user role */}
                    {canEdit() ? (
                      <div className="space-y-8">
                        {/* QR Code Generator for instructors */}
                        <QRCodeGenerator courseId={course._id} courseName={course.title} />

                        {/* Attendance Records for instructors */}
                        <AttendanceRecords
                          courseId={course._id}
                          courseName={course.title}
                          enrolledStudents={course.enrolledStudents}
                        />
                      </div>
                    ) : (
                      /* Student Attendance View */
                      <StudentAttendance courseId={course._id} courseName={course.title} />
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Online Course Content Preview Section */}
          {course.courseType !== 'offline' && course.videos?.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold inline-block relative">
                  Course Content
                  <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
                </h2>

                {(isEnrolled() || canEdit()) && course.videos && course.videos.length > 0 && (
                  <Link
                    to={`/courses/${course._id}/video/${course.videos[0]._id}`}
                    className="bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <FaPlay className="w-4 h-4" />
                    Start Learning
                  </Link>
                )}
              </div>

              {/* Preview Video for Non-enrolled Users */}
              {!isEnrolled() && !canEdit() && (
                <div className="mb-8">
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${course.videos[0]?.videoId}`}
                      title={course.videos[0]?.title}
                      style={{ border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <h3 className="text-lg font-medium mt-4">{course.videos[0]?.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{course.videos[0]?.description}</p>
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4 rounded-lg shadow-sm">
                    <p className="font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Preview Only
                    </p>
                    <p className="text-sm mt-1">Enroll in this course to access all {course.videos.length} videos.</p>
                  </div>
                </div>
              )}

              {/* Video List with Locked/Unlocked Status */}
              <div className="bg-white rounded-xl p-5 mt-4 border border-gray-200 shadow-sm hover:shadow transition-all duration-300">
                <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <FiVideo className="w-5 h-5 text-[#00bcd4]" />
                  Course Videos ({course.videos.length})
                </h3>
                <ul className="divide-y divide-gray-100">
                  {course.videos.map((video, index) => (
                    <li key={video._id} className="group">
                      {(isEnrolled() || canEdit()) ? (
                        <Link
                          to={`/courses/${course._id}/video/${video._id}`}
                          className="flex items-start w-full text-left hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 block"
                        >
                          <div className="flex-shrink-0 mt-1 text-[#00bcd4] group-hover:text-[#01427a] transition-colors duration-200">
                            <FaPlay className="w-4 h-4" />
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className="font-medium text-gray-800 group-hover:text-[#01427a] transition-colors duration-200">{video.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <BiTime className="w-4 h-4" />
                                {video.duration}
                              </span>
                              <span className="text-xs bg-[#00bcd4]/10 text-[#00bcd4] px-2 py-0.5 rounded-full">Video {index + 1}</span>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start w-full text-left p-3 rounded-lg">
                          <div className="flex-shrink-0 mt-1 text-gray-400">
                            {index === 0 ? (
                              <FaPlay className="w-4 h-4 text-[#00bcd4]" />
                            ) : (
                              <FaLock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className={`font-medium ${index === 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <BiTime className="w-4 h-4" />
                                {video.duration}
                              </span>
                              {index === 0 ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Preview</span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Locked</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="lg:pl-6">
          <div className="sticky top-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-[#01427a]">${course.price.toFixed(2)}</span>
                    {course.originalPrice > course.price && (
                      <span className="text-lg text-gray-400 line-through ml-2">${course.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  {course.price === 0 && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Free</span>
                  )}
                </div>

                {isEnrolled() ? (
                  <div className="mb-6">
                    <button
                      className="w-full bg-green-500 text-white py-3.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default shadow-sm"
                      disabled
                    >
                      <FaPlay className="w-4 h-4" />
                      Enrolled
                    </button>
                    {course.courseType !== 'offline' && course.videos && course.videos.length > 0 ? (
                      <Link
                        to={`/courses/${course._id}/video/${course.videos[0]._id}`}
                        className="w-full mt-3 bg-[#00bcd4] text-white py-3.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
                      >
                        <FaPlay className="w-4 h-4" />
                        Continue Learning
                      </Link>
                    ) : (
                      <button
                        className="w-full mt-3 bg-[#00bcd4] text-white py-3.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      >
                        <FaChalkboardTeacher className="w-4 h-4" />
                        View Course Details
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling || !course.isPublished}
                      className={`w-full py-3.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-300 ${
                        !course.isPublished
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#00bcd4] text-white hover:bg-[#01427a]'
                      }`}
                    >
                      {enrolling ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                          Enroll Now
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!course.isPublished && (
                  <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg mb-6 border border-yellow-200 flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>This course is not published yet</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg">
                      <FiVideo className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Videos</p>
                      <p className="font-medium">{course.videos?.length || 0} lessons</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg">
                      <BiTime className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Duration</p>
                      <p className="font-medium">{calculateTotalDuration()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#00bcd4]/10 p-2 rounded-lg">
                      <FaSignal className="w-5 h-5 text-[#00bcd4]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Level</p>
                      <p className="font-medium">{course.level}</p>
                    </div>
                  </div>

                  {course.enrolledStudents?.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="bg-[#00bcd4]/10 p-2 rounded-lg">
                        <FaChalkboardTeacher className="w-5 h-5 text-[#00bcd4]" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Students</p>
                        <p className="font-medium">{course.enrolledStudents.length} enrolled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mt-12 px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 inline-block relative">
            Discussion
            <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <CommentSection courseId={course._id} type="course" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
