import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaTrophy, FaMedal, FaArrowLeft, FaListAlt, FaChartBar, FaEye, FaEyeSlash, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';
import '../styles/quiz-enhancements.css';

const QuizResults = () => {
  const { courseId, quizId, attemptId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  
  useEffect(() => {
    fetchAttemptDetails();
  }, [attemptId]);

  useEffect(() => {
    if (attempt && quiz) {
      calculateAnalysis();
    }
  }, [attempt, quiz]);
  
  const fetchAttemptDetails = async () => {
    try {
      setLoading(true);

      // Fetch attempt details
      const response = await quizAPI.getQuizAttempt(attemptId);
      const attemptData = response.data.data;

      setAttempt(attemptData);
      setQuiz(attemptData.quiz);

    } catch (err) {
      console.error('Error fetching attempt details:', err);
      setError('Failed to load quiz results. Please try again.');
      toast.error('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalysis = () => {
    if (!attempt || !quiz) return;

    const totalQuestions = quiz.questions.length;
    const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
    const incorrectAnswers = attempt.answers.filter(answer => answer.isCorrect === false).length;
    const unanswered = totalQuestions - attempt.answers.length;

    // Calculate time per question (approximate)
    const totalTimeSpent = attempt.timeSpent; // in seconds
    const avgTimePerQuestion = totalTimeSpent / totalQuestions;

    // Categorize questions by difficulty based on points
    const easyQuestions = quiz.questions.filter(q => q.points === 1);
    const mediumQuestions = quiz.questions.filter(q => q.points === 2);
    const hardQuestions = quiz.questions.filter(q => q.points >= 3);

    // Calculate performance by difficulty
    const easyCorrect = attempt.answers.filter(answer => {
      const question = quiz.questions.find(q => q._id === answer.question);
      return question && question.points === 1 && answer.isCorrect;
    }).length;

    const mediumCorrect = attempt.answers.filter(answer => {
      const question = quiz.questions.find(q => q._id === answer.question);
      return question && question.points === 2 && answer.isCorrect;
    }).length;

    const hardCorrect = attempt.answers.filter(answer => {
      const question = quiz.questions.find(q => q._id === answer.question);
      return question && question.points >= 3 && answer.isCorrect;
    }).length;

    // Calculate question type performance
    const questionTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
    const typePerformance = questionTypes.map(type => {
      const questionsOfType = quiz.questions.filter(q => q.type === type);
      const correctOfType = attempt.answers.filter(answer => {
        const question = quiz.questions.find(q => q._id === answer.question);
        return question && question.type === type && answer.isCorrect;
      }).length;

      return {
        type,
        total: questionsOfType.length,
        correct: correctOfType,
        percentage: questionsOfType.length > 0 ? (correctOfType / questionsOfType.length) * 100 : 0
      };
    }).filter(item => item.total > 0);

    setAnalysisData({
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      avgTimePerQuestion,
      difficulty: {
        easy: { total: easyQuestions.length, correct: easyCorrect },
        medium: { total: mediumQuestions.length, correct: mediumCorrect },
        hard: { total: hardQuestions.length, correct: hardCorrect }
      },
      typePerformance
    });
  };
  
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const getAnswerForQuestion = (questionId) => {
    if (!attempt || !attempt.answers) return null;
    return attempt.answers.find(answer => answer.question.toString() === questionId.toString());
  };
  
  const findQuestionById = (questionId) => {
    if (!quiz || !quiz.questions) return null;
    return quiz.questions.find(q => q._id.toString() === questionId.toString());
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p className="font-medium">{error}</p>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }
  
  if (!attempt || !quiz) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Quiz results could not be loaded.</p>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mt-4 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative max-w-6xl mx-auto p-4 sm:p-6">
        {/* Results Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6">
            <div className="flex items-start gap-3 sm:gap-6 w-full lg:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaTrophy className="text-white text-lg sm:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/courses/${courseId}`}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-3 sm:mb-4 transition-colors duration-300 group text-sm sm:text-base"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300 text-xs sm:text-sm" />
                  <span>Back to Course</span>
                </Link>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 leading-tight">
                  {quiz.title}
                </h1>
                <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                  <FaClock className="text-xs sm:text-sm flex-shrink-0" />
                  <span className="truncate">Completed on {new Date(attempt.endTime).toLocaleString()}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 sm:gap-4 w-full sm:w-auto lg:w-auto">
              <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-bold text-base sm:text-lg shadow-lg transform transition-all duration-300 hover:scale-105 ${
                attempt.isPassed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 shadow-red-200'
              }`}>
                {attempt.isPassed ? (
                  <span className="flex items-center gap-2">
                    <FaCheck className="text-sm sm:text-base" />
                    <span>Passed</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FaTimes className="text-sm sm:text-base" />
                    <span>Failed</span>
                  </span>
                )}
              </div>

              <Link
                to={`/courses/${courseId}/quizzes/${quizId}/attempts`}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors duration-300 group text-sm sm:text-base"
              >
                <FaListAlt className="group-hover:scale-110 transition-transform duration-300 text-sm sm:text-base" />
                <span>View All Attempts</span>
              </Link>
            </div>
          </div>
        </div>

      {/* Score Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <FaChartBar className="text-blue-500 text-lg sm:text-xl" />
          <span>Performance Overview</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 sm:p-6 border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FaTrophy className="text-white text-lg sm:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-blue-700 text-xs sm:text-sm font-medium">Final Score</p>
                <p className="font-bold text-2xl sm:text-3xl text-blue-800">{attempt.percentage.toFixed(1)}%</p>
                <p className="text-blue-600 text-xs sm:text-sm">
                  {attempt.score} / {attempt.maxScore} points
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 sm:mt-4">
              <div className="w-full bg-blue-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${attempt.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Passing Score Card */}
          <div className={`rounded-xl p-4 sm:p-6 border transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            attempt.isPassed
              ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200'
              : 'bg-gradient-to-br from-red-50 to-pink-100 border-red-200'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                attempt.isPassed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-pink-600'
              }`}>
                <FaMedal className="text-white text-lg sm:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs sm:text-sm font-medium ${
                  attempt.isPassed ? 'text-green-700' : 'text-red-700'
                }`}>
                  Passing Score
                </p>
                <p className={`font-bold text-2xl sm:text-3xl ${
                  attempt.isPassed ? 'text-green-800' : 'text-red-800'
                }`}>
                  {quiz.passingScore}%
                </p>
                <p className="text-xs sm:text-sm flex items-center gap-1">
                  {attempt.isPassed ? (
                    <span className="text-green-600 flex items-center gap-1 font-medium">
                      <FaCheck size={10} className="sm:w-3 sm:h-3" /> Passed
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1 font-medium">
                      <FaTimes size={10} className="sm:w-3 sm:h-3" /> Failed
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-4 sm:p-6 border border-purple-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FaClock className="text-white text-lg sm:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-purple-700 text-xs sm:text-sm font-medium">Time Spent</p>
                <p className="font-bold text-2xl sm:text-3xl text-purple-800">{formatDuration(attempt.timeSpent)}</p>
                <p className="text-purple-600 text-xs sm:text-sm">
                  Limit: {quiz.timeLimit} minutes
                </p>
              </div>
            </div>

            {/* Time Progress Bar */}
            <div className="mt-3 sm:mt-4">
              <div className="w-full bg-purple-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((attempt.timeSpent / (quiz.timeLimit * 60)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      {analysisData && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaChartBar className="text-white text-sm sm:text-base" />
              </div>
              <span>Detailed Analysis</span>
            </h3>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 shadow-lg text-sm sm:text-base touch-manipulation"
            >
              {showAnalysis ? <FaEyeSlash className="text-sm sm:text-base" /> : <FaEye className="text-sm sm:text-base" />}
              <span className="hidden sm:inline">{showAnalysis ? 'Hide Analysis' : 'Show Analysis'}</span>
              <span className="sm:hidden">{showAnalysis ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          {showAnalysis && (
            <div className="space-y-6 sm:space-y-8 fade-in">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 sm:p-6 rounded-xl border border-green-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <FaCheck className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{analysisData.correctAnswers}</div>
                    <div className="text-xs sm:text-sm font-medium text-green-700">Correct</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-100 p-3 sm:p-6 rounded-xl border border-red-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <FaTimes className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{analysisData.incorrectAnswers}</div>
                    <div className="text-xs sm:text-sm font-medium text-red-700">Incorrect</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-3 sm:p-6 rounded-xl border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <FaExclamationTriangle className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-600 mb-1">{analysisData.unanswered}</div>
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Unanswered</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6 rounded-xl border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <FaClock className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{Math.round(analysisData.avgTimePerQuestion)}s</div>
                    <div className="text-xs sm:text-sm font-medium text-blue-700">Avg/Question</div>
                  </div>
                </div>
              </div>

              {/* Performance by Difficulty */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-yellow-200">
                <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <FaLightbulb className="text-white text-xs sm:text-sm" />
                  </div>
                  <span>Performance by Difficulty</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  {['easy', 'medium', 'hard'].map(level => {
                    const data = analysisData.difficulty[level];
                    const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                    const colors = {
                      easy: { bg: 'from-green-50 to-emerald-100', border: 'border-green-200', progress: 'from-green-500 to-emerald-600', text: 'text-green-700' },
                      medium: { bg: 'from-yellow-50 to-amber-100', border: 'border-yellow-200', progress: 'from-yellow-500 to-amber-600', text: 'text-yellow-700' },
                      hard: { bg: 'from-red-50 to-pink-100', border: 'border-red-200', progress: 'from-red-500 to-pink-600', text: 'text-red-700' }
                    };

                    return (
                      <div key={level} className={`bg-gradient-to-br ${colors[level].bg} p-4 sm:p-6 rounded-xl border ${colors[level].border} transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                          <span className={`font-bold text-base sm:text-lg capitalize ${colors[level].text}`}>{level}</span>
                          <span className={`text-xs sm:text-sm font-medium ${colors[level].text} bg-white/50 px-2 py-1 rounded-lg`}>
                            {data.correct}/{data.total}
                          </span>
                        </div>
                        <div className="w-full bg-white/50 rounded-full h-3 sm:h-4 mb-2 sm:mb-3 overflow-hidden">
                          <div
                            className={`h-3 sm:h-4 bg-gradient-to-r ${colors[level].progress} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className={`text-base sm:text-lg font-bold ${colors[level].text} text-center`}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance by Question Type */}
              {analysisData.typePerformance.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Performance by Question Type</h4>
                  <div className="space-y-3">
                    {analysisData.typePerformance.map(type => (
                      <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium capitalize">{type.type.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-600 ml-2">({type.correct}/{type.total})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-[#00bcd4] rounded-full"
                              style={{ width: `${type.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{type.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Questions and Answers */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold">Questions & Answers</h3>
          {quiz.showCorrectAnswers && (
            <button
              onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
              className="flex items-center gap-2 text-[#00bcd4] hover:text-[#0097a7] transition-colors text-sm sm:text-base"
            >
              {showCorrectAnswers ? <FaEyeSlash className="text-sm sm:text-base" /> : <FaEye className="text-sm sm:text-base" />}
              <span className="hidden sm:inline">{showCorrectAnswers ? 'Hide Correct Answers' : 'Show Correct Answers'}</span>
              <span className="sm:hidden">{showCorrectAnswers ? 'Hide Answers' : 'Show Answers'}</span>
            </button>
          )}
        </div>

        <div className="space-y-4 sm:space-y-8">
          {attempt.answers.map((answer, index) => {
            const question = findQuestionById(answer.question);
            if (!question) return null;

            return (
              <div key={answer.question} className="border border-gray-200 rounded-lg p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm sm:text-base">Question {index + 1}</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                      <span>Type: {question.type.replace('_', ' ')}</span>
                      <span>Points: {question.points}</span>
                      {question.type === 'multiple_choice' && (
                        <span className="hidden sm:inline">Difficulty: {question.points === 1 ? 'Easy' : question.points === 2 ? 'Medium' : 'Hard'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-2">
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {answer.isCorrect ? (
                        <span className="flex items-center gap-1">
                          <FaCheck size={10} className="sm:w-3 sm:h-3" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FaTimes size={10} className="sm:w-3 sm:h-3" /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {answer.pointsEarned} / {question.points} points
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-800">{question.text}</p>
                </div>
                
                {/* Multiple Choice or True/False */}
                {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                  <div className="space-y-3 mb-4">
                    {question.options.map(option => {
                      const isSelected = answer.selectedOptions.includes(option._id);
                      const isCorrect = option.isCorrect;
                      const shouldShowCorrect = showCorrectAnswers && quiz.showCorrectAnswers;

                      return (
                        <div
                          key={option._id}
                          className={`p-3 rounded-lg border ${
                            isSelected && isCorrect ? 'border-green-300 bg-green-50' :
                            isSelected && !isCorrect ? 'border-red-300 bg-red-50' :
                            shouldShowCorrect && !isSelected && isCorrect ? 'border-green-300 bg-green-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded${question.type === 'true_false' ? '-full' : ''} border flex items-center justify-center ${
                                isSelected && isCorrect ? 'bg-green-500 border-green-500 text-white' :
                                isSelected && !isCorrect ? 'bg-red-500 border-red-500 text-white' :
                                shouldShowCorrect && !isSelected && isCorrect ? 'bg-green-500 border-green-500 text-white' :
                                'border-gray-300'
                              }`}>
                                {isSelected && (isCorrect ? <FaCheck size={12} /> : <FaTimes size={12} />)}
                                {shouldShowCorrect && !isSelected && isCorrect && <FaCheck size={12} />}
                              </div>
                              <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {isSelected && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  Your Choice
                                </span>
                              )}
                              {shouldShowCorrect && isCorrect && (
                                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Short Answer */}
                {question.type === 'short_answer' && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Your Answer:</p>
                    <div className={`p-3 rounded-lg border ${
                      answer.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                    }`}>
                      {answer.textAnswer || <em className="text-gray-400">No answer provided</em>}
                    </div>

                    {showCorrectAnswers && quiz.showCorrectAnswers && question.correctAnswer && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-1">Correct Answer:</p>
                        <div className="p-3 rounded-lg border border-green-300 bg-green-50">
                          {question.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Essay */}
                {question.type === 'essay' && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Your Answer:</p>
                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                      {answer.textAnswer || <em className="text-gray-400">No answer provided</em>}
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-500">
                      <p>Essay questions are manually graded by instructors.</p>
                    </div>
                  </div>
                )}
                
                {/* Explanation */}
                {question.explanation && showCorrectAnswers && quiz.showCorrectAnswers && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaLightbulb className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-600">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Indicator */}
                {!answer.isCorrect && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Review Needed</p>
                        <p className="text-sm text-yellow-600">
                          Consider reviewing this topic to improve your understanding.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Summary & Recommendations */}
      {analysisData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary & Recommendations</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                <FaCheck className="text-green-500" />
                Strengths
              </h4>
              <div className="space-y-2">
                {attempt.percentage >= 90 && (
                  <p className="text-sm text-green-600">• Excellent overall performance</p>
                )}
                {analysisData.difficulty.easy.total > 0 &&
                 (analysisData.difficulty.easy.correct / analysisData.difficulty.easy.total) >= 0.8 && (
                  <p className="text-sm text-green-600">• Strong grasp of fundamental concepts</p>
                )}
                {analysisData.difficulty.hard.total > 0 &&
                 (analysisData.difficulty.hard.correct / analysisData.difficulty.hard.total) >= 0.6 && (
                  <p className="text-sm text-green-600">• Good handling of complex questions</p>
                )}
                {analysisData.avgTimePerQuestion < (quiz.timeLimit * 60) / analysisData.totalQuestions * 0.8 && (
                  <p className="text-sm text-green-600">• Efficient time management</p>
                )}
                {analysisData.correctAnswers === 0 && (
                  <p className="text-sm text-gray-600">• Completed the quiz attempt</p>
                )}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-500" />
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {attempt.percentage < 70 && (
                  <p className="text-sm text-orange-600">• Review core concepts to improve overall score</p>
                )}
                {analysisData.difficulty.easy.total > 0 &&
                 (analysisData.difficulty.easy.correct / analysisData.difficulty.easy.total) < 0.7 && (
                  <p className="text-sm text-orange-600">• Focus on mastering basic concepts</p>
                )}
                {analysisData.incorrectAnswers > analysisData.correctAnswers && (
                  <p className="text-sm text-orange-600">• Practice more questions to build confidence</p>
                )}
                {analysisData.avgTimePerQuestion > (quiz.timeLimit * 60) / analysisData.totalQuestions && (
                  <p className="text-sm text-orange-600">• Work on improving response time</p>
                )}
                {analysisData.unanswered > 0 && (
                  <p className="text-sm text-orange-600">• Ensure all questions are answered</p>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-700 mb-2">Recommended Next Steps:</h4>
            <div className="text-sm text-blue-600 space-y-1">
              {attempt.isPassed ? (
                <>
                  <p>• Continue to the next topic or module</p>
                  <p>• Review any incorrect answers to reinforce learning</p>
                  {attempt.percentage < 85 && <p>• Consider retaking to achieve a higher score</p>}
                </>
              ) : (
                <>
                  <p>• Review the course material thoroughly</p>
                  <p>• Focus on topics where you scored poorly</p>
                  <p>• Retake the quiz when you feel more confident</p>
                  <p>• Consider seeking help from instructors or peers</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <Link
          to={`/courses/${courseId}`}
          className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center text-sm sm:text-base order-2 sm:order-1"
        >
          Return to Course
        </Link>

        <Link
          to={`/courses/${courseId}/quizzes/${quizId}`}
          className="px-4 py-2 sm:py-3 bg-[#00bcd4] text-white rounded-lg hover:bg-[#0097a7] transition-colors text-center text-sm sm:text-base order-1 sm:order-2"
        >
          Retake Quiz
        </Link>
      </div>
      </div>
    </div>
  );
};

export default QuizResults;
