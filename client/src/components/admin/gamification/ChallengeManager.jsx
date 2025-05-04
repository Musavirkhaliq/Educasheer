import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../../services/api';
import { FaTrophy, FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ChallengeManager = () => {
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    criteria: {
      activityType: 'video_watch',
      targetCount: 1,
      specificItems: []
    },
    reward: {
      points: 100,
      badge: ''
    },
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  // Challenge types
  const challengeTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'special', label: 'Special' }
  ];

  // Activity types
  const activityTypes = [
    { value: 'video_watch', label: 'Watch Videos' },
    { value: 'course_completion', label: 'Complete Courses' },
    { value: 'quiz', label: 'Take Quizzes' },
    { value: 'attendance', label: 'Mark Attendance' },
    { value: 'blog', label: 'Read/Write Blogs' },
    { value: 'comment', label: 'Post Comments' },
    { value: 'login', label: 'Login' }
  ];

  // Fetch challenges and badges
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch challenges
        const challengesResponse = await gamificationAPI.getAllChallenges();
        setChallenges(challengesResponse.data.data);
        
        // Fetch badges for reward selection
        const badgesResponse = await gamificationAPI.getAllBadges();
        setBadges(badgesResponse.data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load challenges and badges');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('criteria.')) {
      // Handle criteria fields
      const criteriaField = name.split('.')[1];
      setFormData({
        ...formData,
        criteria: {
          ...formData.criteria,
          [criteriaField]: type === 'number' ? parseInt(value) : value
        }
      });
    } else if (name.startsWith('reward.')) {
      // Handle reward fields
      const rewardField = name.split('.')[1];
      setFormData({
        ...formData,
        reward: {
          ...formData.reward,
          [rewardField]: rewardField === 'points' ? parseInt(value) : value
        }
      });
    } else {
      // Handle other fields
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Open modal for creating a new challenge
  const openCreateModal = () => {
    setCurrentChallenge(null);
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      criteria: {
        activityType: 'video_watch',
        targetCount: 1,
        specificItems: []
      },
      reward: {
        points: 100,
        badge: ''
      },
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    });
    setShowModal(true);
  };

  // Open modal for editing a challenge
  const openEditModal = (challenge) => {
    setCurrentChallenge(challenge);
    
    // Format dates for form input
    const startDate = new Date(challenge.startDate).toISOString().split('T')[0];
    const endDate = new Date(challenge.endDate).toISOString().split('T')[0];
    
    setFormData({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      criteria: challenge.criteria,
      reward: {
        points: challenge.reward.points || 0,
        badge: challenge.reward.badge || ''
      },
      startDate,
      endDate,
      isActive: challenge.isActive
    });
    
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const challengeData = {
        ...formData,
        reward: {
          ...formData.reward,
          // Convert empty badge to null
          badge: formData.reward.badge || null
        }
      };
      
      if (currentChallenge) {
        // Update existing challenge
        const response = await gamificationAPI.updateChallenge(currentChallenge._id, challengeData);
        
        // Update challenges list
        setChallenges(challenges.map(challenge => 
          challenge._id === currentChallenge._id ? response.data.data : challenge
        ));
        
        toast.success('Challenge updated successfully');
      } else {
        // Create new challenge
        const response = await gamificationAPI.createChallenge(challengeData);
        
        // Add new challenge to list
        setChallenges([...challenges, response.data.data]);
        
        toast.success('Challenge created successfully');
      }
      
      setShowModal(false);
    } catch (err) {
      console.error('Error saving challenge:', err);
      toast.error(err.response?.data?.message || 'Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  // Handle challenge deletion
  const handleDelete = async (challengeId) => {
    try {
      setLoading(true);
      await gamificationAPI.deleteChallenge(challengeId);
      
      // Remove challenge from list
      setChallenges(challenges.filter(challenge => challenge._id !== challengeId));
      
      toast.success('Challenge deleted successfully');
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting challenge:', err);
      toast.error(err.response?.data?.message || 'Failed to delete challenge');
    } finally {
      setLoading(false);
    }
  };

  // Filter challenges based on search term and status
  const filteredChallenges = challenges.filter(challenge => {
    // Filter by search term
    const matchesSearch = 
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    if (statusFilter === 'all') {
      return matchesSearch;
    } else if (statusFilter === 'active') {
      return matchesSearch && challenge.isActive;
    } else if (statusFilter === 'inactive') {
      return matchesSearch && !challenge.isActive;
    } else if (statusFilter === 'expired') {
      return matchesSearch && new Date(challenge.endDate) < new Date();
    } else if (statusFilter === 'upcoming') {
      return matchesSearch && new Date(challenge.startDate) > new Date();
    }
    
    return matchesSearch;
  });

  if (loading && challenges.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error && challenges.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Challenge Management</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Create Challenge
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Search challenges..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Challenges</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {filteredChallenges.map(challenge => {
          const isExpired = new Date(challenge.endDate) < new Date();
          const isUpcoming = new Date(challenge.startDate) > new Date();
          const isActive = challenge.isActive && !isExpired && !isUpcoming;
          
          return (
            <div 
              key={challenge._id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                isExpired ? 'border-gray-400' : 
                isUpcoming ? 'border-blue-400' : 
                isActive ? 'border-green-400' : 'border-red-400'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 mr-2">{challenge.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isExpired ? 'bg-gray-100 text-gray-600' : 
                        isUpcoming ? 'bg-blue-100 text-blue-600' : 
                        isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {isExpired ? 'Expired' : 
                         isUpcoming ? 'Upcoming' : 
                         isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                        {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{challenge.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(challenge)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(challenge._id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Criteria */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Challenge Criteria</h4>
                    <p className="text-sm text-gray-600">
                      {getActivityTypeLabel(challenge.criteria.activityType)}: {challenge.criteria.targetCount} times
                    </p>
                  </div>
                  
                  {/* Reward */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reward</h4>
                    <p className="text-sm text-gray-600">
                      {challenge.reward.points} points
                      {challenge.reward.badge && (
                        <span className="ml-2">+ Badge</span>
                      )}
                    </p>
                  </div>
                  
                  {/* Dates */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Duration</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-1 text-gray-400" />
                      <span>
                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {challenge._id}</span>
                  <span>
                    Status: {challenge.isActive ? (
                      <span className="text-green-500 flex items-center">
                        <FaCheck className="mr-1" /> Enabled
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <FaTimes className="mr-1" /> Disabled
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No challenges found */}
      {filteredChallenges.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaTrophy className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Challenges Found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Try different search terms or filters' : 'Create your first challenge to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Challenge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
            <div className="bg-primary p-4 text-white sticky top-0 z-10">
              <h3 className="text-xl font-bold">
                {currentChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="mb-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge Type*
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {challengeTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type*
                  </label>
                  <select
                    name="criteria.activityType"
                    value={formData.criteria.activityType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Count*
                  </label>
                  <input
                    type="number"
                    name="criteria.targetCount"
                    value={formData.criteria.targetCount}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of times the activity must be completed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Reward*
                  </label>
                  <input
                    type="number"
                    name="reward.points"
                    value={formData.reward.points}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Reward (Optional)
                </label>
                <select
                  name="reward.badge"
                  value={formData.reward.badge}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No Badge</option>
                  {badges.map(badge => (
                    <option key={badge._id} value={badge._id}>
                      {badge.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date*
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active (visible to users)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : currentChallenge ? 'Update Challenge' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-red-500 p-4 text-white">
              <h3 className="text-xl font-bold">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this challenge? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get activity type label
const getActivityTypeLabel = (activityType) => {
  switch (activityType) {
    case 'video_watch':
      return 'Watch Videos';
    case 'course_completion':
      return 'Complete Courses';
    case 'quiz':
      return 'Take Quizzes';
    case 'attendance':
      return 'Mark Attendance';
    case 'blog':
      return 'Read/Write Blogs';
    case 'comment':
      return 'Post Comments';
    case 'login':
      return 'Login';
    default:
      return activityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export default ChallengeManager;
