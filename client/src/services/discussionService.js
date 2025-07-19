import axios from 'axios';

// Get all discussion messages for a course
export const getDiscussionMessages = async (courseId) => {
  try {
    const response = await axios.get(`/api/v1/discussions/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching discussion messages:', error);
    throw error;
  }
};

// Create a new discussion message
export const createDiscussionMessage = async (courseId, message, parentId = null) => {
  try {
    const response = await axios.post(
      `/api/v1/discussions/courses/${courseId}`,
      { message, parentId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating discussion message:', error);
    throw error;
  }
};

// Toggle like on a message
export const toggleLikeMessage = async (messageId) => {
  try {
    const response = await axios.patch(
      `/api/v1/discussions/${messageId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error toggling like on message:', error);
    throw error;
  }
};

// Delete a discussion message
export const deleteDiscussionMessage = async (messageId) => {
  try {
    const response = await axios.delete(`/api/v1/discussions/${messageId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting discussion message:', error);
    throw error;
  }
};
