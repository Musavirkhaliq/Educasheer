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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);
  
  const startQuiz = async () => {
    try {
      setLoading(true);
      
      // Start a new quiz attempt
      const response = await quizAPI.startQuizAttempt(quizId);
      const { attempt: newAttempt, quiz: quizData } = response.data.data;
      
      setQuiz(quizData);
      setAttempt(newAttempt);
      
      // Initialize answers array
      const initialAnswers = quizData.questions.map(question => ({
        questionId: question._id,
        selectedOptions: [],
        textAnswer: ''
      }));
      
      setAnswers(initialAnswers);
      
      // Set up timer
      const timeLimit = quizData.timeLimit * 60; // convert to seconds
      setTimeLeft(timeLimit);
      
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
      
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError('Failed to start quiz. Please try again.');
      toast.error('Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOptionSelect = (optionId) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    
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
      const response = await quizAPI.submitQuizAttempt(attempt._id, { answers });
      
      // Navigate to results page
      navigate(`/courses/${courseId}/quizzes/${quizId}/results/${attempt._id}`);
      
      toast.success('Quiz submitted successfully!');
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      toast.error('Failed to submit quiz');
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (seconds) => {
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
  
  if (!quiz || !attempt) {
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
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{quiz.title}</h2>
          <p className="text-gray-600 mt-1">{quiz.questions.length} questions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-50 text-blue-700'
          }`}>
            <FaClock />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
          
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
