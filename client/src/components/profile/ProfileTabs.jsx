import React from 'react';
import { FaUser, FaHistory, FaEdit, FaTrophy, FaGraduationCap, FaShoppingBag } from 'react-icons/fa';

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'account', label: 'Account Settings', icon: FaUser },
    { id: 'orders', label: 'My Orders', icon: FaShoppingBag },
    { id: 'exams', label: 'Exam Performance', icon: FaGraduationCap },
    { id: 'history', label: 'Watch History', icon: FaHistory },
    { id: 'blogs', label: 'My Blogs', icon: FaEdit },
    { id: 'gamification', label: 'Achievements', icon: FaTrophy },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#00bcd4] border-b-2 border-[#00bcd4]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="mr-2" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileTabs;
