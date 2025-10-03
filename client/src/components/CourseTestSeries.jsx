import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBook, 
  FaClock, 
  FaQuestionCircle, 
  FaUsers, 
  FaPlay, 
  FaCheck, 
  FaTimes,
  FaChartLine,
  FaLock,
  FaGraduationCap,
  FaInfoCircle,
  FaTag,
  FaArrowRight,
  FaCheckCircle,
  FaEye
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import AddToCartButton from './cart/AddToCartButton';

// Test Series Detail Modal Component
const TestSeriesModal = ({ testSeries, isOpen, onClose }) => {
  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !testSeries) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center mobile-modal-backdrop"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          WebkitOverflowScrolling: 'touch',
          overflowY: 'auto'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ 
            scale: 0.95, 
            opacity: 0,
            y: window.innerWidth < 640 ? '100%' : 0
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            y: 0
          }}
          exit={{ 
            scale: 0.95, 
            opacity: 0,
            y: window.innerWidth < 640 ? '100%' : 0
          }}
          transition={{ type: "spring", duration: 0.3, damping: 25, stiffness: 300 }}
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col sm:m-4 touch-manipulation mobile-modal-content"
          style={{
            WebkitOverflowScrolling: 'touch',
            maxWidth: window.innerWidth < 640 ? '100vw' : undefined,
            maxHeight: window.innerWidth < 640 ? '95vh' : '90vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white">
            {/* Mobile drag indicator */}
            <div className="sm:hidden w-12 h-1 bg-white/40 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing"></div>
            
            <button
              onClick={onClose}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10 text-white"
              aria-label="Close modal"
            >
              <FaTimes className="text-lg" />
            </button>

            <div className="flex items-start gap-3 sm:gap-4 pr-8 sm:pr-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaBook className="text-xl sm:text-2xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(testSeries.difficulty)} text-gray-800`}>
                    {testSeries.difficulty?.charAt(0).toUpperCase() + testSeries.difficulty?.slice(1)}
                  </span>
                  {testSeries.examType && (
                    <span className="text-xs font-medium bg-white/20 text-white px-2 py-1 rounded">
                      {testSeries.examType}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold mb-1 line-clamp-2">{testSeries.title}</h2>
                <p className="text-white/90 text-sm">{testSeries.category}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {/* Description */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">About This Test Series</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{testSeries.description}</p>
            </div>

            {/* Key Features */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <FaBook className="text-blue-600 text-sm sm:text-base flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testSeries.totalQuizzes || 0} Tests</div>
                    <div className="text-xs sm:text-sm text-gray-600">Comprehensive coverage</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                  <FaQuestionCircle className="text-green-600 text-sm sm:text-base flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testSeries.totalQuestions || 0} Questions</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total questions</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <FaClock className="text-purple-600 text-sm sm:text-base flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testSeries.estimatedDuration || 0} Minutes</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total duration</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <FaUsers className="text-orange-600 text-sm sm:text-base flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testSeries.enrolledStudents?.length || 0} Students</div>
                    <div className="text-xs sm:text-sm text-gray-600">Already enrolled</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Content Preview */}
            {testSeries.previewData && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Content Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">{testSeries.previewData.totalTests}</div>
                    <div className="text-xs text-blue-600">Tests</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{testSeries.previewData.totalQuestions}</div>
                    <div className="text-xs text-green-600">Questions</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-700">{testSeries.previewData.estimatedHours}h</div>
                    <div className="text-xs text-purple-600">Study Time</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-700">{testSeries.previewData.averageTestDuration}m</div>
                    <div className="text-xs text-orange-600">Avg Test</div>
                  </div>
                </div>

                {/* Question Types Preview */}
                {Object.keys(testSeries.previewData.questionTypeBreakdown).length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Question Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(testSeries.previewData.questionTypeBreakdown).slice(0, 4).map(([type, count]) => (
                        <span key={type} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {count}
                        </span>
                      ))}
                      {Object.keys(testSeries.previewData.questionTypeBreakdown).length > 4 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{Object.keys(testSeries.previewData.questionTypeBreakdown).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* What You'll Get */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">What You'll Get</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                  <span className="text-sm text-gray-700">Detailed performance analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                  <span className="text-sm text-gray-700">Step-by-step solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                  <span className="text-sm text-gray-700">Progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                  <span className="text-sm text-gray-700">Leaderboard rankings</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                  <span className="text-sm text-gray-700">Mobile-friendly interface</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                  <span className="text-sm text-gray-700">Instant result feedback</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {testSeries.tags && testSeries.tags.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {testSeries.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Pricing</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {testSeries.price > 0 ? (
                      <>
                        <span className="text-xl sm:text-2xl font-bold text-[#00bcd4]">₹{testSeries.price}</span>
                        {testSeries.originalPrice > testSeries.price && (
                          <span className="text-base sm:text-lg text-gray-500 line-through">₹{testSeries.originalPrice}</span>
                        )}
                        {testSeries.originalPrice > testSeries.price && (
                          <span className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            Save ₹{testSeries.originalPrice - testSeries.price}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xl sm:text-2xl font-bold text-green-600">Free</span>
                    )}
                  </div>
                </div>
                <FaTag className="text-2xl sm:text-3xl text-gray-300 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
              >
                Close
              </button>
              <Link
                to={`/test-series/${testSeries._id}`}
                className="flex-1 bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
                onClick={onClose}
              >
                <span className="mr-2">View Details</span>
                <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CourseTestSeries = ({ courseId, courseName, isInstructor = false }) => {
  console.log('CourseTestSeries component rendered with:', { courseId, courseName, isInstructor });
  
  const { currentUser } = useAuth();
  const [testSeries, setTestSeries] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTestSeries, setSelectedTestSeries] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourseTestSeries();
  }, [courseId]);

  const fetchCourseTestSeries = async () => {
    try {
      setLoading(true);
      console.log(`Fetching test series for course: ${courseId}`);

      // Fetch test series linked to this course
      const response = await testSeriesAPI.getTestSeriesByCourse(courseId);
      console.log('Test series API response:', response);

      const testSeriesData = response.data.data || [];
      console.log(`Test series received: ${testSeriesData.length}`);
      console.log('Test series data:', testSeriesData);

      setTestSeries(testSeriesData);

      // Fetch user progress for each test series
      if (testSeriesData.length > 0 && currentUser) {
        await fetchUserProgress(testSeriesData);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching course test series:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      if (err.response?.status === 403) {
        setError('You do not have permission to view test series for this course.');
      } else if (err.response?.status === 401) {
        setError('Please log in to view test series.');
      } else {
        setError('Failed to load test series. Please try again.');
      }
      
      // Don't show toast for permission errors, just log them
      if (err.response?.status !== 403 && err.response?.status !== 401) {
        toast.error('Failed to load test series');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async (testSeriesData) => {
    try {
      const progressMap = {};
      
      for (const ts of testSeriesData) {
        if (ts.quizzes && ts.quizzes.length > 0) {
          let completedQuizzes = 0;
          let totalScore = 0;
          let totalAttempts = 0;

          for (const quiz of ts.quizzes) {
            try {
              const attemptsResponse = await quizAPI.getUserQuizAttempts(quiz._id);
              const attempts = attemptsResponse.data.data || [];
              
              if (attempts.length > 0) {
                totalAttempts += attempts.length;
                const bestAttempt = attempts.reduce((best, current) => 
                  current.percentage > best.percentage ? current : best
                );
                
                if (bestAttempt.isCompleted) {
                  completedQuizzes++;
                  totalScore += bestAttempt.percentage;
                }
              }
            } catch (error) {
              console.error(`Error fetching attempts for quiz ${quiz._id}:`, error);
            }
          }

          progressMap[ts._id] = {
            completedQuizzes,
            totalQuizzes: ts.quizzes.length,
            averageScore: completedQuizzes > 0 ? totalScore / completedQuizzes : 0,
            totalAttempts,
            progressPercentage: ts.quizzes.length > 0 ? (completedQuizzes / ts.quizzes.length) * 100 : 0
          };
        } else {
          progressMap[ts._id] = {
            completedQuizzes: 0,
            totalQuizzes: 0,
            averageScore: 0,
            totalAttempts: 0,
            progressPercentage: 0
          };
        }
      }

      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
  };

  // Modal handlers
  const handleKnowMore = (testSeries) => {
    setSelectedTestSeries(testSeries);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestSeries(null);
  };

  if (loading && testSeries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (testSeries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8 text-gray-500">
          {isInstructor ? (
            <>
              <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="mb-4">No test series have been created for this course yet.</p>
              <p className="text-sm text-gray-400 mb-4">
                Course ID: {courseId} | API called successfully
              </p>
              <Link
                to="/admin/test-series/create"
                className="inline-block bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
              >
                Create Test Series
              </Link>
            </>
          ) : (
            <>
              <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
              <p>No test series are available for this course yet.</p>
              <p className="text-sm text-gray-400">
                Course ID: {courseId} | API called successfully
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="font-medium text-gray-800 flex items-center gap-2 text-base sm:text-lg">
            <FaGraduationCap className="text-[#00bcd4]" />
            Test Series ({testSeries.length})
          </h3>

          {isInstructor && (
            <Link
              to="/admin/test-series/create"
              className="bg-[#00bcd4] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#0097a7] transition-colors self-start sm:self-auto"
            >
              Create Test Series
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {testSeries.map(ts => {
            const progress = userProgress[ts._id] || {
              completedQuizzes: 0,
              totalQuizzes: 0,
              averageScore: 0,
              totalAttempts: 0,
              progressPercentage: 0
            };

            const isEnrolled = ts.isEnrolled;
            const hasStarted = progress.totalAttempts > 0;

            return (
              <div
                key={ts._id}
                className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-800 text-base sm:text-lg">{ts.title}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(ts.difficulty)}`}>
                          {ts.difficulty.charAt(0).toUpperCase() + ts.difficulty.slice(1)}
                        </span>
                        {ts.examType && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            {ts.examType}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {ts.description && ts.description.length > 120 
                        ? `${ts.description.substring(0, 120)}...` 
                        : ts.description}
                    </p>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <FaBook className="text-[#00bcd4] flex-shrink-0" />
                        <span>{ts.totalQuizzes} tests</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FaQuestionCircle className="text-[#00bcd4] flex-shrink-0" />
                        <span>{ts.totalQuestions} questions</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FaClock className="text-[#00bcd4] flex-shrink-0" />
                        <span>{formatDuration(ts.estimatedDuration)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FaUsers className="text-[#00bcd4] flex-shrink-0" />
                        <span>{ts.enrolledStudents?.length || 0} enrolled</span>
                      </div>
                    </div>

                    {/* Progress Bar for Enrolled Users */}
                    {isEnrolled && hasStarted && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-800">
                            {progress.completedQuizzes}/{progress.totalQuizzes} completed
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#00bcd4] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progressPercentage}%` }}
                          ></div>
                        </div>
                        {progress.averageScore > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <FaChartLine className="text-green-600 text-xs" />
                            <span className="text-xs text-gray-600">
                              Average Score: {progress.averageScore.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Enrollment Status */}
                    {isEnrolled && (
                      <div className="flex items-center gap-1 text-sm text-green-700 mb-2">
                        <FaCheck className="text-xs" />
                        <span>Enrolled</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 lg:ml-4 lg:items-end">
                    {/* Price Display */}
                    <div className="flex flex-row lg:flex-col lg:text-right gap-2 lg:gap-1">
                      {ts.price > 0 && !isEnrolled && (
                        <div>
                          <div className="text-lg font-bold text-[#00bcd4]">₹{ts.price}</div>
                          {ts.originalPrice > ts.price && (
                            <div className="text-sm text-gray-500 line-through">₹{ts.originalPrice}</div>
                          )}
                        </div>
                      )}

                      {ts.price === 0 && !isEnrolled && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Free
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {!isEnrolled && ts.price > 0 && (
                        <AddToCartButton
                          itemType="testSeries"
                          itemId={ts._id}
                          size="sm"
                          className="text-xs w-full lg:w-auto"
                        />
                      )}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleKnowMore(ts);
                          }}
                          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors text-xs whitespace-nowrap"
                        >
                          <FaInfoCircle size={10} />
                          Know More
                        </button>
                        <Link
                          to={`/test-series/${ts._id}`}
                          className="bg-[#00bcd4] text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0097a7] transition-colors text-xs whitespace-nowrap"
                        >
                          {isEnrolled ? (
                            <>
                              <FaPlay size={10} />
                              {hasStarted ? 'Continue' : 'Start Tests'}
                            </>
                          ) : (
                            <>
                              <FaEye size={10} />
                              View Details
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Series Detail Modal */}
      <TestSeriesModal
        testSeries={selectedTestSeries}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default CourseTestSeries;