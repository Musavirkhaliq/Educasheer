import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GamificationProfile from '../components/gamification/GamificationProfile';
import Leaderboard from '../components/gamification/Leaderboard';
import { FaTrophy, FaUsers } from 'react-icons/fa';

const GamificationPage = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Make sure we have user data before rendering
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gamification</h1>
        
        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center py-3 px-6 font-medium ${
              activeTab === 'profile'
                ? 'text-[#00bcd4] border-b-2 border-[#00bcd4]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTrophy className="mr-2" />
            My Progress
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center py-3 px-6 font-medium ${
              activeTab === 'leaderboard'
                ? 'text-[#00bcd4] border-b-2 border-[#00bcd4]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUsers className="mr-2" />
            Leaderboard
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'profile' && <GamificationProfile />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>
    </div>
  );
};

export default GamificationPage;
