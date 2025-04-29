import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEye, FaClock, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './comments';

const VideoDetail = () => {
  const { videoId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/v1/videos/${videoId}`);
        setVideo(response.data.data);
      } catch (error) {
        console.error('Error fetching video:', error);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const handleDeleteVideo = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      navigate('/videos');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  // Check if user can edit/delete the video
  const canManageVideo = () => {
    if (!currentUser || !video) return false;

    // Admin can manage all videos
    if (currentUser.role === 'admin') return true;

    // Video owner can manage their videos
    if (video.owner && video.owner._id === currentUser._id) return true;

    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Video not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {video.title}
            </h1>

            {canManageVideo() && (
              <div className="flex space-x-2">
                <Link
                  to={`/videos/edit/${video._id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={handleDeleteVideo}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center mr-4">
              <FaEye className="mr-1" />
              <span>{video.views} views</span>
            </div>
            <div className="flex items-center mr-4">
              <FaClock className="mr-1" />
              <span>{video.duration}</span>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {video.category}
            </span>
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 text-blue-500 hover:text-blue-700 text-xs underline"
            >
              Open on YouTube
            </a>
          </div>

          <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 mb-4">
            Video ID: {video.videoId} • Added on {new Date(video.createdAt).toLocaleDateString()}
          </div>

          {video.owner && (
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img
                  src={video.owner.avatar || 'https://via.placeholder.com/40'}
                  alt={video.owner.fullName || video.owner.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {video.owner.fullName || video.owner.username}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {video.description}
            </p>
          </div>

          {video.tags && video.tags.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection videoId={video._id} type="video" />
    </div>
  );
};

export default VideoDetail;
