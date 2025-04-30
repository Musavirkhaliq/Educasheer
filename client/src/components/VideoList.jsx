import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlay, FaEye, FaTrash, FaEdit, FaUser, FaPlus, FaClock } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { FiVideo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// VideoCard component for individual video display
const VideoCard = ({ video, showControls, onDelete, showOwner = true }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <Link to={`/videos/${video._id}`} className="block relative">
        <div className="overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 w-full">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              Watch Video
            </span>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <FaEye className="w-3 h-3" />
            <span>{video.views || 0} views</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <BiTime className="w-3 h-3" />
            <span>{video.duration}</span>
          </div>
        </div>

        <Link to={`/videos/${video._id}`}>
          <h3 className="font-semibold text-lg mb-3 text-gray-800 hover:text-[#00bcd4] transition-colors line-clamp-2">{video.title}</h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {video.description}
        </p>

        <div className="flex items-center justify-between">
          {showOwner && video.owner && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={video.owner.avatar || 'https://via.placeholder.com/40'}
                  alt={video.owner.fullName || video.owner.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700">{video.owner.fullName || video.owner.username}</span>
            </div>
          )}

          <div className="flex items-center">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {video.category}
            </span>
          </div>
        </div>

        {showControls && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
            <Link
              to={`/videos/edit/${video._id}`}
              className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FaEdit className="inline mr-1" /> Edit
            </Link>
            <button
              onClick={() => onDelete(video._id)}
              className="text-sm px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <FaTrash className="inline mr-1" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoList = ({
  category,
  limit,
  showOwner = true,
  userId = null,
  showControls = false,
  showCreateButton = false,
  title = "Videos",
  watchedOnly = false
}) => {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        let url = '/api/v1/videos';
        const params = {};

        if (category) {
          params.category = category;
        }

        if (limit) {
          params.limit = limit;
        }

        if (userId) {
          url = `/api/v1/videos/user/${userId}`;
        } else if (showControls) {
          url = '/api/v1/videos/my/videos';
        } else if (watchedOnly) {
          // This endpoint would need to be implemented in the backend
          url = '/api/v1/videos/my/watched';
        }

        const response = await axios.get(url, {
          params,
          headers: (showControls || watchedOnly) ? {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          } : {}
        });

        setVideos(response.data.data.videos || response.data.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [category, limit, userId, showControls, watchedOnly]);

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Remove the deleted video from the list
      setVideos(videos.filter(video => video._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold inline-block relative">
          {title}
          <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#00bcd4] rounded-full"></span>
        </h2>

        {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
          <Link
            to="/videos/upload"
            className="flex items-center bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors duration-300"
          >
            <FaPlus className="mr-2" />
            <span>Add Video</span>
          </Link>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <FiVideo className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">
            {showCreateButton ? "You haven't uploaded any videos yet." : "There are no videos available at the moment."}
          </p>
          {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
            <Link
              to="/videos/upload"
              className="inline-block bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
            >
              Upload Your First Video
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              showControls={showControls}
              onDelete={handleDeleteVideo}
              showOwner={showOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoList;
