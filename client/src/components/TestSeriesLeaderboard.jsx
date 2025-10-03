import React, { useState, useEffect } from 'react';
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
  FaEye
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const TestSeriesLeaderboard = ({ testSeriesId, className = '', onDataLoad }) => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [testSeriesId]);

  const fetchLeaderboard = async (showLoading = true, fetchAll = false) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      
      // Set parameters for API call
      const params = fetchAll ? { limit: 1000 } : { limit: 50 }; // Fetch more when showing all
      
      // Use public endpoint for logged out users, authenticated endpoint for logged in users
      const response = currentUser 
        ? await testSeriesAPI.getTestSeriesLeaderboard(testSeriesId, params)
        : await testSeriesAPI.getPublicTestSeriesLeaderboard(testSeriesId, params);
      
      const leaderboardData = response.data.data.leaderboard || [];
      setLeaderboard(leaderboardData);
      setUserPosition(response.data.data.userPosition || null);
      
      // Notify parent component about data load
      if (onDataLoad) {
        onDataLoad({
          participantCount: leaderboardData.length,
          userRank: response.data.data.userPosition?.rank || null
        });
      }
    } catch (err) {
      console.error('Error fetching test series leaderboard:', err);
      setError('Failed to load leaderboard');
      setLeaderboard([]);
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

  const handleShowMore = async () => {
    if (!showAll && leaderboard.length <= 50) {
      // If we haven't fetched all data yet, fetch it
      setLoadingMore(true);
      await fetchLeaderboard(false, true);
      setLoadingMore(false);
    }
    setShowAll(!showAll);
    setDisplayLimit(showAll ? 10 : leaderboard.length);
  };

  const displayedLeaderboard = showAll ? leaderboard : leaderboard.slice(0, 10);
  const isUserInTop10 = currentUser && leaderboard.slice(0, 10).some(entry => entry.user.id === currentUser._id);
  const hasMoreEntries = leaderboard.length > 10;

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          Test Series Leaderboard
        </h3>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          Test Series Leaderboard
        </h3>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="mt-3 text-red-600 hover:text-red-800 font-medium"
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Test Series Leaderboard
          </h3>
          <div className="flex items-center gap-2">
            {currentUser && currentUser.role === 'admin' && (
              <>
                <button
                  onClick={handleRefreshLeaderboard}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Refresh
                </button>
                <button
                  onClick={handleDebugLeaderboard}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  Debug
                </button>
              </>
            )}
            {leaderboard.length === 0 && (
              <button
                onClick={() => fetchLeaderboard(false)}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Refresh
              </button>
            )}
            <div className="text-sm text-gray-500 hidden sm:block">
              Every attempt counts!
            </div>
          </div>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
          <FaTrophy className="text-gray-300 text-4xl mx-auto mb-3" />
          <p className="text-gray-600">No attempts yet</p>
          <p className="text-gray-500 text-sm">Be the first to attempt tests in this series!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User's Position Card (if not in top 10) */}
          {userPosition && currentUser && !isUserInTop10 && (
            <div className="bg-gradient-to-r from-[#00bcd4]/5 to-[#0097a7]/5 rounded-xl p-4 border-2 border-[#00bcd4]/20 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[#00bcd4] flex items-center gap-2">
                  <FaUser className="text-xs" />
                  Your Position
                </h4>
                <span className="text-xs text-gray-500">Rank #{userPosition.rank}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00bcd4] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {userPosition.rank}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-lg">You</div>
                  <div className="text-sm text-gray-600 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FaCheckCircle className="text-green-500" />
                      {userPosition.completedQuizzes}/{userPosition.totalQuizzes} tests
                    </span>
                    <span>{userPosition.completionPercentage}% complete</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#00bcd4]">{userPosition.averagePercentage}%</div>
                  <div className="text-xs text-gray-600">Average Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Ranking Info */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <strong>How ranking works:</strong> Based on average score, completion percentage, and efficiency. 
                You don't need to complete all tests to appear on the leaderboard!
              </div>
            </div>
          </div>

          {/* Top Performers Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  {showAll ? 'All Participants' : 'Top 10 Leaderboard'}
                </h4>
                <div className="text-sm text-gray-600">
                  {leaderboard.length} total participants
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="divide-y divide-gray-100">
              {displayedLeaderboard.map((entry, index) => {
                const isCurrentUser = currentUser && entry.user.id === currentUser._id;
                const isTopThree = entry.rank <= 3;

                return (
                  <div
                    key={entry.user.id}
                    className={`p-4 transition-all duration-200 ${getSpecialStyling(entry.rank, isCurrentUser)} ${isCurrentUser ? 'bg-[#00bcd4]/5' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
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

            {/* Show More/Less Button */}
            {hasMoreEntries && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="text-sm animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FaEye className="text-sm" />
                      {showAll ? (
                        <>
                          Show Top 10 Only
                          <FaChevronUp className="text-sm" />
                        </>
                      ) : (
                        <>
                          Show All {leaderboard.length}+ Participants
                          <FaChevronDown className="text-sm" />
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Footer Info */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                Rankings based on average score, completion percentage, and efficiency
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSeriesLeaderboard;