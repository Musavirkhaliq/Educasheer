import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import QuizTaker from '../components/QuizTaker';

const QuizTakerPage = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <QuizTaker />
      </div>
    </div>
  );
};

export default QuizTakerPage;
