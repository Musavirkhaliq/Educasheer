import customFetch from '../utils/customFetch';

const API_BASE_URL = '/api/v1/categories';

// Category API functions
export const categoryAPI = {
  // Public endpoints
  getAllCategories: async (includeInactive = false) => {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');
    
    const response = await customFetch(`${API_BASE_URL}?${params}`);
    return response;
  },

  getCategoryBySlug: async (slug) => {
    const response = await customFetch(`${API_BASE_URL}/slug/${slug}`);
    return response;
  },

  getCategoryById: async (categoryId) => {
    const response = await customFetch(`${API_BASE_URL}/${categoryId}`);
    return response;
  },

  // Admin endpoints
  createCategory: async (categoryData) => {
    const response = await customFetch.post(API_BASE_URL, categoryData);
    return response;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await customFetch.put(`${API_BASE_URL}/${categoryId}`, categoryData);
    return response;
  },

  deleteCategory: async (categoryId) => {
    const response = await customFetch.delete(`${API_BASE_URL}/${categoryId}`);
    return response;
  },

  toggleCategoryStatus: async (categoryId) => {
    const response = await customFetch.patch(`${API_BASE_URL}/${categoryId}/toggle-status`);
    return response;
  }
};

export default categoryAPI;
