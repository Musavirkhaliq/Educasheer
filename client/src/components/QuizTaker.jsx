import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaExclamationTriangle, FaCheck, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';

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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{quiz.title}</h2>
          <p className="text-gray-600 mt-1">{quiz.questions.length} questions</p>
        </div>
        
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-50 text-blue-700'
            }`}>
              <FaClock />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          )}
          
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
      
      {/* Question Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index === currentQuestionIndex
                ? 'bg-[#00bcd4] text-white'
                : answers[index].selectedOptions.length > 0 || answers[index].textAnswer
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      
      {/* Current Question */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h3>
          <div className="text-sm text-gray-500">
            {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-800">{currentQuestion.text}</p>
        </div>
        
        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'multiple_choice' && (
            <>
              <p className="text-sm text-gray-500 mb-2">Select all that apply:</p>
              {currentQuestion.options.map(option => (
                <div
                  key={option._id}
                  onClick={() => handleOptionSelect(option._id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentAnswer.selectedOptions.includes(option._id)
                      ? 'border-[#00bcd4] bg-[#00bcd4]/10'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      currentAnswer.selectedOptions.includes(option._id)
                        ? 'bg-[#00bcd4] border-[#00bcd4] text-white'
                        : 'border-gray-300'
                    }`}>
                      {currentAnswer.selectedOptions.includes(option._id) && <FaCheck size={12} />}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {currentQuestion.type === 'true_false' && (
            <>
              <p className="text-sm text-gray-500 mb-2">Select one:</p>
              {currentQuestion.options.map(option => (
                <div
                  key={option._id}
                  onClick={() => handleOptionSelect(option._id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentAnswer.selectedOptions.includes(option._id)
                      ? 'border-[#00bcd4] bg-[#00bcd4]/10'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      currentAnswer.selectedOptions.includes(option._id)
                        ? 'bg-[#00bcd4] border-[#00bcd4] text-white'
                        : 'border-gray-300'
                    }`}>
                      {currentAnswer.selectedOptions.includes(option._id) && <div className="w-3 h-3 rounded-full bg-white"></div>}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {currentQuestion.type === 'short_answer' && (
            <>
              <p className="text-sm text-gray-500 mb-2">Enter your answer:</p>
              <textarea
                value={currentAnswer.textAnswer}
                onChange={handleTextAnswerChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                rows="3"
                placeholder="Type your answer here..."
              ></textarea>
            </>
          )}
          
          {currentQuestion.type === 'essay' && (
            <>
              <p className="text-sm text-gray-500 mb-2">Write your essay:</p>
              <textarea
                value={currentAnswer.textAnswer}
                onChange={handleTextAnswerChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                rows="8"
                placeholder="Write your essay here..."
              ></textarea>
            </>
          )}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousQuestion}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            currentQuestionIndex > 0
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          disabled={currentQuestionIndex === 0}
        >
          <FaArrowLeft />
          Previous
        </button>
        
        <button
          onClick={isLastQuestion ? () => setShowConfirmSubmit(true) : goToNextQuestion}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00bcd4] text-white hover:bg-[#0097a7]"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next'}
          {!isLastQuestion && <FaArrowRight />}
        </button>
      </div>
      
      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <FaExclamationTriangle size={24} />
              <h3 className="text-lg font-semibold">Submit Quiz?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                onClick={submitQuiz}
                className="px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#0097a7]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;
