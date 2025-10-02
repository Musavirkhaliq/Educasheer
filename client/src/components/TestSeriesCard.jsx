import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.div
      key={testSeries._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative bg-white rounded-3xl shadow-lg border-2 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group ${
        isEnrolled 
          ? 'border-[#00bcd4]/30 bg-gradient-to-br from-[#00bcd4]/10 to-white' 
          : isPremium 
            ? 'border-[#01427a]/30 bg-gradient-to-br from-[#01427a]/10 to-white'
            : 'border-[#00bcd4]/20 bg-gradient-to-br from-[#00bcd4]/5 to-white'
      }`}
    >
      {/* Premium Badge */}
      {isPremium && !isEnrolled && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <FaCrown className="text-xs" />
            Premium
          </div>
        </div>
      )}

      {/* Enrolled Badge */}
      {isEnrolled && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <FaCheck className="text-xs" />
            Enrolled
          </div>
        </div>
      )}

      {/* Header with Gradient Background */}
      <div className={`relative p-6 pb-4 ${
        isEnrolled 
          ? 'bg-gradient-to-br from-[#00bcd4] to-[#01427a]' 
          : isPremium 
            ? 'bg-gradient-to-br from-[#01427a] to-[#00bcd4]'
            : 'bg-gradient-to-br from-[#00bcd4] to-[#01427a]'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
        </div>

        <div className="relative z-10">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-yellow-100 transition-colors">
                {testSeries.title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                {testSeries.description}
              </p>
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {isFree ? (
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-bold text-lg">
                  FREE
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-2xl">₹{testSeries.price}</span>
                  {testSeries.originalPrice > testSeries.price && (
                    <span className="text-white/70 text-sm line-through">₹{testSeries.originalPrice}</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Difficulty Badge */}
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-medium">
              {testSeries.difficulty?.charAt(0).toUpperCase() + testSeries.difficulty?.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Stats Grid - Test Series with Orange/Amber Theme */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl p-4 text-center border-2 border-orange-300 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
              <FaBook className="text-white text-sm" />
            </div>
            <div className="text-xl font-bold text-orange-800">{testSeries.totalQuizzes || 0}</div>
            <div className="text-orange-600 text-xs font-medium">Tests</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl p-4 text-center border-2 border-amber-300 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
              <FaQuestionCircle className="text-white text-sm" />
            </div>
            <div className="text-xl font-bold text-amber-800">{testSeries.totalQuestions || 0}</div>
            <div className="text-amber-600 text-xs font-medium">Questions</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl p-4 text-center border-2 border-yellow-300 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
              <FaClock className="text-white text-sm" />
            </div>
            <div className="text-xl font-bold text-yellow-800">{testSeries.estimatedDuration || 0}</div>
            <div className="text-yellow-600 text-xs font-medium">Minutes</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl p-4 text-center border-2 border-orange-300 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
              <FaUsers className="text-white text-sm" />
            </div>
            <div className="text-xl font-bold text-orange-800">{testSeries.enrolledStudentsCount || 0}</div>
            <div className="text-orange-600 text-xs font-medium">Enrolled</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {testSeries.examType && (
            <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1 rounded-xl text-xs font-medium border border-indigo-200">
              {testSeries.examType}
            </span>
          )}
          {testSeries.category && (
            <span className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 px-3 py-1 rounded-xl text-xs font-medium border border-pink-200">
              {testSeries.category}
            </span>
          )}
          {testSeries.tags && testSeries.tags.slice(0, 2).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 px-3 py-1 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1"
            >
              <FaTag className="text-xs" />
              {tag}
            </span>
          ))}
          {testSeries.tags && testSeries.tags.length > 2 && (
            <span className="text-slate-500 text-xs font-medium px-2 py-1">
              +{testSeries.tags.length - 2} more
            </span>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={`/test-series/${testSeries._id}`}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105 ${
            isEnrolled 
              ? 'bg-gradient-to-r from-[#00bcd4] to-[#01427a] hover:from-[#00bcd4]/90 hover:to-[#01427a]/90' 
              : isPremium 
                ? 'bg-gradient-to-r from-[#01427a] to-[#00bcd4] hover:from-[#01427a]/90 hover:to-[#00bcd4]/90'
                : 'bg-gradient-to-r from-[#00bcd4] to-[#01427a] hover:from-[#00bcd4]/90 hover:to-[#01427a]/90'
          }`}
        >
          <FaPlay className="text-sm" />
          <span>{isEnrolled ? 'Continue Learning' : 'View Details'}</span>
          <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Creator Info */}
        <div className="mt-4 text-center">
          <div className="text-xs text-slate-500">
            Created by {testSeries.creator?.fullName || testSeries.creator?.username || 'Unknown'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestSeriesCard;