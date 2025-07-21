import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaClock, FaQuestionCircle, FaUsers, FaPlay, FaStar, FaTag } from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const TestSeriesCard = ({ testSeries, onEnroll }) => {
  const { currentUser } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!currentUser) {
      toast.error('Please login to enroll in test series');
      return;
    }

    try {
      setEnrolling(true);
      await onEnroll(testSeries._id);
    } finally {
      setEnrolling(false);
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

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <Link to={`/test-series/${testSeries._id}`} className="block">
        <div className="relative">
          {testSeries.thumbnail ? (
            <img
              src={testSeries.thumbnail}
              alt={testSeries.title}
              className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-40 sm:h-44 md:h-48 bg-gradient-to-br from-[#00bcd4] to-[#0097a7] flex items-center justify-center">
              <FaBook className="text-white text-4xl" />
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(testSeries.difficulty)}`}>
              {testSeries.difficulty.charAt(0).toUpperCase() + testSeries.difficulty.slice(1)}
            </span>
          </div>

          {testSeries.examType && (
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                {testSeries.examType}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        <div className="mb-3">
          <Link to={`/test-series/${testSeries._id}`}>
            <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-[#00bcd4] transition-colors">
              {testSeries.title}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {testSeries.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaQuestionCircle className="text-[#00bcd4]" />
            <span>{testSeries.totalQuizzes} Tests</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-[#00bcd4]" />
            <span>{testSeries.estimatedDuration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-[#00bcd4]" />
            <span>{testSeries.enrolledStudents?.length || 0} enrolled</span>
          </div>
          <div className="flex items-center gap-2">
            <FaTag className="text-[#00bcd4]" />
            <span>{testSeries.category}</span>
          </div>
        </div>

        {/* Tags */}
        {testSeries.tags && testSeries.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {testSeries.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {testSeries.tags.length > 3 && (
              <span className="text-gray-500 text-xs">+{testSeries.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Subject */}
        {testSeries.subject && (
          <div className="mb-4">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {testSeries.subject}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {testSeries.price > 0 ? (
              <>
                <span className="text-2xl font-bold text-[#00bcd4]">₹{testSeries.price}</span>
                {testSeries.originalPrice > testSeries.price && (
                  <span className="text-gray-500 line-through text-sm">₹{testSeries.originalPrice}</span>
                )}
              </>
            ) : (
              <span className="text-2xl font-bold text-green-600">Free</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {testSeries.isEnrolled ? (
            <Link
              to={`/test-series/${testSeries._id}`}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaPlay size={14} />
              Continue
            </Link>
          ) : (
            <>
              <Link
                to={`/test-series/${testSeries._id}`}
                className="flex-1 border border-[#00bcd4] text-[#00bcd4] py-2 px-4 rounded-lg text-center hover:bg-[#00bcd4] hover:text-white transition-colors"
              >
                View Details
              </Link>
              {testSeries.price === 0 && (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-[#00bcd4] text-white py-2 px-4 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TestSeriesList = ({
  limit,
  title = "Test Series",
  search = "",
  filters = {}
}) => {
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestSeries();
  }, [search, filters, limit]);

  const fetchTestSeries = async () => {
    try {
      setLoading(true);
      const queryFilters = {
        ...filters,
        search: search || undefined,
        limit: limit || undefined
      };

      const response = await testSeriesAPI.getPublishedTestSeries(queryFilters);
      setTestSeries(response.data.data);
      setError('');
    } catch (error) {
      console.error('Error fetching test series:', error);
      setError('Failed to fetch test series');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (testSeriesId) => {
    try {
      await testSeriesAPI.enrollInTestSeries(testSeriesId);
      toast.success('Successfully enrolled in test series!');
      fetchTestSeries(); // Refresh to update enrollment status
    } catch (error) {
      console.error('Error enrolling in test series:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in test series');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {testSeries.length > 0 && (
          <span className="text-gray-600">{testSeries.length} test series available</span>
        )}
      </div>

      {testSeries.length === 0 ? (
        <div className="text-center py-12">
          <FaBook className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Test Series Available</h3>
          <p className="text-gray-500">
            There are no test series available at the moment. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {testSeries.map((series) => (
            <TestSeriesCard
              key={series._id}
              testSeries={series}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestSeriesList;
