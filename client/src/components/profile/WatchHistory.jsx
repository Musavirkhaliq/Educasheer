import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../../services/api';
import { FaPlay, FaTrash, FaClock, FaExclamationCircle } from 'react-icons/fa';

const WatchHistory = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch watch history
  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        const response = await profileAPI.getWatchHistory();
        setWatchHistory(response.data.data || []);
      } catch (error) {
        console.error('Error fetching watch history:', error);
        setError('Failed to load watch history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchHistory();
  }, []);

  // Clear watch history
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your watch history?')) {
      return;
    }

    try {
      // This endpoint might not exist yet, you may need to implement it
      await axios.delete('/api/v1/users/watch-history');
      setWatchHistory([]);
    } catch (error) {
      console.error('Error clearing watch history:', error);
      alert('Failed to clear watch history. Please try again later.');
    }
  };

  // Remove a single item from watch history
  const handleRemoveFromHistory = async (videoId) => {
    try {
      // This endpoint might not exist yet, you may need to implement it
      await axios.delete(`/api/v1/users/watch-history/${videoId}`);
      setWatchHistory(watchHistory.filter(video => video._id !== videoId));
    } catch (error) {
      console.error('Error removing video from history:', error);
      alert('Failed to remove video from history. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (watchHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <FaClock className="text-gray-400 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Your watch history is empty</h3>
        <p className="text-gray-500 mb-6">Videos you watch will appear here</p>
        <Link
          to="/videos"
          className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
        >
          Browse Videos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Watch History</h2>
        <button
          onClick={handleClearHistory}
          className="text-red-600 hover:text-red-800 font-medium flex items-center"
        >
          <FaTrash className="mr-2" />
          Clear All History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchHistory.map((video) => (
          <div key={video._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <Link to={`/videos/${video._id}`} className="block">
              <div className="relative h-40 bg-gray-200">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <FaPlay className="text-gray-400 text-4xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-[#00bcd4] rounded-full p-3 text-white">
                    <FaPlay />
                  </div>
                </div>
              </div>
            </Link>

            <div className="p-4">
              <Link to={`/videos/${video._id}`} className="block">
                <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 hover:text-[#00bcd4]">
                  {video.title}
                </h3>
              </Link>

              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>{video.owner?.fullName || 'Unknown Creator'}</span>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFromHistory(video._id);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove from history"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchHistory;
