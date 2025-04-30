import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDiscussionMessages,
  createDiscussionMessage,
  toggleLikeMessage,
  deleteDiscussionMessage
} from '../services/discussionService';
import { FaHeart, FaRegHeart, FaReply, FaTrash, FaUserCircle, FaBold, FaItalic, FaLink, FaCode } from 'react-icons/fa';

const DiscussionForum = ({ courseId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isFormatting, setIsFormatting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messageInputRef = useRef(null);
  const replyInputRef = useRef(null);

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    fetchMessages();

    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefresh > refreshInterval) {
        fetchMessages(false); // Silent refresh (no loading indicator)
        setLastRefresh(Date.now());
      }
    }, 10000); // Check every 10 seconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [courseId, lastRefresh, refreshInterval]);

  const fetchMessages = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await getDiscussionMessages(courseId);
      setMessages(data);
      setError('');
    } catch (err) {
      if (showLoading) {
        setError('Failed to load discussion messages. Please try again.');
      }
      console.error('Error fetching messages:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Text formatting functions
  const insertFormatting = (format, inputRef) => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          formattedText = `[${selectedText || 'link'}](${url})`;
        } else {
          return;
        }
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      default:
        return;
    }

    const newValue = input.value.substring(0, start) + formattedText + input.value.substring(end);

    if (inputRef === messageInputRef) {
      setNewMessage(newValue);
    } else if (inputRef === replyInputRef) {
      setReplyText(newValue);
    }

    // Focus back on the input after formatting
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      await createDiscussionMessage(courseId, newMessage);
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to post message. Please try again.');
      console.error('Error posting message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setIsSending(true);
      await createDiscussionMessage(courseId, replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to post reply. Please try again.');
      console.error('Error posting reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Function to render markdown-like formatting in messages
  const renderFormattedText = (text) => {
    if (!text) return '';

    // Replace markdown-style formatting with HTML
    let formattedText = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#00bcd4] hover:underline">$1</a>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-red-600">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return formattedText;
  };

  const handleLikeMessage = async (messageId) => {
    try {
      await toggleLikeMessage(messageId);
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to like/unlike message. Please try again.');
      console.error('Error liking message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteDiscussionMessage(messageId);
      fetchMessages(); // Refresh messages
    } catch (err) {
      setError('Failed to delete message. Please try again.');
      console.error('Error deleting message:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canDeleteMessage = (message) => {
    if (!currentUser) return false;

    // User can delete their own messages
    if (message.user._id === currentUser._id) return true;

    // Admins and course creators can delete any message
    return currentUser.role === 'admin' || currentUser.role === 'tutor';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00bcd4]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
          Class Discussion
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 border-b border-red-100">
          <p>{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-2 text-sm bg-red-100 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="p-4">
        {/* New message form */}
        <form onSubmit={handleSubmitMessage} className="mb-8">
          <div className="relative">
            <textarea
              ref={messageInputRef}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
              placeholder="Write a message to the class..."
              rows="3"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            ></textarea>

            {/* Formatting toolbar */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting('bold', messageInputRef)}
                className="p-1.5 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                title="Bold"
              >
                <FaBold size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('italic', messageInputRef)}
                className="p-1.5 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                title="Italic"
              >
                <FaItalic size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('link', messageInputRef)}
                className="p-1.5 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                title="Link"
              >
                <FaLink size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('code', messageInputRef)}
                className="p-1.5 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                title="Code"
              >
                <FaCode size={14} />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              Supports formatting: **bold**, *italic*, [link](url), `code`
            </div>
            <button
              type="submit"
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors flex items-center gap-2"
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : (
                'Post Message'
              )}
            </button>
          </div>
        </form>

        {/* Messages list */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message._id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                {/* Message header */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {message.user.avatar ? (
                      <img
                        src={message.user.avatar}
                        alt={message.user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        <FaUserCircle className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{message.user.fullName}</h4>
                      <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                      {message.isInstructor && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Instructor</span>
                      )}
                    </div>
                    <p
                      className="text-gray-700 mt-2"
                      dangerouslySetInnerHTML={{ __html: renderFormattedText(message.message) }}
                    ></p>

                    {/* Message actions */}
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => handleLikeMessage(message._id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#00bcd4] transition-colors"
                      >
                        {message.likes?.includes(currentUser?._id) ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart />
                        )}
                        <span>{message.likes?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => setReplyingTo(replyingTo === message._id ? null : message._id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#00bcd4] transition-colors"
                      >
                        <FaReply />
                        <span>Reply</span>
                      </button>

                      {canDeleteMessage(message) && (
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>

                    {/* Reply form */}
                    {replyingTo === message._id && (
                      <form
                        onSubmit={(e) => handleSubmitReply(e, message._id)}
                        className="mt-4 pl-4 border-l-2 border-gray-200"
                      >
                        <div className="relative">
                          <textarea
                            ref={replyInputRef}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                            placeholder={`Reply to ${message.user.fullName}...`}
                            rows="2"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            required
                          ></textarea>

                          {/* Formatting toolbar for reply */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => insertFormatting('bold', replyInputRef)}
                              className="p-1 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                              title="Bold"
                            >
                              <FaBold size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('italic', replyInputRef)}
                              className="p-1 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                              title="Italic"
                            >
                              <FaItalic size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('link', replyInputRef)}
                              className="p-1 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                              title="Link"
                            >
                              <FaLink size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('code', replyInputRef)}
                              className="p-1 text-gray-500 hover:text-[#00bcd4] hover:bg-gray-100 rounded-md transition-colors"
                              title="Code"
                            >
                              <FaCode size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-gray-500">
                            Supports formatting
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 text-sm text-white bg-[#00bcd4] rounded-lg hover:bg-[#01427a] transition-colors flex items-center gap-1"
                              disabled={!replyText.trim() || isSending}
                            >
                              {isSending ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                  Sending...
                                </>
                              ) : (
                                'Reply'
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {message.replies && message.replies.length > 0 && (
                  <div className="mt-4 pl-12 space-y-4">
                    {message.replies.map((reply) => (
                      <div key={reply._id} className="border-l-2 border-gray-200 pl-4 py-2">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {reply.user.avatar ? (
                              <img
                                src={reply.user.avatar}
                                alt={reply.user.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                                <FaUserCircle className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-800 text-sm">{reply.user.fullName}</h5>
                              <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                              {reply.isInstructor && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Instructor</span>
                              )}
                            </div>
                            <p
                              className="text-gray-700 text-sm mt-1"
                              dangerouslySetInnerHTML={{ __html: renderFormattedText(reply.message) }}
                            ></p>

                            {/* Reply actions */}
                            <div className="mt-2 flex items-center gap-3">
                              <button
                                onClick={() => handleLikeMessage(reply._id)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#00bcd4] transition-colors"
                              >
                                {reply.likes?.includes(currentUser?._id) ? (
                                  <FaHeart className="text-red-500" />
                                ) : (
                                  <FaRegHeart />
                                )}
                                <span>{reply.likes?.length || 0}</span>
                              </button>

                              {canDeleteMessage(reply) && (
                                <button
                                  onClick={() => handleDeleteMessage(reply._id)}
                                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <FaTrash />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
