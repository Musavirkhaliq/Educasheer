import React from 'react';
import { FaFire, FaTrophy, FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';

const StreakCalendar = ({ streak }) => {
  if (!streak) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FaExclamationCircle className="text-gray-400 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Streak Data Available</h3>
        <p className="text-gray-500">Start learning to build your streak!</p>
      </div>
    );
  }

  // Get dates for the last 30 days
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  }).reverse();

  // Create a map of activity dates for quick lookup
  const activityDatesMap = new Map();
  if (streak.streakHistory && streak.streakHistory.length > 0) {
    streak.streakHistory.forEach(history => {
      const date = new Date(history.date);
      date.setHours(0, 0, 0, 0);
      activityDatesMap.set(date.getTime(), history.activities);
    });
  }

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-4 bg-orange-500 rounded-full text-white mr-5">
              <FaFire className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Current Streak</h3>
              <p className="text-3xl font-bold text-orange-900">{streak.currentStreak} days</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-4 bg-purple-500 rounded-full text-white mr-5">
              <FaTrophy className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Longest Streak</h3>
              <p className="text-3xl font-bold text-purple-900">{streak.longestStreak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center">
          <FaCalendarAlt className="text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Activity Calendar</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {/* Day labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {last30Days.map(date => {
              const dateTime = date.getTime();
              const hasActivity = activityDatesMap.has(dateTime);
              const activities = hasActivity ? activityDatesMap.get(dateTime) : [];
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <div 
                  key={dateTime} 
                  className={`aspect-square rounded-md flex flex-col items-center justify-center ${
                    isToday 
                      ? 'border-2 border-[#00bcd4]' 
                      : 'border border-gray-200'
                  } ${
                    hasActivity 
                      ? 'bg-gradient-to-br from-orange-50 to-orange-100' 
                      : 'bg-gray-50'
                  }`}
                >
                  <span className={`text-xs font-medium ${hasActivity ? 'text-orange-800' : 'text-gray-500'}`}>
                    {date.getDate()}
                  </span>
                  
                  {hasActivity && (
                    <div className="mt-1 flex justify-center">
                      <FaFire className="text-orange-500 text-xs" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Types</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Video Watch</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Course Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Quiz</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Comment</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Login</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
