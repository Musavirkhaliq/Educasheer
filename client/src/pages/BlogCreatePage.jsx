import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaImage, FaTimes } from 'react-icons/fa';
import { blogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BlogEditor from '../components/blog/BlogEditor';

const BlogCreatePage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Uncategorized',
    tags: '',
    isPublished: false
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login?redirect=%2Fblogs%2Fcreate');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });

    // If excerpt is empty, generate it from content
    if (!formData.excerpt.trim()) {
      // Strip HTML tags and get first 150 characters
      const textContent = content.replace(/<[^>]*>/g, '');
      const excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
      setFormData(prev => ({
        ...prev,
        excerpt
      }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    // Thumbnail is optional

    setSubmitting(true);
    setError('');

    try {
      // Create FormData object
      const blogFormData = new FormData();
      blogFormData.append('title', formData.title);
      blogFormData.append('content', formData.content);
      blogFormData.append('excerpt', formData.excerpt);
      blogFormData.append('category', formData.category);
      blogFormData.append('isPublished', formData.isPublished);

      // Process tags
      if (formData.tags) {
        blogFormData.append('tags', formData.tags);
      }

      // Add thumbnail if available
      if (thumbnail) {
        blogFormData.append('thumbnail', thumbnail);
      }

      // Submit the form
      const response = await blogAPI.createBlog(blogFormData);

      // Redirect to the new blog
      navigate(`/blogs/${response.data.data.slug}`);
    } catch (error) {
      console.error('Error creating blog:', error);
      setError(error.response?.data?.message || 'Failed to create blog. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              to="/blogs"
              className="inline-flex items-center text-gray-600 hover:text-[#00bcd4] transition-colors mb-2"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blogs
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Create New Blog</h1>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="mr-2" />
            {submitting ? 'Publishing...' : 'Publish Blog'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Blog Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Thumbnail Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Blog Thumbnail</h2>

            {thumbnailPreview ? (
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FaImage className="mx-auto text-gray-400 text-4xl mb-4" />
                <p className="text-gray-500 mb-4">
                  Upload a thumbnail image for your blog or leave empty to use default cover
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <label className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors cursor-pointer inline-block">
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setThumbnailPreview("https://via.placeholder.com/800x400?text=Blog+Thumbnail")}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Use Default Cover
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Blog Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Blog Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                >
                  <option value="Uncategorized">Uncategorized</option>
                  <option value="Education">Education</option>
                  <option value="Technology">Technology</option>
                  <option value="Programming">Programming</option>
                  <option value="Career">Career</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Tutorials">Tutorials</option>
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="excerpt" className="block text-gray-700 font-medium mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] h-24"
                  placeholder="Brief summary of your blog (will be auto-generated if left empty)"
                />
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="mr-2 h-5 w-5 text-[#00bcd4] focus:ring-[#00bcd4]"
                />
                <label htmlFor="isPublished" className="text-gray-700">
                  Publish immediately (uncheck to save as draft)
                </label>
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Blog Content *</h2>
            <BlogEditor
              initialContent={formData.content}
              onChange={handleContentChange}
            />
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="mr-2" />
              {submitting ? 'Publishing...' : 'Publish Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogCreatePage;
