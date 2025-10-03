import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useParams } from 'react-router-dom';
import QuizDetails from '../components/QuizDetails';

const QuizDetailsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { testSeriesId, courseId } = useParams();

  // Only redirect if not authenticated AND it's a course quiz (not test series)
  // Test series quizzes should be viewable by logged out users
  if (!isAuthenticated && courseId && !testSeriesId) {
    return <Navigate to="/login" />;
  }

  return <QuizDetails />;
};

export default QuizDetailsPage;
