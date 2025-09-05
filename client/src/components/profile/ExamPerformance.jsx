import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaClipboardCheck, FaTrophy, FaChartLine, FaClock, FaEye, FaCalendarAlt, FaFilter } from 'react-icons/fa';
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
      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Attempts</p>
              <p className="text-2xl font-bold">{stats.totalAttempts || 0}</p>
            </div>
            <FaClipboardCheck className="text-3xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Passed</p>
              <p className="text-2xl font-bold">{stats.totalPassed || 0}</p>
            </div>
            <FaTrophy className="text-3xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Average Score</p>
              <p className="text-2xl font-bold">{stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%'}</p>
            </div>
            <FaChartLine className="text-3xl text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Success Rate</p>
              <p className="text-2xl font-bold">
                {stats.totalAttempts > 0 ? `${((stats.totalPassed / stats.totalAttempts) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <FaGraduationCap className="text-3xl text-cyan-200" />
          </div>
        </div>
      </div>

      {/* Quiz vs Exam Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaClipboardCheck className="mr-2 text-[#00bcd4]" />
            Quizzes
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Attempts:</span>
              <span className="font-medium">{stats.totalQuizzes || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passed:</span>
              <span className="font-medium text-green-600">{stats.quizzesPassed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium">
                {stats.totalQuizzes > 0 ? `${((stats.quizzesPassed / stats.totalQuizzes) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaGraduationCap className="mr-2 text-[#00bcd4]" />
            Exams
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Attempts:</span>
              <span className="font-medium">{stats.totalExams || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passed:</span>
              <span className="font-medium text-green-600">{stats.examsPassed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium">
                {stats.totalExams > 0 ? `${((stats.examsPassed / stats.totalExams) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
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
            <option value="quiz">Quizzes</option>
            <option value="exam">Exams</option>
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            attempt.quiz.quizType === 'exam' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {attempt.quiz.quizType === 'exam' ? 'Exam' : 'Quiz'}
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
  );
};

export default ExamPerformance;
