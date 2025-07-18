import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import CategoryManagement from '../components/admin/CategoryManagement';

const CategoryManagementPage = () => {
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
      <CategoryManagement />
    </div>
  );
};

export default CategoryManagementPage;
