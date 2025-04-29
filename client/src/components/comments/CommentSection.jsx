import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const CommentSection = ({ videoId, courseId, type }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [videoId, courseId, currentPage]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'video' 
        ? `/api/v1/comments/video/${videoId}?page=${currentPage}` 
        : `/api/v1/comments/course/${courseId}?page=${currentPage}`;
      
      const response = await axios.get(endpoint);
      
      setComments(response.data.data.comments);
      setTotalComments(response.data.data.totalComments);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content) => {
    try {
      const endpoint = type === 'video' 
        ? `/api/v1/comments/video/${videoId}` 
        : `/api/v1/comments/course/${courseId}`;
      
      const response = await axios.post(endpoint, 
        { content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Add the new comment to the top of the list
      setComments([response.data.data, ...comments]);
      setTotalComments(totalComments + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleAddReply = async (commentId, content) => {
    try {
      const response = await axios.post(
        `/api/v1/comments/reply/${commentId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Update the comments list with the new reply
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data.data]
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
    } catch (error) {
      console.error('Error adding reply:', error);
      setError('Failed to add reply. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      await axios.delete(
        `/api/v1/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Remove the comment from the list
      const updatedComments = comments.filter(comment => comment._id !== commentId);
      setComments(updatedComments);
      setTotalComments(totalComments - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }
    
    try {
      await axios.delete(
        `/api/v1/comments/${replyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Remove the reply from the comment
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply._id !== replyId)
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
    } catch (error) {
      console.error('Error deleting reply:', error);
      setError('Failed to delete reply. Please try again.');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(
        `/api/v1/comments/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Update the comment's like count
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            likes: response.data.data.likes
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
    } catch (error) {
      console.error('Error liking comment:', error);
      setError('Failed to like comment. Please try again.');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6">Comments ({totalComments})</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isAuthenticated ? (
        <CommentForm onSubmit={handleAddComment} />
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
          <p>Please <a href="/login" className="text-blue-600 hover:underline">log in</a> to leave a comment.</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <CommentList 
            comments={comments} 
            onAddReply={handleAddReply}
            onDeleteComment={handleDeleteComment}
            onDeleteReply={handleDeleteReply}
            onLikeComment={handleLikeComment}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages).keys()].map(page => (
                  <button
                    key={page + 1}
                    onClick={() => handlePageChange(page + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;
