import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaClock, 
  FaQuestionCircle, 
  FaUsers, 
  FaPlay, 
  FaCheck,
  FaTag,
  FaStar,
  FaCrown,
  FaGraduationCap,
  FaArrowRight
} from 'react-icons/fa';

const TestSeriesCard = ({ testSeries, index, getDifficultyColor }) => {
  const isEnrolled = testSeries.isEnrolled;
  const isFree = testSeries.price === 0;
  const isPremium = testSeries.price > 0;
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <Link to={`/test-series/${testSeries._id}`} className="block">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-white" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                  TEST SERIES
                </span>
              </div>
              
              {/* Status Badges */}
              <div className="flex gap-2">
                {isEnrolled && (
                  <span className="text-xs bg-green-500 px-2 py-1 rounded-full flex items-center gap-1">
                    <FaCheck className="text-xs" />
                    Enrolled
                  </span>
                )}
                {isPremium && !isEnrolled && (
                  <span className="text-xs bg-yellow-500 px-2 py-1 rounded-full flex items-center gap-1">
                    <FaCrown className="text-xs" />
                    Premium
                  </span>
                )}
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-yellow-100 transition-colors">
              {testSeries.title}
            </h3>
            
            <p className="text-white/80 text-sm line-clamp-2">
              {testSeries.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {isFree ? (
                <span className="text-lg font-bold text-green-600">Free</span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[#01427a]">₹{testSeries.price}</span>
                  {testSeries.originalPrice > testSeries.price && (
                    <span className="text-sm text-gray-400 line-through">₹{testSeries.originalPrice}</span>
                  )}
                </div>
              )}
            </div>
            
            {testSeries.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(testSeries.difficulty)}`}>
                {testSeries.difficulty.charAt(0).toUpperCase() + testSeries.difficulty.slice(1)}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
                <FaBook className="text-blue-600 text-sm" />
              </div>
              <div className="text-sm font-semibold text-gray-800">{testSeries.totalQuizzes || 0}</div>
              <div className="text-xs text-gray-500">Tests</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
                <FaQuestionCircle className="text-green-600 text-sm" />
              </div>
              <div className="text-sm font-semibold text-gray-800">{testSeries.totalQuestions || 0}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
                <FaClock className="text-purple-600 text-sm" />
              </div>
              <div className="text-sm font-semibold text-gray-800">{testSeries.estimatedDuration || 0}</div>
              <div className="text-xs text-gray-500">Minutes</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1">
                <FaUsers className="text-orange-600 text-sm" />
              </div>
              <div className="text-sm font-semibold text-gray-800">{testSeries.enrolledStudentsCount || 0}</div>
              <div className="text-xs text-gray-500">Enrolled</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {testSeries.examType && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {testSeries.examType}
              </span>
            )}
            {testSeries.category && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {testSeries.category}
              </span>
            )}
            {testSeries.tags && testSeries.tags.slice(0, 2).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                <FaTag className="text-xs" />
                {tag}
              </span>
            ))}
            {testSeries.tags && testSeries.tags.length > 2 && (
              <span className="text-gray-500 text-xs px-2 py-1">
                +{testSeries.tags.length - 2} more
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className="w-full bg-[#00bcd4] text-white py-3 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-200 flex items-center justify-center gap-2">
            <FaPlay className="text-sm" />
            <span>{isEnrolled ? 'Continue Learning' : 'View Details'}</span>
          </div>

          {/* Creator Info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Created by {testSeries.creator?.fullName || testSeries.creator?.username || 'Unknown'}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TestSeriesCard;