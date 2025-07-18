import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaExclamationTriangle, FaCheck, FaTimes, FaArrowLeft, FaArrowRight, FaQuestionCircle, FaListAlt, FaTrophy, FaEdit, FaFileAlt } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';
import '../styles/quiz-enhancements.css';

const QuizTaker = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  
  const timerRef = useRef(null);
  
  useEffect(() => {
    startQuiz();

    return () => {
      // Cleanup function to prevent memory leaks
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizId]);
  
  const startQuiz = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Reset state
      setQuiz(null);
      setAttempt(null);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setTimeLeft(null);
      setIsSubmitting(false);
      setShowConfirmSubmit(false);

      // Start a new quiz attempt
      const response = await quizAPI.startQuizAttempt(quizId);

      // Validate response structure
      if (!response || !response.data || !response.data.data) {
        throw new Error('Invalid response structure from server');
      }

      let newAttempt, quizData;

      // Handle two different response structures:
      // 1. New attempt: { attempt: {...}, quiz: {...} }
      // 2. Continuing attempt: just the attempt object directly
      if (response.data.data.attempt && response.data.data.quiz) {
        // New attempt case
        newAttempt = response.data.data.attempt;
        quizData = response.data.data.quiz;
      } else if (response.data.data._id || response.data.data.id) {
        // Continuing existing attempt case
        newAttempt = response.data.data;
        // We need to fetch the quiz data separately
        const quizResponse = await quizAPI.getQuizById(newAttempt.quiz);
        quizData = quizResponse.data.data;
      } else {
        throw new Error('Unexpected response structure from server');
      }

      // Validate attempt data - check for _id or id field
      if (!newAttempt || (!newAttempt._id && !newAttempt.id)) {
        throw new Error('Invalid attempt data received from server');
      }

      // Validate quiz data
      if (!quizData) {
        throw new Error('No quiz data received from server');
      }

      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz questions data received from server');
      }

      if (quizData.questions.length === 0) {
        throw new Error('This quiz has no questions');
      }

      // Validate that all questions have required properties
      for (let i = 0; i < quizData.questions.length; i++) {
        const question = quizData.questions[i];
        if (!question._id) {
          throw new Error(`Question ${i + 1} is missing required ID`);
        }
      }

      setQuiz(quizData);
      setAttempt(newAttempt);

      // Initialize answers array - check if we have existing answers from a previous attempt
      let initialAnswers;
      if (newAttempt.answers && newAttempt.answers.length > 0) {
        // Restore previous answers for continuing attempt
        initialAnswers = quizData.questions.map(question => {
          const existingAnswer = newAttempt.answers.find(ans =>
            ans.question?.toString() === question._id?.toString() ||
            ans.questionId?.toString() === question._id?.toString()
          );

          return {
            questionId: question._id,
            selectedOptions: existingAnswer?.selectedOptions || [],
            textAnswer: existingAnswer?.textAnswer || ''
          };
        });
      } else {
        // Create fresh answers for new attempt
        initialAnswers = quizData.questions.map(question => ({
          questionId: question._id,
          selectedOptions: [],
          textAnswer: ''
        }));
      }

      setAnswers(initialAnswers);

      // Set up timer if quiz has time limit
      if (quizData.timeLimit && quizData.timeLimit > 0) {
        let timeLeft;

        if (newAttempt.startTime) {
          // Calculate remaining time for continuing attempt
          const startTime = new Date(newAttempt.startTime);
          const currentTime = new Date();
          const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
          const totalTimeLimit = quizData.timeLimit * 60; // convert to seconds
          timeLeft = Math.max(0, totalTimeLimit - elapsedSeconds);
        } else {
          // New attempt
          timeLeft = quizData.timeLimit * 60; // convert to seconds
        }

        setTimeLeft(timeLeft);

        if (timeLeft > 0) {
          timerRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
              if (prevTime <= 1) {
                clearInterval(timerRef.current);
                submitQuiz();
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);
        } else {
          // Time has already expired
          setTimeout(() => submitQuiz(), 100);
        }
      }

    } catch (err) {
      console.error('Error starting quiz:', err);
      const errorMessage = err.message || 'Failed to start quiz. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOptionSelect = (optionId) => {
    if (!quiz || !quiz.questions || !answers || currentQuestionIndex >= quiz.questions.length) {
      console.error('Invalid state for option selection');
      return;
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    if (!currentQuestion || !currentAnswer) {
      console.error('Current question or answer is undefined');
      return;
    }

    if (currentQuestion.type === 'multiple_choice') {
      // For multiple choice, toggle the selection
      const newSelectedOptions = currentAnswer.selectedOptions.includes(optionId)
        ? currentAnswer.selectedOptions.filter(id => id !== optionId)
        : [...currentAnswer.selectedOptions, optionId];

      updateAnswer(currentQuestionIndex, { selectedOptions: newSelectedOptions });
    } else if (currentQuestion.type === 'true_false') {
      // For true/false, select only one option
      updateAnswer(currentQuestionIndex, { selectedOptions: [optionId] });
    }
  };
  
  const handleTextAnswerChange = (e) => {
    updateAnswer(currentQuestionIndex, { textAnswer: e.target.value });
  };
  
  const updateAnswer = (index, newValues) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { ...updatedAnswers[index], ...newValues };
    setAnswers(updatedAnswers);
  };
  
  const goToNextQuestion = () => {
    if (!quiz || !quiz.questions) {
      console.error('Quiz data not available for navigation');
      return;
    }
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const submitQuiz = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Submit the quiz
      const attemptId = attempt._id || attempt.id;
      const response = await quizAPI.submitQuizAttempt(attemptId, { answers });

      // Navigate to results page
      navigate(`/courses/${courseId}/quizzes/${quizId}/results/${attemptId}`);
      
      toast.success('Quiz submitted successfully!');
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      toast.error('Failed to submit quiz');
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return '0:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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
  
  if (!quiz || !attempt || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Quiz data could not be loaded.</p>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mt-4 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }

  if (!answers || answers.length === 0 || currentQuestionIndex >= quiz.questions.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Quiz answers not properly initialized.</p>
        <button
          onClick={() => startQuiz()}
          className="mt-4 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // Additional safety check for current question and answer
  if (!currentQuestion || !currentAnswer) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Error: Current question or answer data is missing.</p>
        <button
          onClick={() => startQuiz()}
          className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Quiz Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaQuestionCircle className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {quiz.title}
                </h2>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <FaListAlt className="text-sm" />
                  {quiz.questions.length} questions • {quiz.timeLimit} minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg ${
                  timeLeft < 60
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-red-200'
                    : timeLeft < 300
                    ? 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-orange-200'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200'
                }`}>
                  <FaClock className="text-lg" />
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatTime(timeLeft)}</div>
                    <div className="text-xs opacity-90">remaining</div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Submit Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Progress</h3>
          <span className="text-sm text-gray-600">
            {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Navigation Pills */}
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => {
            const isAnswered = answers[index].selectedOptions.length > 0 || answers[index].textAnswer;
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : isAnswered
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {isAnswered && !isCurrent ? <FaCheck size={12} /> : index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {currentQuestionIndex + 1}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Question {currentQuestionIndex + 1}
              </h3>
              <p className="text-gray-600">of {quiz.questions.length} questions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl shadow-lg">
            <FaTrophy className="text-sm" />
            <span className="font-bold">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <div className="flex items-start gap-3">
              <FaQuestionCircle className="text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-gray-800 text-lg leading-relaxed">{currentQuestion.text}</p>
            </div>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-4">
          {currentQuestion.type === 'multiple_choice' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FaListAlt className="text-blue-500" />
                <p className="text-sm font-medium text-gray-700">Select all that apply:</p>
              </div>
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = currentAnswer.selectedOptions.includes(option._id);
                const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D...

                return (
                  <div
                    key={option._id}
                    onClick={() => handleOptionSelect(option._id)}
                    className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-100'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-bold transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                          : 'border-gray-300 text-gray-600 group-hover:border-blue-400 group-hover:text-blue-600'
                      }`}>
                        {isSelected ? <FaCheck size={14} /> : optionLetter}
                      </div>
                      <span className={`text-lg transition-colors duration-300 ${
                        isSelected ? 'text-gray-800 font-medium' : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {option.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          
          {currentQuestion.type === 'true_false' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FaCheck className="text-green-500" />
                <p className="text-sm font-medium text-gray-700">Select one:</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, optionIndex) => {
                  const isSelected = currentAnswer.selectedOptions.includes(option._id);
                  const isTrue = option.text.toLowerCase().includes('true');

                  return (
                    <div
                      key={option._id}
                      onClick={() => handleOptionSelect(option._id)}
                      className={`group p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? isTrue
                            ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg shadow-green-100'
                            : 'border-red-400 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg shadow-red-100'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-4">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                          isSelected
                            ? isTrue
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white shadow-lg'
                              : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-500 text-white shadow-lg'
                            : 'border-gray-300 text-gray-600 group-hover:border-blue-400 group-hover:text-blue-600'
                        }`}>
                          {isSelected ? <FaCheck size={16} /> : (isTrue ? 'T' : 'F')}
                        </div>
                        <span className={`text-xl font-medium transition-colors duration-300 ${
                          isSelected ? 'text-gray-800' : 'text-gray-700 group-hover:text-gray-800'
                        }`}>
                          {option.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {currentQuestion.type === 'short_answer' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FaEdit className="text-blue-500" />
                <p className="text-sm font-medium text-gray-700">Enter your answer:</p>
              </div>
              <div className="relative">
                <textarea
                  value={currentAnswer.textAnswer}
                  onChange={handleTextAnswerChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white shadow-sm resize-none"
                  rows="4"
                  placeholder="Type your answer here..."
                ></textarea>
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {currentAnswer.textAnswer?.length || 0} characters
                </div>
              </div>
            </>
          )}

          {currentQuestion.type === 'essay' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FaFileAlt className="text-purple-500" />
                <p className="text-sm font-medium text-gray-700">Write your essay:</p>
              </div>
              <div className="relative">
                <textarea
                  value={currentAnswer.textAnswer}
                  onChange={handleTextAnswerChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white shadow-sm resize-none"
                  rows="10"
                  placeholder="Write your essay here... Be detailed and provide examples to support your points."
                ></textarea>
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {currentAnswer.textAnswer?.length || 0} characters
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={goToPreviousQuestion}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform ${
              currentQuestionIndex > 0
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:scale-105 shadow-md'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            disabled={currentQuestionIndex === 0}
          >
            <FaArrowLeft />
            Previous
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          </div>

          <button
            onClick={isLastQuestion ? () => setShowConfirmSubmit(true) : goToNextQuestion}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isLastQuestion
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-200'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-200'
            }`}
          >
            {isLastQuestion ? (
              <>
                <FaCheck />
                Finish Quiz
              </>
            ) : (
              <>
                Next
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Submit Quiz?</h3>
                  <p className="text-gray-600">Final confirmation required</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6 border border-blue-100">
                <p className="text-gray-700 leading-relaxed">
                  Are you sure you want to submit your quiz? Once submitted, you won't be able to change your answers.
                  Please review your responses before proceeding.
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={submitQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg transform hover:scale-105 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Submit Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default QuizTaker;
