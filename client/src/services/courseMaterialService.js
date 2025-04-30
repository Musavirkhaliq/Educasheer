import axios from 'axios';

// Get all materials for a course
export const getCourseMaterials = async (courseId) => {
  try {
    const response = await axios.get(`/api/v1/courses/${courseId}/materials`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching course materials:', error);
    throw error;
  }
};

// Upload a new material
export const uploadCourseMaterial = async (courseId, formData, onProgress) => {
  try {
    const response = await axios.post(
      `/api/v1/courses/${courseId}/materials`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error uploading course material:', error);
    throw error;
  }
};

// Delete a material
export const deleteCourseMaterial = async (materialId) => {
  try {
    const response = await axios.delete(`/api/v1/materials/${materialId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting course material:', error);
    throw error;
  }
};
