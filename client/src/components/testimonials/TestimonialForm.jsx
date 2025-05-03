import React, { useState } from 'react';
import { FaStar, FaPaperPlane } from 'react-icons/fa';
import { testimonialAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TestimonialForm = ({ onSuccess }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please share your experience');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await testimonialAPI.submitTestimonial({ content, rating });
      setSuccess('Thank you for your testimonial! It will be reviewed and published soon.');
      setContent('');
      setRating(5);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setError(error.response?.data?.message || 'Failed to submit testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">Please <a href="/login" className="text-[#00bcd4] hover:underline">log in</a> to share your testimonial.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4">Share Your Experience</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="rating" className="block text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="text-2xl focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <FaStar 
                  className={`${
                    (hoveredRating || rating) >= star 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 mb-2">
            Your Testimonial
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience with EduCasheer..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            rows="4"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Submit Testimonial
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestimonialForm;
