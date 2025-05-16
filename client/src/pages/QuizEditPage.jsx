import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import QuizForm from '../components/admin/QuizForm';

const QuizEditPage = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Redirect if not authenticated or not an admin
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <QuizForm isEditing={true} />
    </div>
  );
};

export default QuizEditPage;
