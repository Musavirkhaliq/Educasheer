import React from 'react';
import { Navigate } from 'react-router-dom';
import VideoUploadForm from '../components/VideoUploadForm';
import { useAuth } from '../context/AuthContext';

const VideoUploadPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Redirect if user is not admin or tutor
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'tutor') {
    return <Navigate to="/videos" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <VideoUploadForm />
      </div>
    </div>
  );
};

export default VideoUploadPage;
