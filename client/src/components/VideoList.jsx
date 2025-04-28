import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlay, FaEye, FaTrash, FaEdit, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const VideoList = ({ category, limit, showOwner = true, userId = null, showControls = false }) => {
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
        }
        
        const response = await axios.get(url, { 
          params,
          headers: showControls ? {
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
  }, [category, limit, userId, showControls]);

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

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No videos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Link 
                to={`/videos/${video._id}`} 
                className="bg-[#00bcd4] text-white p-3 rounded-full"
              >
                <FaPlay />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {video.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {video.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {showOwner && video.owner && (
                  <div className="flex items-center">
                    <FaUser className="mr-1" />
                    <span>{video.owner.fullName || video.owner.username}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <FaEye className="mr-1" />
                  <span>{video.views} views</span>
                </div>
              </div>
              
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {video.category}
              </span>
            </div>
            
            {showControls && (
              <div className="mt-4 flex justify-end space-x-2">
                <Link 
                  to={`/videos/edit/${video._id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <FaEdit />
                </Link>
                <button 
                  onClick={() => handleDeleteVideo(video._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;
