import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMedal, FaInfoCircle } from 'react-icons/fa';

const BadgeDisplay = ({ badges = [], showAll = false }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  // If no badges, show empty state
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FaMedal className="text-gray-400 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Badges Yet</h3>
        <p className="text-gray-500">Complete activities to earn your first badge!</p>
      </div>
    );
  }

  // Display badges to show (all or just the first few)
  const displayBadges = showAll ? badges : badges.slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayBadges.map((userBadge) => {
          const badge = userBadge.badge;
          return (
            <motion.div
              key={userBadge._id}
              className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedBadge(userBadge)}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${getBadgeBgColor(badge.category)}`}>
                <img 
                  src={badge.icon} 
                  alt={badge.name} 
                  className="w-10 h-10"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?name=Badge&background=0D8ABC&color=fff";
                  }}
                />
              </div>
              <h3 className="text-sm font-medium text-center text-gray-800">{badge.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(userBadge.earnedAt).toLocaleDateString()}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Badge details modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className={`p-6 ${getBadgeBgColor(selectedBadge.badge.category)}`}>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white">{selectedBadge.badge.name}</h2>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="text-white hover:text-gray-200"
                >
                  &times;
                </button>
              </div>
              <div className="flex justify-center my-4">
                <div className="w-24 h-24 rounded-full bg-white p-2 flex items-center justify-center">
                  <img 
                    src={selectedBadge.badge.icon} 
                    alt={selectedBadge.badge.name} 
                    className="w-16 h-16"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=Badge&background=0D8ABC&color=fff";
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">{selectedBadge.badge.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FaInfoCircle className="mr-2" />
                <span>Level {selectedBadge.badge.level} {getCategoryName(selectedBadge.badge.category)} Badge</span>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}</p>
                {selectedBadge.badge.pointsAwarded > 0 && (
                  <p className="mt-1">Awarded {selectedBadge.badge.pointsAwarded} points</p>
                )}
              </div>
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-6 w-full py-2 bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Helper functions for badge styling
const getBadgeBgColor = (category) => {
  switch (category) {
    case 'course':
      return 'bg-gradient-to-r from-blue-500 to-blue-700';
    case 'video':
      return 'bg-gradient-to-r from-red-500 to-red-700';
    case 'quiz':
      return 'bg-gradient-to-r from-green-500 to-green-700';
    case 'attendance':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-700';
    case 'blog':
      return 'bg-gradient-to-r from-purple-500 to-purple-700';
    case 'social':
      return 'bg-gradient-to-r from-pink-500 to-pink-700';
    case 'special':
      return 'bg-gradient-to-r from-[#00bcd4] to-[#01427a]';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-700';
  }
};

const getCategoryName = (category) => {
  switch (category) {
    case 'course':
      return 'Course';
    case 'video':
      return 'Video';
    case 'quiz':
      return 'Quiz';
    case 'attendance':
      return 'Attendance';
    case 'blog':
      return 'Blog';
    case 'social':
      return 'Social';
    case 'special':
      return 'Special';
    default:
      return 'General';
  }
};

export default BadgeDisplay;
