import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaHeart, FaRegHeart, FaReply, FaTrash, FaUserCircle } from 'react-icons/fa';

const OfflineCourseDiscussion = ({ courseId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, [courseId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/discussions/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setMessages(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load discussion messages. Please try again.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`/api/v1/discussions/courses/${courseId}`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to post message. Please try again.');
      console.error('Error posting message:', err);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await axios.post(`/api/v1/courses/${courseId}/discussion`, 
        { 
          message: replyText,
          parentId 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setReplyText('');
      setReplyingTo(null);
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to post reply. Please try again.');
      console.error('Error posting reply:', err);
    }
  };

  const handleLikeMessage = async (messageId) => {
    try {
      await axios.patch(`/api/v1/discussion/${messageId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to like message. Please try again.');
      console.error('Error liking message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await axios.delete(`/api/v1/discussion/${messageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to delete message. Please try again.');
      console.error('Error deleting message:', err);
    }
  };

  const isLikedByUser = (likes) => {
    return likes?.includes(currentUser?._id);
  };

  const canDeleteMessage = (message) => {
    return currentUser && (
      message.user._id === currentUser._id || 
      currentUser.role === 'admin'
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* New message form */}
      <div className="p-4 border-b border-gray-100">
        <form onSubmit={handleSubmitMessage} className="space-y-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message to the class..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            rows="3"
            required
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors"
            >
              Post Message
            </button>
          </div>
        </form>
      </div>

      {/* Messages list */}
      <div className="divide-y divide-gray-100">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No messages yet. Be the first to start a discussion!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="p-4">
              {/* Main message */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {message.user.avatar ? (
                    <img
                      src={message.user.avatar}
                      alt={message.user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUserCircle className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800">{message.user.fullName}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                    {message.isInstructor && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        Instructor
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{message.message}</p>
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => handleLikeMessage(message._id)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      {isLikedByUser(message.likes) ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                      {message.likes?.length || 0}
                    </button>
                    <button
                      onClick={() => setReplyingTo(message._id)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <FaReply />
                      Reply
                    </button>
                    {canDeleteMessage(message) && (
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply form */}
                  {replyingTo === message._id && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                      <form onSubmit={(e) => handleSubmitReply(e, message._id)} className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                          rows="2"
                          required
                        ></textarea>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-[#00bcd4] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#01427a] transition-colors"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="bg-gray-200 text-gray-700 px-3 py-1 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Replies */}
                  {message.replies && message.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                      {message.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-2">
                          <div className="flex-shrink-0">
                            {reply.user.avatar ? (
                              <img
                                src={reply.user.avatar}
                                alt={reply.user.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUserCircle className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-800 text-sm">{reply.user.fullName}</h5>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                              {reply.isInstructor && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                  Instructor
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">{reply.message}</p>
                            <div className="mt-1 flex gap-2">
                              <button
                                onClick={() => handleLikeMessage(reply._id)}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                              >
                                {isLikedByUser(reply.likes) ? (
                                  <FaHeart className="text-red-500" />
                                ) : (
                                  <FaRegHeart />
                                )}
                                {reply.likes?.length || 0}
                              </button>
                              {canDeleteMessage(reply) && (
                                <button
                                  onClick={() => handleDeleteMessage(reply._id)}
                                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                  <FaTrash />
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OfflineCourseDiscussion;
