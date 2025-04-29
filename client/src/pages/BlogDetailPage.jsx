import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaEye, FaClock, FaEdit, FaTrash, FaArrowLeft, FaTags } from 'react-icons/fa';
import { blogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BlogCommentSection from '../components/blog/BlogCommentSection';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogAPI.getBlogBySlug(slug);
        setBlog(response.data.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    try {
      await blogAPI.deleteBlog(blog._id);
      navigate('/blogs');
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error || 'Blog not found'}</p>
          <Link
            to="/blogs"
            className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser && currentUser._id === blog.author._id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/blogs"
          className="inline-flex items-center text-gray-600 hover:text-[#00bcd4] transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Blogs
        </Link>
      </div>
      
      <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Blog Header */}
        <div className="relative">
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-wrap items-center text-sm mb-3 gap-4">
              <span className="inline-block px-3 py-1 bg-[#00bcd4] rounded-full">
                {blog.category}
              </span>
              <span className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <FaClock className="mr-2" />
                {blog.readTime} min read
              </span>
              <span className="flex items-center">
                <FaEye className="mr-2" />
                {blog.views} views
              </span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-4">{blog.title}</h1>
            
            <div className="flex items-center">
              <img
                src={blog.author.avatar}
                alt={blog.author.fullName}
                className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-white"
              />
              <div>
                <p className="font-medium">{blog.author.fullName}</p>
                <p className="text-sm text-gray-300">@{blog.author.username}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blog Content */}
        <div className="p-6 md:p-8">
          {/* Admin/Author Actions */}
          {canEdit && (
            <div className="flex justify-end mb-6">
              <Link
                to={`/blogs/edit/${blog._id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-3 hover:bg-blue-600 transition-colors flex items-center"
              >
                <FaEdit className="mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </div>
          )}
          
          {/* Blog Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <FaTags className="text-gray-500 mr-2" />
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
      
      {/* Comments Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <BlogCommentSection blogId={blog._id} />
      </div>
    </div>
  );
};

export default BlogDetailPage;
