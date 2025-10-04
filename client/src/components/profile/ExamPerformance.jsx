import React, { useState, useEffect, useMemo } from 'react';
import {
  FaClipboardCheck,
  FaTrophy,
  FaChartLine,
  FaClock,
  FaEye,
  FaCalendarAlt,
  FaFilter,
  FaBullseye,
  FaBookOpen,
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFire,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
import { quizAPI } from '../../services/quizAPI';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ExamPerformance = () => {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    status: '',
    quizType: ''
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchExamPerformance();
  }, [page, filter]);

  const fetchExamPerformance = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...filter
      };

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await quizAPI.getUserAllQuizAttempts(params);
      setAttempts(response.data.data.attempts);
      setStats(response.data.data.stats);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching exam performance:', err);
      setError('Failed to load exam performance data');
      toast.error('Failed to load exam performance data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getScoreColor = (percentage, isPassed) => {
    if (!isPassed) return 'text-red-600';
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getScoreBadge = (percentage, isPassed) => {
    if (!isPassed) return 'bg-red-100 text-red-800';
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Advanced Analytics Calculations
  const analytics = useMemo(() => {
    if (!attempts.length) return null;

    const completedAttempts = attempts.filter(a => a.isCompleted);
    const recentAttempts = completedAttempts.slice(0, 10);
    const last30Days = completedAttempts.filter(a =>
      new Date(a.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    // Performance by Quiz Type
    const performanceByType = {};
    ['Topic Test', 'Subject Test', 'Multi Subject', 'Full Test'].forEach(type => {
      const typeAttempts = completedAttempts.filter(a => a.quiz.quizType === type);
      performanceByType[type] = {
        total: typeAttempts.length,
        passed: typeAttempts.filter(a => a.isPassed).length,
        averageScore: typeAttempts.length > 0
          ? typeAttempts.reduce((sum, a) => sum + a.percentage, 0) / typeAttempts.length
          : 0,
        bestScore: typeAttempts.length > 0
          ? Math.max(...typeAttempts.map(a => a.percentage))
          : 0,
        averageTime: typeAttempts.length > 0
          ? typeAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / typeAttempts.length
          : 0
      };
    });

    // Performance Trends (last 10 attempts)
    const trendData = recentAttempts.reverse().map((attempt, index) => ({
      attempt: index + 1,
      score: attempt.percentage,
      date: new Date(attempt.createdAt).toLocaleDateString(),
      isPassed: attempt.isPassed
    }));

    // Time Analysis
    const timeAnalysis = {
      averageTimePerQuestion: completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => {
          const questionsCount = a.maxScore; // Assuming 1 point per question
          return sum + (questionsCount > 0 ? a.timeSpent / questionsCount : 0);
        }, 0) / completedAttempts.length
        : 0,
      fastestCompletion: completedAttempts.length > 0
        ? Math.min(...completedAttempts.map(a => a.timeSpent))
        : 0,
      slowestCompletion: completedAttempts.length > 0
        ? Math.max(...completedAttempts.map(a => a.timeSpent))
        : 0
    };

    // Difficulty Analysis
    const difficultyAnalysis = {
      easy: completedAttempts.filter(a => a.percentage >= 80).length,
      medium: completedAttempts.filter(a => a.percentage >= 60 && a.percentage < 80).length,
      hard: completedAttempts.filter(a => a.percentage < 60).length
    };

    // Streak Analysis
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = completedAttempts.length - 1; i >= 0; i--) {
      if (completedAttempts[i].isPassed) {
        tempStreak++;
        if (i === completedAttempts.length - 1) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (i === completedAttempts.length - 1) currentStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Recent Performance (last 30 days)
    const recentPerformance = {
      totalAttempts: last30Days.length,
      passedAttempts: last30Days.filter(a => a.isPassed).length,
      averageScore: last30Days.length > 0
        ? last30Days.reduce((sum, a) => sum + a.percentage, 0) / last30Days.length
        : 0,
      improvement: (() => {
        if (last30Days.length < 2) return 0;
        const firstHalf = last30Days.slice(0, Math.floor(last30Days.length / 2));
        const secondHalf = last30Days.slice(Math.floor(last30Days.length / 2));
        const firstAvg = firstHalf.reduce((sum, a) => sum + a.percentage, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, a) => sum + a.percentage, 0) / secondHalf.length;
        return secondAvg - firstAvg;
      })()
    };

    // Subject Performance (based on course titles)
    const subjectPerformance = {};
    completedAttempts.forEach(attempt => {
      const subject = attempt.quiz.course?.title || 'Unknown';
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          total: 0,
          passed: 0,
          totalScore: 0,
          bestScore: 0
        };
      }
      subjectPerformance[subject].total++;
      if (attempt.isPassed) subjectPerformance[subject].passed++;
      subjectPerformance[subject].totalScore += attempt.percentage;
      subjectPerformance[subject].bestScore = Math.max(
        subjectPerformance[subject].bestScore,
        attempt.percentage
      );
    });

    // Convert to array and add averages
    const subjectArray = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      ...data,
      averageScore: data.total > 0 ? data.totalScore / data.total : 0,
      successRate: data.total > 0 ? (data.passed / data.total) * 100 : 0
    })).sort((a, b) => b.averageScore - a.averageScore);

    return {
      performanceByType,
      trendData,
      timeAnalysis,
      difficultyAnalysis,
      currentStreak,
      longestStreak,
      recentPerformance,
      subjectPerformance: subjectArray
    };
  }, [attempts]);

  if (loading && attempts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error && attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setError('');
            fetchExamPerformance();
          }}
          className="text-[#00bcd4] font-medium hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Attempts</p>
              <p className="text-2xl font-bold">{stats.totalAttempts || 0}</p>
              {analytics?.recentPerformance?.totalAttempts > 0 && (
                <p className="text-blue-200 text-xs mt-1">
                  {analytics.recentPerformance.totalAttempts} in last 30 days
                </p>
              )}
            </div>
            <FaClipboardCheck className="text-3xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Success Rate</p>
              <p className="text-2xl font-bold">
                {stats.totalAttempts > 0 ? `${((stats.totalPassed / stats.totalAttempts) * 100).toFixed(1)}%` : '0%'}
              </p>
              {analytics?.currentStreak > 0 && (
                <p className="text-green-200 text-xs mt-1 flex items-center">
                  <FaFire className="mr-1" />
                  {analytics.currentStreak} streak
                </p>
              )}
            </div>
            <FaTrophy className="text-3xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Average Score</p>
              <p className="text-2xl font-bold">{stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%'}</p>
              {analytics?.recentPerformance?.improvement !== undefined && (
                <p className={`text-xs mt-1 flex items-center ${analytics.recentPerformance.improvement > 0 ? 'text-green-200' :
                  analytics.recentPerformance.improvement < 0 ? 'text-red-200' : 'text-purple-200'
                  }`}>
                  {analytics.recentPerformance.improvement > 0 ? <FaArrowUp className="mr-1" /> :
                    analytics.recentPerformance.improvement < 0 ? <FaArrowDown className="mr-1" /> :
                      <FaMinus className="mr-1" />}
                  {Math.abs(analytics.recentPerformance.improvement).toFixed(1)}% trend
                </p>
              )}
            </div>
            <FaChartLine className="text-3xl text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Best Streak</p>
              <p className="text-2xl font-bold">{analytics?.longestStreak || 0}</p>
              {analytics?.timeAnalysis?.averageTimePerQuestion > 0 && (
                <p className="text-cyan-200 text-xs mt-1">
                  ~{Math.round(analytics.timeAnalysis.averageTimePerQuestion)}s per question
                </p>
              )}
            </div>
            <FaStar className="text-3xl text-cyan-200" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Responsive */}
      <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-200">
        <div className="flex flex-wrap border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine, shortLabel: 'Overview' },
            { id: 'analytics', label: 'Analytics', icon: FaChartLine, shortLabel: 'Analytics' },
            { id: 'subjects', label: 'Subject Analysis', icon: FaBookOpen, shortLabel: 'Subjects' },
            { id: 'attempts', label: 'Recent Attempts', icon: FaClipboardCheck, shortLabel: 'Attempts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'text-[#00bcd4] border-b-2 border-[#00bcd4] bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <tab.icon className="mr-1 sm:mr-2 text-sm sm:text-base" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quiz Type Performance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {analytics && Object.entries(analytics.performanceByType).map(([type, data]) => (
              <div key={type} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <FaBullseye className="mr-2 text-[#00bcd4]" />
                  {type}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Attempts:</span>
                    <span className="font-medium">{data.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Passed:</span>
                    <span className="font-medium text-green-600">{data.passed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium">
                      {data.total > 0 ? `${((data.passed / data.total) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{data.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Best Score:</span>
                    <span className="font-medium text-blue-600">{data.bestScore.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Insights */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Difficulty Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBullseye className="mr-2 text-[#00bcd4]" />
                  Performance Level
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Excellent (80%+)</span>
                    </div>
                    <span className="font-medium">{analytics.difficultyAnalysis.easy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Good (60-79%)</span>
                    </div>
                    <span className="font-medium">{analytics.difficultyAnalysis.medium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Needs Work (&lt;60%)</span>
                    </div>
                    <span className="font-medium">{analytics.difficultyAnalysis.hard}</span>
                  </div>
                </div>
              </div>

              {/* Time Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaClock className="mr-2 text-[#00bcd4]" />
                  Time Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg per Question:</span>
                    <span className="font-medium">{Math.round(analytics.timeAnalysis.averageTimePerQuestion)}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fastest Quiz:</span>
                    <span className="font-medium">{formatDuration(analytics.timeAnalysis.fastestCompletion)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Longest Quiz:</span>
                    <span className="font-medium">{formatDuration(analytics.timeAnalysis.slowestCompletion)}</span>
                  </div>
                </div>
              </div>

              {/* Recent Performance */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-[#00bcd4]" />
                  Last 30 Days
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Attempts:</span>
                    <span className="font-medium">{analytics.recentPerformance.totalAttempts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Passed:</span>
                    <span className="font-medium text-green-600">{analytics.recentPerformance.passedAttempts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{analytics.recentPerformance.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trend:</span>
                    <span className={`font-medium flex items-center ${analytics.recentPerformance.improvement > 0 ? 'text-green-600' :
                      analytics.recentPerformance.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {analytics.recentPerformance.improvement > 0 ? <FaArrowUp className="mr-1" /> :
                        analytics.recentPerformance.improvement < 0 ? <FaArrowDown className="mr-1" /> :
                          <FaMinus className="mr-1" />}
                      {Math.abs(analytics.recentPerformance.improvement).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Performance Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-[#00bcd4]" />
              Performance Trend (Last 10 Attempts)
            </h3>
            {analytics.trendData.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Score %</span>
                  <span>Attempts →</span>
                </div>
                <div className="relative h-64 flex items-end justify-between bg-gray-50 rounded p-4">
                  {analytics.trendData.map((point, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-8 rounded-t transition-all duration-300 ${point.isPassed ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        style={{ height: `${(point.score / 100) * 200}px` }}
                        title={`Attempt ${point.attempt}: ${point.score.toFixed(1)}% on ${point.date}`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{point.attempt}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Passed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span>Failed</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Not enough data to show trend</p>
            )}
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-green-500" />
                Strengths
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.performanceByType)
                  .filter(([_, data]) => data.total > 0 && (data.passed / data.total) >= 0.7)
                  .sort((a, b) => (b[1].passed / b[1].total) - (a[1].passed / a[1].total))
                  .slice(0, 3)
                  .map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{type}</p>
                        <p className="text-sm text-green-600">
                          {((data.passed / data.total) * 100).toFixed(1)}% success rate
                        </p>
                      </div>
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  ))}
                {Object.entries(analytics.performanceByType).filter(([_, data]) =>
                  data.total > 0 && (data.passed / data.total) >= 0.7
                ).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Keep practicing to identify your strengths!</p>
                  )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaExclamationTriangle className="mr-2 text-yellow-500" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.performanceByType)
                  .filter(([_, data]) => data.total > 0 && (data.passed / data.total) < 0.7)
                  .sort((a, b) => (a[1].passed / a[1].total) - (b[1].passed / b[1].total))
                  .slice(0, 3)
                  .map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">{type}</p>
                        <p className="text-sm text-yellow-600">
                          {((data.passed / data.total) * 100).toFixed(1)}% success rate
                        </p>
                      </div>
                      <FaExclamationTriangle className="text-yellow-500" />
                    </div>
                  ))}
                {Object.entries(analytics.performanceByType).filter(([_, data]) =>
                  data.total > 0 && (data.passed / data.total) < 0.7
                ).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Great job! No major weak areas identified.</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && analytics && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaBookOpen className="mr-2 text-[#00bcd4]" />
                Subject-wise Performance Analysis
              </h3>
            </div>
            <div className="p-6">
              {analytics.subjectPerformance.length > 0 ? (
                <div className="space-y-4">
                  {analytics.subjectPerformance.map((subject, index) => (
                    <div key={subject.subject} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">{subject.subject}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject.successRate >= 80 ? 'bg-green-100 text-green-800' :
                            subject.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Attempts</p>
                          <p className="font-semibold">{subject.total}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <p className="font-semibold">{subject.successRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Average Score</p>
                          <p className="font-semibold">{subject.averageScore.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Best Score</p>
                          <p className="font-semibold text-blue-600">{subject.bestScore.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${subject.successRate >= 80 ? 'bg-green-500' :
                              subject.successRate >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            style={{ width: `${subject.successRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No subject data available yet</p>
              )}
            </div>
          </div>

          {/* Performance Recommendations */}
          {analytics.subjectPerformance.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaLightbulb className="mr-2 text-yellow-500" />
                  Personalized Recommendations
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Focus Areas */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <FaBullseye className="mr-2 text-red-500" />
                      Focus Areas
                    </h4>
                    {analytics.subjectPerformance
                      .filter(subject => subject.successRate < 70)
                      .slice(0, 3)
                      .map(subject => (
                        <div key={subject.subject} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="font-medium text-red-800">{subject.subject}</p>
                          <p className="text-sm text-red-600">
                            Success rate: {subject.successRate.toFixed(1)}% - Consider reviewing fundamentals and practicing more questions
                          </p>
                        </div>
                      ))}
                    {analytics.subjectPerformance.filter(subject => subject.successRate < 70).length === 0 && (
                      <p className="text-gray-500 italic">Great job! No critical areas identified.</p>
                    )}
                  </div>

                  {/* Strong Subjects */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <FaCheckCircle className="mr-2 text-green-500" />
                      Strong Subjects
                    </h4>
                    {analytics.subjectPerformance
                      .filter(subject => subject.successRate >= 80)
                      .slice(0, 3)
                      .map(subject => (
                        <div key={subject.subject} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="font-medium text-green-800">{subject.subject}</p>
                          <p className="text-sm text-green-600">
                            Success rate: {subject.successRate.toFixed(1)}% - Maintain your excellent performance!
                          </p>
                        </div>
                      ))}
                    {analytics.subjectPerformance.filter(subject => subject.successRate >= 80).length === 0 && (
                      <p className="text-gray-500 italic">Keep practicing to build strong subjects!</p>
                    )}
                  </div>
                </div>

                {/* General Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <FaLightbulb className="mr-2" />
                    Study Tips Based on Your Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    {analytics.timeAnalysis.averageTimePerQuestion > 120 && (
                      <div className="flex items-start">
                        <FaClock className="mr-2 mt-1 flex-shrink-0" />
                        <span>Work on time management - aim for faster question solving</span>
                      </div>
                    )}
                    {analytics.currentStreak === 0 && stats.totalAttempts > 3 && (
                      <div className="flex items-start">
                        <FaBullseye className="mr-2 mt-1 flex-shrink-0" />
                        <span>Focus on consistency - review basics before attempting new tests</span>
                      </div>
                    )}
                    {analytics.recentPerformance.improvement < -5 && (
                      <div className="flex items-start">
                        <FaArrowUp className="mr-2 mt-1 flex-shrink-0" />
                        <span>Recent performance declined - take a break and review weak areas</span>
                      </div>
                    )}
                    {analytics.recentPerformance.improvement > 5 && (
                      <div className="flex items-start">
                        <FaCheckCircle className="mr-2 mt-1 flex-shrink-0" />
                        <span>Great improvement trend! Keep up the momentum</span>
                      </div>
                    )}
                    {stats.averageScore >= 80 && (
                      <div className="flex items-start">
                        <FaStar className="mr-2 mt-1 flex-shrink-0" />
                        <span>Excellent performance! Consider attempting more challenging tests</span>
                      </div>
                    )}
                    {stats.averageScore < 60 && (
                      <div className="flex items-start">
                        <FaBookOpen className="mr-2 mt-1 flex-shrink-0" />
                        <span>Focus on understanding concepts before attempting more tests</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'attempts' && (
        <div className="space-y-6">

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>

              <select
                value={filter.quizType}
                onChange={(e) => setFilter({ ...filter, quizType: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
              >
                <option value="">All Types</option>
                <option value="Topic Test">Topic Tests</option>
                <option value="Subject Test">Subject Tests</option>
                <option value="Multi Subject">Multi Subject</option>
                <option value="Full Test">Full Tests</option>
              </select>

              <button
                onClick={() => {
                  setFilter({ status: '', quizType: '' });
                  setPage(1);
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Attempts List */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Attempts</h3>
            </div>

            {attempts.length === 0 ? (
              <div className="text-center py-12">
                <FaClipboardCheck className="text-gray-400 text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No exam attempts found</h3>
                <p className="text-gray-500 mb-6">Start taking quizzes and exams to see your performance here</p>
                <Link
                  to="/courses"
                  className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz/Exam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attempts.map((attempt) => (
                      <tr key={attempt._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 break-words max-w-xs">
                              {attempt.quiz.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${attempt.quiz.quizType === 'Topic Test'
                                ? 'bg-blue-100 text-blue-800'
                                : attempt.quiz.quizType === 'Subject Test'
                                  ? 'bg-green-100 text-green-800'
                                  : attempt.quiz.quizType === 'Multi Subject'
                                    ? 'bg-purple-100 text-purple-800'
                                    : attempt.quiz.quizType === 'Full Test'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                {attempt.quiz.quizType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="break-words max-w-xs">{attempt.quiz.course.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className={`font-medium ${getScoreColor(attempt.percentage, attempt.isPassed)}`}>
                              {attempt.percentage.toFixed(1)}%
                            </div>
                            <div className="text-gray-500">
                              {attempt.score}/{attempt.maxScore}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attempt.isCompleted ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBadge(attempt.percentage, attempt.isPassed)}`}>
                              {attempt.isPassed ? 'Passed' : 'Failed'}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaClock className="mr-1 text-gray-400" />
                            {formatDuration(attempt.timeSpent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1 text-gray-400" />
                            {formatDate(attempt.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {attempt.isCompleted && (
                            <Link
                              to={`/courses/${attempt.quiz.course._id}/quizzes/${attempt.quiz._id}/results/${attempt._id}`}
                              className="text-[#00bcd4] hover:text-[#0097a7] flex items-center"
                            >
                              <FaEye className="mr-1" />
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPerformance;
