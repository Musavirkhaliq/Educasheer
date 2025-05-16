import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaTrophy, FaMedal, FaArrowLeft, FaListAlt } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';

const QuizResults = () => {
  const { courseId, quizId, attemptId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchAttemptDetails();
  }, [attemptId]);
  
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
      
      {/* Questions and Answers */}
      <div>
        <h3 className="text-xl font-semibold mb-6">Questions & Answers</h3>
        
        <div className="space-y-8">
          {attempt.answers.map((answer, index) => {
            const question = findQuestionById(answer.question);
            if (!question) return null;
            
            return (
              <div key={answer.question} className="border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
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
                      
                      return (
                        <div
                          key={option._id}
                          className={`p-3 rounded-lg border ${
                            isSelected && isCorrect ? 'border-green-300 bg-green-50' :
                            isSelected && !isCorrect ? 'border-red-300 bg-red-50' :
                            !isSelected && isCorrect ? 'border-green-300 bg-green-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded${question.type === 'true_false' ? '-full' : ''} border flex items-center justify-center ${
                              isSelected && isCorrect ? 'bg-green-500 border-green-500 text-white' :
                              isSelected && !isCorrect ? 'bg-red-500 border-red-500 text-white' :
                              !isSelected && isCorrect ? 'border-green-500' :
                              'border-gray-300'
                            }`}>
                              {isSelected && (isCorrect ? <FaCheck size={12} /> : <FaTimes size={12} />)}
                            </div>
                            <span>{option.text}</span>
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
                    
                    {!answer.isCorrect && (
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
                {question.explanation && quiz.showCorrectAnswers && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-600">{question.explanation}</p>
                  </div>
                )}
                
                {/* Points */}
                <div className="mt-4 text-sm text-gray-500">
                  Points: {answer.pointsEarned} / {question.points}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
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
