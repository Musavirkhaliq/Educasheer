import React from 'react';
import MaterialUploadForm from '../components/materials/MaterialUploadForm';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const MaterialUploadPage = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect if user is not admin or tutor
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'tutor') {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Upload Course Material</h1>
          <p className="text-gray-600">
            Add study materials for your students to download and learn from
          </p>
        </div>

        <MaterialUploadForm />
      </div>
    </div>
  );
};

export default MaterialUploadPage;
