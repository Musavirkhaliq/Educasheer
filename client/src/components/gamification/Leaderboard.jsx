import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';
import { FaTrophy, FaMedal, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Leaderboard = () => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await gamificationAPI.getLeaderboard({
          page: pagination.page,
          limit: pagination.limit
        });
        
        setLeaderboard(response.data.data.leaderboard);
        setPagination(response.data.data.pagination);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load the leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [pagination.page, pagination.limit]);

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white p-6">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <p className="text-white/80">See who's leading the way in learning!</p>
      </div>

      <div className="p-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <FaTrophy className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Leaderboard Data Yet</h3>
            <p className="text-gray-500">Be the first to earn points and top the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const rank = (pagination.page - 1) * pagination.limit + index + 1;
              const isCurrentUser = currentUser && entry.user._id === currentUser._id;
              
              return (
                <motion.div
                  key={entry._id}
                  className={`flex items-center p-4 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-white border border-gray-200'
                  } hover:shadow-md transition-shadow`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {rank <= 3 ? (
                      <div className={`mx-auto ${getRankBadgeColor(rank)}`}>
                        <FaMedal className="text-2xl" />
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-500">#{rank}</span>
                    )}
                  </div>
                  
                  {/* User info */}
                  <div className="flex-shrink-0 ml-2">
                    <img
                      src={entry.user.avatar}
                      alt={entry.user.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";
                      }}
                    />
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h3 className={`font-medium ${isCurrentUser ? 'text-blue-800' : 'text-gray-800'}`}>
                          {entry.user.fullName}
                          {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                        </h3>
                        <p className="text-sm text-gray-500">@{entry.user.username}</p>
                      </div>
                      
                      <div className="mt-2 sm:mt-0 flex items-center">
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mr-2">
                          Level {entry.level}
                        </div>
                        <div className="font-bold text-gray-700">
                          {entry.totalPoints} pts
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`flex items-center px-4 py-2 border rounded-md ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaChevronLeft className="mr-2" />
              Previous
            </button>
            
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`flex items-center px-4 py-2 border rounded-md ${
                pagination.page === pagination.pages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
              <FaChevronRight className="ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for rank badge colors
const getRankBadgeColor = (rank) => {
  switch (rank) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-gray-400';
    case 3:
      return 'text-amber-600';
    default:
      return 'text-gray-500';
  }
};

export default Leaderboard;
