import React, { useState, useEffect } from 'react';
import { rewardAPI } from '../../services/api';
import { FaGift, FaCheck, FaClock, FaExclamationCircle } from 'react-icons/fa';

const RedemptionHistory = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRedemption, setSelectedRedemption] = useState(null);

  useEffect(() => {
    fetchRedemptionHistory();
  }, []);

  const fetchRedemptionHistory = async () => {
    try {
      setLoading(true);
      const response = await rewardAPI.getRedemptionHistory();
      setRedemptions(response.data.data);
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      setError('Failed to load your redemption history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (redemptions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FaExclamationCircle className="text-gray-400 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Redemption History</h3>
        <p className="text-gray-500">You haven't redeemed any rewards yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points Spent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {redemptions.map((redemption) => (
              <tr 
                key={redemption._id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedRedemption(redemption)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {redemption.reward.image ? (
                        <img 
                          src={redemption.reward.image} 
                          alt={redemption.reward.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/40?text=R";
                          }}
                        />
                      ) : (
                        <FaGift className="text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {redemption.reward.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCategory(redemption.reward.category)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(redemption.redeemedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {redemption.pointsSpent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(redemption)}`}>
                    {redemption.isUsed ? 'Used' : isExpired(redemption.expiresAt) ? 'Expired' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {redemption.redemptionCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Redemption Details Modal */}
      {selectedRedemption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] p-6 text-white">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{selectedRedemption.reward.name}</h2>
                <button
                  onClick={() => setSelectedRedemption(null)}
                  className="text-white hover:text-gray-200"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700">{selectedRedemption.reward.description}</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Redemption Code</p>
                  <p className="text-xl font-mono font-bold">{selectedRedemption.redemptionCode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Redeemed On</p>
                  <p className="font-medium">{new Date(selectedRedemption.redeemedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires On</p>
                  <p className="font-medium">{new Date(selectedRedemption.expiresAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Points Spent</p>
                  <p className="font-medium">{selectedRedemption.pointsSpent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedRedemption)}`}>
                    {selectedRedemption.isUsed ? (
                      <>
                        <FaCheck className="mr-1" />
                        Used
                      </>
                    ) : isExpired(selectedRedemption.expiresAt) ? (
                      <>
                        <FaExclamationCircle className="mr-1" />
                        Expired
                      </>
                    ) : (
                      <>
                        <FaClock className="mr-1" />
                        Active
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedRedemption(null)}
                className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const formatCategory = (category) => {
  switch (category) {
    case 'discount':
      return 'Discount';
    case 'content':
      return 'Exclusive Content';
    case 'certificate':
      return 'Certificate';
    case 'merchandise':
      return 'Merchandise';
    default:
      return 'Other';
  }
};

const isExpired = (expiresAt) => {
  return new Date(expiresAt) < new Date();
};

const getStatusBadgeColor = (redemption) => {
  if (redemption.isUsed) {
    return 'bg-gray-100 text-gray-800';
  } else if (isExpired(redemption.expiresAt)) {
    return 'bg-red-100 text-red-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
};

export default RedemptionHistory;
