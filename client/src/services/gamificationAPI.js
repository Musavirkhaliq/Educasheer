import { api } from './api';

export const gamificationAPI = {
  // Get user gamification profile
  getUserProfile: () => api.get('/gamification/profile'),

  // Get user badges
  getUserBadges: () => api.get('/gamification/badges'),

  // Get user points history
  getUserPointsHistory: (params) => api.get('/gamification/points-history', { params }),

  // Get user streak
  getUserStreak: () => api.get('/gamification/streak'),

  // Force update user streak
  forceUpdateStreak: () => api.post('/gamification/force-update-streak'),

  // Get user challenges
  getUserChallenges: (params) => api.get('/gamification/challenges', { params }),

  // Get leaderboard
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),

  // Get streaks for leaderboard users
  getLeaderboardStreaks: (userIds) => api.post('/gamification/leaderboard-streaks', { userIds }),

  // Update displayed badges
  updateDisplayedBadges: (data) => api.patch('/gamification/displayed-badges', data),

  // Admin: Create a badge
  createBadge: (data) => api.post('/gamification/badges', data),

  // Admin: Create a challenge
  createChallenge: (data) => api.post('/gamification/challenges', data),

  // Admin: Award badge to user
  awardBadge: (data) => api.post('/gamification/award-badge', data),

  // Admin: Award points to user
  awardPoints: (data) => api.post('/gamification/award-points', data),

  // Admin: Get all badges
  getAllBadges: () => api.get('/gamification/admin/badges'),

  // Admin: Get all challenges
  getAllChallenges: (params) => api.get('/gamification/admin/challenges', { params })
};
