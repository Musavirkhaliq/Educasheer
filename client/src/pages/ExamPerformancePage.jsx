import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EnhancedContainer from '../components/layout/EnhancedContainer';
import { 
  FaChartLine, 
  FaTrophy, 
  FaCalendarAlt, 
  FaPercentage, 
  FaClock,
  FaArrowLeft,
  FaSignInAlt
} from 'react-icons/fa';

const ExamPerformancePage = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading performance data
    setTimeout(() => {
      if (isAuthenticated) {
        setPerformanceData({
          totalExams: 12,
          averageScore: 78.5,
          bestScore: 95,
          totalTimeSpent: 480, // minutes
          recentExams: [
            { name: 'Mathematics Quiz 1', score: 85, date: '2024-01-15', duration: 30 },
            { name: 'Physics Test Series', score: 92, date: '2024-01-12', duration: 45 },
            { name: 'Chemistry Mock Test', score: 78, date: '2024-01-10', duration: 60 },
          ]
        });
      }
      setLoading(false);
    }, 1000);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
          <EnhancedContainer maxWidth="10xl" padding="responsive">
            <div className="py-12">
              <button
                onClick={() => navigate('/exams')}
                className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
              >
                <FaArrowLeft />
                <span>Back to Exams</span>
              </button>
              <h1 className="text-4xl font-bold mb-4">Exam Performance</h1>
              <p className="text-xl text-white/80">
                Track your progress and analyze your exam performance
              </p>
            </div>
          </EnhancedContainer>
        </div>

        <EnhancedContainer maxWidth="10xl" padding="responsive" className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSignInAlt className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Please sign in to view your exam performance and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-[#00bcd4] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#01427a] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-[#00bcd4] px-6 py-3 rounded-lg font-medium border border-[#00bcd4] hover:bg-[#00bcd4] hover:text-white transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </EnhancedContainer>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
        <EnhancedContainer maxWidth="10xl" padding="responsive">
          <div className="py-12">
            <button
              onClick={() => navigate('/exams')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Exams</span>
            </button>
            <h1 className="text-4xl font-bold mb-4">Exam Performance</h1>
            <p className="text-xl text-white/80">
              Track your progress and analyze your exam performance
            </p>
          </div>
        </EnhancedContainer>
      </div>

      <EnhancedContainer maxWidth="10xl" padding="responsive" className="py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4] mb-4"></div>
            <p className="text-gray-600">Loading your performance data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Total Exams</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{performanceData?.totalExams || 0}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaPercentage className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Average Score</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{performanceData?.averageScore || 0}%</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaTrophy className="text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Best Score</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{performanceData?.bestScore || 0}%</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaClock className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Time Spent</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">{Math.floor((performanceData?.totalTimeSpent || 0) / 60)}h</p>
              </div>
            </div>

            {/* Recent Exams */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Recent Exam Results</h2>
              </div>
              <div className="p-6">
                {performanceData?.recentExams?.length > 0 ? (
                  <div className="space-y-4">
                    {performanceData.recentExams.map((exam, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{exam.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-xs" />
                              {new Date(exam.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-xs" />
                              {exam.duration} min
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            exam.score >= 90 ? 'text-green-600' :
                            exam.score >= 75 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {exam.score}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaChartLine className="text-gray-300 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">No exam results yet. Take your first exam to see your performance!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Performance Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Review your incorrect answers to identify weak areas</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Take practice tests regularly to improve your speed</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Focus on time management during exams</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Set study goals and track your progress consistently</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </EnhancedContainer>
    </div>
  );
};

export default ExamPerformancePage;