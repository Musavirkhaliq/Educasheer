import axios from 'axios';

// Create an axios instance with default config for authenticated requests
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate axios instance for public endpoints that don't require authentication
const publicApi = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests (only for authenticated api)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('API - Token expired, attempting to refresh...');

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('API - No refresh token available');
          clearAuthData();
          throw new Error('No refresh token available');
        }

        console.log('API - Calling refresh token endpoint');
        const response = await axios.post('/api/v1/users/refresh-token', { refreshToken });
        console.log('API - Token refresh successful');

        // Store the new tokens
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);

        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;

        // Always fetch the latest user data to ensure role consistency
        try {
          console.log('API - Fetching latest user data after token refresh');
          const userResponse = await axios.get('/api/v1/users/get-current-user', {
            headers: {
              Authorization: `Bearer ${response.data.data.accessToken}`
            }
          });

          const userData = userResponse.data.data;

          // Check if we have existing user data to compare
          const existingUserData = localStorage.getItem('user');
          if (existingUserData) {
            try {
              const parsedExistingUser = JSON.parse(existingUserData);

              // If user IDs don't match, we have a serious inconsistency
              if (parsedExistingUser._id !== userData._id) {
                console.error('API - User ID mismatch after token refresh!', {
                  storedUserId: parsedExistingUser._id,
                  serverUserId: userData._id
                });
                clearAuthData();
                throw new Error('User identity mismatch after token refresh');
              }
            } catch (parseError) {
              console.error('API - Error parsing existing user data:', parseError);
            }
          }

          // Update user data in localStorage and sessionStorage
          localStorage.setItem('user', JSON.stringify(userData));
          sessionStorage.setItem('userRole', userData.role);
          sessionStorage.setItem('lastAuthCheck', Date.now().toString());

          console.log('API - User data updated after token refresh:', userData);
        } catch (userError) {
          console.error('API - Failed to fetch user data after token refresh:', userError);
          clearAuthData();
          throw new Error('Failed to verify user identity after token refresh');
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('API - Token refresh failed:', refreshError);
        clearAuthData();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to clear auth data
function clearAuthData() {
  console.log('API - Clearing all auth data');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('admin');
  sessionStorage.removeItem('lastAuthCheck');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('admin');
}

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  googleLogin: (googleData) => api.post('/users/google-login', googleData),
  register: (userData) => api.post('/users/register', userData),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/get-current-user'),
  verifyEmail: (token) => api.get(`/users/verify-email/${token}`),
  resendVerification: (email) => api.post('/users/resend-verification', { email }),
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/users/reset-password', { token, newPassword }),
};

// Profile API functions
export const profileAPI = {
  updateAccountDetails: (data) => api.patch('/users/update-account-details', data),
  changePassword: (data) => api.post('/users/change-password', data),
  updateAvatar: (formData) => api.post('/users/update-user-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateCoverImage: (formData) => api.patch('/users/update-user-cover-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getWatchHistory: () => api.get('/users/watch-history'),
  getUserChannel: (username) => api.get(`/users/channel/${username}`),
};

// Blog API functions
export const blogAPI = {
  // Public endpoints that don't require authentication
  getAllBlogs: (params) => publicApi.get('/blogs', { params }),
  getBlogBySlug: (slug) => publicApi.get(`/blogs/slug/${slug}`),
  getBlogComments: (blogId, params) => publicApi.get(`/comments/blog/${blogId}`, { params }),

  // Protected endpoints that require authentication
  getBlogById: (id) => api.get(`/blogs/${id}`),
  createBlog: (formData) => api.post('/blogs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateBlog: (id, formData) => api.patch(`/blogs/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  getMyBlogs: (params) => api.get('/blogs/my/blogs', { params }),
  getBlogsByAuthor: (userId, params) => api.get(`/blogs/author/${userId}`, { params }),
  addBlogComment: (blogId, data) => api.post(`/comments/blog/${blogId}`, data),

  // Comment operations (require authentication)
  addCommentReply: (commentId, data) => api.post(`/comments/reply/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
};

// Testimonial API functions
export const testimonialAPI = {
  // Use publicApi for fetching approved testimonials (no auth required)
  getApprovedTestimonials: (params) => publicApi.get('/testimonials', { params }),
  // These operations still require authentication
  submitTestimonial: (data) => api.post('/testimonials', data),
  getUserTestimonials: () => api.get('/testimonials/my-testimonials'),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`),
  // Admin functions
  getAllTestimonials: (params) => api.get('/testimonials/all', { params }),
  reviewTestimonial: (id, data) => api.patch(`/testimonials/${id}/review`, data),
};

// Tutor API functions
export const tutorAPI = {
  // Use publicApi for fetching approved tutors (no auth required)
  getApprovedTutors: (params) => publicApi.get('/tutors', { params }),
};

// Gamification API functions
export const gamificationAPI = {
  // User functions
  getUserProfile: () => api.get('/gamification/profile'),
  getUserBadges: () => api.get('/gamification/badges'),
  getUserPointsHistory: (params) => api.get('/gamification/points-history', { params }),
  getUserStreak: () => api.get('/gamification/streak'),
  forceUpdateStreak: () => api.post('/gamification/force-update-streak'),
  getUserChallenges: (params) => api.get('/gamification/challenges', { params }),
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),
  getLeaderboardStreaks: (userIds) => api.post('/gamification/leaderboard-streaks', { userIds }),
  updateDisplayedBadges: (data) => api.patch('/gamification/displayed-badges', data),

  // Admin functions - Badges
  createBadge: (data) => api.post('/gamification/badges', data),
  updateBadge: (badgeId, data) => api.put(`/gamification/badges/${badgeId}`, data),
  deleteBadge: (badgeId) => api.delete(`/gamification/badges/${badgeId}`),
  getAllBadges: () => api.get('/gamification/admin/badges'),

  // Admin functions - Challenges
  createChallenge: (data) => api.post('/gamification/challenges', data),
  updateChallenge: (challengeId, data) => api.put(`/gamification/challenges/${challengeId}`, data),
  deleteChallenge: (challengeId) => api.delete(`/gamification/challenges/${challengeId}`),
  getAllChallenges: (params) => api.get('/gamification/admin/challenges', { params }),

  // Admin functions - User Rewards
  awardBadge: (data) => api.post('/gamification/award-badge', data),
  awardPoints: (data) => api.post('/gamification/award-points', data),

  // Admin functions - Statistics
  getGamificationStats: () => api.get('/gamification/admin/stats'),
};

// Rewards API functions
export const rewardAPI = {
  // Public endpoint that doesn't require authentication
  getAvailableRewards: (params) => publicApi.get('/rewards/available', { params }),
  // Protected endpoints that require authentication
  getRedemptionHistory: () => api.get('/rewards/history'),
  redeemReward: (rewardId) => api.post(`/rewards/redeem/${rewardId}`),
  // Admin functions
  getAllRewards: (params) => api.get('/rewards/admin/all', { params }),
  createReward: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/rewards', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateReward: (rewardId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.patch(`/rewards/${rewardId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  verifyRedemptionCode: (code) => api.get(`/rewards/verify/${code}`),
  markRedemptionUsed: (redemptionId) => api.patch(`/rewards/mark-used/${redemptionId}`)
};

// Export the api instances for other API services
export { publicApi };
export default api;
