import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const VideoUploadForm = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    category: 'Uncategorized',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);

  // Check if user is authorized to upload videos
  const canUploadVideos = currentUser?.role === 'admin' || currentUser?.role === 'tutor';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // If changing video URL, try to extract video ID for preview
    if (name === 'videoUrl') {
      const videoId = extractYouTubeId(value);
      if (videoId) {
        setVideoPreview(videoId);
      } else {
        setVideoPreview(null);
      }
    }
  };

  // Helper function to extract YouTube video ID
  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate YouTube URL
      const videoId = extractYouTubeId(formData.videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Show a message that we're fetching video details
      setSuccess('Fetching video details from YouTube...');

      const response = await axios.post(
        '/api/v1/videos',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setSuccess('Video added successfully! The details were automatically fetched from YouTube.');
      setFormData({
        videoUrl: '',
        title: '',
        description: '',
        category: 'Uncategorized',
        tags: ''
      });
      setVideoPreview(null);

      // After a short delay, redirect to the videos page
      setTimeout(() => {
        window.location.href = '/videos';
      }, 2000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to add video. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!canUploadVideos) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized</h2>
        <p className="text-gray-600 mb-4">
          Only tutors and administrators can upload videos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add a New Video</h2>
      <p className="text-gray-600 mb-6">
        Add a YouTube video by providing the URL. The system will automatically fetch the title, description, thumbnail, and duration from YouTube.
      </p>

      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Automatic YouTube Data Fetching</p>
        <p>When you submit a YouTube URL, the system will:</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Extract the video ID from the URL</li>
          <li>Fetch the video title, description, and thumbnail from YouTube</li>
          <li>Store all the information in the database</li>
        </ul>
        <p className="mt-2">You can optionally provide your own title and description if you want to override the YouTube data.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="videoUrl" className="block text-gray-700 font-medium mb-2">
            YouTube Video URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </div>

        {videoPreview && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Preview</label>
            <div className="aspect-video w-full max-w-md mx-auto bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoPreview}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title (Optional - will use YouTube title if empty)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Video title"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description (Optional - will use YouTube description if empty)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Video description"
            rows="3"
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
          >
            <option value="Uncategorized">Uncategorized</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Programming">Programming</option>
            <option value="Science">Science</option>
            <option value="Languages">Languages</option>
            <option value="Arts">Arts</option>
            <option value="History">History</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="math, algebra, equations"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#00bcd4] text-white py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Adding Video..." : "Add Video"}
        </button>
      </form>
    </div>
  );
};

export default VideoUploadForm;
