import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaExclamationTriangle, FaCheck, FaTimes, FaArrowLeft, FaArrowRight, FaQuestionCircle, FaListAlt, FaTrophy, FaEdit, FaFileAlt, FaBookmark, FaRegBookmark, FaEye, FaFlag, FaChevronLeft, FaChevronRight, FaHome, FaCalculator, FaPause, FaPlay } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';
import '../styles/quiz-enhancements.css';

const QuizTaker = () => {
  const { courseId, testSeriesId, quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [lastProgressSave, setLastProgressSave] = useState(null);

  const timerRef = useRef(null);
  const sessionCheckRef = useRef(null);
  const progressSaveRef = useRef(null);

  useEffect(() => {
    startQuiz();

    return () => {
      // Cleanup function to prevent memory leaks
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
        sessionCheckRef.current = null;
      }
      if (progressSaveRef.current) {
        clearInterval(progressSaveRef.current);
        progressSaveRef.current = null;
      }
    };
  }, [quizId]);

  // Handle timer expiration with proper state access
  const handleTimerExpiration = useCallback(() => {
    console.log('Timer expired - checking quiz state', {
      hasAttempt: !!attempt,
      attemptId: attempt?._id || attempt?.id,
      hasAnswers: !!answers,
      answersLength: answers?.length,
      isSubmitted: isSubmitted
    });

    // Only submit if we have a valid attempt and answers and haven't submitted yet
    if (!isSubmitted && attempt && (attempt._id || attempt.id) && answers && answers.length > 0) {
      console.log('Timer expired - auto-submitting quiz');
      submitQuiz();
    } else if (isSubmitted) {
      console.log('Timer expired but quiz already submitted');
    } else {
      console.error('Timer expired but no valid attempt or answers found');
      setError('Quiz session expired. Please restart the quiz to continue.');
      toast.error('Quiz session expired. Please restart the quiz.');
    }
  }, [attempt, answers, isSubmitted]);

  // FIX: Created a dedicated function to start the timer
  const startTimer = useCallback(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;

          // Use a timeout to ensure state is properly updated before checking
          setTimeout(handleTimerExpiration, 100);

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [handleTimerExpiration]);

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
      setIsSubmitted(false);
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
        console.log('Started new quiz attempt:', { attemptId: newAttempt._id || newAttempt.id });
      } else if (response.data.data._id || response.data.data.id) {
        // Continuing existing attempt case
        newAttempt = response.data.data;
        console.log('Continuing existing quiz attempt:', { attemptId: newAttempt._id || newAttempt.id });

        // We need to fetch the quiz data separately
        try {
          const quizResponse = await quizAPI.getQuizById(newAttempt.quiz);
          quizData = quizResponse.data.data;
        } catch (quizError) {
          console.error('Failed to fetch quiz data for existing attempt:', quizError);
          throw new Error('Failed to load quiz data. Please restart the quiz.');
        }
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
        let calculatedTimeLeft;

        if (newAttempt.startTime) {
          // Calculate remaining time for continuing attempt
          const startTime = new Date(newAttempt.startTime);
          const currentTime = new Date();
          const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
          const totalTimeLimit = quizData.timeLimit * 60; // convert to seconds
          calculatedTimeLeft = Math.max(0, totalTimeLimit - elapsedSeconds);

          console.log('Time calculation for continuing attempt:', {
            startTime: startTime.toISOString(),
            currentTime: currentTime.toISOString(),
            elapsedSeconds,
            totalTimeLimit,
            calculatedTimeLeft,
            timeLimitMinutes: quizData.timeLimit
          });
        } else {
          // New attempt
          calculatedTimeLeft = quizData.timeLimit * 60; // convert to seconds
          console.log('Time calculation for new attempt:', {
            timeLimitMinutes: quizData.timeLimit,
            calculatedTimeLeft
          });
        }

        setTimeLeft(calculatedTimeLeft);

        if (calculatedTimeLeft > 0) {
          // FIX: Call the new startTimer function
          startTimer();
        } else {
          // Time has already expired - this should rarely happen now that backend handles expired attempts
          console.log('Quiz time has already expired on load', {
            calculatedTimeLeft,
            startTime: newAttempt.startTime,
            timeLimit: quizData.timeLimit
          });

          setError('Quiz time has expired. Please restart the quiz to continue.');
          toast.error('Quiz time has expired. Please restart the quiz.');
        }
      }

      // Start session validation (check every 30 seconds)
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
      sessionCheckRef.current = setInterval(validateSession, 30000);

      // Start automatic progress saving (every 30 seconds when there are answers)
      if (progressSaveRef.current) {
        clearInterval(progressSaveRef.current);
      }
      progressSaveRef.current = setInterval(saveProgress, 30000);

    } catch (err) {
      console.error('Error starting quiz:', err);

      // Handle specific error cases
      let errorMessage = 'Failed to start quiz. Please try again.';

      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Quiz not found or no longer available.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to take this quiz.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid quiz request.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

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

  const toggleMarkForReview = (questionIndex = currentQuestionIndex) => {
    setMarkedForReview(prevMarked => {
      const newMarked = new Set(prevMarked);
      if (newMarked.has(questionIndex)) {
        newMarked.delete(questionIndex);
      } else {
        newMarked.add(questionIndex);
      }
      return newMarked;
    });
  };

  const getQuestionStatus = (index) => {
    const isAnswered = answers[index]?.selectedOptions?.length > 0 || answers[index]?.textAnswer;
    const isMarked = markedForReview.has(index);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'not-visited';
  };

  const getAnsweredCount = () => {
    return answers.filter(answer =>
      answer.selectedOptions?.length > 0 || answer.textAnswer
    ).length;
  };

  const getMarkedCount = () => {
    return markedForReview.size;
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
  };

  // FIX: Fixed the call to the now-defined startTimer function
  const resumeTimer = () => {
    setIsPaused(false);
    if (timeLeft > 0) {
      startTimer();
    }
  };

  const submitQuiz = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;

    try {
      setIsSubmitting(true);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Check if attempt exists
      if (!attempt || (!attempt._id && !attempt.id)) {
        console.error('No valid attempt found for submission', {
          hasAttempt: !!attempt,
          attemptId: attempt?._id || attempt?.id
        });
        setError('Quiz session expired. Please restart the quiz to continue.');
        toast.error('Quiz session expired. Please restart the quiz.');
        setIsSubmitting(false);
        return;
      }

      // Check if answers exist
      if (!answers || answers.length === 0) {
        console.error('No answers found for submission', {
          hasAnswers: !!answers,
          answersLength: answers?.length
        });
        setError('No answers to submit. Please restart the quiz.');
        toast.error('No answers to submit. Please restart the quiz.');
        setIsSubmitting(false);
        return;
      }

      // Submit the quiz
      const attemptId = attempt._id || attempt.id;
      console.log('Submitting quiz attempt:', { attemptId, answersCount: answers.length });

      // Validate attempt before submission
      try {
        // First, try to get the attempt to make sure it still exists
        await quizAPI.getQuizAttempt(attemptId);
      } catch (validateError) {
        console.error('Attempt validation failed:', validateError);
        if (validateError.response && validateError.response.status === 404) {
          throw new Error('Quiz session has expired. Please restart the quiz.');
        }
        throw validateError;
      }

      await quizAPI.submitQuizAttempt(attemptId, { answers });

      // Mark as submitted
      setIsSubmitted(true);

      // Navigate to results page
      if (courseId) {
        navigate(`/courses/${courseId}/quizzes/${quizId}/results/${attemptId}`);
      } else if (testSeriesId) {
        navigate(`/test-series/${testSeriesId}/quiz/${quizId}/results/${attemptId}`);
      }

      toast.success('Quiz submitted successfully!');
    } catch (err) {
      console.error('Error submitting quiz:', err);

      // Check if it's a session/attempt related error
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        setError('Quiz session expired or invalid. Please restart the quiz to continue.');
        toast.error('Quiz session expired. Please restart the quiz.');
      } else {
        setError('Failed to submit quiz. Please try again or restart the quiz.');
        toast.error('Failed to submit quiz. Please try again.');
      }

      setIsSubmitting(false);
    }
  }, [isSubmitting, isSubmitted, attempt, answers, courseId, testSeriesId, quizId, navigate]);

  // Validate session periodically
  const validateSession = useCallback(async () => {
    if (!attempt || isSubmitted || isSubmitting) return;

    try {
      const attemptId = attempt._id || attempt.id;
      await quizAPI.getQuizAttempt(attemptId);
    } catch (error) {
      console.error('Session validation failed:', error);
      if (error.response && error.response.status === 404) {
        setError('Quiz session has expired. Please restart the quiz.');
        toast.error('Quiz session has expired. Please restart the quiz.');

        // Clear timers
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (sessionCheckRef.current) {
          clearInterval(sessionCheckRef.current);
          sessionCheckRef.current = null;
        }
      }
    }
  }, [attempt, isSubmitted, isSubmitting]);

  // Save quiz progress automatically and on user actions
  const saveProgress = useCallback(async () => {
    // Only save if we have an active attempt, answers, and haven't submitted
    if (!attempt || isSubmitted || isSubmitting || !answers || answers.length === 0) {
      return;
    }

    // Check if user has answered at least one question
    const hasAnswers = answers.some(answer => 
      answer.selectedOptions?.length > 0 || answer.textAnswer?.trim()
    );
    
    if (!hasAnswers) {
      return; // Don't save if no answers provided yet
    }

    try {
      const attemptId = attempt._id || attempt.id;
      const progressData = {
        answers,
        currentQuestionIndex
      };
      
      await quizAPI.saveQuizProgress(attemptId, progressData);
      setLastProgressSave(new Date());
      
      console.log('Quiz progress saved successfully', {
        attemptId,
        currentQuestionIndex,
        answersCount: answers.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
      
      // Handle session expiry
      if (error.response && error.response.status === 408) {
        setError('Quiz session expired due to inactivity. Please restart.');
        toast.error('Quiz session expired due to inactivity. Please restart the quiz.');
        
        // Clear timers
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (sessionCheckRef.current) {
          clearInterval(sessionCheckRef.current);
          sessionCheckRef.current = null;
        }
        if (progressSaveRef.current) {
          clearInterval(progressSaveRef.current);
          progressSaveRef.current = null;
        }
      }
      // Don't show toast for other progress save errors to avoid user annoyance
    }
  }, [attempt, answers, currentQuestionIndex, isSubmitted, isSubmitting]);

  // Save progress when answers change (debounced)
  useEffect(() => {
    if (!attempt || isSubmitted || isSubmitting || !answers || answers.length === 0) {
      return;
    }

    // Debounce progress saving - save 2 seconds after user stops interacting
    const timeoutId = setTimeout(() => {
      saveProgress();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [answers, saveProgress]);

  // Save progress when navigating between questions
  useEffect(() => {
    if (!attempt || isSubmitted || isSubmitting) {
      return;
    }

    // Save immediately when question changes
    const timeoutId = setTimeout(() => {
      saveProgress();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentQuestionIndex, saveProgress]);

  // Force restart quiz - the backend will handle expired attempts
  const forceRestartQuiz = useCallback(async () => {
    try {
      console.log('Force restarting quiz - backend will handle expired attempts');

      // Clear current state
      setAttempt(null);
      setAnswers([]);
      setError('');

      // Restart the quiz - backend will detect expired attempt and create new one
      startQuiz();
    } catch (error) {
      console.error('Error force restarting quiz:', error);
      setError('Failed to restart quiz. Please refresh the page.');
      toast.error('Failed to restart quiz. Please refresh the page.');
    }
  }, []);

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
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              setError('');
              startQuiz();
            }}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Restart Quiz
          </button>
          <button
            onClick={() => courseId ? navigate(`/courses/${courseId}`) : navigate(`/test-series/${testSeriesId}`)}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            {courseId ? 'Return to Course' : 'Return to Test Series'}
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !attempt || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Quiz data could not be loaded.</p>
        <button
          onClick={() => courseId ? navigate(`/courses/${courseId}`) : navigate(`/test-series/${testSeriesId}`)}
          className="mt-4 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          {courseId ? 'Return to Course' : 'Return to Test Series'}
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

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPause className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Paused</h3>
            <p className="text-gray-600 mb-6">Take a break. Your progress is saved.</p>
            <button
              onClick={resumeTimer}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <FaPlay className="text-sm" />
              Resume Quiz
            </button>
          </div>
        </div>
      )}

      <div className="relative flex max-w-7xl mx-auto p-4 sm:p-6 gap-6">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showQuestionPalette ? 'lg:mr-0' : ''}`}>
          {/* Quiz Header Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaQuestionCircle className="text-white text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">
                    {quiz.title}
                  </h2>
                  <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm sm:text-base">
                    <FaListAlt className="text-xs sm:text-sm flex-shrink-0" />
                    <span className="truncate">{quiz.questions.length} questions • {quiz.timeLimit} minutes</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
                {/* Question Palette Toggle (Desktop Only) */}
                <button
                  onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                  className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700"
                >
                  <FaListAlt />
                  {showQuestionPalette ? 'Hide' : 'Show'} Palette
                </button>

                {/* Pause/Resume Button */}
                <button
                  onClick={isPaused ? resumeTimer : pauseTimer}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors text-sm text-yellow-700"
                >
                  {isPaused ? <FaPlay /> : <FaPause />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>

                {/* Timer */}
                {timeLeft !== null && (
                  <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg flex-shrink-0 ${
                    timeLeft < 60
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-red-200'
                      : timeLeft < 300
                      ? 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-orange-200'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200'
                  }`}>
                    <FaClock className="text-sm sm:text-lg" />
                    <div className="text-center">
                      <div className="font-bold text-sm sm:text-lg">{formatTime(timeLeft)}</div>
                      <div className="text-xs opacity-90 hidden sm:block">remaining</div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center gap-2 text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                      <span className="hidden sm:inline">Submitting...</span>
                      <span className="sm:hidden">Submit</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="text-xs sm:text-sm" />
                      <span className="hidden sm:inline">Submit Quiz</span>
                      <span className="sm:hidden">Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar - Mobile Only */}
          <div className="lg:hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">Progress</h3>
              <span className="text-xs text-gray-600">
                {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Compact Question Navigation Pills - Mobile */}
            <div className="flex flex-wrap gap-1 justify-center">
              {quiz.questions.map((_, index) => {
                const status = getQuestionStatus(index);
                const statusColors = {
                  'current': 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg',
                  'answered-marked': 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md border-2 border-orange-400',
                  'answered': 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md',
                  'marked': 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md',
                  'not-visited': 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                };

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 transform active:scale-95 touch-manipulation ${statusColors[status]}`}
                  >
                    {(status === 'answered' || status === 'answered-marked') && status !== 'current' ? <FaCheck size={8} /> : index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                  {currentQuestionIndex + 1}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Question {currentQuestionIndex + 1}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">of {quiz.questions.length} questions</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mark for Review Button */}
                <button
                  onClick={() => toggleMarkForReview()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
                    markedForReview.has(currentQuestionIndex)
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {markedForReview.has(currentQuestionIndex) ? <FaBookmark /> : <FaRegBookmark />}
                  <span className="hidden sm:inline">
                    {markedForReview.has(currentQuestionIndex) ? 'Marked' : 'Mark for Review'}
                  </span>
                </button>

                {/* Points Badge */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg">
                  <FaTrophy className="text-xs sm:text-sm" />
                  <span className="font-bold text-sm sm:text-base">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
              <div className="relative">
                <div className="flex items-start gap-3">
                  <FaQuestionCircle className="text-blue-500 mt-1 flex-shrink-0 text-sm sm:text-base" />
                  <p className="text-gray-800 text-base sm:text-lg leading-relaxed">{currentQuestion.text}</p>
                </div>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 sm:space-y-4">
              {currentQuestion.type === 'multiple_choice' && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <FaListAlt className="text-blue-500 text-sm sm:text-base" />
                    <p className="text-sm font-medium text-gray-700">Select all that apply:</p>
                  </div>
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected = currentAnswer.selectedOptions.includes(option._id);
                    const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D...

                    return (
                      <div
                        key={option._id}
                        onClick={() => handleOptionSelect(option._id)}
                        className={`group p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform active:scale-95 sm:hover:scale-[1.02] touch-manipulation ${
                          isSelected
                            ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-100'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 flex items-center justify-center font-bold transition-all duration-300 flex-shrink-0 ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg'
                              : 'border-gray-300 text-gray-600 group-hover:border-blue-400 group-hover:text-blue-600'
                          }`}>
                            {isSelected ? <FaCheck size={12} className="sm:w-3.5 sm:h-3.5" /> : optionLetter}
                          </div>
                          <span className={`text-base sm:text-lg transition-colors duration-300 leading-relaxed ${
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
                    <FaCheck className="text-green-500 text-sm sm:text-base" />
                    <p className="text-sm font-medium text-gray-700">Select one:</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const isSelected = currentAnswer.selectedOptions.includes(option._id);
                      const isTrue = option.text.toLowerCase().includes('true');

                      return (
                        <div
                          key={option._id}
                          onClick={() => handleOptionSelect(option._id)}
                          className={`group p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform active:scale-95 sm:hover:scale-105 touch-manipulation ${
                            isSelected
                              ? isTrue
                                ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg shadow-green-100'
                                : 'border-red-400 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg shadow-red-100'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-3 sm:gap-4">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 flex-shrink-0 ${
                              isSelected
                                ? isTrue
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-500 text-white shadow-lg'
                                : 'border-gray-300 text-gray-600 group-hover:border-blue-400 group-hover:text-blue-600'
                            }`}>
                              {isSelected ? <FaCheck size={14} className="sm:w-4 sm:h-4" /> : (isTrue ? 'T' : 'F')}
                            </div>
                            <span className={`text-lg sm:text-xl font-medium transition-colors duration-300 text-center sm:text-left ${
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
                    <FaEdit className="text-blue-500 text-sm sm:text-base" />
                    <p className="text-sm font-medium text-gray-700">Enter your answer:</p>
                  </div>
                  <div className="relative">
                    <textarea
                      value={currentAnswer.textAnswer}
                      onChange={handleTextAnswerChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white shadow-sm resize-none text-base"
                      rows="4"
                      placeholder="Type your answer here..."
                    ></textarea>
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-gray-400">
                      {currentAnswer.textAnswer?.length || 0} characters
                    </div>
                  </div>
                </>
              )}

              {currentQuestion.type === 'essay' && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <FaFileAlt className="text-purple-500 text-sm sm:text-base" />
                    <p className="text-sm font-medium text-gray-700">Write your essay:</p>
                  </div>
                  <div className="relative">
                    <textarea
                      value={currentAnswer.textAnswer}
                      onChange={handleTextAnswerChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white shadow-sm resize-none text-base"
                      rows="8"
                      placeholder="Write your essay here... Be detailed and provide examples to support your points."
                    ></textarea>
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-gray-400">
                      {currentAnswer.textAnswer?.length || 0} characters
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={goToPreviousQuestion}
                className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 transform touch-manipulation ${
                  currentQuestionIndex > 0
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 active:scale-95 sm:hover:scale-105 shadow-md'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                disabled={currentQuestionIndex === 0}
              >
                <FaArrowLeft className="text-sm sm:text-base" />
                <span className="text-sm sm:text-base">Previous</span>
              </button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 text-center">
                <span className="hidden sm:inline">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span className="sm:hidden">{currentQuestionIndex + 1}/{quiz.questions.length}</span>
              </div>

              <button
                onClick={isLastQuestion ? () => setShowConfirmSubmit(true) : goToNextQuestion}
                className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 sm:hover:scale-105 shadow-lg touch-manipulation ${
                  isLastQuestion
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-200'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-200'
                }`}
              >
                {isLastQuestion ? (
                  <>
                    <FaCheck className="text-sm sm:text-base" />
                    <span className="text-sm sm:text-base">Finish Quiz</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Next</span>
                    <FaArrowRight className="text-sm sm:text-base" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette - Desktop Only */}
        {showQuestionPalette && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FaListAlt className="text-blue-500" />
                    Question Palette
                  </h3>
                  <button
                    onClick={() => setShowQuestionPalette(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">{getAnsweredCount()}</div>
                    <div className="text-xs text-emerald-700">Answered</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-100">
                    <div className="text-2xl font-bold text-orange-600">{getMarkedCount()}</div>
                    <div className="text-xs text-orange-700">Marked</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{quiz.questions.length - getAnsweredCount()}</div>
                    <div className="text-xs text-blue-700">Not Answered</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{currentQuestionIndex + 1}</div>
                    <div className="text-xs text-purple-700">Current</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                      <span>Current Question</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded"></div>
                      <span>Marked for Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded border-2 border-orange-400"></div>
                      <span>Answered & Marked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
                      <span>Not Visited</span>
                    </div>
                  </div>
                </div>

                {/* Question Grid */}
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-5 gap-2">
                    {quiz.questions.map((_, index) => {
                      const status = getQuestionStatus(index);
                      const statusColors = {
                        'current': 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-300',
                        'answered-marked': 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md border-2 border-orange-400',
                        'answered': 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md',
                        'marked': 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md',
                        'not-visited': 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      };

                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-105 ${statusColors[status]}`}
                        >
                          {(status === 'answered' || status === 'answered-marked') && status !== 'current' ? <FaCheck size={12} /> : index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const unanswered = quiz.questions.findIndex((_, index) =>
                          !answers[index]?.selectedOptions?.length && !answers[index]?.textAnswer
                        );
                        if (unanswered !== -1) setCurrentQuestionIndex(unanswered);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-sm text-blue-700"
                    >
                      <FaArrowRight size={12} />
                      Next Unanswered
                    </button>
                    <button
                      onClick={() => {
                        const marked = Array.from(markedForReview)[0];
                        if (marked !== undefined) setCurrentQuestionIndex(marked);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors text-sm text-yellow-700"
                      disabled={markedForReview.size === 0}
                    >
                      <FaBookmark size={12} />
                      Review Marked
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-4 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaExclamationTriangle className="text-white text-lg sm:text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Submit Quiz?</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Final confirmation required</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border border-blue-100">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                  Are you sure you want to submit your quiz? Once submitted, you won't be able to change your answers.
                </p>

                {/* Quiz Summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/70 rounded-lg p-2">
                    <div className="text-lg font-bold text-emerald-600">{getAnsweredCount()}</div>
                    <div className="text-xs text-gray-600">Answered</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2">
                    <div className="text-lg font-bold text-orange-600">{getMarkedCount()}</div>
                    <div className="text-xs text-gray-600">Marked</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2">
                    <div className="text-lg font-bold text-red-600">{quiz.questions.length - getAnsweredCount()}</div>
                    <div className="text-xs text-gray-600">Unanswered</div>
                  </div>
                </div>

                {(quiz.questions.length - getAnsweredCount() > 0) && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-xs text-center">
                      ⚠️ You have {quiz.questions.length - getAnsweredCount()} unanswered question(s)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>

                <button
                  onClick={submitQuiz}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg transform active:scale-95 sm:hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2 touch-manipulation"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="text-sm sm:text-base" />
                      <span>Submit Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submitting Overlay */}
      {(isSubmitting || isSubmitted) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isSubmitted ? 'Quiz Submitted!' : 'Submitting Quiz...'}
            </h3>
            <p className="text-gray-600">
              {isSubmitted ? 'Redirecting to results...' : 'Please wait while we process your answers.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;
