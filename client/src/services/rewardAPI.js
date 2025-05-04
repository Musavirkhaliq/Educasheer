import { api } from './api';

export const rewardAPI = {
  // Get available rewards
  getAvailableRewards: (params) => api.get('/rewards/available', { params }),
  
  // Get user's redemption history
  getRedemptionHistory: () => api.get('/rewards/history'),
  
  // Redeem a reward
  redeemReward: (rewardId) => api.post(`/rewards/redeem/${rewardId}`),
  
  // Admin: Get all rewards
  getAllRewards: (params) => api.get('/rewards/admin/all', { params }),
  
  // Admin: Create a new reward
  createReward: (data) => {
    const formData = new FormData();
    
    // Append all fields to formData
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    
    return api.post('/rewards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Admin: Update a reward
  updateReward: (rewardId, data) => {
    const formData = new FormData();
    
    // Append all fields to formData
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    
    return api.patch(`/rewards/${rewardId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Admin: Verify a redemption code
  verifyRedemptionCode: (code) => api.get(`/rewards/verify/${code}`),
  
  // Admin: Mark a redemption as used
  markRedemptionUsed: (redemptionId) => api.patch(`/rewards/mark-used/${redemptionId}`)
};
