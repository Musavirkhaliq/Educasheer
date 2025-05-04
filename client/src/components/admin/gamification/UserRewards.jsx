import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../../services/api';
import axios from 'axios';
import { FaUsers, FaMedal, FaStar, FaSpinner, FaSearch, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UserRewards = () => {
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [modalType, setModalType] = useState('badge'); // 'badge' or 'points'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    badgeId: '',
    points: 100,
    category: 'other',
    description: ''
  });

  // Point categories
  const pointCategories = [
    { value: 'course_completion', label: 'Course Completion' },
    { value: 'video_watch', label: 'Video Watching' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'blog', label: 'Blog' },
    { value: 'comment', label: 'Comment' },
    { value: 'social', label: 'Social' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch users and badges
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersResponse = await axios.get('/api/v1/admin/users');
        setUsers(usersResponse.data.data);

        // Fetch badges
        const badgesResponse = await gamificationAPI.getAllBadges();
        setBadges(badgesResponse.data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load users and badges');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : value
    });
  };

  // Open award modal
  const openAwardModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);

    // Reset form data
    setFormData({
      badgeId: badges.length > 0 ? badges[0]._id : '',
      points: 100,
      category: 'other',
      description: `Manual ${type === 'badge' ? 'badge' : 'points'} award by admin`
    });

    setShowAwardModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (modalType === 'badge') {
        // Award badge
        await gamificationAPI.awardBadge({
          userId: selectedUser._id,
          badgeId: formData.badgeId
        });

        toast.success(`Badge awarded to ${selectedUser.username} successfully`);
      } else {
        // Award points
        await gamificationAPI.awardPoints({
          userId: selectedUser._id,
          points: formData.points,
          category: formData.category,
          description: formData.description
        });

        toast.success(`${formData.points} points awarded to ${selectedUser.username} successfully`);
      }

      setShowAwardModal(false);
    } catch (err) {
      console.error('Error awarding reward:', err);
      toast.error(err.response?.data?.message || 'Failed to award reward');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Rewards</h2>
        <p className="text-gray-600">Award badges and points to users</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar}
                            alt={user.username}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";
                            }}
                          />
                        ) : (
                          <FaUserCircle className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'tutor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openAwardModal(user, 'badge')}
                      className="text-primary hover:text-primary-dark mr-4"
                    >
                      Award Badge
                    </button>
                    <button
                      onClick={() => openAwardModal(user, 'points')}
                      className="text-primary hover:text-primary-dark"
                    >
                      Award Points
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No users found */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
          <FaUsers className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Users Found</h3>
          <p className="text-gray-500">
            Try a different search term
          </p>
        </div>
      )}

      {/* Award Modal */}
      {showAwardModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-primary p-4 text-white">
              <h3 className="text-xl font-bold">
                {modalType === 'badge' ? 'Award Badge' : 'Award Points'} to {selectedUser.username}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {modalType === 'badge' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Badge*
                    </label>
                    <select
                      name="badgeId"
                      value={formData.badgeId}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      {badges.map(badge => (
                        <option key={badge._id} value={badge._id}>
                          {badge.name} (Level {badge.level})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Badge Preview */}
                  {formData.badgeId && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Preview
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3">
                          <img
                            src={badges.find(b => b._id === formData.badgeId)?.icon}
                            alt="Badge Icon"
                            className="w-10 h-10"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://ui-avatars.com/api/?name=Badge&background=0D8ABC&color=fff";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {badges.find(b => b._id === formData.badgeId)?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {badges.find(b => b._id === formData.badgeId)?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points Amount*
                    </label>
                    <input
                      type="number"
                      name="points"
                      value={formData.points}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      {pointCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  required
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  This will be visible to the user in their activity history
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  disabled={loading}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin mx-auto" />
                  ) : modalType === 'badge' ? (
                    <span className="flex items-center">
                      <FaMedal className="mr-2" /> Award Badge
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaStar className="mr-2" /> Award Points
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRewards;
