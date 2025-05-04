import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamificationAPI } from '../../services/api';
import { FaStar, FaFire, FaTrophy, FaMedal } from 'react-icons/fa';
import { motion } from 'framer-motion';

const GamificationWidget = () => {
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const response = await gamificationAPI.getUserProfile();
        setGamificationData(response.data.data);
      } catch (error) {
        console.error('Error fetching gamification data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return null;
  }

  const { points, streak, badges = [] } = gamificationData;
  const displayBadges = badges.slice(0, 3);
  const progressPercentage = Math.min(100, Math.round((points?.currentLevelPoints / points?.pointsToNextLevel) * 100));

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] p-4 text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Level {points?.level || 1}</h3>
          <div className="flex items-center">
            <FaStar className="text-yellow-300 mr-1" />
            <span>{points?.totalPoints || 0} pts</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 text-white/80">
            <span>{points?.currentLevelPoints || 0}/{points?.pointsToNextLevel || 100} XP</span>
            <span>{progressPercentage}%</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Streak */}
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 rounded-full text-orange-500 mr-3">
            <FaFire />
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Streak</p>
            <p className="font-medium">{streak?.currentStreak || 0} days</p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <FaMedal className="text-purple-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">Recent Badges</h4>
          </div>
          
          {displayBadges.length > 0 ? (
            <div className="flex space-x-2">
              {displayBadges.map((userBadge) => (
                <div 
                  key={userBadge._id} 
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  title={userBadge.badge.name}
                >
                  <img 
                    src={userBadge.badge.icon} 
                    alt={userBadge.badge.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=B&background=0D8ABC&color=fff";
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No badges earned yet</p>
          )}
        </div>
        
        {/* Active Challenges */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <FaTrophy className="text-yellow-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">Active Challenges</h4>
          </div>
          
          {gamificationData.challenges && gamificationData.challenges.length > 0 ? (
            <div className="text-sm text-gray-600">
              {gamificationData.challenges[0].challenge.title}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] h-1.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.round((gamificationData.challenges[0].progress / gamificationData.challenges[0].challenge.criteria.targetCount) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active challenges</p>
          )}
        </div>
        
        {/* View Profile Link */}
        <Link 
          to="/gamification"
          className="block w-full text-center py-2 bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
        >
          View Full Profile
        </Link>
      </div>
    </motion.div>
  );
};

export default GamificationWidget;
