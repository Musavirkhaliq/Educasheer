import React, { useState, useEffect } from 'react';
import { rewardAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaGift, FaCoins, FaQrcode, FaCheck } from 'react-icons/fa';

const AdminRewardsPage = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsCost: '',
    category: 'other',
    code: '',
    validFrom: '',
    validUntil: '',
    quantity: '',
    isActive: true,
    image: null
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [verifiedRedemption, setVerifiedRedemption] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardAPI.getAllRewards();
      setRewards(response.data.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pointsCost: '',
      category: 'other',
      code: '',
      validFrom: '',
      validUntil: '',
      quantity: '',
      isActive: true,
      image: null
    });
    setEditingReward(null);
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      code: reward.code || '',
      validFrom: reward.validFrom ? new Date(reward.validFrom).toISOString().split('T')[0] : '',
      validUntil: reward.validUntil ? new Date(reward.validUntil).toISOString().split('T')[0] : '',
      quantity: reward.quantity === -1 ? '' : reward.quantity,
      isActive: reward.isActive,
      image: null // Can't pre-fill file input
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReward) {
        await rewardAPI.updateReward(editingReward._id, formData);
        toast.success('Reward updated successfully');
      } else {
        await rewardAPI.createReward(formData);
        toast.success('Reward created successfully');
      }
      
      resetForm();
      setShowForm(false);
      fetchRewards();
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error(error.response?.data?.message || 'Failed to save reward');
    }
  };

  const handleVerifyCode = async () => {
    if (!redemptionCode.trim()) {
      toast.error('Please enter a redemption code');
      return;
    }
    
    try {
      setVerifying(true);
      const response = await rewardAPI.verifyRedemptionCode(redemptionCode);
      setVerifiedRedemption(response.data.data);
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error(error.response?.data?.message || 'Invalid redemption code');
      setVerifiedRedemption(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleMarkAsUsed = async () => {
    try {
      await rewardAPI.markRedemptionUsed(verifiedRedemption._id);
      toast.success('Redemption marked as used');
      setShowVerifyModal(false);
      setRedemptionCode('');
      setVerifiedRedemption(null);
    } catch (error) {
      console.error('Error marking redemption as used:', error);
      toast.error('Failed to mark redemption as used');
    }
  };

  if (loading && rewards.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Rewards</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#00a0b7]"
          >
            <FaPlus className="mr-2" />
            {showForm ? 'Cancel' : 'Add New Reward'}
          </button>
          <button
            onClick={() => setShowVerifyModal(true)}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            <FaQrcode className="mr-2" />
            Verify Code
          </button>
        </div>
      </div>

      {/* Reward Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingReward ? 'Edit Reward' : 'Create New Reward'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points Cost *
                </label>
                <input
                  type="number"
                  name="pointsCost"
                  value={formData.pointsCost}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                >
                  <option value="discount">Discount</option>
                  <option value="content">Exclusive Content</option>
                  <option value="certificate">Certificate</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Redemption Code (Optional)
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                  placeholder="e.g., DISCOUNT20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From
                </label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until (Optional)
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (Leave empty for unlimited)
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                  placeholder="Unlimited if empty"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#00bcd4] focus:ring-[#00bcd4] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active (available for redemption)
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00bcd4] text-white rounded-md hover:bg-[#00a0b7]"
              >
                {editingReward ? 'Update Reward' : 'Create Reward'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rewards Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rewards.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No rewards found. Create your first reward!
                </td>
              </tr>
            ) : (
              rewards.map((reward) => (
                <tr key={reward._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {reward.image ? (
                          <img
                            src={reward.image}
                            alt={reward.name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=R";
                            }}
                          />
                        ) : (
                          <FaGift className="text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{reward.name}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">{reward.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FaCoins className="text-yellow-500 mr-1" />
                      {reward.pointsCost}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(reward.category)}`}>
                      {formatCategory(reward.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reward.quantity === -1 ? 'Unlimited' : reward.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {reward.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditReward(reward)}
                      className="text-[#00bcd4] hover:text-[#00a0b7] mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        // Implement delete functionality
                        toast.info('Delete functionality not implemented yet');
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Verify Redemption Code Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gray-800 p-4 text-white">
              <h2 className="text-lg font-bold">Verify Redemption Code</h2>
            </div>
            
            <div className="p-6">
              {!verifiedRedemption ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Redemption Code
                    </label>
                    <input
                      type="text"
                      value={redemptionCode}
                      onChange={(e) => setRedemptionCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00bcd4] focus:border-[#00bcd4]"
                      placeholder="e.g., ABC123-4567"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowVerifyModal(false);
                        setRedemptionCode('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyCode}
                      disabled={verifying}
                      className="px-4 py-2 bg-[#00bcd4] text-white rounded-md hover:bg-[#00a0b7] flex items-center"
                    >
                      {verifying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>Verify</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaCheck className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          Redemption code is valid!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Redemption Details</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Reward:</span>
                          <p className="font-medium">{verifiedRedemption.reward.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">User:</span>
                          <p className="font-medium">{verifiedRedemption.user.fullName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Redeemed On:</span>
                          <p className="font-medium">{new Date(verifiedRedemption.redeemedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expires On:</span>
                          <p className="font-medium">{new Date(verifiedRedemption.expiresAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <p className={`font-medium ${verifiedRedemption.isUsed ? 'text-red-600' : 'text-green-600'}`}>
                            {verifiedRedemption.isUsed ? 'Already Used' : 'Valid'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowVerifyModal(false);
                        setRedemptionCode('');
                        setVerifiedRedemption(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {!verifiedRedemption.isUsed && (
                      <button
                        onClick={handleMarkAsUsed}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Mark as Used
                      </button>
                    )}
                  </div>
                </div>
              )}
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

const getCategoryBadgeColor = (category) => {
  switch (category) {
    case 'discount':
      return 'bg-green-100 text-green-800';
    case 'content':
      return 'bg-blue-100 text-blue-800';
    case 'certificate':
      return 'bg-purple-100 text-purple-800';
    case 'merchandise':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default AdminRewardsPage;
