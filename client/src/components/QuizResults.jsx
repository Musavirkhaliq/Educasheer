import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaTrophy, FaMedal, FaArrowLeft, FaListAlt, FaChartBar, FaEye, FaEyeSlash, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';

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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Results Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Course</span>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800">{quiz.title} - Results</h2>
          <p className="text-gray-600 mt-1">Attempt completed on {new Date(attempt.endTime).toLocaleString()}</p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className={`px-4 py-2 rounded-lg text-white font-medium ${
            attempt.isPassed ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {attempt.isPassed ? 'Passed' : 'Failed'}
          </div>
          
          <Link
            to={`/courses/${courseId}/quizzes/${quizId}/attempts`}
            className="mt-2 text-[#00bcd4] hover:text-[#0097a7] flex items-center gap-1"
          >
            <FaListAlt size={14} />
            <span>View All Attempts</span>
          </Link>
        </div>
      </div>
      
      {/* Score Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#00bcd4]/10 p-3 rounded-lg">
                <FaTrophy className="text-[#00bcd4] text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Score</p>
                <p className="font-semibold text-xl">{attempt.percentage.toFixed(1)}%</p>
                <p className="text-gray-600 text-sm">
                  {attempt.score} / {attempt.maxScore} points
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#00bcd4]/10 p-3 rounded-lg">
                <FaMedal className="text-[#00bcd4] text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Passing Score</p>
                <p className="font-semibold text-xl">{quiz.passingScore}%</p>
                <p className="text-gray-600 text-sm">
                  {attempt.isPassed ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <FaCheck size={12} /> Passed
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <FaTimes size={12} /> Failed
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#00bcd4]/10 p-3 rounded-lg">
                <FaClock className="text-[#00bcd4] text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Time Spent</p>
                <p className="font-semibold text-xl">{formatDuration(attempt.timeSpent)}</p>
                <p className="text-gray-600 text-sm">
                  Time limit: {quiz.timeLimit} minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      {analysisData && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FaChartBar className="text-[#00bcd4]" />
              Detailed Analysis
            </h3>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center gap-2 text-[#00bcd4] hover:text-[#0097a7] transition-colors"
            >
              {showAnalysis ? <FaEyeSlash /> : <FaEye />}
              {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
            </button>
          </div>

          {showAnalysis && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysisData.correctAnswers}</div>
                    <div className="text-sm text-green-700">Correct</div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analysisData.incorrectAnswers}</div>
                    <div className="text-sm text-red-700">Incorrect</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{analysisData.unanswered}</div>
                    <div className="text-sm text-gray-700">Unanswered</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(analysisData.avgTimePerQuestion)}s</div>
                    <div className="text-sm text-blue-700">Avg/Question</div>
                  </div>
                </div>
              </div>

              {/* Performance by Difficulty */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FaLightbulb className="text-yellow-500" />
                  Performance by Difficulty
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['easy', 'medium', 'hard'].map(level => {
                    const data = analysisData.difficulty[level];
                    const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                    return (
                      <div key={level} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium capitalize">{level}</span>
                          <span className="text-sm text-gray-600">{data.correct}/{data.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              level === 'easy' ? 'bg-green-500' :
                              level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{percentage.toFixed(1)}%</div>
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Questions & Answers</h3>
          {quiz.showCorrectAnswers && (
            <button
              onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
              className="flex items-center gap-2 text-[#00bcd4] hover:text-[#0097a7] transition-colors"
            >
              {showCorrectAnswers ? <FaEyeSlash /> : <FaEye />}
              {showCorrectAnswers ? 'Hide Correct Answers' : 'Show Correct Answers'}
            </button>
          )}
        </div>
        
        <div className="space-y-8">
          {attempt.answers.map((answer, index) => {
            const question = findQuestionById(answer.question);
            if (!question) return null;
            
            return (
              <div key={answer.question} className="border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Type: {question.type.replace('_', ' ')}</span>
                      <span>Points: {question.points}</span>
                      {question.type === 'multiple_choice' && (
                        <span>Difficulty: {question.points === 1 ? 'Easy' : question.points === 2 ? 'Medium' : 'Hard'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {answer.isCorrect ? (
                        <span className="flex items-center gap-1">
                          <FaCheck size={12} /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FaTimes size={12} /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
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
      <div className="mt-8 flex justify-between">
        <Link
          to={`/courses/${courseId}`}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Return to Course
        </Link>
        
        <Link
          to={`/courses/${courseId}/quizzes/${quizId}`}
          className="px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#0097a7]"
        >
          Retake Quiz
        </Link>
      </div>
    </div>
  );
};

export default QuizResults;
