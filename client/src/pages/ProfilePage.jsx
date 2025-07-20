import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import AccountSettings from '../components/profile/AccountSettings';
import WatchHistory from '../components/profile/WatchHistory';
import UserBlogs from '../components/profile/UserBlogs';
import GamificationProfile from '../components/gamification/GamificationProfile';
import ExamPerformance from '../components/profile/ExamPerformance';

const ProfilePage = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('exams');

  // Debug log to check user data
  useEffect(() => {
    console.log('Profile Page - Current User:', currentUser);
    console.log('Profile Page - Is Authenticated:', isAuthenticated);
    console.log('Profile Page - Loading:', loading);
  }, [currentUser, isAuthenticated, loading]);

  // Show loading indicator while auth state is being determined
  if (loading) {
    console.log('Auth state is loading, showing loading indicator');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Make sure we have user data before rendering the profile
  if (!currentUser) {
    console.log('User is authenticated but no user data available');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <ProfileHeader user={currentUser} />

        <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'account' && <AccountSettings user={currentUser} />}
            {activeTab === 'exams' && <ExamPerformance />}
            {activeTab === 'history' && <WatchHistory />}
            {activeTab === 'blogs' && <UserBlogs />}
            {activeTab === 'gamification' && <GamificationProfile />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
