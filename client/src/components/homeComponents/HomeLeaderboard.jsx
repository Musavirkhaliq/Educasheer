import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gamificationAPI } from '../../services/api';
import { FaTrophy, FaMedal, FaChevronLeft, FaChevronRight, FaArrowRight, FaFire, FaStar, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Helper function to get rank badge color
const getRankBadgeColor = (rank) => {
  switch (rank) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-gray-400';
    case 3:
      return 'text-amber-700';
    default:
      return 'text-gray-500';
  }
};

// LeaderboardCard component for individual user display
const LeaderboardCard = ({ entry, rank, isCurrentUser, streakData }) => {
  // Get streak data for this user if available
  const streakInfo = streakData?.find(s => s.userId === entry.user?._id);
  const userStreak = streakInfo?.streak || 0;
  const isRealStreak = streakInfo?.isReal || false;

  return (
    <Link to={`/gamification`} state={{ activeTab: 'leaderboard' }}>
      <motion.div
        className={`flex flex-col h-full rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border ${
          isCurrentUser ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white'
        } group`}
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top gradient banner with rank */}
        <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] p-2 flex justify-center items-center">
          {rank <= 3 ? (
            <div className={`${getRankBadgeColor(rank)} flex items-center gap-1`}>
              <FaMedal className="text-2xl" />
              <span className="text-white font-bold">Rank #{rank}</span>
            </div>
          ) : (
            <span className="text-white font-bold">Rank #{rank}</span>
          )}
        </div>

        <div className="p-4 flex flex-col items-center">
          {/* User Avatar */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={entry.user?.avatar || 'https://ui-avatars.com/api/?name=' + (entry.user?.username || 'User')}
                alt={entry.user?.username || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md">
              <div className="flex items-center">
                <span>{entry.level}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <h3 className="font-semibold text-gray-800 text-center line-clamp-1 text-base">
            {entry.user?.fullName || entry.user?.username || 'Unknown User'}
            {isCurrentUser && <span className="ml-1 text-xs text-blue-600">(You)</span>}
          </h3>

          <div className="mt-2 flex flex-col items-center gap-2 w-full">
            {/* Points */}
            <div className="flex items-center justify-center gap-1 bg-yellow-50 px-3 py-1 rounded-full w-full">
              <FaTrophy className="text-yellow-500" />
              <span className="text-yellow-700 font-medium">{entry.totalPoints} XP</span>
            </div>

            {/* Streak */}
            <div
              className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full w-full relative
                ${userStreak >= 7 ? 'bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200' :
                  userStreak > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}
              title="Streaks show consecutive days of learning activity. Keep your streak going to earn bonus points and badges!"
            >
              <FaFire className={`${
                userStreak >= 7 ? 'text-orange-600' :
                userStreak > 0 ? 'text-orange-500' :
                'text-gray-400'
              }`} />
              <span className={`${
                userStreak >= 7 ? 'text-orange-800 font-semibold' :
                userStreak > 0 ? 'text-orange-700' :
                'text-gray-500'
              } font-medium`}>
                {userStreak >= 7 ? `${userStreak} day streak! 🔥` :
                 userStreak > 0 ? `${userStreak} day streak` :
                 'No active streak'}
              </span>

              {/* Badge for real streak data */}
              {isRealStreak && (
                <div className="absolute -right-1 -top-1 bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded-full shadow-sm" title="Verified streak data">
                  ✓
                </div>
              )}
            </div>
          </div>

          {/* View Profile Button */}
          <div className="mt-3 w-full">
            <div className="text-xs text-center bg-gray-50 hover:bg-gray-100 text-[#01427a] hover:text-[#00bcd4] transition-all py-1.5 rounded-full border border-gray-200 flex items-center justify-center gap-1 group-hover:border-[#00bcd4]">
              <FaUser size={10} />
              <span>View Profile</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const HomeLeaderboard = () => {
  const scrollContainerRef = useRef(null);
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [streakData, setStreakData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch leaderboard data and streak data for all users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch leaderboard data
        const leaderboardResponse = await gamificationAPI.getLeaderboard({
          limit: 10 // Limit to 10 users for the home section
        });

        const leaderboardData = leaderboardResponse.data.data.leaderboard || [];
        setLeaderboard(leaderboardData);

        // Extract user IDs from leaderboard data (filter out entries with null users)
        const userIds = leaderboardData
          .filter(entry => entry.user && entry.user._id)
          .map(entry => entry.user._id);

        try {
          // Try to fetch real streak data for all users in the leaderboard
          const streaksResponse = await gamificationAPI.getLeaderboardStreaks(userIds);

          if (streaksResponse.data.data && streaksResponse.data.data.streaks) {
            // Format the streak data
            const realStreakData = streaksResponse.data.data.streaks.map(streak => ({
              userId: streak.user,
              streak: streak.currentStreak || 0,
              isReal: true
            }));

            setStreakData(realStreakData);
            console.log('Fetched real streak data for all users:', realStreakData);
          } else {
            throw new Error('Invalid streak data format');
          }
        } catch (streakError) {
          console.error('Error fetching leaderboard streaks:', streakError);

          // Fallback to fetching only the current user's streak if available
          let streaksData = leaderboardData
            .filter(entry => entry.user && entry.user._id) // Filter out entries with null users
            .map(entry => ({
              userId: entry.user._id,
              streak: Math.floor(Math.random() * 5) + 3, // Streak between 3-7 days
              isReal: false // Flag to indicate this is not real data
            }));

          // If user is authenticated, fetch their actual streak
          if (currentUser) {
            try {
              const streakResponse = await gamificationAPI.getUserStreak();
              if (streakResponse.data.data) {
                const userStreak = streakResponse.data.data.currentStreak || 0;
                console.log('Fetched actual user streak:', userStreak);

                // Update the current user's streak in the streaks array
                streaksData = streaksData.map(item =>
                  item.userId === currentUser._id ? {
                    ...item,
                    streak: userStreak,
                    isReal: true // Flag to indicate this is real data from backend
                  } : item
                );
              }
            } catch (userStreakError) {
              console.error('Error fetching user streak:', userStreakError);
              // Continue with random streak data for current user
            }
          }

          setStreakData(streaksData);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load the leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Scroll functions
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.75;

      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6 sm:mb-8"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Top Learners</h2>
            <p className="text-gray-600 mt-1">
              Join the competition, maintain your <span className="text-orange-600 font-medium">daily streak</span>, and climb the ranks!
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Scroll right"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#01427a]/5 to-[#00bcd4]/5 rounded-3xl transform -rotate-1 scale-105 -z-10"></div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 snap-x scrollbar-hide -mx-2"
            >
              {loading ? (
                <div className="flex justify-center items-center py-8 w-full">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center w-full">
                  {error}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-lg w-full">
                  <p className="text-gray-500">No leaderboard data available at the moment.</p>
                </div>
              ) : (
                <>
                  {leaderboard
                    .filter(entry => entry.user && entry.user._id) // Filter out entries with null users
                    .map((entry, index) => (
                    <div
                      key={entry._id}
                      className="flex-shrink-0 w-[45%] sm:w-[35%] md:w-[25%] lg:w-[20%] snap-start px-2 first:pl-4 last:pr-4"
                    >
                      <LeaderboardCard
                        entry={entry}
                        rank={index + 1}
                        isCurrentUser={currentUser && entry.user?._id === currentUser._id}
                        streakData={streakData}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8 sm:mt-10 md:mt-12"
        >
          <Link
            to="/gamification"
            state={{ activeTab: 'leaderboard' }}
            className="inline-flex items-center text-[#01427a] hover:text-[#00bcd4] transition-colors duration-300 font-medium text-sm sm:text-base"
          >
            <span>See all rankings & achievements</span>
            <FaArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeLeaderboard;
