import axios from 'axios';
import { publicApi } from './api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// Add request interceptor to include auth token
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

// Quiz API functions
export const quizAPI = {
  // Public: Get published quizzes for students
  getPublishedQuizzes: async (params) => {
    try {
      // Use the correct public endpoint
      const response = await axios.get('/api/public/quizzes', { params });
      return response;
    } catch (error) {
      console.error('Error fetching published quizzes:', error);
      if (error.response && error.response.status === 404) {
        return { data: { data: { quizzes: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } } } };
      }
      throw error;
    }
  },

  // Public: Get quiz categories with counts
  getQuizCategories: async (params) => {
    try {
      // Use the correct public endpoint
      const response = await axios.get('/api/public/quiz-categories', { params });
      return response;
    } catch (error) {
      console.error('Error fetching quiz categories:', error);
      if (error.response && error.response.status === 404) {
        return { data: { data: [] } };
      }
      throw error;
    }
  },

  // Public: Get quiz tags with counts
  getQuizTags: async (params) => {
    try {
      const response = await axios.get('/api/public/quiz-tags', { params });
      return response;
    } catch (error) {
      console.error('Error fetching quiz tags:', error);
      if (error.response && error.response.status === 404) {
        return { data: { data: [] } };
      }
      throw error;
    }
  },

  // Admin: Create a quiz
  createQuiz: (data) => api.post('/quizzes', data),

  // Admin: Get all quizzes
  getAllQuizzes: async (params) => {
    try {
      const response = await api.get('/quizzes', { params });
      // If no quizzes exist yet, return an empty array
      if (!response.data.data) {
        return { data: { data: [] } };
      }
      return response;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // If the endpoint doesn't exist yet (404), return empty array
      if (error.response && error.response.status === 404) {
        return { data: { data: [] } };
      }
      throw error;
    }
  },

  // Get quiz by ID
  getQuizById: (quizId) => api.get(`/quizzes/${quizId}`),

  // Admin: Update quiz
  updateQuiz: (quizId, data) => api.put(`/quizzes/${quizId}`, data),

  // Admin: Delete quiz
  deleteQuiz: (quizId) => api.delete(`/quizzes/${quizId}`),

  // Admin: Publish/unpublish quiz
  toggleQuizPublishStatus: async (quizId, isPublished) => {
    try {
      console.log(`API call: Toggling quiz ${quizId} publish status to ${isPublished}`);
      const response = await api.patch(`/quizzes/${quizId}/publish`, { isPublished });
      console.log('API response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error toggling publish status for quiz ${quizId}:`, error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  // Get quizzes for a course
  getCourseQuizzes: async (courseId) => {
    try {
      console.log(`API call: Getting quizzes for course ${courseId}`);
      const response = await api.get(`/quizzes/course/${courseId}`);
      console.log('API response:', response);
      return response;
    } catch (error) {
      console.error(`Error getting quizzes for course ${courseId}:`, error);
      // If the endpoint returns an error, return an empty array
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      // Re-throw the error to be handled by the component
      throw error;
    }
  },

  // Start a quiz attempt
  startQuizAttempt: (quizId) => api.post(`/quizzes/${quizId}/attempts`),

  // Submit a quiz attempt
  submitQuizAttempt: (attemptId, data) =>
    api.post(`/quizzes/attempts/${attemptId}/submit`, data),

  // Get quiz attempt by ID
  getQuizAttempt: (attemptId) => api.get(`/quizzes/attempts/${attemptId}`),

  // Admin: Get all attempts for a quiz
  getQuizAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts`),

  // Get user's attempts for a quiz
  getUserQuizAttempts: (quizId) => api.get(`/quizzes/${quizId}/my-attempts`),

  // Get quiz leaderboard (top 10 performers)
  getQuizLeaderboard: (quizId) => api.get(`/quizzes/${quizId}/leaderboard`),

  // Admin: Get all quiz attempts across all quizzes
  getAllQuizAttempts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/quizzes/attempts/all${queryString ? `?${queryString}` : ''}`);
  },

  // Get current user's all quiz attempts across all quizzes
  getUserAllQuizAttempts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/quizzes/my-attempts/all${queryString ? `?${queryString}` : ''}`);
  },
};

export default quizAPI;
