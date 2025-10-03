import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaTrophy, 
  FaCrown, 
  FaMedal, 
  FaAward,
  FaUser,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Constants for pagination
const ITEMS_PER_PAGE = 5;
const EXPANDED_ITEMS_PER_PAGE = 10;

const TestSeriesLeaderboard = ({ testSeriesId, className = '', onDataLoad }) => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [testSeriesId, currentPage, isExpanded]);

  const fetchLeaderboard = async (showLoading = true, page = currentPage) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      
      // Set parameters for API call with pagination
      const itemsPerPage = isExpanded ? EXPANDED_ITEMS_PER_PAGE : ITEMS_PER_PAGE;
      const params = { 
        limit: itemsPerPage,
        page: page
      };
      
      // Use public endpoint for logged out users, authenticated endpoint for logged in users
      const response = currentUser 
        ? await testSeriesAPI.getTestSeriesLeaderboard(testSeriesId, params)
        : await testSeriesAPI.getPublicTestSeriesLeaderboard(testSeriesId, params);
      
      const leaderboardData = response.data.data.leaderboard || [];
      const pagination = response.data.data.pagination || {};
      
      setLeaderboard(leaderboardData);
      setUserPosition(response.data.data.userPosition || null);
      setTotalEntries(pagination.totalEntries || 0);
      setHasNextPage(pagination.hasNext || false);
      setHasPrevPage(pagination.hasPrev || false);
      
      // Notify parent component about data load
      if (onDataLoad) {
        onDataLoad({
          participantCount: pagination.totalEntries || leaderboardData.length,
          userRank: response.data.data.userPosition?.rank || null
        });
      }
    } catch (err) {
      console.error('Error fetching test series leaderboard:', err);
      setError('Failed to load leaderboard');
      setLeaderboard([]);
      setTotalEntries(0);
      setHasNextPage(false);
      setHasPrevPage(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefreshLeaderboard = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    try {
      toast.loading('Refreshing leaderboard...');
      await testSeriesAPI.refreshLeaderboard(testSeriesId);
      toast.dismiss();
      toast.success('Leaderboard refreshed!');
      fetchLeaderboard();
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to refresh leaderboard');
      console.error('Error refreshing leaderboard:', err);
    }
  };

  const handleDebugLeaderboard = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    try {
      const response = await testSeriesAPI.debugLeaderboard(testSeriesId);
      console.log('Debug data:', response.data.data);
      toast.success('Debug data logged to console');
    } catch (err) {
      toast.error('Failed to get debug data');
      console.error('Error getting debug data:', err);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500 text-sm sm:text-base" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-sm sm:text-base" />;
    if (rank === 3) return <FaAward className="text-amber-600 text-sm sm:text-base" />;
    return <span className="text-gray-600 font-bold text-sm sm:text-base">{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-blue-400 to-blue-500';
  };

  const getSpecialStyling = (rank, isCurrentUser) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-[#00bcd4]/10 to-[#0097a7]/10 border-2 border-[#00bcd4] shadow-lg ring-2 ring-[#00bcd4]/20';
    }
    if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 shadow-lg';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 shadow-md';
    if (rank === 3) return 'bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-300 shadow-md';
    return 'bg-white/70 border border-gray-200 hover:bg-gray-50';
  };

  // Pagination handlers
  const handlePageChange = async (page) => {
    if (page === currentPage || loadingMore) return;
    setLoadingMore(true);
    setCurrentPage(page);
    await fetchLeaderboard(false, page);
    setLoadingMore(false);
  };

  const handleNextPage = () => {
    if (hasNextPage && !loadingMore) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage && !loadingMore) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleToggleExpanded = async () => {
    setLoadingMore(true);
    setIsExpanded(!isExpanded);
    setCurrentPage(1); // Reset to first page when toggling
    setLoadingMore(false);
  };

  // Calculate pagination info
  const itemsPerPage = isExpanded ? EXPANDED_ITEMS_PER_PAGE : ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  
  const isUserInDisplayed = currentUser && leaderboard.some(entry => entry.user.id === currentUser._id);
  const hasMultiplePages = totalPages > 1;

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-3 sm:p-6 ${className}`}>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500 text-base sm:text-xl" />
          <span className="hidden sm:inline">Test Series Leaderboard</span>
          <span className="sm:hidden">Leaderboard</span>
        </h3>
        <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-200">
          <div className="animate-pulse space-y-2 sm:space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 sm:w-1/3 mb-1"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/3 sm:w-1/4"></div>
                </div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16 flex-shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-3 sm:p-6 ${className}`}>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500 text-base sm:text-xl" />
          <span className="hidden sm:inline">Test Series Leaderboard</span>
          <span className="sm:hidden">Leaderboard</span>
        </h3>
        <div className="bg-red-50 rounded-xl p-4 sm:p-6 border border-red-200 text-center">
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if we should use embedded styling (no shadow/border)
  const isEmbedded = className.includes('shadow-none') || className.includes('border-0');
  const containerClasses = isEmbedded 
    ? `bg-transparent ${className}` 
    : `bg-white rounded-xl shadow-lg p-6 ${className}`;

  return (
    <div className={containerClasses}>
      {!isEmbedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaTrophy className="text-yellow-500 text-base sm:text-xl" />
            <span className="hidden sm:inline">Test Series Leaderboard</span>
            <span className="sm:hidden">Leaderboard</span>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {currentUser && currentUser.role === 'admin' && (
              <>
                <button
                  onClick={handleRefreshLeaderboard}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={handleDebugLeaderboard}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  Debug
                </button>
              </>
            )}
            {leaderboard.length === 0 && (
              <button
                onClick={() => fetchLeaderboard(false)}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
              >
                Refresh
              </button>
            )}
            <div className="text-xs sm:text-sm text-gray-500 hidden md:block">
              Every attempt counts!
            </div>
          </div>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 text-center">
          <FaTrophy className="text-gray-300 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
          <p className="text-gray-600 text-sm sm:text-base">No attempts yet</p>
          <p className="text-gray-500 text-xs sm:text-sm">Be the first to attempt tests in this series!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-6">
          {/* User's Position Card (if not in current page) */}
          {userPosition && currentUser && !isUserInDisplayed && (
            <div className="bg-gradient-to-r from-[#00bcd4]/5 to-[#0097a7]/5 rounded-xl p-3 sm:p-4 border-2 border-[#00bcd4]/20 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs sm:text-sm font-semibold text-[#00bcd4] flex items-center gap-1 sm:gap-2">
                  <FaUser className="text-xs" />
                  Your Position
                </h4>
                <span className="text-xs text-gray-500">Rank #{userPosition.rank}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00bcd4] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg flex-shrink-0">
                  {userPosition.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-base sm:text-lg">You</div>
                  <div className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="flex items-center gap-1">
                      <FaCheckCircle className="text-green-500 text-xs" />
                      {userPosition.completedQuizzes}/{userPosition.totalQuizzes} tests
                    </span>
                    <span>{userPosition.completionPercentage}% complete</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg sm:text-2xl font-bold text-[#00bcd4]">{userPosition.averagePercentage}%</div>
                  <div className="text-xs text-gray-600">Average Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Ranking Info */}
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-xs sm:text-sm text-blue-800">
                <strong>How ranking works:</strong> Based on average score, completion percentage, and efficiency. 
                <span className="hidden sm:inline">You don't need to complete all tests to appear on the leaderboard!</span>
              </div>
            </div>
          </div>

          {/* Top Performers Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500 text-sm sm:text-base" />
                    <span className="hidden sm:inline">Leaderboard</span>
                    <span className="sm:hidden">Rankings</span>
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleToggleExpanded}
                      disabled={loadingMore}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {isExpanded ? <FaCompress /> : <FaExpand />}
                      <span className="hidden sm:inline">{isExpanded ? 'Compact' : 'Expand'}</span>
                    </button>
                    
                    {userPosition && currentUser && !isUserInDisplayed && (
                      <button
                        onClick={() => {
                          const userPage = Math.ceil(userPosition.rank / itemsPerPage);
                          handlePageChange(userPage);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#00bcd4] text-white rounded-full hover:bg-[#0097a7] transition-colors"
                      >
                        <FaUser className="text-xs" />
                        <span className="hidden sm:inline">Find Me</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <span>
                    Showing {startIndex + 1}-{endIndex} of {totalEntries}
                  </span>
                  {hasMultiplePages && (
                    <span className="hidden sm:inline">
                      • Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="divide-y divide-gray-100 relative">
              {loadingMore && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaSpinner className="animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              )}
              {leaderboard.map((entry, index) => {
                const isCurrentUser = currentUser && entry.user.id === currentUser._id;
                const isTopThree = entry.rank <= 3;

                return (
                  <div
                    key={entry.user.id}
                    className={`p-2 sm:p-4 transition-all duration-200 ${getSpecialStyling(entry.rank, isCurrentUser)} ${isCurrentUser ? 'bg-[#00bcd4]/5' : 'hover:bg-gray-50'} touch-manipulation`}
                  >
                    {/* Mobile Layout (< sm) */}
                    <div className="sm:hidden">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 ${getRankBg(entry.rank)} rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
                          {isTopThree ? (
                            <div className="text-xs">
                              {entry.rank === 1 && <FaCrown className="text-yellow-200" />}
                              {entry.rank === 2 && <FaMedal className="text-gray-200" />}
                              {entry.rank === 3 && <FaAward className="text-amber-200" />}
                            </div>
                          ) : (
                            <span className="text-xs">{entry.rank}</span>
                          )}
                        </div>

                        {/* User Avatar */}
                        <div className={`w-8 h-8 ${isCurrentUser ? 'bg-[#00bcd4] ring-1 ring-[#00bcd4]/30' : 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
                          {entry.user.fullName?.charAt(0) || entry.user.username?.charAt(0) || 'U'}
                        </div>

                        {/* User Name */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-[#00bcd4]' : 'text-gray-800'}`}>
                            {entry.user.fullName || entry.user.username}
                            {isCurrentUser && <span className="ml-1 text-xs font-normal text-[#00bcd4]">(You)</span>}
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="text-right flex-shrink-0">
                          <div className={`text-lg font-bold ${isCurrentUser ? 'text-[#00bcd4]' : 'text-gray-800'}`}>
                            {entry.averagePercentage}%
                          </div>
                        </div>

                        {/* Trophy for top 3 */}
                        {isTopThree && (
                          <div className="flex-shrink-0">
                            {entry.rank === 1 && <FaTrophy className="text-yellow-500 text-lg animate-pulse" />}
                            {entry.rank === 2 && <FaMedal className="text-gray-400 text-lg" />}
                            {entry.rank === 3 && <FaAward className="text-amber-600 text-lg" />}
                          </div>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-xs text-gray-600 ml-10">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="text-green-500 text-xs" />
                            {entry.completedQuizzes}/{entry.totalQuizzes}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {Math.round(entry.averageTimePerQuiz / 60)}m
                          </span>
                        </div>
                        <span className="text-gray-500">
                          {entry.completionPercentage}% complete
                        </span>
                      </div>
                    </div>

                    {/* Desktop Layout (>= sm) */}
                    <div className="hidden sm:flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className={`w-10 h-10 ${getRankBg(entry.rank)} rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
                        {isTopThree ? getRankIcon(entry.rank) : entry.rank}
                      </div>

                      {/* User Avatar */}
                      <div className={`w-12 h-12 ${isCurrentUser ? 'bg-[#00bcd4] ring-2 ring-[#00bcd4]/30' : 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}>
                        {entry.user.fullName?.charAt(0) || entry.user.username?.charAt(0) || 'U'}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-base sm:text-lg truncate ${isCurrentUser ? 'text-[#00bcd4]' : 'text-gray-800'}`}>
                          {entry.user.fullName || entry.user.username}
                          {isCurrentUser && <span className="ml-2 text-xs sm:text-sm font-normal text-[#00bcd4]">(You)</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="text-green-500" />
                            {entry.completedQuizzes}/{entry.totalQuizzes} tests
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <FaClock />
                              {Math.round(entry.averageTimePerQuiz / 60)}m avg
                            </span>
                            <span className="text-gray-500">
                              {entry.completionPercentage}% complete
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="text-right flex-shrink-0">
                        <div className={`text-xl sm:text-2xl font-bold ${isCurrentUser ? 'text-[#00bcd4]' : 'text-gray-800'}`}>
                          {entry.averagePercentage}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Average Score
                        </div>
                      </div>

                      {/* Trophy for top 3 */}
                      {isTopThree && (
                        <div className="ml-2 flex-shrink-0">
                          {entry.rank === 1 && <FaTrophy className="text-yellow-500 text-2xl animate-pulse" />}
                          {entry.rank === 2 && <FaMedal className="text-gray-400 text-2xl" />}
                          {entry.rank === 3 && <FaAward className="text-amber-600 text-2xl" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {hasMultiplePages && (
              <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || loadingMore}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <FaChevronLeft className="text-xs" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loadingMore}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors touch-manipulation ${
                            pageNum === currentPage
                              ? 'bg-[#00bcd4] text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || loadingMore}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>

                {/* Mobile Page Info */}
                <div className="sm:hidden mt-2 text-center text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-1">
                <div className="text-xs sm:text-sm text-gray-600">
                  <span className="hidden sm:inline">Rankings based on average score, completion percentage, and efficiency</span>
                  <span className="sm:hidden">Rankings by score & completion</span>
                </div>
                <div className="text-xs text-gray-500">
                  {isExpanded ? `${EXPANDED_ITEMS_PER_PAGE} per page` : `${ITEMS_PER_PAGE} per page`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSeriesLeaderboard;