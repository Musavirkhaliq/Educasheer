import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaFileImport, FaSearch } from 'react-icons/fa';
import { quizAPI } from '../../services/quizAPI';
import { courseAPI } from '../../services/courseAPI';
import { toast } from 'react-hot-toast';
import BulkQuizImport from './BulkQuizImport';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [filters, setFilters] = useState({
    course: '',
    published: '',
    type: '',
    search: ''
  });

  // Fetch quizzes and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizzesResponse, coursesResponse] = await Promise.all([
          quizAPI.getAllQuizzes(filters),
          courseAPI.getAllCourses()
        ]);

        // Make sure we're setting arrays for both quizzes and courses
        const quizzesData = Array.isArray(quizzesResponse.data.data) ? quizzesResponse.data.data : [];
        const coursesData = Array.isArray(coursesResponse.data.data) ? coursesResponse.data.data : [];

        console.log('Quizzes response:', quizzesResponse.data);
        console.log('Courses response:', coursesResponse.data);

        setQuizzes(quizzesData);
        setCourses(coursesData);
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
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No quizzes found. Create your first quiz to get started!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
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
                <tr key={quiz._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {quiz.course?.title || 'Unknown Course'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">
                      {quiz.quizType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {quiz.questions?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        quiz.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                        className={`${
                          quiz.isPublished
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={quiz.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {quiz.isPublished ? <FaTimes /> : <FaCheck />}
                      </button>
                      <Link
                        to={`/admin/quizzes/${quiz._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/admin/quizzes/edit/${quiz._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
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
