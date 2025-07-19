import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import QuizDetails from '../components/QuizDetails';

const QuizDetailsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <QuizDetails />;
};

export default QuizDetailsPage;
