import { useState, useEffect } from 'react';
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaChartLine,
  FaTrophy
} from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import TestSeriesSections from './TestSeriesSections';

const TestSeriesProgress = ({ testSeriesId, testSeries, onProgressUpdate }) => {
  const { currentUser } = useAuth();
  const [userAttempts, setUserAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    passedQuizzes: 0,
    totalScore: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    if (testSeries && currentUser) {
      fetchUserProgress();
    }
  }, [testSeries, currentUser]);

  const fetchUserProgress = async () => {
    // Collect all quizzes from both sections and legacy quizzes array
    const allQuizzes = [];
    const seenQuizIds = new Set();

    // Add quizzes from sections
    if (testSeries?.sections) {
      testSeries.sections.forEach(section => {
        if (section.quizzes) {
          section.quizzes.forEach(quiz => {
            if (!seenQuizIds.has(quiz._id)) {
              allQuizzes.push(quiz);
              seenQuizIds.add(quiz._id);
            }
          });
        }
      });
    }

    // Add legacy quizzes (not in sections)
    if (testSeries?.quizzes) {
      testSeries.quizzes.forEach(quiz => {
        if (!seenQuizIds.has(quiz._id)) {
          allQuizzes.push(quiz);
          seenQuizIds.add(quiz._id);
        }
      });
    }

    console.log('Progress calculation:', {
      sectionsCount: testSeries?.sections?.length || 0,
      legacyQuizzesCount: testSeries?.quizzes?.length || 0,
      totalUniqueQuizzes: allQuizzes.length,
      quizIds: allQuizzes.map(q => q._id)
    });

    if (allQuizzes.length === 0) return;
    
    try {
      setLoading(true);
      const attempts = {};
      let totalScore = 0;
      let totalMaxScore = 0;
      let completedCount = 0;
      let passedCount = 0;
      let totalTimeSpent = 0;
      let bestScore = 0;

      for (const quiz of allQuizzes) {
        try {
          const response = await quizAPI.getUserQuizAttempts(quiz._id);
          const quizAttempts = response.data.data;
          attempts[quiz._id] = quizAttempts;

          if (quizAttempts.length > 0) {
            // Find best attempt for this quiz
            const bestAttempt = quizAttempts.reduce((best, current) => 
              current.percentage > best.percentage ? current : best
            );

            if (bestAttempt.isCompleted) {
              completedCount++;
              totalScore += bestAttempt.score;
              totalMaxScore += bestAttempt.maxScore;
              totalTimeSpent += bestAttempt.timeSpent || 0;
              
              if (bestAttempt.isPassed) {
                passedCount++;
              }
              
              if (bestAttempt.percentage > bestScore) {
                bestScore = bestAttempt.percentage;
              }
            }
          }
        } catch (error) {
          // Quiz might not have attempts, which is fine
          attempts[quiz._id] = [];
        }
      }

      const averageScore = completedCount > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      const completionPercentage = allQuizzes.length > 0 ? (completedCount / allQuizzes.length) * 100 : 0;

      setUserAttempts(attempts);
      setStats({
        totalQuizzes: allQuizzes.length,
        completedQuizzes: completedCount,
        passedQuizzes: passedCount,
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
        bestScore: Math.round(bestScore * 100) / 100,
        completionPercentage: Math.round(completionPercentage * 100) / 100
      });

      if (onProgressUpdate) {
        onProgressUpdate({
          completionPercentage,
          completedQuizzes: completedCount,
          totalQuizzes: allQuizzes.length
        });
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-[#00bcd4]" />
            Progress Overview
          </h3>
          <div className="text-sm text-gray-500">
            {testSeries?.sections?.length > 0 && (
              <span>{testSeries.sections.length} sections</span>
            )}
            {testSeries?.sections?.length > 0 && testSeries?.quizzes?.length > 0 && (
              <span> • </span>
            )}
            {testSeries?.quizzes?.length > 0 && (
              <span>{testSeries.quizzes.length} additional tests</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{stats.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.completedQuizzes}</div>
            <div className="text-xs sm:text-sm text-blue-800">Completed</div>
            <div className="text-xs text-gray-600">of {stats.totalQuizzes}</div>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.passedQuizzes}</div>
            <div className="text-xs sm:text-sm text-green-800">Passed</div>
            <div className="text-xs text-gray-600">tests</div>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
            <div className="text-xs sm:text-sm text-purple-800">Average</div>
            <div className="text-xs text-gray-600">score</div>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.totalTimeSpent}</div>
            <div className="text-xs sm:text-sm text-orange-800">Minutes</div>
            <div className="text-xs text-gray-600">spent</div>
          </div>
        </div>

        {/* Performance & Leaderboard Info */}
        {stats.completedQuizzes > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-800">
                <FaTrophy />
                <span className="font-medium">
                  {stats.bestScore > 0 ? `Best Performance: ${stats.bestScore}%` : 'Great start!'}
                </span>
              </div>
              <div className="text-sm text-yellow-700">
                You're on the leaderboard! 🎉
              </div>
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Your ranking considers all {stats.completedQuizzes} completed test{stats.completedQuizzes !== 1 ? 's' : ''} • Keep going to improve your position!
            </div>
          </div>
        )}
        
        {stats.completedQuizzes === 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <FaTrophy />
              <span className="font-medium">Ready to join the leaderboard?</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Complete your first test to appear on the leaderboard and compete with others!
            </div>
          </div>
        )}
      </div>

      {/* Test Series Sections */}
      <div>
        <TestSeriesSections
          testSeries={testSeries}
          testSeriesId={testSeriesId}
          userAttempts={userAttempts}
        />
      </div>
    </div>
  );
};

export default TestSeriesProgress;
