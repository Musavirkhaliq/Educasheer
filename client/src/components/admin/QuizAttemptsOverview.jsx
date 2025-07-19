import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser, 
  FaBook, 
  FaChevronLeft, 
  FaChevronRight,
  FaSpinner,
  FaTrophy,
  FaQuestionCircle
} from 'react-icons/fa';
import { quizAPI } from '../../services/quizAPI';
import { courseAPI } from '../../services/courseAPI';
import { toast } from 'react-hot-toast';

const QuizAttemptsOverview = () => {
  const [attempts, setAttempts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    quiz: '',
    status: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
  }, []);

  useEffect(() => {
    fetchAttempts();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.data.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getAllQuizzes();
      setQuizzes(response.data.data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {};
      if (filters.course) params.course = filters.course;
      if (filters.quiz) params.quiz = filters.quiz;
      if (filters.status) params.status = filters.status;
      // Note: Search functionality will be implemented in future backend update
      // if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await quizAPI.getAllQuizAttempts(params);
      let filteredAttempts = response.data.data.attempts;

      // Client-side search filtering (until backend search is implemented)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredAttempts = filteredAttempts.filter(attempt =>
          attempt.user.fullName?.toLowerCase().includes(searchTerm) ||
          attempt.user.username?.toLowerCase().includes(searchTerm) ||
          attempt.user.email?.toLowerCase().includes(searchTerm)
        );
      }

      setAttempts(filteredAttempts);
      setPagination(response.data.data.pagination);
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
      setError('Failed to load quiz attempts');
      toast.error('Failed to load quiz attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

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

  const getStatusBadge = (attempt) => {
    if (!attempt.isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaClock size={10} />
          In Progress
        </span>
      );
    }
    
    if (attempt.isPassed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck size={10} />
          Passed
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimes size={10} />
        Failed
      </span>
    );
  };

  if (loading && attempts.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-[#00bcd4]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Attempts Overview</h2>
        <p className="text-gray-600">Monitor and review all quiz attempts across all courses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
              />
            </div>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz
            </label>
            <select
              value={filters.quiz}
              onChange={(e) => handleFilterChange('quiz', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            >
              <option value="">All Quizzes</option>
              {quizzes
                .filter(quiz => !filters.course || quiz.course._id === filters.course)
                .map(quiz => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {attempts.length} of {pagination.totalItems} attempts
          </div>
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Attempts Table */}
      {attempts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaQuestionCircle className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No quiz attempts found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#00bcd4] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {attempt.user.fullName?.charAt(0) || attempt.user.username?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {attempt.user.fullName || attempt.user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attempt.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.quiz.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attempt.quiz.quizType === 'quiz' ? 'Quiz' : 'Exam'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {attempt.quiz.course.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attempt.isCompleted ? (
                        <div className="text-sm">
                          <div className={`font-medium ${attempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.percentage.toFixed(1)}%
                          </div>
                          <div className="text-gray-500">
                            {attempt.score}/{attempt.maxScore} pts
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          In Progress
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(attempt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FaClock className="text-gray-400" size={12} />
                        {attempt.timeSpent ? formatDuration(attempt.timeSpent) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(attempt.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {attempt.isCompleted && (
                        <Link
                          to={`/courses/${attempt.quiz.course._id}/quizzes/${attempt.quiz._id}/results/${attempt._id}`}
                          className="text-[#00bcd4] hover:text-[#0097a7] flex items-center gap-1"
                          title="View Results"
                        >
                          <FaEye />
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                  pagination.hasPrevPage
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaChevronLeft size={12} />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg ${
                        pageNum === pagination.currentPage
                          ? 'bg-[#00bcd4] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                  pagination.hasNextPage
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptsOverview;
