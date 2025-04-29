import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CommentForm = ({ onSubmit, placeholder = "Add a comment...", buttonText = "Comment", initialValue = "", isReply = false }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(content);
      setContent(''); // Clear the form after successful submission
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex ${isReply ? 'mt-2' : 'mb-8'}`}>
      {currentUser?.avatar && (
        <img 
          src={currentUser.avatar} 
          alt={currentUser.fullName} 
          className={`rounded-full ${isReply ? 'w-8 h-8' : 'w-10 h-10'} mr-3 object-cover`}
        />
      )}
      
      <form onSubmit={handleSubmit} className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReply ? 'text-sm min-h-[60px]' : 'min-h-[80px]'}`}
          disabled={isSubmitting}
        />
        
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`px-4 py-2 rounded-lg ${
              !content.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors duration-200`}
          >
            {isSubmitting ? 'Submitting...' : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
