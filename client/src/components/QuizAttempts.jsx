import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaEye, FaArrowLeft, FaPlay } from 'react-icons/fa';
import { quizAPI } from '../services/quizAPI';
import { toast } from 'react-hot-toast';

const QuizAttempts = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchQuizAndAttempts();
  }, [quizId]);
  
  const fetchQuizAndAttempts = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details
      const quizResponse = await quizAPI.getQuizById(quizId);
      setQuiz(quizResponse.data.data);
      
      // Fetch user's attempts for this quiz
      const attemptsResponse = await quizAPI.getUserQuizAttempts(quizId);
      setAttempts(attemptsResponse.data.data || []);
      
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
      setError('Failed to load quiz attempts. Please try again.');
      toast.error('Failed to load quiz attempts');
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
  
  if (!quiz) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Quiz details could not be loaded.</p>
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
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft />
          <span>Back to Course</span>
        </Link>
        <h2 className="text-2xl font-semibold text-gray-800">{quiz.title} - Attempts</h2>
        <p className="text-gray-600 mt-1">
          {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'} made
        </p>
      </div>
      
      {/* Quiz Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Questions</p>
            <p className="font-medium">{quiz.questions?.length || 0} questions</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Time Limit</p>
            <p className="font-medium">{quiz.timeLimit} minutes</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Passing Score</p>
            <p className="font-medium">{quiz.passingScore}%</p>
          </div>
        </div>
      </div>
      
      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You haven't attempted this quiz yet.</p>
          <Link
            to={`/courses/${courseId}/quizzes/${quizId}`}
            className="mt-4 inline-block bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] transition-colors"
          >
            Take Quiz
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt, index) => (
                <tr key={attempt._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{attempts.length - index}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(attempt.endTime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(attempt.endTime).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attempt.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {attempt.score} / {attempt.maxScore} points
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      attempt.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {attempt.isPassed ? (
                        <span className="flex items-center gap-1">
                          <FaCheck size={10} /> Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FaTimes size={10} /> Failed
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <FaClock className="text-gray-400" size={12} />
                      {formatDuration(attempt.timeSpent)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/courses/${courseId}/quizzes/${quizId}/results/${attempt._id}`}
                        className="text-[#00bcd4] hover:text-[#0097a7]"
                        title="View Results"
                      >
                        <FaEye />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          className="px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#0097a7] flex items-center gap-2"
        >
          <FaPlay size={14} />
          {attempts.length > 0 ? 'Retake Quiz' : 'Take Quiz'}
        </Link>
      </div>
    </div>
  );
};

export default QuizAttempts;
