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

// Course API functions
export const courseAPI = {
  // Get all courses (public)
  getAllCourses: async (params) => {
    try {
      const response = await api.get('/courses', { params });
      // Handle different response structures
      if (response.data.data && Array.isArray(response.data.data.courses)) {
        return { data: { data: response.data.data.courses } };
      }
      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  getCourseById: (courseId) => api.get(`/courses/${courseId}`),

  // Create a new course
  createCourse: (formData) => api.post('/courses', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Update a course
  updateCourse: (courseId, formData) => api.patch(`/courses/${courseId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Delete a course
  deleteCourse: (courseId) => api.delete(`/courses/${courseId}`),

  // Get courses created by a specific user
  getCoursesByCreator: (userId, params) => api.get(`/courses/creator/${userId}`, { params }),

  // Get courses created by the current user
  getMyCourses: (params) => api.get('/courses/my/courses', { params }),

  // Enroll in a course
  enrollInCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),

  // Get courses the current user is enrolled in
  getEnrolledCourses: (params) => api.get('/courses/my/enrolled', { params }),

  // Course materials
  getCourseMaterials: (courseId) => api.get(`/courses/${courseId}/materials`),

  uploadCourseMaterial: (courseId, formData, onProgress) => api.post(
    `/courses/${courseId}/materials`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    }
  ),

  deleteCourseMaterial: (materialId) => api.delete(`/materials/${materialId}`),

  // Course discussions
  getDiscussionMessages: (courseId) => api.get(`/courses/${courseId}/discussion`),

  createDiscussionMessage: (courseId, data) => api.post(`/courses/${courseId}/discussion`, data),

  toggleLikeMessage: (messageId) => api.patch(`/discussion/${messageId}/like`),

  deleteDiscussionMessage: (messageId) => api.delete(`/discussion/${messageId}`)
};

export default courseAPI;
