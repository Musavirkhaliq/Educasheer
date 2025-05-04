import React from 'react';
import { FaTrophy, FaExclamationCircle, FaCheck, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Challenges = ({ challenges = [], showAll = false }) => {
  // Filter active challenges
  const activeUserChallenges = challenges.filter(uc => !uc.isCompleted);
  
  // If no challenges, show empty state
  if (activeUserChallenges.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FaExclamationCircle className="text-gray-400 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Active Challenges</h3>
        <p className="text-gray-500">Check back later for new challenges!</p>
      </div>
    );
  }

  // Display challenges to show (all or just the first few)
  const displayChallenges = showAll ? activeUserChallenges : activeUserChallenges.slice(0, 3);

  return (
    <div className="space-y-4">
      {displayChallenges.map((userChallenge) => {
        const challenge = userChallenge.challenge;
        const progress = userChallenge.progress;
        const target = challenge.criteria.targetCount;
        const progressPercentage = Math.min(100, Math.round((progress / target) * 100));
        
        // Calculate time remaining
        const endDate = new Date(challenge.endDate);
        const now = new Date();
        const timeRemaining = endDate - now;
        const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
        
        return (
          <motion.div
            key={userChallenge._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className={`p-4 ${getChallengeTypeColor(challenge.type)}`}>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">{challenge.title}</h3>
                <div className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                  {formatChallengeType(challenge.type)}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-700 text-sm mb-4">{challenge.description}</p>
              
              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress: {progress}/{target}</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] h-2.5 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Reward info */}
              <div className="flex items-center text-sm text-gray-600 mt-3">
                <FaTrophy className="text-yellow-500 mr-2" />
                <span>Reward: {challenge.reward.points} points</span>
                {challenge.reward.badge && (
                  <span className="ml-2">+ Badge</span>
                )}
              </div>
              
              {/* Time remaining */}
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <FaClock className="mr-1" />
                <span>
                  {daysRemaining > 0 
                    ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining` 
                    : 'Ending today'}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Helper functions
const getChallengeTypeColor = (type) => {
  switch (type) {
    case 'daily':
      return 'bg-gradient-to-r from-blue-500 to-blue-700';
    case 'weekly':
      return 'bg-gradient-to-r from-purple-500 to-purple-700';
    case 'monthly':
      return 'bg-gradient-to-r from-green-500 to-green-700';
    case 'special':
      return 'bg-gradient-to-r from-[#00bcd4] to-[#01427a]';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-700';
  }
};

const formatChallengeType = (type) => {
  switch (type) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'special':
      return 'Special';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export default Challenges;
