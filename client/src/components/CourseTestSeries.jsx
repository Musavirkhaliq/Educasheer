import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaClock, 
  FaQuestionCircle, 
  FaUsers, 
  FaPlay, 
  FaCheck, 
  FaTimes,
  FaChartLine,
  FaLock,
  FaGraduationCap
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CourseTestSeries = ({ courseId, courseName, isInstructor = false }) => {
  console.log('CourseTestSeries component rendered with:', { courseId, courseName, isInstructor });
  
  const { currentUser } = useAuth();
  const [testSeries, setTestSeries] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseTestSeries();
  }, [courseId]);

  const fetchCourseTestSeries = async () => {
    try {
      setLoading(true);
      console.log(`Fetching test series for course: ${courseId}`);

      // Fetch test series linked to this course
      const response = await testSeriesAPI.getTestSeriesByCourse(courseId);
      console.log('Test series API response:', response);

      const testSeriesData = response.data.data || [];
      console.log(`Test series received: ${testSeriesData.length}`);
      console.log('Test series data:', testSeriesData);

      setTestSeries(testSeriesData);

      // Fetch user progress for each test series
      if (testSeriesData.length > 0 && currentUser) {
        await fetchUserProgress(testSeriesData);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching course test series:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      if (err.response?.status === 403) {
        setError('You do not have permission to view test series for this course.');
      } else if (err.response?.status === 401) {
        setError('Please log in to view test series.');
      } else {
        setError('Failed to load test series. Please try again.');
      }
      
      // Don't show toast for permission errors, just log them
      if (err.response?.status !== 403 && err.response?.status !== 401) {
        toast.error('Failed to load test series');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async (testSeriesData) => {
    try {
      const progressMap = {};
      
      for (const ts of testSeriesData) {
        if (ts.quizzes && ts.quizzes.length > 0) {
          let completedQuizzes = 0;
          let totalScore = 0;
          let totalAttempts = 0;

          for (const quiz of ts.quizzes) {
            try {
              const attemptsResponse = await quizAPI.getUserQuizAttempts(quiz._id);
              const attempts = attemptsResponse.data.data || [];
              
              if (attempts.length > 0) {
                totalAttempts += attempts.length;
                const bestAttempt = attempts.reduce((best, current) => 
                  current.percentage > best.percentage ? current : best
                );
                
                if (bestAttempt.isCompleted) {
                  completedQuizzes++;
                  totalScore += bestAttempt.percentage;
                }
              }
            } catch (error) {
              console.error(`Error fetching attempts for quiz ${quiz._id}:`, error);
            }
          }

          progressMap[ts._id] = {
            completedQuizzes,
            totalQuizzes: ts.quizzes.length,
            averageScore: completedQuizzes > 0 ? totalScore / completedQuizzes : 0,
            totalAttempts,
            progressPercentage: ts.quizzes.length > 0 ? (completedQuizzes / ts.quizzes.length) * 100 : 0
          };
        } else {
          progressMap[ts._id] = {
            completedQuizzes: 0,
            totalQuizzes: 0,
            averageScore: 0,
            totalAttempts: 0,
            progressPercentage: 0
          };
        }
      }

      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
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

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
  };

  if (loading && testSeries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (testSeries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8 text-gray-500">
          {isInstructor ? (
            <>
              <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="mb-4">No test series have been created for this course yet.</p>
              <p className="text-sm text-gray-400 mb-4">
                Course ID: {courseId} | API called successfully
              </p>
              <Link
                to="/admin/test-series/create"
                className="inline-block bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
              >
                Create Test Series
              </Link>
            </>
          ) : (
            <>
              <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
              <p>No test series are available for this course yet.</p>
              <p className="text-sm text-gray-400">
                Course ID: {courseId} | API called successfully
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <FaGraduationCap className="text-[#00bcd4]" />
          Test Series ({testSeries.length})
        </h3>

        {isInstructor && (
          <Link
            to="/admin/test-series/create"
            className="bg-[#00bcd4] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#0097a7] transition-colors"
          >
            Create Test Series
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {testSeries.map(ts => {
          const progress = userProgress[ts._id] || {
            completedQuizzes: 0,
            totalQuizzes: 0,
            averageScore: 0,
            totalAttempts: 0,
            progressPercentage: 0
          };

          const isEnrolled = ts.isEnrolled;
          const hasStarted = progress.totalAttempts > 0;

          return (
            <div
              key={ts._id}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-800 text-lg">{ts.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(ts.difficulty)}`}>
                      {ts.difficulty.charAt(0).toUpperCase() + ts.difficulty.slice(1)}
                    </span>
                    {ts.examType && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {ts.examType}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {ts.description && ts.description.length > 120 
                      ? `${ts.description.substring(0, 120)}...` 
                      : ts.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <FaBook className="text-[#00bcd4]" />
                      <span>{ts.totalQuizzes} tests</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <FaQuestionCircle className="text-[#00bcd4]" />
                      <span>{ts.totalQuestions} questions</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <FaClock className="text-[#00bcd4]" />
                      <span>{formatDuration(ts.estimatedDuration)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FaUsers className="text-[#00bcd4]" />
                      <span>{ts.enrolledStudents?.length || 0} enrolled</span>
                    </div>
                  </div>

                  {/* Progress Bar for Enrolled Users */}
                  {isEnrolled && hasStarted && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-800">
                          {progress.completedQuizzes}/{progress.totalQuizzes} completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#00bcd4] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progressPercentage}%` }}
                        ></div>
                      </div>
                      {progress.averageScore > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <FaChartLine className="text-green-600 text-xs" />
                          <span className="text-xs text-gray-600">
                            Average Score: {progress.averageScore.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enrollment Status */}
                  {isEnrolled && (
                    <div className="flex items-center gap-1 text-sm text-green-700 mb-2">
                      <FaCheck className="text-xs" />
                      <span>Enrolled</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {ts.price > 0 && !isEnrolled && (
                    <div className="text-right mb-2">
                      <div className="text-lg font-bold text-[#00bcd4]">₹{ts.price}</div>
                      {ts.originalPrice > ts.price && (
                        <div className="text-sm text-gray-500 line-through">₹{ts.originalPrice}</div>
                      )}
                    </div>
                  )}

                  {ts.price === 0 && !isEnrolled && (
                    <div className="text-right mb-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Free
                      </span>
                    </div>
                  )}

                  <Link
                    to={`/test-series/${ts._id}`}
                    className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0097a7] transition-colors text-sm whitespace-nowrap"
                  >
                    {isEnrolled ? (
                      <>
                        <FaPlay size={12} />
                        {hasStarted ? 'Continue' : 'Start Tests'}
                      </>
                    ) : (
                      <>
                        <FaBook size={12} />
                        View Details
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseTestSeries;