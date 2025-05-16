import axios from 'axios';

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
  toggleQuizPublishStatus: (quizId, isPublished) =>
    api.patch(`/quizzes/${quizId}/publish`, { isPublished }),

  // Get quizzes for a course
  getCourseQuizzes: (courseId) => api.get(`/quizzes/course/${courseId}`),

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
};

export default quizAPI;
