import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RewardsList from '../components/rewards/RewardsList';
import RedemptionHistory from '../components/rewards/RedemptionHistory';
import { FaGift, FaHistory, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RewardsPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('rewards');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rewards Center</h1>
          <p className="text-gray-600">
            Redeem your points for exclusive rewards and benefits
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Earn points by completing courses, watching videos, participating in discussions, and more. 
                Then redeem your points for rewards like course discounts, exclusive content, and certificates.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rewards'
                  ? 'border-[#00bcd4] text-[#00bcd4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaGift className="mr-2" />
                Available Rewards
              </div>
            </button>
            
            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-[#00bcd4] text-[#00bcd4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FaHistory className="mr-2" />
                  Redemption History
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'rewards' ? (
            <RewardsList />
          ) : (
            <RedemptionHistory />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RewardsPage;
