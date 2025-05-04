import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../../services/api';
import { FaMedal, FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BadgeManager = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    category: 'special',
    level: 1,
    pointsAwarded: 0,
    criteria: '',
    isHidden: false
  });

  // Badge categories
  const categories = [
    { value: 'course', label: 'Course' },
    { value: 'video', label: 'Video' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'blog', label: 'Blog' },
    { value: 'social', label: 'Social' },
    { value: 'special', label: 'Special' }
  ];

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const response = await gamificationAPI.getAllBadges();
        setBadges(response.data.data);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError('Failed to load badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open modal for creating a new badge
  const openCreateModal = () => {
    setCurrentBadge(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      category: 'special',
      level: 1,
      pointsAwarded: 0,
      criteria: '',
      isHidden: false
    });
    setShowModal(true);
  };

  // Open modal for editing a badge
  const openEditModal = (badge) => {
    setCurrentBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      level: badge.level,
      pointsAwarded: badge.pointsAwarded,
      criteria: badge.criteria,
      isHidden: badge.isHidden
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (currentBadge) {
        // Update existing badge
        const response = await gamificationAPI.updateBadge(currentBadge._id, formData);
        
        // Update badges list
        setBadges(badges.map(badge => 
          badge._id === currentBadge._id ? response.data.data : badge
        ));
        
        toast.success('Badge updated successfully');
      } else {
        // Create new badge
        const response = await gamificationAPI.createBadge(formData);
        
        // Add new badge to list
        setBadges([...badges, response.data.data]);
        
        toast.success('Badge created successfully');
      }
      
      setShowModal(false);
    } catch (err) {
      console.error('Error saving badge:', err);
      toast.error(err.response?.data?.message || 'Failed to save badge');
    } finally {
      setLoading(false);
    }
  };

  // Handle badge deletion
  const handleDelete = async (badgeId) => {
    try {
      setLoading(true);
      await gamificationAPI.deleteBadge(badgeId);
      
      // Remove badge from list
      setBadges(badges.filter(badge => badge._id !== badgeId));
      
      toast.success('Badge deleted successfully');
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting badge:', err);
      toast.error(err.response?.data?.message || 'Failed to delete badge');
    } finally {
      setLoading(false);
    }
  };

  // Filter badges based on search term
  const filteredBadges = badges.filter(badge => 
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && badges.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error && badges.length === 0) {
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
        <h2 className="text-2xl font-bold text-gray-800">Badge Management</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Create Badge
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search badges..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map(badge => (
          <div key={badge._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className={`p-4 ${getBadgeBgColor(badge.category)}`}>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(badge)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(badge._id)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 rounded-full bg-white p-2 flex items-center justify-center">
                  <img 
                    src={badge.icon} 
                    alt={badge.name} 
                    className="w-10 h-10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=Badge&background=0D8ABC&color=fff";
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-2">{badge.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                  Level {badge.level}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                  {formatCategory(badge.category)}
                </span>
                {badge.isHidden && (
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{badge.pointsAwarded} points</span>
                <span>Criteria: {badge.criteria}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No badges found */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaMedal className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Badges Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Create your first badge to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Badge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="bg-primary p-4 text-white">
              <h3 className="text-xl font-bold">
                {currentBadge ? 'Edit Badge' : 'Create New Badge'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL*
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
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
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level (1-5)*
                  </label>
                  <input
                    type="number"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    min="1"
                    max="5"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Awarded
                  </label>
                  <input
                    type="number"
                    name="pointsAwarded"
                    value={formData.pointsAwarded}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criteria*
                </label>
                <input
                  type="text"
                  name="criteria"
                  value={formData.criteria}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., course:complete:1, streak:7, level:5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: action:condition:count (e.g., course:complete:1, streak:7, level:5)
                </p>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isHidden"
                    checked={formData.isHidden}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Hidden Badge (not visible to users until earned)</span>
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
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : currentBadge ? 'Update Badge' : 'Create Badge'}
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
                Are you sure you want to delete this badge? This action cannot be undone.
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

// Helper functions for badge styling
const getBadgeBgColor = (category) => {
  switch (category) {
    case 'course':
      return 'bg-gradient-to-r from-blue-500 to-blue-700';
    case 'video':
      return 'bg-gradient-to-r from-red-500 to-red-700';
    case 'quiz':
      return 'bg-gradient-to-r from-green-500 to-green-700';
    case 'attendance':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-700';
    case 'blog':
      return 'bg-gradient-to-r from-purple-500 to-purple-700';
    case 'social':
      return 'bg-gradient-to-r from-pink-500 to-pink-700';
    case 'special':
      return 'bg-gradient-to-r from-[#00bcd4] to-[#01427a]';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-700';
  }
};

const formatCategory = (category) => {
  switch (category) {
    case 'course':
      return 'Course';
    case 'video':
      return 'Video';
    case 'quiz':
      return 'Quiz';
    case 'attendance':
      return 'Attendance';
    case 'blog':
      return 'Blog';
    case 'social':
      return 'Social';
    case 'special':
      return 'Special';
    default:
      return 'General';
  }
};

export default BadgeManager;
