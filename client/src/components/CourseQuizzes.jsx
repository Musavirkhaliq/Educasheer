import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaCheck, FaTimes, FaClock, FaPlay, FaHistory, FaEye } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';

const CourseQuizzes = ({ courseId, courseName, isInstructor = false }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAttempts, setUserAttempts] = useState({});

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log(`Fetching quizzes for course: ${courseId}`);

      const response = await quizAPI.getCourseQuizzes(courseId);
      console.log('Quiz API response:', response);

      const quizzesData = response.data.data || [];
      console.log(`Quizzes received: ${quizzesData.length}`);

      setQuizzes(quizzesData);

      // Fetch user attempts for each quiz
      if (quizzesData.length > 0) {
        console.log('Fetching quiz attempts...');

        const attemptsPromises = quizzesData.map(quiz =>
          quizAPI.getUserQuizAttempts(quiz._id)
            .then(res => {
              console.log(`Attempts for quiz ${quiz._id}:`, res.data.data);
              return { quizId: quiz._id, attempts: res.data.data || [] };
            })
            .catch(err => {
              console.error(`Error fetching attempts for quiz ${quiz._id}:`, err);
              return { quizId: quiz._id, attempts: [] };
            })
        );

        const attemptsResults = await Promise.all(attemptsPromises);

        // Convert to object with quizId as key
        const attemptsMap = {};
        attemptsResults.forEach(result => {
          attemptsMap[result.quizId] = result.attempts;
        });

        console.log('User attempts map:', attemptsMap);
        setUserAttempts(attemptsMap);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load quizzes. Please try again.');
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getBestAttempt = (quizId) => {
    const attempts = userAttempts[quizId] || [];
    if (attempts.length === 0) return null;

    // Find the attempt with the highest score
    return attempts.reduce((best, current) =>
      (current.percentage > best.percentage) ? current : best, attempts[0]);
  };

  const getAttemptCount = (quizId) => {
    return (userAttempts[quizId] || []).length;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
  };

  if (loading && quizzes.length === 0) {
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

  if (quizzes.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="text-center py-8 text-gray-500">
          {isInstructor ? (
            <>
              <p>No quizzes have been created for this course yet.</p>
              <Link
                to="/admin/quizzes/create"
                className="mt-4 inline-block bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
              >
                Create Quiz
              </Link>
            </>
          ) : (
            <p>No quizzes are available for this course yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <FaClipboardList className="text-[#00bcd4]" />
          Available Quizzes ({quizzes.length})
        </h3>

        {isInstructor && (
          <Link
            to="/admin/quizzes/create"
            className="bg-[#00bcd4] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#0097a7] transition-colors"
          >
            Create Quiz
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {quizzes.map(quiz => {
          const bestAttempt = getBestAttempt(quiz._id);
          const attemptCount = getAttemptCount(quiz._id);
          const isPassed = bestAttempt && bestAttempt.isPassed;
          const hasAttempted = attemptCount > 0;

          return (
            <div
              key={quiz._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 quiz-title-compact">{quiz.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 quiz-description">
                    {quiz.description && quiz.description.length > 100 
                      ? `${quiz.description.substring(0, 100)}...` 
                      : quiz.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FaClock className="text-[#00bcd4]" />
                      <span>{formatDuration(quiz.timeLimit)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FaClipboardList className="text-[#00bcd4]" />
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        quiz.quizType === 'quiz'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {quiz.quizType === 'quiz' ? 'Quiz' : 'Exam'}
                      </span>
                    </div>

                    {hasAttempted && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isPassed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {isPassed ? (
                            <span className="flex items-center gap-1">
                              <FaCheck size={10} />
                              Passed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FaTimes size={10} />
                              Failed
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {hasAttempted && (
                    <div className="mt-3 text-sm">
                      <p className="text-gray-600">
                        Best score: <span className="font-medium">{bestAttempt.percentage.toFixed(1)}%</span>
                        {attemptCount > 1 && ` (${attemptCount} attempts)`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {hasAttempted && (
                    <Link
                      to={`/courses/${courseId}/quizzes/${quiz._id}/attempts`}
                      className="flex items-center gap-1 text-[#00bcd4] hover:text-[#0097a7] text-sm"
                    >
                      <FaHistory size={14} />
                      View Attempts
                    </Link>
                  )}

                  {hasAttempted && (
                    <Link
                      to={`/courses/${courseId}/quizzes/${quiz._id}/results/${bestAttempt._id}`}
                      className="flex items-center gap-1 text-[#00bcd4] hover:text-[#0097a7] text-sm"
                    >
                      <FaEye size={14} />
                      View Results
                    </Link>
                  )}

                  <Link
                    to={`/courses/${courseId}/quizzes/${quiz._id}`}
                    className={`bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0097a7] transition-colors ${
                      hasAttempted ? 'mt-2' : ''
                    }`}
                  >
                    <FaPlay size={14} />
                    {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
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

export default CourseQuizzes;
