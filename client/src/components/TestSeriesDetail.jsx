import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  FaCalendarAlt
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import TestSeriesProgress from './TestSeriesProgress';

const TestSeriesDetail = () => {
  const { testSeriesId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [testSeries, setTestSeries] = useState(null);
  const [userAttempts, setUserAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestSeriesDetails();
    if (currentUser) {
      fetchUserAttempts();
    }
  }, [testSeriesId, currentUser]);

  const fetchTestSeriesDetails = async () => {
    try {
      setLoading(true);
      const response = await testSeriesAPI.getTestSeriesById(testSeriesId);
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
      toast.error('Please login to enroll in test series');
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

          {/* Test Series Details Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white p-8">
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
                  <h1 className="text-3xl font-bold mb-2">{testSeries.title}</h1>
                  <p className="text-white/90 text-lg mb-4">{testSeries.description}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{testSeries.totalQuizzes}</div>
                      <div className="text-white/80 text-sm">Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{testSeries.totalQuestions}</div>
                      <div className="text-white/80 text-sm">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{testSeries.estimatedDuration}</div>
                      <div className="text-white/80 text-sm">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{testSeries.enrolledStudentsCount || 0}</div>
                      <div className="text-white/80 text-sm">Enrolled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Progress and Quiz List */}
                  {isEnrolled ? (
                    <TestSeriesProgress
                      testSeriesId={testSeriesId}
                      testSeries={testSeries}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Enroll to Access</h3>
                      <p className="text-gray-600 mb-4">
                        Enroll in this test series to access all tests and track your progress.
                      </p>
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </button>
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
                <div className="space-y-6">
                  {/* Enrollment Card */}
                  <div className="bg-gray-50 rounded-lg p-6">
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
                          Enrolled
                        </div>
                        <p className="text-sm text-gray-600">
                          You have access to all tests in this series
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full bg-[#00bcd4] text-white py-3 px-4 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
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
                    <div className="bg-gray-50 rounded-lg p-6">
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
