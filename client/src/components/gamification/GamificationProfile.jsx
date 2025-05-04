import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';
import { FaTrophy, FaMedal, FaFire, FaStar, FaChartLine } from 'react-icons/fa';
import BadgeDisplay from './BadgeDisplay';
import PointsHistory from './PointsHistory';
import StreakCalendar from './StreakCalendar';
import Challenges from './Challenges';
import LevelProgress from './LevelProgress';

const GamificationProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchGamificationProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching gamification profile...');
        const response = await gamificationAPI.getUserProfile();
        setProfile(response.data.data);
        console.log('Gamification profile updated:', response.data.data);

        // Log streak information specifically
        if (response.data.data.streak) {
          console.log('Current streak:', response.data.data.streak.currentStreak);
          console.log('Longest streak:', response.data.data.streak.longestStreak);
          console.log('Last activity date:', response.data.data.streak.lastActivityDate);
        }
      } catch (err) {
        console.error('Error fetching gamification profile:', err);
        setError('Failed to load your gamification profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on mount
    fetchGamificationProfile();

    // Then set up a refresh interval (every 30 seconds)
    const refreshInterval = setInterval(fetchGamificationProfile, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
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

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No gamification data available.</p>
      </div>
    );
  }

  const { points, badges, streak, challenges, leaderboardPosition } = profile;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'badges', label: 'Badges', icon: FaMedal },
    { id: 'history', label: 'Points History', icon: FaStar },
    { id: 'streak', label: 'Streak', icon: FaFire },
    { id: 'challenges', label: 'Challenges', icon: FaTrophy },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with level and points */}
      <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">Level {points.level}</h2>
            <p className="text-white/80">
              {points.totalPoints} total points • Rank #{leaderboardPosition}
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <LevelProgress
              currentPoints={points.currentLevelPoints}
              pointsToNextLevel={points.pointsToNextLevel}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-6 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#00bcd4] border-b-2 border-[#00bcd4]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full text-white mr-4">
                    <FaStar />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Total Points</h3>
                    <p className="text-2xl font-bold text-blue-900">{points.totalPoints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500 rounded-full text-white mr-4">
                    <FaFire />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800">Current Streak</h3>
                    <p className="text-2xl font-bold text-orange-900">{streak?.currentStreak || 0} days</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-full text-white mr-4">
                    <FaMedal />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-800">Badges Earned</h3>
                    <p className="text-2xl font-bold text-purple-900">{badges?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Badges */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Badges</h3>
              <BadgeDisplay badges={badges?.slice(0, 5) || []} />
            </div>

            {/* Active Challenges */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Active Challenges</h3>
              <Challenges challenges={challenges?.slice(0, 3) || []} />
            </div>
          </div>
        )}

        {activeTab === 'badges' && <BadgeDisplay badges={badges || []} showAll={true} />}

        {activeTab === 'history' && <PointsHistory userId={profile.user._id} />}

        {activeTab === 'streak' && <StreakCalendar streak={streak} />}

        {activeTab === 'challenges' && <Challenges challenges={challenges || []} showAll={true} />}
      </div>
    </div>
  );
};

export default GamificationProfile;
