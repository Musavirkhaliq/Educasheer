import React, { useState, useEffect } from 'react';
import { rewardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGift, FaCoins, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RewardsList = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [redeemingReward, setRedeemingReward] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    fetchRewards();
    
    // If user is authenticated, fetch their points
    if (isAuthenticated && currentUser) {
      fetchUserPoints();
    }
  }, [isAuthenticated, currentUser, selectedCategory]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await rewardAPI.getAvailableRewards(params);
      setRewards(response.data.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setError('Failed to load rewards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await rewardAPI.getUserProfile();
      if (response.data.data.points) {
        setUserPoints(response.data.data.points.totalPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to redeem rewards');
      return;
    }
    
    try {
      setRedeemingReward(rewardId);
      const response = await rewardAPI.redeemReward(rewardId);
      
      // Show success message
      toast.success('Reward redeemed successfully!');
      
      // Update user points
      setUserPoints(prev => prev - response.data.data.reward.pointsCost);
      
      // Show redemption code in a modal or toast
      toast.info(
        <div>
          <p>Your redemption code:</p>
          <p className="font-bold text-lg">{response.data.data.redemptionCode}</p>
          <p className="text-sm mt-2">Valid until: {new Date(response.data.data.expiresAt).toLocaleDateString()}</p>
        </div>,
        { autoClose: false }
      );
      
      // Refresh rewards list
      fetchRewards();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error(error.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setRedeemingReward(null);
    }
  };

  const categories = [
    { id: 'all', label: 'All Rewards' },
    { id: 'discount', label: 'Discounts' },
    { id: 'content', label: 'Exclusive Content' },
    { id: 'certificate', label: 'Certificates' },
    { id: 'merchandise', label: 'Merchandise' },
    { id: 'other', label: 'Other' }
  ];

  if (loading && rewards.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-[#00bcd4] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Points (if authenticated) */}
      {isAuthenticated && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-full text-white mr-4">
              <FaCoins className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Your Points Balance</h3>
              <p className="text-2xl font-bold text-blue-900">{userPoints}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      {rewards.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaExclamationCircle className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Rewards Available</h3>
          <p className="text-gray-500">Check back later for new rewards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <motion.div
              key={reward._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Reward Image */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                {reward.image ? (
                  <img
                    src={reward.image}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x200?text=Reward";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#00bcd4] to-[#01427a]">
                    <FaGift className="text-white text-5xl" />
                  </div>
                )}
              </div>
              
              {/* Reward Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{reward.name}</h3>
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    <FaCoins className="mr-1" />
                    {reward.pointsCost}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                
                {/* Category Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(reward.category)}`}>
                    {formatCategory(reward.category)}
                  </span>
                </div>
                
                {/* Redeem Button */}
                <button
                  onClick={() => handleRedeemReward(reward._id)}
                  disabled={!isAuthenticated || redeemingReward === reward._id || userPoints < reward.pointsCost}
                  className={`w-full py-2 rounded-lg font-medium ${
                    !isAuthenticated
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : userPoints < reward.pointsCost
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white hover:shadow-lg transition-all duration-300'
                  }`}
                >
                  {redeemingReward === reward._id ? (
                    <FaSpinner className="animate-spin inline mr-2" />
                  ) : !isAuthenticated ? (
                    'Login to Redeem'
                  ) : userPoints < reward.pointsCost ? (
                    'Not Enough Points'
                  ) : (
                    'Redeem Reward'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
const formatCategory = (category) => {
  switch (category) {
    case 'discount':
      return 'Discount';
    case 'content':
      return 'Exclusive Content';
    case 'certificate':
      return 'Certificate';
    case 'merchandise':
      return 'Merchandise';
    default:
      return 'Other';
  }
};

const getCategoryBadgeColor = (category) => {
  switch (category) {
    case 'discount':
      return 'bg-green-100 text-green-800';
    case 'content':
      return 'bg-blue-100 text-blue-800';
    case 'certificate':
      return 'bg-purple-100 text-purple-800';
    case 'merchandise':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default RewardsList;
