import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaList, FaPlay, FaCheck, FaLock, FaComment } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from '../components/comments';
// Using default YouTube embed instead of custom VideoPlayer

const CourseVideoPlayerPage = () => {
  const { courseId, videoId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedVideos, setCompletedVideos] = useState([]);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        setCourse(response.data.data);

        // Find the current video and its index
        if (videoId) {
          const index = response.data.data.videos.findIndex(video => video._id === videoId);
          if (index !== -1) {
            setCurrentVideoIndex(index);
            setCurrentVideo(response.data.data.videos[index]);
          } else {
            // If video not found, use the first video
            setCurrentVideo(response.data.data.videos[0]);
          }
        } else if (response.data.data.videos.length > 0) {
          // If no videoId provided, use the first video
          setCurrentVideo(response.data.data.videos[0]);
          // Update URL to include the first video's ID
          navigate(`/courses/${courseId}/video/${response.data.data.videos[0]._id}`, { replace: true });
        }

        // Load completed videos from localStorage
        const savedCompletedVideos = localStorage.getItem(`course_${courseId}_completed`);
        if (savedCompletedVideos) {
          setCompletedVideos(JSON.parse(savedCompletedVideos));
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError(error.response?.data?.message || 'Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, videoId, navigate]);

  // Check if user is enrolled
  const isEnrolled = () => {
    return currentUser && course?.enrolledStudents?.includes(currentUser._id);
  };

  // Check if user can access the course (admin, creator, or enrolled)
  const canAccess = () => {
    return currentUser && (
      currentUser.role === 'admin' ||
      course?.creator?._id === currentUser._id ||
      isEnrolled()
    );
  };

  // Handle video navigation
  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      const newIndex = currentVideoIndex - 1;
      setCurrentVideoIndex(newIndex);
      setCurrentVideo(course.videos[newIndex]);
      navigate(`/courses/${courseId}/video/${course.videos[newIndex]._id}`);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < course.videos.length - 1) {
      const newIndex = currentVideoIndex + 1;
      setCurrentVideoIndex(newIndex);
      setCurrentVideo(course.videos[newIndex]);
      navigate(`/courses/${courseId}/video/${course.videos[newIndex]._id}`);
    }
  };

  // Handle video selection
  const handleVideoSelect = (video, index) => {
    setCurrentVideoIndex(index);
    setCurrentVideo(video);
    navigate(`/courses/${courseId}/video/${video._id}`);
  };

  // Mark video as completed
  const markAsCompleted = (videoId) => {
    if (!completedVideos.includes(videoId)) {
      const updatedCompletedVideos = [...completedVideos, videoId];
      setCompletedVideos(updatedCompletedVideos);
      localStorage.setItem(`course_${courseId}_completed`, JSON.stringify(updatedCompletedVideos));
    }
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!course?.videos || course.videos.length === 0) return 0;
    return Math.round((completedVideos.length / course.videos.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4] mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
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

  if (!canAccess()) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-yellow-200">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9" />
              </svg>
              <h3 className="font-bold text-lg text-yellow-800">Access Restricted</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-6">You need to enroll in this course to access its content. Enroll now to unlock all videos and start learning!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
              <Link
                to={`/courses/${courseId}`}
                className="bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg hover:bg-[#01427a] transition-all duration-300 text-center"
              >
                Go to Course Page
              </Link>
              <Link
                to="/courses"
                className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-300 text-center"
              >
                Browse Other Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Link
              to={`/courses/${courseId}`}
              className="text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
              aria-label="Back to course"
            >
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{course.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <span className="bg-[#00bcd4]/10 text-[#00bcd4] px-2 py-0.5 rounded-full">
                  Video {currentVideoIndex + 1} of {course.videos.length}
                </span>
                <span className="hidden sm:inline-block">•</span>
                <span className="hidden sm:inline-block">{calculateCompletionPercentage()}% completed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-auto flex-grow sm:flex-grow-0 mr-2 sm:mr-0">
              <div className="h-2.5 bg-gray-200 rounded-full w-full sm:w-36 md:w-52">
                <div
                  className="h-2.5 bg-gradient-to-r from-[#00bcd4] to-[#01427a] rounded-full"
                  style={{ width: `${calculateCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-all duration-200"
              aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
            >
              <FaList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Player Section */}
          <div className={`${showSidebar ? 'lg:w-2/3 xl:w-3/4' : 'w-full'} transition-all duration-300`}>
            {currentVideo ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Video Player */}
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.videoId}?rel=0&color=white&modestbranding=1`}
                    title={currentVideo.title}
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentVideo.title}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                          <BiTime className="w-4 h-4 text-[#00bcd4]" />
                          <span>{currentVideo.duration}</span>
                        </div>
                        <a
                          href={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00bcd4] hover:text-[#01427a] transition-colors text-sm flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open on YouTube
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => markAsCompleted(currentVideo._id)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 shadow-sm ${
                        completedVideos.includes(currentVideo._id)
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-[#00bcd4] text-white hover:bg-[#01427a]'
                      }`}
                    >
                      {completedVideos.includes(currentVideo._id) ? (
                        <>
                          <FaCheck className="w-4 h-4" />
                          Completed
                        </>
                      ) : (
                        <>
                          <FaCheck className="w-4 h-4" />
                          Mark as Completed
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 inline-block relative">
                      Description
                      <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed mt-2">
                      {currentVideo.description}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 border-t border-gray-100 pt-6">
                    <button
                      onClick={handlePreviousVideo}
                      disabled={currentVideoIndex === 0}
                      className={`px-5 py-2.5 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-all duration-300 ${
                        currentVideoIndex === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      <span>Previous Video</span>
                    </button>

                    <button
                      onClick={handleNextVideo}
                      disabled={currentVideoIndex === course.videos.length - 1}
                      className={`px-5 py-2.5 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-all duration-300 ${
                        currentVideoIndex === course.videos.length - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#00bcd4] text-white hover:bg-[#01427a]'
                      }`}
                    >
                      <span>Next Video</span>
                      <FaArrowLeft className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Videos Available</h3>
                <p className="text-gray-600 mb-4">This course doesn't have any videos yet.</p>
                <Link to={`/courses/${courseId}`} className="inline-block bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg hover:bg-[#01427a] transition-all duration-300">
                  Back to Course
                </Link>
              </div>
            )}

            {/* Comment Section */}
            {currentVideo && (
              <div className="mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 inline-block relative">
                    Discussion
                    <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
                  </h3>
                  <CommentSection videoId={currentVideo._id} type="video" />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div
            className={`lg:w-1/3 xl:w-1/4 transition-all duration-300 ${
              showSidebar ? 'opacity-100 max-h-[2000px]' : 'lg:opacity-0 lg:max-h-0 lg:overflow-hidden'
            }`}
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 sticky top-24">
              <div className="p-5 bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
                <h3 className="font-semibold text-lg mb-3">Course Content</h3>
                <div className="text-sm text-white/90 flex items-center gap-2">
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${calculateCompletionPercentage()}%` }}
                    ></div>
                  </div>
                  <span>{calculateCompletionPercentage()}%</span>
                </div>
                <p className="text-white/80 text-xs mt-1">
                  {completedVideos.length} of {course.videos.length} videos completed
                </p>
              </div>

              <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                <ul className="divide-y divide-gray-100">
                  {course.videos.map((video, index) => (
                    <li key={video._id} className="py-3">
                      <button
                        onClick={() => handleVideoSelect(index)}
                        className={`flex items-start w-full text-left rounded-lg p-2 transition-all duration-200 ${
                          currentVideoIndex === index
                            ? 'bg-[#00bcd4]/10 text-[#00bcd4]'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1 mr-3 relative">
                          {completedVideos.includes(video._id) ? (
                            <div className="bg-green-500 rounded-full p-1 shadow-sm">
                              <FaCheck className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className={`rounded-full p-1 shadow-sm ${currentVideoIndex === index ? 'bg-[#00bcd4]' : 'bg-gray-200'}`}>
                              <FaPlay className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {index !== course.videos.length - 1 && (
                            <div className={`absolute top-6 bottom-0 left-1/2 w-0.5 -translate-x-1/2 ${
                              completedVideos.includes(video._id) ? 'bg-green-500/50' : 'bg-gray-200'
                            }`}></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className={`font-medium text-sm ${
                            currentVideoIndex === index ? 'text-[#00bcd4]' : 'text-gray-700'
                          }`}>
                            {video.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <BiTime className="w-3.5 h-3.5" />
                              {video.duration}
                            </span>
                            {completedVideos.includes(video._id) && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Completed</span>
                            )}
                            {currentVideoIndex === index && !completedVideos.includes(video._id) && (
                              <span className="text-xs bg-[#00bcd4]/10 text-[#00bcd4] px-1.5 py-0.5 rounded-full">Current</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoPlayerPage;
