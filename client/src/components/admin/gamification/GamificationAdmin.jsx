import React, { useState } from 'react';
import { FaChartLine, FaMedal, FaTrophy, FaUsers } from 'react-icons/fa';
import GamificationDashboard from './GamificationDashboard';
import BadgeManager from './BadgeManager';
import ChallengeManager from './ChallengeManager';
import UserRewards from './UserRewards';

const GamificationAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
    { id: 'badges', label: 'Badges', icon: FaMedal },
    { id: 'challenges', label: 'Challenges', icon: FaTrophy },
    { id: 'rewards', label: 'User Rewards', icon: FaUsers },
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gamification Management</h1>
      
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-3 px-6 font-medium text-sm ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Content */}
      <div>
        {activeTab === 'dashboard' && <GamificationDashboard />}
        {activeTab === 'badges' && <BadgeManager />}
        {activeTab === 'challenges' && <ChallengeManager />}
        {activeTab === 'rewards' && <UserRewards />}
      </div>
    </div>
  );
};

export default GamificationAdmin;
