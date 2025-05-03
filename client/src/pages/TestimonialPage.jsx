import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TestimonialForm from '../components/testimonials/TestimonialForm';
import Testimonials from '../components/homeComponents/Testimonials';

const TestimonialPage = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/testimonials/add" />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Share Your Experience</h1>
          <p className="text-gray-600">
            We value your feedback! Share your experience with EduCasheer to help others in their educational journey.
          </p>
        </div>

        <div className="mb-12">
          <TestimonialForm onSuccess={() => window.scrollTo(0, 0)} />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What Others Are Saying</h2>
          <Testimonials showAddButton={false} />
        </div>
      </div>
    </div>
  );
};

export default TestimonialPage;
