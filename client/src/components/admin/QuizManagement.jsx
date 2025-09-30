import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaFileImport, FaSearch } from 'react-icons/fa';
import { quizAPI } from '../../services/quizAPI';
import { courseAPI } from '../../services/courseAPI';
import { testSeriesAPI } from '../../services/testSeriesAPI';
import { toast } from 'react-hot-toast';
import BulkQuizImport from './BulkQuizImport';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [filters, setFilters] = useState({
    course: '',
    testSeries: '',
    published: '',
    type: '',
    search: ''
  });

  // Fetch quizzes, courses, and test series on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build test series filters based on selected course
        const testSeriesFilters = {};
        if (filters.course) {
          testSeriesFilters.course = filters.course;
        }
        
        const [quizzesResponse, coursesResponse, testSeriesResponse] = await Promise.all([
          quizAPI.getAllQuizzes(filters),
          courseAPI.getAllCourses(),
          testSeriesAPI.getAllTestSeries(testSeriesFilters)
        ]);

        // Make sure we're setting arrays for all data
        const quizzesData = Array.isArray(quizzesResponse.data.data) ? quizzesResponse.data.data : [];
        const coursesData = Array.isArray(coursesResponse.data.data) ? coursesResponse.data.data : [];
        const testSeriesData = Array.isArray(testSeriesResponse.data.data) ? testSeriesResponse.data.data : [];

        console.log('Quizzes response:', quizzesResponse.data);
        console.log('Courses response:', coursesResponse.data);
        console.log('Test Series response:', testSeriesResponse.data);

        setQuizzes(quizzesData);
        setCourses(coursesData);
        setTestSeries(testSeriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load quizzes. Please try again.');
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [name]: value
      };
      
      // If course changes, reset test series filter to show only test series for that course
      if (name === 'course') {
        newFilters.testSeries = '';
      }
      
      return newFilters;
    });
  };

  // Handle publish/unpublish quiz
  const handleTogglePublish = async (quizId, currentStatus) => {
    try {
      console.log(`Toggling publish status for quiz ${quizId} from ${currentStatus} to ${!currentStatus}`);

      const response = await quizAPI.toggleQuizPublishStatus(quizId, !currentStatus);
      console.log('Toggle publish response:', response.data);

      // Update local state
      setQuizzes(prevQuizzes =>
        prevQuizzes.map(quiz => {
          if (quiz._id === quizId) {
            console.log(`Updating quiz in state: ${quiz.title}, isPublished: ${currentStatus} -> ${!currentStatus}`);
            return { ...quiz, isPublished: !currentStatus };
          }
          return quiz;
        })
      );

      toast.success(`Quiz ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      console.error('Error toggling publish status:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error('Failed to update quiz status');
    }
  };

  // Handle delete quiz
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await quizAPI.deleteQuiz(quizId);

      // Update local state
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId));

      toast.success('Quiz deleted successfully');
    } catch (err) {
      console.error('Error deleting quiz:', err);
      toast.error('Failed to delete quiz');
    }
  };

  // Handle closing bulk import modal
  const handleCloseBulkImport = () => {
    setShowBulkImport(false);
    // Refresh quizzes list after potential new quiz creation
    const fetchQuizzes = async () => {
      try {
        const response = await quizAPI.getAllQuizzes(filters);
        setQuizzes(response.data.data);
      } catch (err) {
        console.error('Error refreshing quizzes:', err);
      }
    };
    fetchQuizzes();
  };

  // Render loading state
  if (loading && quizzes.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkImport(!showBulkImport)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <FaFileImport /> Import Questions
            </button>
            <Link
              to="/admin/quizzes/create"
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0097a7] transition-colors"
            >
              <FaPlus /> Create Quiz
            </Link>
          </div>
        </div>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
          <p className="mt-2">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quiz Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <FaFileImport /> Import Questions
          </button>
          <Link
            to="/admin/quizzes/create"
            className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0097a7] transition-colors"
          >
            <FaPlus /> Create Quiz
          </Link>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkQuizImport onClose={handleCloseBulkImport} />
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Quiz Statistics */}
      {quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
                <p className="text-2xl font-semibold text-gray-900">{quizzes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {quizzes.filter(quiz => quiz.isPublished).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {quizzes.filter(quiz => !quiz.isPublished).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Questions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {quizzes.reduce((total, quiz) => total + (quiz.questions?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search quizzes..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Series
              {filters.course && (
                <span className="text-xs text-blue-600 ml-1">(filtered by course)</span>
              )}
            </label>
            <select
              name="testSeries"
              value={filters.testSeries}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">
                {filters.course ? 'All Test Series in Course' : 'All Test Series'}
              </option>
              {testSeries.map(series => (
                <option key={series._id} value={series._id}>
                  {series.title}
                  {series.course?.title && (
                    <span className="text-gray-500"> (Course: {series.course.title})</span>
                  )}
                </option>
              ))}
            </select>
            {testSeries.length === 0 && filters.course && (
              <p className="text-xs text-gray-500 mt-1">
                No test series found for the selected course
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="published"
              value={filters.published}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-500 mb-6">Create your first quiz to get started with assessments!</p>
          <Link
            to="/admin/quizzes/create"
            className="inline-flex items-center px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#0097a7] transition-colors"
          >
            <FaPlus className="mr-2" size={14} />
            Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Series & Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quizzes.map(quiz => (
                <tr key={quiz._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 mb-1 quiz-title-compact max-w-xs">{quiz.title}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        {quiz.description && quiz.description.length > 100 
                          ? `${quiz.description.substring(0, 100)}...` 
                          : quiz.description || 'No description'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          quiz.quizType === 'exam' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {quiz.quizType === 'exam' ? 'Exam' : 'Quiz'}
                        </span>
                        {quiz.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {quiz.category}
                          </span>
                        )}
                        {quiz.difficulty && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            quiz.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                            quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {quiz.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {quiz.testSeries?.title && (
                        <div className="flex items-center mb-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 max-w-full">
                            <span className="truncate">📝 {quiz.testSeries.title}</span>
                          </span>
                        </div>
                      )}
                      {quiz.testSeries?.course?.title && (
                        <div className="flex items-center mb-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 max-w-full">
                            <span className="truncate">📚 {quiz.testSeries.course.title}</span>
                          </span>
                        </div>
                      )}
                      {!quiz.testSeries?.title && (
                        <span className="text-gray-400 text-xs">No test series</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600">Questions:</span>
                        <span className="ml-2 font-medium">{quiz.questions?.length || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600">Time:</span>
                        <span className="ml-2 font-medium">{quiz.timeLimit || 0} min</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600">Pass:</span>
                        <span className="ml-2 font-medium">{quiz.passingScore || 0}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          quiz.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {quiz.isPublished ? (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Published
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                            Draft
                          </>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* Publish/Unpublish Button */}
                      <button
                        onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                        className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          quiz.isPublished
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={quiz.isPublished ? 'Unpublish Quiz' : 'Publish Quiz'}
                      >
                        {quiz.isPublished ? (
                          <>
                            <FaTimes className="mr-1" size={12} />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <FaCheck className="mr-1" size={12} />
                            Publish
                          </>
                        )}
                      </button>

                      {/* View Button */}
                      <Link
                        to={`/admin/quizzes/${quiz._id}`}
                        className="flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                        title="View Quiz Details"
                      >
                        <FaEye className="mr-1" size={12} />
                        View
                      </Link>

                      {/* Edit Button */}
                      <Link
                        to={`/admin/quizzes/edit/${quiz._id}`}
                        className="flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        title="Edit Quiz"
                      >
                        <FaEdit className="mr-1" size={12} />
                        Edit
                      </Link>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="Delete Quiz"
                      >
                        <FaTrash className="mr-1" size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
