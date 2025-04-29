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
    return <div className="text-center py-10">Loading course content...</div>;
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

  if (!canAccess()) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <h3 className="font-bold text-lg mb-2">Access Restricted</h3>
        <p className="mb-4">You need to enroll in this course to access its content.</p>
        <Link
          to={`/courses/${courseId}`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
        >
          Go to Course Page
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Link
              to={`/courses/${courseId}`}
              className="text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
              aria-label="Back to course"
            >
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{course.title}</h1>
              <p className="text-gray-500 text-sm hidden sm:block">
                {currentVideoIndex + 1} of {course.videos.length} • {calculateCompletionPercentage()}% completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-auto flex-grow sm:flex-grow-0 mr-2 sm:mr-0">
              <div className="h-2 bg-gray-200 rounded-full w-full sm:w-32 md:w-48">
                <div
                  className="h-2 bg-[#00bcd4] rounded-full"
                  style={{ width: `${calculateCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
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
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Video Player */}
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.videoId}?rel=0&color=white&modestbranding=1`}
                    title={currentVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentVideo.title}</h2>

                    <button
                      onClick={() => markAsCompleted(currentVideo._id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                        completedVideos.includes(currentVideo._id)
                          ? 'bg-green-500 text-white'
                          : 'border border-[#00bcd4] text-[#00bcd4] hover:bg-[#00bcd4] hover:text-white'
                      }`}
                    >
                      {completedVideos.includes(currentVideo._id) ? (
                        <>
                          <FaCheck className="w-4 h-4" />
                          Completed
                        </>
                      ) : (
                        'Mark as Completed'
                      )}
                    </button>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center mr-4">
                      <BiTime className="mr-1" />
                      <span>{currentVideo.duration}</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      Video {currentVideoIndex + 1} of {course.videos.length}
                    </span>
                    <a
                      href={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-blue-500 hover:text-blue-700 text-xs underline"
                    >
                      Open on YouTube
                    </a>
                  </div>

                  <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 mb-4">
                    Video ID: {currentVideo.videoId} • Part of course: {course.title}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {currentVideo.description}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 border-t border-gray-100 pt-4">
                    <button
                      onClick={handlePreviousVideo}
                      disabled={currentVideoIndex === 0}
                      className={`px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-all ${
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
                      className={`px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-all ${
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
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600">No videos available in this course.</p>
              </div>
            )}

            {/* Comment Section */}
            {currentVideo && (
              <div className="mt-6">
                <CommentSection videoId={currentVideo._id} type="video" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div
            className={`lg:w-1/3 xl:w-1/4 transition-all duration-300 ${
              showSidebar ? 'opacity-100 max-h-[2000px]' : 'lg:opacity-0 lg:max-h-0 lg:overflow-hidden'
            }`}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center">
                  <span className="bg-[#00bcd4] w-1 h-6 rounded mr-2 inline-block"></span>
                  Course Content
                </h3>

                <div className="mb-4 px-2">
                  <p className="text-gray-700 text-sm mb-2">Your Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div
                      className="bg-[#00bcd4] h-2.5 rounded-full"
                      style={{ width: `${calculateCompletionPercentage()}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {completedVideos.length} of {course.videos.length} videos completed
                  </p>
                </div>

                <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                  <ul className="divide-y divide-gray-100">
                    {course.videos.map((video, index) => (
                      <li key={video._id} className="py-3">
                        <button
                          onClick={() => handleVideoSelect(video, index)}
                          className={`flex items-start w-full text-left rounded-lg p-2 transition-all ${
                            currentVideoIndex === index
                              ? 'bg-gray-100 text-gray-900'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-1 mr-3 relative">
                            {completedVideos.includes(video._id) ? (
                              <div className="bg-green-500 rounded-full p-1">
                                <FaCheck className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className={`rounded-full p-1 ${currentVideoIndex === index ? 'bg-[#00bcd4]' : 'bg-gray-200'}`}>
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
                              currentVideoIndex === index ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{video.duration}</span>
                              {completedVideos.includes(video._id) && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-sm">Completed</span>
                              )}
                              {currentVideoIndex === index && !completedVideos.includes(video._id) && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm">Current</span>
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
    </div>
  );
};

export default CourseVideoPlayerPage;
