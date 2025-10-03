import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaPlay,
  FaClock,
  FaQuestionCircle,
  FaTrophy,
  FaHistory,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaCrown,
  FaMedal,
  FaAward
} from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const QuizDetails = () => {
  const { courseId, testSeriesId, quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [userAttempts, setUserAttempts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizDetails();
    fetchUserAttempts();
    fetchLeaderboard();
  }, [quizId]);

  const fetchQuizDetails = async () => {
    try {
      // Use public endpoint for logged out users, authenticated endpoint for logged in users
      const response = currentUser 
        ? await quizAPI.getQuizById(quizId)
        : await quizAPI.getPublicQuizById(quizId);
      setQuiz(response.data.data);
    } catch (err) {
      console.error('Error fetching quiz details:', err);
      setError('Failed to load quiz details');
      toast.error('Failed to load quiz details');
    }
  };

  const fetchUserAttempts = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await quizAPI.getUserQuizAttempts(quizId);
      setUserAttempts(response.data.data);
    } catch (err) {
      console.error('Error fetching user attempts:', err);
      // Don't show error for attempts as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const response = await quizAPI.getQuizLeaderboard(quizId);
      setLeaderboard(response.data.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      // Don't show error for leaderboard as it's not critical
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (courseId) {
      navigate(`/courses/${courseId}/quizzes/${quizId}/take`);
    } else if (testSeriesId) {
      navigate(`/test-series/${testSeriesId}/quiz/${quizId}/take`);
    } else {
      // For admin viewing, redirect to appropriate page
      if (quiz.course) {
        navigate(`/courses/${quiz.course._id}/quizzes/${quizId}/take`);
      } else if (quiz.testSeries) {
        navigate(`/test-series/${quiz.testSeries._id}/quiz/${quizId}/take`);
      }
    }
  };

  const getBestAttempt = () => {
    if (!userAttempts.length) return null;
    return userAttempts.reduce((best, current) => 
      current.percentage > (best?.percentage || 0) ? current : best
    );
  };

  const getAttemptCount = () => userAttempts.filter(attempt => attempt.isCompleted).length;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The quiz you are looking for does not exist.'}</p>
              <Link
                to={courseId ? `/courses/${courseId}` : testSeriesId ? `/test-series/${testSeriesId}` : '/admin/quizzes'}
                className="bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#0097a7] transition-colors inline-flex items-center gap-2"
              >
                <FaArrowLeft />
                {courseId ? 'Back to Course' : testSeriesId ? 'Back to Test Series' : 'Back to Quiz Management'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const bestAttempt = getBestAttempt();
  const attemptCount = getAttemptCount();
  const hasAttempted = attemptCount > 0;
  const isPassed = bestAttempt && bestAttempt.isPassed;
  const canRetake = (!quiz.maxAttempts || attemptCount < quiz.maxAttempts) && (courseId || testSeriesId); // Allow for both course and test series

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to={courseId ? `/courses/${courseId}` : testSeriesId ? `/test-series/${testSeriesId}` : '/admin/quizzes'}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <FaArrowLeft />
              <span>{courseId ? 'Back to Course' : testSeriesId ? 'Back to Test Series' : 'Back to Quiz Management'}</span>
            </Link>
          </div>

          {/* Quiz Details Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaQuestionCircle className="text-2xl" />
                    </div>
                    <div>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {quiz.quizType === 'quiz' ? 'Quiz' : 'Exam'}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{quiz.title}</h1>
                  <p className="text-white/90 text-base sm:text-lg break-words">{quiz.description}</p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Quiz Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FaQuestionCircle className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-blue-700 text-xs sm:text-sm font-medium">Questions</p>
                      <p className="text-blue-900 text-lg sm:text-xl font-bold">
                        {Array.isArray(quiz.questions) ? quiz.questions.length : (quiz.questions?.length || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <FaClock className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-green-700 text-xs sm:text-sm font-medium">Time Limit</p>
                      <p className="text-green-900 text-lg sm:text-xl font-bold">{quiz.timeLimit} min</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 border border-yellow-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <FaTrophy className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-yellow-700 text-xs sm:text-sm font-medium">Passing Score</p>
                      <p className="text-yellow-900 text-lg sm:text-xl font-bold">{quiz.passingScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FaHistory className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-purple-700 text-xs sm:text-sm font-medium">Max Attempts</p>
                      <p className="text-purple-900 text-lg sm:text-xl font-bold">
                        {quiz.maxAttempts || 'Unlimited'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attempt History */}
              {hasAttempted && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaHistory className="text-[#00bcd4]" />
                    Your Performance
                  </h3>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-1">{attemptCount}</div>
                        <div className="text-gray-600">Attempts Made</div>
                      </div>

                      {bestAttempt && (
                        <>
                          <div className="text-center">
                            <div className={`text-3xl font-bold mb-1 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {bestAttempt.percentage.toFixed(1)}%
                            </div>
                            <div className="text-gray-600">Best Score</div>
                          </div>

                          <div className="text-center">
                            <div className={`flex items-center justify-center gap-2 text-lg font-semibold mb-1 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {isPassed ? <FaCheckCircle /> : <FaTimesCircle />}
                              {isPassed ? 'Passed' : 'Not Passed'}
                            </div>
                            <div className="text-gray-600">Status</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Rules and Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-[#00bcd4]" />
                  Quiz Information
                </h3>

                <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                      <span>You have <strong>{quiz.timeLimit} minutes</strong> to complete this {quiz.quizType}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                      <span>You need to score at least <strong>{quiz.passingScore}%</strong> to pass</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                      <span>This {quiz.quizType} contains <strong>{Array.isArray(quiz.questions) ? quiz.questions.length : (quiz.questions?.length || 0)} questions</strong></span>
                    </li>
                    {quiz.maxAttempts > 0 && (
                      <li className="flex items-start gap-3">
                        <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                        <span>You can attempt this {quiz.quizType} up to <strong>{quiz.maxAttempts} times</strong></span>
                      </li>
                    )}
                    {quiz.allowReview && (
                      <li className="flex items-start gap-3">
                        <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                        <span>You can review your answers after submission</span>
                      </li>
                    )}
                    {quiz.showCorrectAnswers && (
                      <li className="flex items-start gap-3">
                        <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                        <span>Correct answers will be shown after submission</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Leaderboard Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  Top Performers
                </h3>

                {leaderboardLoading ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="animate-pulse space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                    <FaTrophy className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-600">No completed attempts yet</p>
                    <p className="text-gray-500 text-sm">Be the first to complete this {quiz.quizType}!</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
                    <div className="space-y-2 sm:space-y-3">
                      {leaderboard.map((entry, index) => {
                        const getRankIcon = (rank) => {
                          if (rank === 1) return <FaCrown className="text-yellow-500 text-sm sm:text-base" />;
                          if (rank === 2) return <FaMedal className="text-gray-400 text-sm sm:text-base" />;
                          if (rank === 3) return <FaAward className="text-amber-600 text-sm sm:text-base" />;
                          return <span className="text-gray-600 font-bold text-sm sm:text-base">{rank}</span>;
                        };

                        const getRankBg = (rank) => {
                          if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
                          if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400';
                          if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-500';
                          return 'bg-gradient-to-r from-blue-400 to-blue-500';
                        };

                        const isCurrentUser = entry.user._id === currentUser?._id;

                        const getSpecialStyling = (rank) => {
                          if (isCurrentUser) {
                            return 'bg-gradient-to-r from-[#00bcd4]/10 to-[#0097a7]/10 border-2 border-[#00bcd4] shadow-lg ring-2 ring-[#00bcd4]/20';
                          }
                          if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 shadow-lg';
                          if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 shadow-md';
                          if (rank === 3) return 'bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-300 shadow-md';
                          return 'bg-white/70 border border-gray-200';
                        };

                        return (
                          <div
                            key={entry._id}
                            className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg ${getSpecialStyling(entry.rank)} transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}
                          >
                            {/* Rank */}
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getRankBg(entry.rank)} rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                              {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${isCurrentUser ? 'bg-[#00bcd4] ring-2 ring-white' : 'bg-[#00bcd4]'} rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0`}>
                                {entry.user.fullName?.charAt(0) || entry.user.username?.charAt(0) || 'U'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`font-semibold truncate text-sm sm:text-base ${isCurrentUser ? 'text-[#00bcd4]' : 'text-gray-800'}`}>
                                  {entry.user.fullName || entry.user.username}
                                  {isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {entry.totalAttempts} {entry.totalAttempts === 1 ? 'attempt' : 'attempts'}
                                </div>
                              </div>
                            </div>

                            {/* Score */}
                            <div className="text-right flex-shrink-0">
                              <div className="text-base sm:text-lg font-bold text-gray-800">
                                {entry.bestPercentage.toFixed(1)}%
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {entry.bestScore} pts
                              </div>
                            </div>

                            {/* Trophy for top 3 */}
                            {entry.rank <= 3 && (
                              <div className="ml-1 sm:ml-2 flex-shrink-0">
                                {entry.rank === 1 && <FaTrophy className="text-yellow-500 text-lg sm:text-xl animate-pulse" />}
                                {entry.rank === 2 && <FaMedal className="text-gray-400 text-lg sm:text-xl" />}
                                {entry.rank === 3 && <FaAward className="text-amber-600 text-lg sm:text-xl" />}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {leaderboard.length === 10 && (
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Showing top 10 performers
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Access Control and Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Show access message for users without access */}
                {quiz.accessMessage && !quiz.hasAccess && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 mb-6 border border-blue-200">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaInfoCircle className="text-white text-lg sm:text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                          {quiz.requiresLogin ? 'Login Required' : quiz.requiresPurchase ? 'Purchase Required' : 'Access Required'}
                        </h3>
                        <p className="text-sm sm:text-base text-blue-800 mb-4">{quiz.accessMessage}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {quiz.requiresLogin ? (
                            <button
                              onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                            >
                              Login to Access
                            </button>
                          ) : quiz.requiresPurchase && quiz.testSeries ? (
                            <Link
                              to={`/test-series/${quiz.testSeries._id}`}
                              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto text-center"
                            >
                              View Test Series
                            </Link>
                          ) : quiz.requiresEnrollment && quiz.testSeries ? (
                            <Link
                              to={`/test-series/${quiz.testSeries._id}`}
                              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto text-center"
                            >
                              Enroll in Test Series
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show normal action buttons for users with access */}
                {quiz.hasAccess && (
                  <>
                    {hasAttempted && (
                      <>
                        {(courseId || testSeriesId) && (
                          <Link
                            to={courseId
                              ? `/courses/${courseId}/quizzes/${quizId}/attempts`
                              : `/test-series/${testSeriesId}/quiz/${quizId}/attempts`
                            }
                            className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                          >
                            <FaHistory />
                            View All Attempts
                          </Link>
                        )}

                        {bestAttempt && (courseId || testSeriesId) && (
                          <Link
                            to={courseId
                              ? `/courses/${courseId}/quizzes/${quizId}/results/${bestAttempt._id}`
                              : `/test-series/${testSeriesId}/quiz/${quizId}/results/${bestAttempt._id}`
                            }
                            className="bg-blue-100 text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                          >
                            <FaEye />
                            View Best Result
                          </Link>
                        )}
                      </>
                    )}

                    {canRetake && (
                      <button
                        onClick={handleStartQuiz}
                        className="bg-[#00bcd4] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-[#0097a7] transition-colors inline-flex items-center justify-center gap-2 font-semibold text-base sm:text-lg w-full sm:w-auto"
                      >
                        <FaPlay />
                        {hasAttempted ? `Retake ${quiz.quizType}` : `Start ${quiz.quizType}`}
                      </button>
                    )}

                    {!canRetake && (courseId || testSeriesId) && (
                      <div className="bg-red-50 text-red-700 px-6 py-3 rounded-lg border border-red-200 text-center">
                        <FaTimesCircle className="inline mr-2" />
                        You have reached the maximum number of attempts ({quiz.maxAttempts})
                      </div>
                    )}
                  </>
                )}

                {!courseId && !testSeriesId && (
                  <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-lg border border-blue-200 text-center">
                    <FaInfoCircle className="inline mr-2" />
                    Admin View - Quiz details and statistics only
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
