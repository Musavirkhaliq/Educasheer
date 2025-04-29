import React, { useState } from 'react';
import { FaReply, FaTrash, FaThumbsUp, FaEllipsisV } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, onAddReply, onDeleteComment, onDeleteReply, onLikeComment }) => {
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const isOwner = currentUser && comment.owner._id === currentUser._id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canDelete = isOwner || isAdmin;
  
  const handleReply = async (content) => {
    await onAddReply(comment._id, content);
    setShowReplyForm(false);
    setShowReplies(true); // Show replies after adding a new one
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleDelete = () => {
    onDeleteComment(comment._id);
  };

  const handleLike = () => {
    onLikeComment(comment._id);
  };

  return (
    <div className="comment-item">
      <div className="flex">
        <img 
          src={comment.owner.avatar} 
          alt={comment.owner.fullName} 
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        
        <div className="flex-1">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{comment.owner.fullName}</h4>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {canDelete && (
                <div className="relative">
                  <button 
                    onClick={toggleOptions}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <FaEllipsisV size={14} />
                  </button>
                  
                  {showOptions && (
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                      <button
                        onClick={handleDelete}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FaTrash className="mr-2" size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <p className="mt-1 text-gray-800">{comment.content}</p>
          </div>
          
          <div className="flex items-center mt-2 space-x-4 text-sm">
            <button 
              onClick={handleLike}
              className="flex items-center text-gray-500 hover:text-blue-600"
            >
              <FaThumbsUp className="mr-1" size={12} />
              <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
            </button>
            
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center text-gray-500 hover:text-blue-600"
            >
              <FaReply className="mr-1" size={12} />
              <span>Reply</span>
            </button>
            
            {comment.replies && comment.replies.length > 0 && (
              <button 
                onClick={toggleReplies}
                className="text-gray-500 hover:text-blue-600"
              >
                {showReplies ? 'Hide replies' : `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>
          
          {showReplyForm && currentUser && (
            <div className="mt-3 ml-6">
              <CommentForm 
                onSubmit={handleReply} 
                placeholder="Write a reply..." 
                buttonText="Reply"
                isReply={true}
              />
            </div>
          )}
          
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-6 space-y-3">
              {comment.replies.map(reply => (
                <ReplyItem 
                  key={reply._id} 
                  reply={reply} 
                  parentCommentId={comment._id}
                  onDeleteReply={onDeleteReply}
                  onLikeComment={onLikeComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReplyItem = ({ reply, parentCommentId, onDeleteReply, onLikeComment }) => {
  const { currentUser } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  
  const isOwner = currentUser && reply.owner._id === currentUser._id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canDelete = isOwner || isAdmin;
  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  const handleDelete = () => {
    onDeleteReply(parentCommentId, reply._id);
  };
  
  const handleLike = () => {
    onLikeComment(reply._id);
  };
  
  return (
    <div className="flex">
      <img 
        src={reply.owner.avatar} 
        alt={reply.owner.fullName} 
        className="w-8 h-8 rounded-full mr-2 object-cover"
      />
      
      <div className="flex-1">
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{reply.owner.fullName}</h4>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {canDelete && (
              <div className="relative">
                <button 
                  onClick={toggleOptions}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <FaEllipsisV size={12} />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FaTrash className="mr-2" size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="mt-1 text-sm text-gray-800">{reply.content}</p>
        </div>
        
        <div className="flex items-center mt-1 space-x-4 text-xs">
          <button 
            onClick={handleLike}
            className="flex items-center text-gray-500 hover:text-blue-600"
          >
            <FaThumbsUp className="mr-1" size={10} />
            <span>{reply.likes > 0 ? reply.likes : 'Like'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
