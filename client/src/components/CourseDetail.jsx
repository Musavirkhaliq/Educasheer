import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiTime, BiCategory } from 'react-icons/bi';
import { FiVideo } from 'react-icons/fi';
import { FaEdit, FaPlay, FaChalkboardTeacher, FaSignal, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './comments';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        setCourse(response.data.data);
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError(error.response?.data?.message || 'Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

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
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    setEnrolling(true);

    try {
      await axios.post(`/api/v1/courses/${courseId}/enroll`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Update the course state to reflect enrollment
      setCourse({
        ...course,
        enrolledStudents: [...(course.enrolledStudents || []), currentUser._id]
      });

      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = () => {
    return currentUser && course?.enrolledStudents?.includes(currentUser._id);
  };

  const canEdit = () => {
    return currentUser && (
      currentUser.role === 'admin' ||
      (course?.creator?._id === currentUser._id)
    );
  };

  if (loading) {
    return <div className="text-center py-10">Loading course details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-10">Course not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Info Section */}
        <div className="lg:col-span-2 p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{course.title}</h1>

            {canEdit() && (
              <Link
                to={`/courses/edit/${course._id}`}
                className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"
              >
                <FaEdit className="w-5 h-5" />
              </Link>
            )}
          </div>

          {!course.isPublished && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4">
              This course is not published yet. Only you can see it.
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FaChalkboardTeacher className="w-5 h-5" />
              <span>Instructor: {course.creator?.fullName}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <BiCategory className="w-5 h-5" />
              <span>Category: {course.category}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FaSignal className="w-5 h-5" />
              <span>Level: {course.level}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">About This Course</h2>
            <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
          </div>

          {course.tags?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Course Content Preview Section */}
          {course.videos?.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Course Content</h2>

                {(isEnrolled() || canEdit()) && (
                  <Link
                    to={`/courses/${course._id}/video/${course.videos[0]._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <FaPlay className="w-4 h-4" />
                    Start Learning
                  </Link>
                )}
              </div>

              {/* Preview Video for Non-enrolled Users */}
              {!isEnrolled() && !canEdit() && (
                <div className="mb-6">
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${course.videos[0]?.videoId}`}
                      title={course.videos[0]?.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <h3 className="text-lg font-medium mt-2">{course.videos[0]?.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{course.videos[0]?.description}</p>
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                    <p className="font-medium">Preview Only</p>
                    <p className="text-sm">Enroll in this course to access all {course.videos.length} videos.</p>
                  </div>
                </div>
              )}

              {/* Video List with Locked/Unlocked Status */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FiVideo className="w-5 h-5 text-blue-600" />
                  Course Videos ({course.videos.length})
                </h3>
                <ul className="divide-y divide-gray-200">
                  {course.videos.map((video, index) => (
                    <li key={video._id} className="py-3">
                      {(isEnrolled() || canEdit()) ? (
                        <Link
                          to={`/courses/${course._id}/video/${video._id}`}
                          className="flex items-start w-full text-left hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1 text-blue-600">
                            <FaPlay className="w-4 h-4" />
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className="font-medium text-gray-800">{video.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <span>{video.duration}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Video {index + 1}</span>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start w-full text-left p-2">
                          <div className="flex-shrink-0 mt-1 text-gray-400">
                            {index === 0 ? (
                              <FaPlay className="w-4 h-4" />
                            ) : (
                              <FaLock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className={`font-medium ${index === 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <span>{video.duration}</span>
                              {index === 0 ? (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Preview</span>
                              ) : (
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Locked</span>
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
        <div className="bg-gray-50 p-6">
          <div className="sticky top-20">
            <div className="mb-6">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">${course.price.toFixed(2)}</span>
                {course.originalPrice > course.price && (
                  <span className="text-lg text-gray-400 line-through">${course.originalPrice.toFixed(2)}</span>
                )}
              </div>

              {isEnrolled() ? (
                <button
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default"
                  disabled
                >
                  <FaPlay className="w-4 h-4" />
                  Enrolled
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !course.isPublished}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    !course.isPublished
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              {!course.isPublished && (
                <p className="text-yellow-600 text-sm mt-2 text-center">
                  This course is not published yet
                </p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Course Information</h3>
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <FiVideo className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{course.videos?.length || 0} videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <BiTime className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Total duration: {calculateTotalDuration()}</span>
                </div>
                {course.enrolledStudents?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FaChalkboardTeacher className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{course.enrolledStudents.length} students enrolled</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaSignal className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Level: {course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BiCategory className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Category: {course.category}</span>
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">About the Instructor</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={course.creator?.avatar}
                    alt={course.creator?.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{course.creator?.fullName}</h4>
                    <p className="text-sm text-gray-500">@{course.creator?.username}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mt-8">
        <CommentSection courseId={course._id} type="course" />
      </div>
    </div>
  );
};

export default CourseDetail;
