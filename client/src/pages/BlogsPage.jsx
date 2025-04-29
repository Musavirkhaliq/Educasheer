import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { blogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BlogList from '../components/blog/BlogList';

const BlogsPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await blogAPI.getAllBlogs({ limit: 100 });
        const blogs = response.data.data.blogs;
        
        // Extract unique categories
        const uniqueCategories = [...new Set(blogs.map(blog => blog.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the BlogList component
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Blogs</h1>
          <p className="text-gray-600">Discover insights, tutorials, and educational content</p>
        </div>
        
        {currentUser && (
          <Link
            to="/blogs/create"
            className="mt-4 md:mt-0 bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center"
          >
            <FaPlus className="mr-2" />
            Write a Blog
          </Link>
        )}
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="md:w-1/4">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Tabs - Only show if user is logged in */}
      {currentUser && (
        <div className="border-b border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-[#00bcd4] text-[#00bcd4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Blogs
              </button>
              
              <button
                onClick={() => setActiveTab('my')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my'
                    ? 'border-[#00bcd4] text-[#00bcd4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Blogs
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Blog List */}
      <BlogList 
        activeTab={activeTab}
        searchQuery={searchQuery}
        category={category}
      />
    </div>
  );
};

export default BlogsPage;
