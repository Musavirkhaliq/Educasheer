import customFetch from '../utils/customFetch';

export const testSeriesAPI = {
  // Get all test series (admin)
  getAllTestSeries: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/test-series?${queryString}` : '/test-series';
    
    return await customFetch.get(url);
  },

  // Get published test series (public)
  getPublishedTestSeries: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `../public/test-series?${queryString}` : '../public/test-series';

    return await customFetch.get(url);
  },

  // Get test series by ID
  getTestSeriesById: async (testSeriesId) => {
    return await customFetch.get(`/test-series/${testSeriesId}`);
  },

  // Create new test series
  createTestSeries: async (testSeriesData) => {
    return await customFetch.post('/test-series', testSeriesData);
  },

  // Update test series
  updateTestSeries: async (testSeriesId, testSeriesData) => {
    return await customFetch.put(`/test-series/${testSeriesId}`, testSeriesData);
  },

  // Delete test series
  deleteTestSeries: async (testSeriesId) => {
    return await customFetch.delete(`/test-series/${testSeriesId}`);
  },

  // Toggle publish status
  togglePublishStatus: async (testSeriesId, isPublished) => {
    return await customFetch.patch(`/test-series/${testSeriesId}/publish`, { isPublished });
  },

  // Add quiz to test series
  addQuizToTestSeries: async (testSeriesId, quizId) => {
    return await customFetch.post(`/test-series/${testSeriesId}/quizzes/${quizId}`);
  },

  // Remove quiz from test series
  removeQuizFromTestSeries: async (testSeriesId, quizId) => {
    return await customFetch.delete(`/test-series/${testSeriesId}/quizzes/${quizId}`);
  },

  // Enroll in test series
  enrollInTestSeries: async (testSeriesId) => {
    return await customFetch.post(`/test-series/${testSeriesId}/enroll`);
  }
};
