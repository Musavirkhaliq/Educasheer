import React from 'react';
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
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer"
      onClick={() => onQuizClick(quiz)}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isExam ? (
                <FaTrophy className="text-yellow-300" />
              ) : (
                <FaBookOpen className="text-white" />
              )}
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                {isExam ? 'EXAM' : 'QUIZ'}
              </span>
            </div>
            
            {/* Status Badge */}
            {requiresEnrollment && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                <FaLock className="text-xs" />
                Locked
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-yellow-100 transition-colors">
            {quiz.title}
          </h3>
          
          {quiz.testSeries && (
            <p className="text-white/80 text-sm">
              📚 {quiz.testSeries.title}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Enrollment Warning */}
        {requiresEnrollment && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <FaExclamationTriangle className="text-sm" />
              <span className="text-sm font-medium">Enrollment Required</span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Join the test series to access this quiz
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {quiz.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
              <FaQuestionCircle className="text-blue-600 text-sm" />
            </div>
            <div className="text-sm font-semibold text-gray-800">{quiz.questions?.length || 0}</div>
            <div className="text-xs text-gray-500">Questions</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <FaClock className="text-green-600 text-sm" />
            </div>
            <div className="text-sm font-semibold text-gray-800">{quiz.timeLimit || 0}</div>
            <div className="text-xs text-gray-500">Minutes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
              <FaTrophy className="text-purple-600 text-sm" />
            </div>
            <div className="text-sm font-semibold text-gray-800">{quiz.passingScore || 0}%</div>
            <div className="text-xs text-gray-500">Pass Score</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quiz.category && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
              {quiz.category}
            </span>
          )}
          {quiz.difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
            </span>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full bg-[#00bcd4] text-white py-3 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-200 flex items-center justify-center gap-2">
          {requiresEnrollment ? (
            <>
              <FaLock className="text-sm" />
              View Details
            </>
          ) : (
            <>
              <FaPlay className="text-sm" />
              {isAccessible ? 'Start Quiz' : 'View Details'}
            </>
          )}
        </button>

        {/* Creator Info */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Created by {quiz.creator?.fullName || quiz.creator?.username || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;