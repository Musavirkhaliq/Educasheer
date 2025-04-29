import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('/api/v1/users/refresh-token', { refreshToken });

        // Store the new tokens
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);

        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/get-current-user'),
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
  getAllBlogs: (params) => api.get('/blogs', { params }),
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
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
  getBlogComments: (blogId, params) => api.get(`/comments/blog/${blogId}`, { params }),
  addBlogComment: (blogId, data) => api.post(`/comments/blog/${blogId}`, data),
};

// Export the api instance for other API services
export default api;
