import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaReply, FaThumbsUp, FaTrash } from 'react-icons/fa';
import { blogAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BlogCommentSection = ({ blogId }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await blogAPI.getBlogComments(blogId);
        setComments(response.data.data.comments || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchComments();
    }
  }, [blogId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await blogAPI.addBlogComment(blogId, { content: newComment });
      setComments([response.data.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault();

    if (!replyContent.trim()) return;

    setSubmitting(true);

    try {
      // Use the blogAPI service which includes auth token in headers
      const response = await blogAPI.addCommentReply(commentId, { content: replyContent });

      // Update the comments state to include the new reply
      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data.data]
          };
        }
        return comment;
      }));

      setReplyTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      // Use the blogAPI service which includes auth token in headers
      await blogAPI.deleteComment(commentId);

      // Remove the comment from state
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      // Use the blogAPI service which includes auth token in headers
      const response = await blogAPI.likeComment(commentId);

      // Update the comment likes in state
      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, likes: response.data.data.likes };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start mb-4">
            <img
              src={currentUser?.avatar || 'https://via.placeholder.com/40'}
              alt={currentUser?.fullName}
              className="w-10 h-10 rounded-full mr-4 object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] min-h-[100px]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-8 text-center">
          <p className="text-gray-700 mb-2">You need to be logged in to comment</p>
          <Link
            to="/login"
            className="text-[#00bcd4] font-medium hover:underline"
          >
            Log in to join the conversation
          </Link>
        </div>
      )}

      {/* Comments List */}
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-100 pb-6 last:border-0">
              {/* Main Comment */}
              <div className="flex">
                <img
                  src={comment.owner?.avatar || 'https://via.placeholder.com/40'}
                  alt={comment.owner?.fullName}
                  className="w-10 h-10 rounded-full mr-4 object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{comment.owner?.fullName}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Delete button - only for comment owner or admin */}
                      {currentUser && (currentUser._id === comment.owner?._id || currentUser.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete comment"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>

                  {/* Comment Actions */}
                  <div className="flex mt-2 text-sm">
                    {isAuthenticated && (
                      <>
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          className="flex items-center text-gray-500 hover:text-[#00bcd4] mr-4"
                        >
                          <FaThumbsUp className="mr-1" />
                          <span>{comment.likes || 0}</span>
                        </button>
                        <button
                          onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                          className="flex items-center text-gray-500 hover:text-[#00bcd4]"
                        >
                          <FaReply className="mr-1" />
                          Reply
                        </button>
                      </>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment._id && (
                    <form
                      onSubmit={(e) => handleSubmitReply(e, comment._id)}
                      className="mt-4 ml-6"
                    >
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] min-h-[80px]"
                        required
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="text-gray-500 px-4 py-2 mr-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !replyContent.trim()}
                          className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-6 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex">
                          <img
                            src={reply.owner?.avatar || 'https://via.placeholder.com/30'}
                            alt={reply.owner?.fullName}
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h5 className="font-medium text-gray-800 text-sm">{reply.owner?.fullName}</h5>
                                  <p className="text-xs text-gray-500">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </p>
                                </div>

                                {/* Delete button - only for reply owner or admin */}
                                {currentUser && (currentUser._id === reply.owner?._id || currentUser.role === 'admin') && (
                                  <button
                                    onClick={() => handleDeleteComment(reply._id)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                    title="Delete reply"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm">{reply.content}</p>
                            </div>

                            {/* Reply Actions */}
                            {isAuthenticated && (
                              <div className="flex mt-1 text-xs">
                                <button
                                  onClick={() => handleLikeComment(reply._id)}
                                  className="flex items-center text-gray-500 hover:text-[#00bcd4]"
                                >
                                  <FaThumbsUp className="mr-1" />
                                  <span>{reply.likes || 0}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogCommentSection;
