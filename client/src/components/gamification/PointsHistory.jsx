import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const PointsHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    const fetchPointsHistory = async () => {
      try {
        setLoading(true);
        const response = await gamificationAPI.getUserPointsHistory({
          page: pagination.page,
          limit: pagination.limit
        });
        
        setHistory(response.data.data.history);
        setPagination(response.data.data.pagination);
      } catch (err) {
        console.error('Error fetching points history:', err);
        setError('Failed to load your points history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPointsHistory();
  }, [userId, pagination.page, pagination.limit]);

  if (loading && history.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FaStar className="text-gray-400 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Points History Yet</h3>
        <p className="text-gray-500">Complete activities to earn points!</p>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(transaction.category)}`}>
                    {formatCategory(transaction.category)}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                  transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="flex items-center justify-end">
                    {transaction.type === 'earned' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {transaction.amount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-4 py-2 border rounded-md ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.pages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className={`px-4 py-2 border rounded-md ${
              pagination.page === pagination.pages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Helper functions
const formatCategory = (category) => {
  switch (category) {
    case 'course_completion':
      return 'Course';
    case 'video_watch':
      return 'Video';
    case 'quiz':
      return 'Quiz';
    case 'attendance':
      return 'Attendance';
    case 'blog':
      return 'Blog';
    case 'comment':
      return 'Comment';
    case 'social':
      return 'Social';
    default:
      return 'Other';
  }
};

const getCategoryBadgeColor = (category) => {
  switch (category) {
    case 'course_completion':
      return 'bg-blue-100 text-blue-800';
    case 'video_watch':
      return 'bg-red-100 text-red-800';
    case 'quiz':
      return 'bg-green-100 text-green-800';
    case 'attendance':
      return 'bg-yellow-100 text-yellow-800';
    case 'blog':
      return 'bg-purple-100 text-purple-800';
    case 'comment':
      return 'bg-indigo-100 text-indigo-800';
    case 'social':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default PointsHistory;
