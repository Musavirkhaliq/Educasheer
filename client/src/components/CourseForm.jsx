import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaTrash } from 'react-icons/fa';

const CourseForm = ({ courseId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userVideos, setUserVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Uncategorized',
    level: 'Mixed',
    price: 0,
    originalPrice: 0,
    tags: '',
    isPublished: false
  });

  const categories = [
    'Uncategorized',
    'Mathematics',
    'Programming',
    'Science',
    'Languages',
    'Arts',
    'History',
    'Business',
    'Technology'
  ];

  const levels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Mixed'
  ];

  // Fetch user's videos
  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const response = await axios.get('/api/v1/videos/my/videos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        // Handle both response formats (array or object with videos property)
        const videosData = response.data.data.videos || response.data.data;
        console.log('Fetched videos:', videosData); // Debug log
        setUserVideos(videosData);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to fetch your videos. Please try again.');
      }
    };

    // If editing an existing course, fetch course details
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        const course = response.data.data;
        setFormData({
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          originalPrice: course.originalPrice,
          tags: course.tags.join(', '),
          isPublished: course.isPublished
        });

        // Set selected videos
        setSelectedVideos(course.videos.map(video => video._id));
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError('Failed to fetch course details. Please try again.');
      }
    };

    fetchUserVideos();
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleVideoSelection = (videoId) => {
    console.log('Video selection clicked:', videoId);
    console.log('Current selected videos:', selectedVideos);

    // Using functional update to ensure we're working with the latest state
    if (selectedVideos.includes(videoId)) {
      console.log('Removing video from selection');
      setSelectedVideos(prevSelected => prevSelected.filter(id => id !== videoId));
    } else {
      console.log('Adding video to selection');
      setSelectedVideos(prevSelected => [...prevSelected, videoId]);
    }

    // State updates are asynchronous, so we can't log the updated state immediately
    // We'll add a visual indicator in the UI instead
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('Form submission - Selected videos:', selectedVideos);
    console.log('Form submission - Form data:', formData);

    if (selectedVideos.length === 0) {
      console.error('No videos selected');
      setError('Please select at least one video for the course');
      setLoading(false);
      return;
    }

    try {
      // Validate videoIds to ensure they are valid MongoDB ObjectIds
      if (selectedVideos.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
        console.error('Invalid video ID format detected');
        setError('One or more selected videos have an invalid ID format');
        setLoading(false);
        return;
      }

      // Ensure price and originalPrice are valid numbers
      const price = parseFloat(formData.price) || 0;
      const originalPrice = parseFloat(formData.originalPrice) || price || 0;

      const courseData = {
        ...formData,
        price,
        originalPrice,
        videoIds: selectedVideos
      };

      console.log('Submitting course data:', courseData);

      let response;
      if (courseId) {
        // Update existing course
        console.log('Updating existing course:', courseId);
        response = await axios.patch(
          `/api/v1/courses/${courseId}`,
          courseData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        console.log('Course update response:', response.data);
        setSuccess('Course updated successfully!');
      } else {
        // Create new course
        console.log('Creating new course');
        response = await axios.post(
          '/api/v1/courses',
          courseData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        console.log('Course creation response:', response.data);
        setSuccess('Course created successfully!');
      }

      // After a short delay, redirect to the courses page
      setTimeout(() => {
        navigate('/courses');
      }, 2000);
    } catch (error) {
      console.error('Error saving course:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can create courses
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'tutor') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Access Denied!</strong>
        <span className="block sm:inline"> Only admins and tutors can create courses.</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{courseId ? 'Edit Course' : 'Create New Course'}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Course Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="level">
              Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originalPrice">
              Original Price ($) <span className="text-gray-500 text-xs">(for discounts)</span>
            </label>
            <input
              type="number"
              id="originalPrice"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
            Tags <span className="text-gray-500 text-xs">(comma separated)</span>
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. javascript, programming, web development"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700">Publish course immediately</span>
          </label>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Select Videos for Course *</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  console.log('Current selected videos:', selectedVideos);
                  alert(`Selected videos (${selectedVideos.length}): ${selectedVideos.join(', ')}`);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Debug Selection
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/v1/debug/validate-video-ids',
                      { videoIds: selectedVideos },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                      }
                    );
                    console.log('Video ID validation result:', response.data);
                    alert(`Validation result: ${JSON.stringify(response.data.data, null, 2)}`);
                  } catch (error) {
                    console.error('Error validating video IDs:', error);
                    alert('Error validating video IDs: ' + (error.response?.data?.message || error.message));
                  }
                }}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Validate IDs
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-4">Select at least one video to include in your course. The first video's thumbnail will be used as the course thumbnail.</p>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Selected Videos: {selectedVideos.length}</p>
                <p className="text-sm">Click on a video to select/deselect it. Selected videos will be highlighted.</p>
              </div>
              {selectedVideos.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all selected videos?')) {
                      setSelectedVideos([]);
                    }
                  }}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {userVideos.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">You don't have any videos yet. Please upload videos first.</span>
              <button
                onClick={() => window.location.href = '/videos/upload'}
                className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Upload a Video
              </button>
              <button
                onClick={() => {
                  const fetchVideos = async () => {
                    try {
                      const response = await axios.get('/api/v1/videos/my/videos', {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                      });
                      console.log('Debug - API Response:', response.data);
                      alert('Check console for video data');
                    } catch (error) {
                      console.error('Debug - Error:', error);
                      alert('Error: ' + (error.response?.data?.message || error.message));
                    }
                  };
                  fetchVideos();
                }}
                className="mt-3 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Debug Videos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userVideos.map((video) => (
                <div
                  key={video._id}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedVideos.includes(video._id)
                      ? 'border-blue-500 shadow-md bg-blue-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleVideoSelection(video._id)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    {selectedVideos.includes(video._id) && (
                      <div className="absolute top-0 left-0 w-full h-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white p-2 rounded-full">
                          <FaPlus className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 ${selectedVideos.includes(video._id) ? 'bg-blue-50' : ''}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800 truncate">{video.title}</h4>
                      {selectedVideos.includes(video._id) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Selected</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{video.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading || userVideos.length === 0 || selectedVideos.length === 0}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              (loading || userVideos.length === 0 || selectedVideos.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : (
              courseId
                ? `Update Course (${selectedVideos.length} videos)`
                : `Create Course (${selectedVideos.length} videos)`
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
