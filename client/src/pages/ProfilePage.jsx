import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import AccountSettings from '../components/profile/AccountSettings';
import WatchHistory from '../components/profile/WatchHistory';
import UserBlogs from '../components/profile/UserBlogs';

const ProfilePage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <ProfileHeader user={currentUser} />

        <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'account' && <AccountSettings user={currentUser} />}
            {activeTab === 'history' && <WatchHistory />}
            {activeTab === 'blogs' && <UserBlogs />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
