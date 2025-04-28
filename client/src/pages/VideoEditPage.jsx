import React from 'react';
import { Navigate } from 'react-router-dom';
import VideoEditForm from '../components/VideoEditForm';
import { useAuth } from '../context/AuthContext';

const VideoEditPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <VideoEditForm />
      </div>
    </div>
  );
};

export default VideoEditPage;
