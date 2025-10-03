import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBook,
  FaClock,
  FaQuestionCircle,
  FaUsers,
  FaPlay,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaTag,
  FaStar,
  FaCalendarAlt,
  FaEye,
  FaTrophy,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import TestSeriesProgress from './TestSeriesProgress';
import AddToCartButton from './cart/AddToCartButton';
import TestSeriesLeaderboard from './TestSeriesLeaderboard';

const TestSeriesDetail = () => {
  const { testSeriesId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [testSeries, setTestSeries] = useState(null);
  const [userAttempts, setUserAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState({ participantCount: 0, userRank: null });

  useEffect(() => {
    fetchTestSeriesDetails();
    if (currentUser) {
      fetchUserAttempts();
    }

    // Show enrollment message if redirected from quiz access
    if (location.state?.message) {
      toast(location.state.message, {
        icon: 'ℹ️',
        duration: 4000,
      });
    }
  }, [testSeriesId, currentUser, location.state]);

  const fetchTestSeriesDetails = async () => {
    try {
      setLoading(true);
      // Use public endpoint for logged out users, authenticated endpoint for logged in users
      const response = currentUser
        ? await testSeriesAPI.getTestSeriesById(testSeriesId)
        : await testSeriesAPI.getPublicTestSeriesById(testSeriesId);



      setTestSeries(response.data.data);
      setError('');
    } catch (error) {
      console.error('Error fetching test series details:', error);
      setError('Failed to fetch test series details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    if (!testSeries?.quizzes) return;

    try {
      const attempts = {};
      for (const quiz of testSeries.quizzes) {
        try {
          const response = await quizAPI.getUserQuizAttempts(quiz._id);
          attempts[quiz._id] = response.data.data;
        } catch (error) {
          // Quiz might not have attempts, which is fine
          attempts[quiz._id] = [];
        }
      }
      setUserAttempts(attempts);
    } catch (error) {
      console.error('Error fetching user attempts:', error);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      // Redirect to login with return URL
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setEnrolling(true);
      await testSeriesAPI.enrollInTestSeries(testSeriesId);
      toast.success('Successfully enrolled in test series!');
      fetchTestSeriesDetails(); // Refresh to update enrollment status
    } catch (error) {
      console.error('Error enrolling in test series:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in test series');
    } finally {
      setEnrolling(false);
    }
  };

  const getBestAttempt = (quizId) => {
    const attempts = userAttempts[quizId] || [];
    if (attempts.length === 0) return null;
    return attempts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );
  };

  const getAttemptCount = (quizId) => {
    return userAttempts[quizId]?.length || 0;
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

  const calculateProgress = () => {
    if (!testSeries?.quizzes || testSeries.quizzes.length === 0) return 0;

    const completedQuizzes = testSeries.quizzes.filter(quiz => {
      const attempts = userAttempts[quiz._id] || [];
      return attempts.some(attempt => attempt.isCompleted);
    }).length;

    return Math.round((completedQuizzes / testSeries.quizzes.length) * 100);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testSeries) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaTimes className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Series Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The test series you are looking for does not exist.'}</p>
              <Link
                to="/test-series"
                className="bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#0097a7] transition-colors inline-flex items-center gap-2"
              >
                <FaArrowLeft />
                Back to Test Series
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const isEnrolled = testSeries.isEnrolled;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/test-series"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Test Series</span>
            </Link>
          </div>

          {/* Leaderboard Toggle Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-200 touch-manipulation"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaTrophy className="text-white text-sm sm:text-lg" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    <span className="hidden sm:inline">Test Series Leaderboard</span>
                    <span className="sm:hidden">Leaderboard</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {leaderboardData.participantCount > 0 ? (
                      <>
                        <span className="hidden sm:inline">
                          {leaderboardData.participantCount} participants
                          {leaderboardData.userRank && (
                            <span className="ml-2 text-[#00bcd4] font-medium">
                              • You're #{leaderboardData.userRank}
                            </span>
                          )}
                        </span>
                        <span className="sm:hidden">
                          {leaderboardData.participantCount} active
                          {leaderboardData.userRank && (
                            <span className="ml-1 text-[#00bcd4] font-medium">
                              • #{leaderboardData.userRank}
                            </span>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">See how you rank against other participants</span>
                        <span className="sm:hidden">View rankings</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {leaderboardData.participantCount > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    <span className="hidden sm:inline">{leaderboardData.participantCount} active</span>
                    <span className="sm:hidden">{leaderboardData.participantCount}</span>
                  </span>
                )}
                <span className="text-xs sm:text-sm text-gray-500 hidden md:inline">
                  {showLeaderboard ? 'Hide' : 'Show'} Rankings
                </span>
                {showLeaderboard ? (
                  <FaChevronUp className="text-gray-400 text-sm sm:text-base" />
                ) : (
                  <FaChevronDown className="text-gray-400 text-sm sm:text-base" />
                )}
              </div>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showLeaderboard ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t border-gray-100">
                <div className="p-3 sm:p-6">
                  <TestSeriesLeaderboard 
                    testSeriesId={testSeriesId} 
                    className="shadow-none border-0" 
                    onDataLoad={setLeaderboardData}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Series Details Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaBook className="text-2xl" />
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(testSeries.difficulty)} text-gray-800`}>
                        {testSeries.difficulty.charAt(0).toUpperCase() + testSeries.difficulty.slice(1)}
                      </span>
                      {testSeries.examType && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {testSeries.examType}
                        </span>
                      )}
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{testSeries.title}</h1>
                  <p className="text-white/90 text-base sm:text-lg mb-4 break-words">{testSeries.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{testSeries.totalQuizzes}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{testSeries.totalQuestions}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{testSeries.estimatedDuration}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{testSeries.enrolledStudentsCount || 0}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Enrolled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Progress and Quiz List */}
                  {isEnrolled ? (
                    <TestSeriesProgress
                      testSeriesId={testSeriesId}
                      testSeries={testSeries}
                    />
                  ) : (
                    <div>
                      {/* Test Series Overview for Non-Enrolled Users */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 mb-6 border border-blue-200">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaInfoCircle className="text-white text-xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                              {testSeries.price > 0 ? 'Purchase Required' : 'Enrollment Required'}
                            </h3>
                            <p className="text-sm sm:text-base text-blue-800 mb-4">
                              {testSeries.price > 0
                                ? 'Purchase this test series to access all tests and track your progress.'
                                : currentUser
                                  ? 'Enroll in this free test series to access all tests and track your progress.'
                                  : 'Login and enroll in this free test series to access all tests and track your progress.'
                              }
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              {testSeries.price > 0 ? (
                                currentUser ? (
                                  <AddToCartButton
                                    itemType="testSeries"
                                    itemId={testSeriesId}
                                    size="md"
                                  />
                                ) : (
                                  <button
                                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                  >
                                    Login to Enroll
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={handleEnroll}
                                  disabled={enrolling}
                                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                                >
                                  {enrolling ? 'Enrolling...' : currentUser ? 'Enroll Now' : 'Login to Enroll'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Test Series Content Preview */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaBook className="text-blue-500" />
                            Test Series Content
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {currentUser ? 'Enroll to access all tests' : 'Login and enroll to access all tests'}
                          </p>
                        </div>

                        <div className="p-6">
                          {/* Show quiz list as preview */}

                          {((testSeries.quizzes && testSeries.quizzes.length > 0) ||
                            (testSeries.sections && testSeries.sections.some(section => section.quizzes && section.quizzes.length > 0))) ? (
                            <div className="space-y-3">
                              {/* Render direct quizzes */}
                              {testSeries.quizzes && testSeries.quizzes.map((quiz, index) => (
                                <div key={quiz._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-3 flex-1 mb-2 sm:mb-0">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-800 truncate">{quiz.title}</h4>
                                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                                        <span className="flex items-center gap-1">
                                          <FaQuestionCircle className="text-xs" />
                                          {Array.isArray(quiz.questions) ? quiz.questions.length : (quiz.questions?.length || 0)} questions
                                        </span>
                                        {quiz.timeLimit && (
                                          <span className="flex items-center gap-1">
                                            <FaClock className="text-xs" />
                                            {quiz.timeLimit} min
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-2 ml-11 sm:ml-0">
                                    <Link
                                      to={`/test-series/${testSeriesId}/quiz/${quiz._id}`}
                                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                    >
                                      View Details
                                    </Link>
                                    <div className="text-gray-400">
                                      <FaTimes className="text-sm" />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Render section-based quizzes */}
                              {testSeries.sections && testSeries.sections.map((section, sectionIndex) => (
                                section.quizzes && section.quizzes.length > 0 && (
                                  <div key={section._id} className="space-y-2">
                                    <h5 className="font-semibold text-gray-700 text-sm sm:text-base uppercase tracking-wide px-2 sm:px-0">
                                      {section.title}
                                    </h5>
                                    {section.quizzes.map((quiz, quizIndex) => (
                                      <div key={quiz._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors ml-2 sm:ml-4">
                                        <div className="flex items-center gap-3 flex-1 mb-2 sm:mb-0">
                                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                                            {quizIndex + 1}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-800 truncate">{quiz.title}</h4>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                                              <span className="flex items-center gap-1">
                                                <FaQuestionCircle className="text-xs" />
                                                {Array.isArray(quiz.questions) ? quiz.questions.length : (quiz.questions?.length || 0)} questions
                                              </span>
                                              {quiz.timeLimit && (
                                                <span className="flex items-center gap-1">
                                                  <FaClock className="text-xs" />
                                                  {quiz.timeLimit} min
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2 ml-11 sm:ml-0">
                                          <Link
                                            to={`/test-series/${testSeriesId}/quiz/${quiz._id}`}
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                                          >
                                            <FaEye className="text-xs" />
                                            View Details
                                          </Link>
                                          <div className="text-gray-400">
                                            <FaTimes className="text-sm" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FaBook className="text-4xl mx-auto mb-4 opacity-50" />
                              <p>No tests available in this series yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {testSeries.instructions && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                          <p className="text-blue-700 text-sm whitespace-pre-line">{testSeries.instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}


                </div>

                {/* Sidebar */}
                <div className="space-y-4 lg:space-y-6">
                  {/* Enrollment Card */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="text-center mb-4">
                      {testSeries.price > 0 ? (
                        <div>
                          <div className="text-3xl font-bold text-[#00bcd4] mb-1">₹{testSeries.price}</div>
                          {testSeries.originalPrice > testSeries.price && (
                            <div className="text-gray-500 line-through">₹{testSeries.originalPrice}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-green-600">Free</div>
                      )}
                    </div>

                    {isEnrolled ? (
                      <div className="text-center">
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4 flex items-center justify-center gap-2">
                          <FaCheck />
                          {testSeries.price > 0 ? 'Purchased' : 'Enrolled'}
                        </div>
                        <p className="text-sm text-gray-600">
                          You have access to all tests in this series
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {testSeries.price > 0 ? (
                          currentUser ? (
                            <AddToCartButton
                              itemType="testSeries"
                              itemId={testSeriesId}
                              className="w-full"
                              size="lg"
                            />
                          ) : (
                            <div className="text-center">
                              <button
                                onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                                className="w-full bg-[#00bcd4] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#0097a7] transition-colors text-base sm:text-lg font-medium"
                              >
                                Login to Enroll
                              </button>
                              <p className="text-sm text-gray-600 mt-2">
                                Please login to add this test series to your cart
                              </p>
                            </div>
                          )
                        ) : (
                          <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="w-full bg-[#00bcd4] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-medium"
                          >
                            {enrolling ? 'Enrolling...' : currentUser ? 'Enroll Now' : 'Login to Enroll'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{testSeries.category}</span>
                      </div>
                      {testSeries.subject && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{testSeries.subject}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className="font-medium capitalize">{testSeries.difficulty}</span>
                      </div>
                      {testSeries.maxAttempts > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Attempts:</span>
                          <span className="font-medium">{testSeries.maxAttempts}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Review Allowed:</span>
                        <span className="font-medium">{testSeries.allowReview ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Show Results:</span>
                        <span className="font-medium">{testSeries.showResults ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {testSeries.tags && testSeries.tags.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaTag />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {testSeries.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSeriesDetail;
