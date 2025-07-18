import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/categoryAPI';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#00bcd4',
    icon: 'FaBook',
    order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const iconOptions = [
    'FaBook', 'FaGraduationCap', 'FaFlask', 'FaAtom', 'FaDna', 'FaCalculator',
    'FaGlobe', 'FaHistory', 'FaLanguage', 'FaMusic', 'FaPalette', 'FaRunning',
    'FaLaptopCode', 'FaBrain', 'FaQuestion', 'FaStar'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAllCategories(true);
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryAPI.createCategory(formData);
        toast.success('Category created successfully');
      }
      
      await fetchCategories();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#00bcd4',
      icon: category.icon || 'FaBook',
      order: category.order || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoryAPI.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      await fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      await categoryAPI.toggleCategoryStatus(categoryId);
      toast.success('Category status updated');
      await fetchCategories();
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#00bcd4',
      icon: 'FaBook',
      order: 0
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-[#00bcd4]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#00bcd4] text-white px-4 py-2 rounded-md hover:bg-[#0097a7] transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                  placeholder="Display order"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                placeholder="Category description"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#00bcd4] text-white px-4 py-2 rounded-md hover:bg-[#0097a7] transition-colors flex items-center disabled:opacity-50"
              >
                {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="p-6">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Color</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Icon</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                      {category.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{category.color}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{category.icon}</td>
                    <td className="py-3 px-4 text-gray-600">{category.order}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(category._id)}
                        className={`flex items-center ${
                          category.isActive ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {category.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        <span className="ml-1 text-sm">
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
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
    </div>
  );
};

export default CategoryManagement;
