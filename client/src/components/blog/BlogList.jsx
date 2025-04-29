import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaEye, FaClock, FaEdit, FaTrash } from 'react-icons/fa';
import { blogAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BlogList = ({ activeTab = 'all', searchQuery = '', category = '' }) => {
  const { currentUser } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalBlogs: 0,
    totalPages: 0
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError('');
      
      try {
        let response;
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery,
          category: category || undefined
        };
        
        if (activeTab === 'my' && currentUser) {
          response = await blogAPI.getMyBlogs(params);
        } else {
          response = await blogAPI.getAllBlogs(params);
        }
        
        setBlogs(response.data.data.blogs);
        setPagination({
          ...pagination,
          totalBlogs: response.data.data.pagination.totalBlogs,
          totalPages: response.data.data.pagination.totalPages
        });
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, [activeTab, searchQuery, category, pagination.page, pagination.limit, currentUser]);

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    try {
      await blogAPI.deleteBlog(blogId);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => setPagination({ ...pagination, page: 1 })}
          className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium text-gray-700 mb-4">No blogs found</h3>
        {activeTab === 'my' ? (
          <Link
            to="/blogs/create"
            className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300"
          >
            Write Your First Blog
          </Link>
        ) : (
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/blogs/${blog.slug}`}>
              <div className="h-48 overflow-hidden">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </Link>
            
            <div className="p-6">
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <span className="inline-block px-2 py-1 bg-[#00bcd4]/10 rounded-full text-[#00bcd4] mr-2">
                  {blog.category}
                </span>
                <span className="flex items-center mr-4">
                  <FaCalendarAlt className="mr-1" />
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <FaClock className="mr-1" />
                  {blog.readTime} min read
                </span>
              </div>
              
              <Link to={`/blogs/${blog.slug}`}>
                <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-[#00bcd4] transition-colors">
                  {blog.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {blog.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={blog.author?.avatar || 'https://via.placeholder.com/40'}
                    alt={blog.author?.fullName}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <span className="text-sm text-gray-700">{blog.author?.fullName}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <FaEye className="mr-1" />
                  <span>{blog.views}</span>
                </div>
              </div>
              
              {/* Edit/Delete buttons - only show for author or admin */}
              {currentUser && (currentUser._id === blog.author?._id || currentUser.role === 'admin') && (
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/blogs/edit/${blog._id}`}
                    className="text-blue-500 hover:text-blue-700 mr-4"
                    title="Edit"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(blog._id);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`px-4 py-2 rounded-md ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {[...Array(pagination.totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show current page, first page, last page, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === pagination.totalPages ||
                (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 rounded-md ${
                      pagination.page === pageNumber
                        ? 'bg-[#00bcd4] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              
              // Show ellipsis for gaps
              if (
                (pageNumber === 2 && pagination.page > 3) ||
                (pageNumber === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
              ) {
                return <span key={pageNumber}>...</span>;
              }
              
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className={`px-4 py-2 rounded-md ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default BlogList;
