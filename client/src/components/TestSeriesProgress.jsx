import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaPlay,
  FaEye,
  FaChartLine,
  FaTrophy,
  FaBullseye,
  FaCalendarAlt
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';

const TestSeriesProgress = ({ testSeriesId, testSeries, onProgressUpdate }) => {
  const { currentUser } = useAuth();
  const [userAttempts, setUserAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    passedQuizzes: 0,
    totalScore: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    if (testSeries && currentUser) {
      fetchUserProgress();
    }
  }, [testSeries, currentUser]);

  const fetchUserProgress = async () => {
    if (!testSeries?.quizzes) return;
    
    try {
      setLoading(true);
      const attempts = {};
      let totalScore = 0;
      let totalMaxScore = 0;
      let completedCount = 0;
      let passedCount = 0;
      let totalTimeSpent = 0;
      let bestScore = 0;

      for (const quiz of testSeries.quizzes) {
        try {
          const response = await quizAPI.getUserQuizAttempts(quiz._id);
          const quizAttempts = response.data.data;
          attempts[quiz._id] = quizAttempts;

          if (quizAttempts.length > 0) {
            // Find best attempt for this quiz
            const bestAttempt = quizAttempts.reduce((best, current) => 
              current.percentage > best.percentage ? current : best
            );

            if (bestAttempt.isCompleted) {
              completedCount++;
              totalScore += bestAttempt.score;
              totalMaxScore += bestAttempt.maxScore;
              totalTimeSpent += bestAttempt.timeSpent || 0;
              
              if (bestAttempt.isPassed) {
                passedCount++;
              }
              
              if (bestAttempt.percentage > bestScore) {
                bestScore = bestAttempt.percentage;
              }
            }
          }
        } catch (error) {
          // Quiz might not have attempts, which is fine
          attempts[quiz._id] = [];
        }
      }

      const averageScore = completedCount > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      const completionPercentage = (completedCount / testSeries.quizzes.length) * 100;

      setUserAttempts(attempts);
      setStats({
        totalQuizzes: testSeries.quizzes.length,
        completedQuizzes: completedCount,
        passedQuizzes: passedCount,
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
        bestScore: Math.round(bestScore * 100) / 100,
        completionPercentage: Math.round(completionPercentage * 100) / 100
      });

      if (onProgressUpdate) {
        onProgressUpdate({
          completionPercentage,
          completedQuizzes: completedCount,
          totalQuizzes: testSeries.quizzes.length
        });
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBestAttempt = (quizId) => {
    const attempts = userAttempts[quizId] || [];
    if (attempts.length === 0) return null;
    return attempts.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  };

  const getQuizStatus = (quiz) => {
    const bestAttempt = getBestAttempt(quiz._id);
    if (!bestAttempt || !bestAttempt.isCompleted) return 'not-attempted';
    return bestAttempt.isPassed ? 'passed' : 'failed';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <FaCheck className="text-green-600" />;
      case 'failed':
        return <FaTimes className="text-red-600" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartLine className="text-[#00bcd4]" />
          Progress Overview
        </h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{stats.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.completedQuizzes}</div>
            <div className="text-sm text-blue-800">Completed</div>
            <div className="text-xs text-gray-600">of {stats.totalQuizzes}</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.passedQuizzes}</div>
            <div className="text-sm text-green-800">Passed</div>
            <div className="text-xs text-gray-600">tests</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
            <div className="text-sm text-purple-800">Average</div>
            <div className="text-xs text-gray-600">score</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.totalTimeSpent}</div>
            <div className="text-sm text-orange-800">Minutes</div>
            <div className="text-xs text-gray-600">spent</div>
          </div>
        </div>

        {/* Best Performance */}
        {stats.bestScore > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <FaTrophy />
              <span className="font-medium">Best Performance: {stats.bestScore}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Progress List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaBullseye className="text-[#00bcd4]" />
          Test Progress
        </h3>

        <div className="space-y-3">
          {testSeries.quizzes?.map((quiz, index) => {
            const status = getQuizStatus(quiz);
            const bestAttempt = getBestAttempt(quiz._id);
            const attemptCount = userAttempts[quiz._id]?.length || 0;

            return (
              <div
                key={quiz._id}
                className={`border rounded-lg p-4 transition-all duration-200 ${getStatusColor(status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-current">
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{quiz.title}</h4>
                      <div className="flex items-center gap-4 text-sm mt-1">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>{quiz.timeLimit} min</span>
                        {bestAttempt && (
                          <span className="font-medium">
                            Best: {bestAttempt.percentage}% ({bestAttempt.score}/{bestAttempt.maxScore})
                          </span>
                        )}
                        {attemptCount > 0 && (
                          <span className="text-xs">
                            {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {bestAttempt && (
                      <Link
                        to={`/quiz-attempts/${bestAttempt._id}`}
                        className="text-sm px-3 py-1 bg-white/50 rounded hover:bg-white/80 transition-colors flex items-center gap-1"
                      >
                        <FaEye size={12} />
                        View Result
                      </Link>
                    )}
                    <Link
                      to={`/test-series/${testSeriesId}/quiz/${quiz._id}`}
                      className="text-sm px-3 py-1 bg-white rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <FaPlay size={12} />
                      {bestAttempt ? 'Retake' : 'Start'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestSeriesProgress;
