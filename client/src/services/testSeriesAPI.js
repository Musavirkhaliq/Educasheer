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
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `/api/public/test-series?${queryString}` : '/api/public/test-series';

      // Use direct axios call instead of customFetch for public endpoints
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch test series');
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching published test series:', error);
      return { data: { data: [] } };
    }
  },

  // Get enrolled test series for authenticated user
  getEnrolledTestSeries: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/test-series/enrolled?${queryString}` : '/test-series/enrolled';
    
    return await customFetch.get(url);
  },

  // Get test series by ID (authenticated users)
  getTestSeriesById: async (testSeriesId) => {
    return await customFetch.get(`/test-series/${testSeriesId}`);
  },

  // Get test series by ID (public - for logged out users)
  getPublicTestSeriesById: async (testSeriesId) => {
    try {
      const response = await fetch(`/api/public/test-series/${testSeriesId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch test series');
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching public test series:', error);
      throw error;
    }
  },

  // Get test series by course ID
  getTestSeriesByCourse: async (courseId) => {
    return await customFetch.get(`/test-series?course=${courseId}`);
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
  },

  // Section management
  addSection: async (testSeriesId, sectionData) => {
    return await customFetch.post(`/test-series/${testSeriesId}/sections`, sectionData);
  },

  updateSection: async (testSeriesId, sectionId, sectionData) => {
    return await customFetch.put(`/test-series/${testSeriesId}/sections/${sectionId}`, sectionData);
  },

  deleteSection: async (testSeriesId, sectionId) => {
    return await customFetch.delete(`/test-series/${testSeriesId}/sections/${sectionId}`);
  },

  addQuizToSection: async (testSeriesId, sectionId, quizId) => {
    return await customFetch.post(`/test-series/${testSeriesId}/sections/${sectionId}/quizzes/${quizId}`);
  },

  removeQuizFromSection: async (testSeriesId, sectionId, quizId) => {
    return await customFetch.delete(`/test-series/${testSeriesId}/sections/${sectionId}/quizzes/${quizId}`);
  },

  reorderSections: async (testSeriesId, sectionOrders) => {
    return await customFetch.put(`/test-series/${testSeriesId}/sections/reorder`, { sectionOrders });
  }
};
