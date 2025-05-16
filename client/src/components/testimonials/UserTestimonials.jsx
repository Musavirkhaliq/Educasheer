import React, { useState, useEffect } from 'react';
import { FaStar, FaClock } from 'react-icons/fa';
import { testimonialAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UserTestimonials = () => {
  const { currentUser } = useAuth();
  const [userTestimonials, setUserTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserTestimonials = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await testimonialAPI.getUserTestimonials();
        console.log('User testimonials response:', response);
        // Handle both possible response formats
        const testimonials = Array.isArray(response.data)
          ? response.data
          : (response.data.testimonials || []);
        setUserTestimonials(testimonials);
      } catch (error) {
        console.error('Error fetching user testimonials:', error);
        setError('Failed to load your testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTestimonials();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  if (userTestimonials.length === 0) {
    return null; // Don't show anything if no testimonials
  }

  // Filter to only show pending testimonials
  const pendingTestimonials = userTestimonials.filter(testimonial => !testimonial.isApproved);

  if (pendingTestimonials.length === 0) {
    return null; // Don't show anything if no pending testimonials
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
        <FaClock className="mr-2" />
        Your Pending Testimonials
      </h3>

      <p className="text-yellow-700 mb-4">
        The following testimonials are awaiting admin approval before they appear on the site:
      </p>

      <div className="space-y-4">
        {pendingTestimonials.map((testimonial) => (
          <div key={testimonial._id} className="bg-white rounded p-4 shadow-sm">
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`${
                    i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-700 italic">"{testimonial.content}"</p>
            <p className="text-sm text-gray-500 mt-2">
              Submitted on {new Date(testimonial.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTestimonials;
