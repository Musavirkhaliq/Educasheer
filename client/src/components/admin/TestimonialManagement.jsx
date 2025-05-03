import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaTrash, FaStar } from 'react-icons/fa';
import { testimonialAPI } from '../../services/api';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved'

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialAPI.getAllTestimonials({ status: filter !== 'all' ? filter : '' });
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError('Failed to load testimonials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (testimonialId) => {
    try {
      await testimonialAPI.reviewTestimonial(testimonialId, { isApproved: true });
      setSuccess('Testimonial approved successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      setError('Failed to approve testimonial');
    }
  };

  const handleReject = async (testimonialId) => {
    try {
      await testimonialAPI.reviewTestimonial(testimonialId, { isApproved: false });
      setSuccess('Testimonial rejected successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      setError('Failed to reject testimonial');
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      await testimonialAPI.deleteTestimonial(testimonialId);
      setSuccess('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setError('Failed to delete testimonial');
    }
  };

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Testimonials</h2>

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

      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-[#01427a] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'pending'
                ? 'bg-[#01427a] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'approved'
                ? 'bg-[#01427a] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No testimonials found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Testimonial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <tr key={testimonial._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {testimonial.authorName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">
                      {testimonial.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < testimonial.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        testimonial.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {testimonial.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {!testimonial.isApproved && (
                        <button
                          onClick={() => handleApprove(testimonial._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {testimonial.isApproved && (
                        <button
                          onClick={() => handleReject(testimonial._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Unapprove"
                        >
                          <FaTimes />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(testimonial._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;
