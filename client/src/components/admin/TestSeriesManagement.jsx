import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaBook, FaClock, FaQuestionCircle } from 'react-icons/fa';
import { testSeriesAPI } from '../../services/testSeriesAPI';
import { toast } from 'react-hot-toast';

const TestSeriesManagement = () => {
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    published: '',
    difficulty: '',
    examType: '',
    subject: ''
  });

  useEffect(() => {
    fetchTestSeries();
  }, [filters]);

  const fetchTestSeries = async () => {
    try {
      setLoading(true);
      const response = await testSeriesAPI.getAllTestSeries(filters);
      setTestSeries(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching test series:', error);
      setError('Failed to fetch test series');
      toast.error('Failed to fetch test series');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (testSeriesId, currentStatus) => {
    try {
      await testSeriesAPI.togglePublishStatus(testSeriesId, !currentStatus);
      toast.success(`Test series ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchTestSeries();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const handleDelete = async (testSeriesId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await testSeriesAPI.deleteTestSeries(testSeriesId);
        toast.success('Test series deleted successfully');
        fetchTestSeries();
      } catch (error) {
        console.error('Error deleting test series:', error);
        toast.error('Failed to delete test series');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      published: '',
      difficulty: '',
      examType: '',
      subject: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Test Series Management</h1>
          <p className="text-gray-600 mt-1">Manage and organize test series for different exams</p>
        </div>
        <Link
          to="/admin/test-series/create"
          className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors flex items-center gap-2"
        >
          <FaPlus />
          Create Test Series
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Management">Management</option>
              <option value="Government">Government</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.published}
              onChange={(e) => handleFilterChange('published', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <input
              type="text"
              value={filters.examType}
              onChange={(e) => handleFilterChange('examType', e.target.value)}
              placeholder="e.g., JEE, NEET, CAT"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Test Series List */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : testSeries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaBook className="text-gray-400 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Test Series Found</h3>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some(f => f) 
              ? "No test series match your current filters." 
              : "You haven't created any test series yet."
            }
          </p>
          <Link
            to="/admin/test-series/create"
            className="inline-flex items-center gap-2 bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
          >
            <FaPlus />
            Create Your First Test Series
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Series
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
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
                {testSeries.map((series) => (
                  <tr key={series._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{series.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{series.description}</p>
                        {series.examType && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                            {series.examType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="capitalize">{series.difficulty}</span>
                          <span className="text-gray-400">•</span>
                          <span>{series.category}</span>
                        </div>
                        {series.subject && (
                          <div className="text-gray-500">{series.subject}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <FaQuestionCircle className="text-gray-400" />
                          <span>{series.totalQuizzes} quizzes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          <span>{series.estimatedDuration} min</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(series._id, series.isPublished)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          series.isPublished
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } transition-colors`}
                      >
                        {series.isPublished ? <FaCheck /> : <FaTimes />}
                        {series.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/test-series/${series._id}`}
                          className="text-[#00bcd4] hover:text-[#0097a7] transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/admin/test-series/${series._id}/edit`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(series._id, series.title)}
                          className="text-red-600 hover:text-red-800 transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default TestSeriesManagement;
