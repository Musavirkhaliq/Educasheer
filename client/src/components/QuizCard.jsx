import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaQuestionCircle, 
  FaUser, 
  FaPlay, 
  FaLock,
  FaExclamationTriangle,
  FaGraduationCap,
  FaArrowRight,
  FaShieldAlt,
  FaTrophy,
  FaBookOpen
} from 'react-icons/fa';

const QuizCard = ({ quiz, index, onQuizClick, getDifficultyColor, isAuthenticated, currentCategory }) => {
  const requiresEnrollment = quiz.testSeries && !quiz.isEnrolledInTestSeries && currentCategory === 'all';
  const isAccessible = quiz.isEnrolledInTestSeries || !quiz.testSeries;
  const isExam = quiz.quizType === 'exam';
  
  return (
    <motion.div
      key={quiz._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative bg-white rounded-3xl shadow-lg border-2 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer ${
        requiresEnrollment 
          ? 'border-[#01427a]/30 bg-gradient-to-br from-[#01427a]/10 to-[#00bcd4]/5' 
          : isAccessible 
            ? 'border-[#00bcd4]/30 bg-gradient-to-br from-[#00bcd4]/10 to-[#01427a]/5'
            : 'border-[#00bcd4]/20 bg-gradient-to-br from-[#00bcd4]/5 to-white'
      }`}
      onClick={() => onQuizClick(quiz)}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {requiresEnrollment ? (
          <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <FaLock className="text-xs" />
            Locked
          </div>
        ) : isAccessible ? (
          <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <FaShieldAlt className="text-xs" />
            Available
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <FaBookOpen className="text-xs" />
            Public
          </div>
        )}
      </div>

      {/* Header with Gradient Background */}
      <div className={`relative p-4 sm:p-5 lg:p-6 pb-3 sm:pb-4 ${
        requiresEnrollment 
          ? 'bg-gradient-to-br from-[#01427a] to-[#00bcd4]' 
          : isAccessible 
            ? 'bg-gradient-to-br from-[#00bcd4] to-[#01427a]'
            : isExam
              ? 'bg-gradient-to-br from-[#01427a] to-[#00bcd4]'
              : 'bg-gradient-to-br from-[#00bcd4] to-[#01427a]'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full -translate-x-8 translate-y-8"></div>
        </div>

        <div className="relative z-10">
          {/* Icon and Quiz Type */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                {isExam ? (
                  <FaTrophy className="text-white text-xl" />
                ) : (
                  <FaGraduationCap className="text-white text-xl" />
                )}
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-bold">
                {isExam ? 'EXAM' : 'QUIZ'}
              </div>
            </div>
            
            {/* Difficulty Badge */}
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-medium">
              {quiz.difficulty?.charAt(0).toUpperCase() + quiz.difficulty?.slice(1)}
            </div>
          </div>

          {/* Title and Description */}
          <h3 className="font-bold text-white text-base sm:text-lg leading-tight mb-2 group-hover:text-yellow-100 transition-colors break-words">
            {quiz.title}
          </h3>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3 sm:mb-4 break-words">
            {quiz.description}
          </p>

          {/* Test Series Info */}
          {quiz.testSeries && (
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-xs font-medium">
              📚 {quiz.testSeries.title}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Enrollment Warning */}
        {requiresEnrollment && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-[#01427a]/10 to-[#00bcd4]/10 border-2 border-[#01427a]/30 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-3 text-[#01427a]">
              <div className="w-8 h-8 bg-[#01427a] rounded-xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-white text-sm" />
              </div>
              <div>
                <div className="font-bold text-sm">Enrollment Required</div>
                <div className="text-xs">Join the test series to access this quiz</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Quiz Cards with Purple/Violet Theme */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center border-2 border-purple-300 shadow-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-md">
              <FaQuestionCircle className="text-white text-xs sm:text-sm" />
            </div>
            <div className="text-base sm:text-lg font-bold text-purple-800">{quiz.questions?.length || 0}</div>
            <div className="text-purple-600 text-xs font-medium">Questions</div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center border-2 border-indigo-300 shadow-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-md">
              <FaClock className="text-white text-xs sm:text-sm" />
            </div>
            <div className="text-base sm:text-lg font-bold text-indigo-800">{quiz.timeLimit || 0}</div>
            <div className="text-indigo-600 text-xs font-medium">Minutes</div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-100 to-purple-200 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center border-2 border-violet-300 shadow-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-md">
              <FaTrophy className="text-white text-xs sm:text-sm" />
            </div>
            <div className="text-base sm:text-lg font-bold text-violet-800">{quiz.passingScore || 0}%</div>
            <div className="text-violet-600 text-xs font-medium">Pass Score</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
          {quiz.category && (
            <span className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 px-3 py-1 rounded-xl text-xs font-medium border border-pink-200">
              {quiz.category}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105 text-sm sm:text-base ${
          requiresEnrollment 
            ? 'bg-gradient-to-r from-[#01427a] to-[#00bcd4] hover:from-[#01427a]/90 hover:to-[#00bcd4]/90' 
            : isAccessible 
              ? 'bg-gradient-to-r from-[#00bcd4] to-[#01427a] hover:from-[#00bcd4]/90 hover:to-[#01427a]/90'
              : isExam
                ? 'bg-gradient-to-r from-[#01427a] to-[#00bcd4] hover:from-[#01427a]/90 hover:to-[#00bcd4]/90'
                : 'bg-gradient-to-r from-[#00bcd4] to-[#01427a] hover:from-[#00bcd4]/90 hover:to-[#01427a]/90'
        }`}>
          {requiresEnrollment ? (
            <>
              <FaLock className="text-sm" />
              <span>View Details</span>
              <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              <FaPlay className="text-sm" />
              <span>{isAccessible ? 'Start Quiz' : 'View Details'}</span>
              <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>

        {/* Creator Info */}
        <div className="mt-4 text-center">
          <div className="text-xs text-slate-500">
            Created by {quiz.creator?.fullName || quiz.creator?.username || 'Unknown'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizCard;