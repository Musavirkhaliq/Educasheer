import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaFilter, FaClock, FaQuestionCircle, FaGraduationCap, FaBook, FaChevronRight, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ExamsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line
  }, [search, selectedCategory, selectedType, pagination.page]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await quizAPI.getQuizCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;
      
      const response = await quizAPI.getPublishedQuizzes(params);
      const data = response.data.data;
      setQuizzes(data.quizzes || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError('Failed to load exams and quizzes.');
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? '' : categoryName);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type === selectedType ? '' : type);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleQuizClick = (quiz) => {
    // Check if user is authenticated before allowing quiz access
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/courses/${quiz.course._id}/quizzes/${quiz._id}`);
      return;
    }

    // Navigate to quiz taking page
    navigate(`/courses/${quiz.course._id}/quizzes/${quiz._id}`);
  };

  const getTypeIcon = (type) => {
    return type === 'exam' ? <FaGraduationCap /> : <FaQuestionCircle />;
  };

  const getTypeColor = (type) => {
    return type === 'exam' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exams & Quizzes
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Test your knowledge with our comprehensive collection of exams and quizzes
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams and quizzes..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-gray-600 hover:text-gray-800"
                >
                  <FaFilter />
                </button>
              </div>
              
              <div className={`space-y-2 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <FaSpinner className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {/* All Categories */}
                    <button
                      onClick={() => handleCategorySelect('')}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === '' 
                          ? 'bg-[#00bcd4] text-white' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>All Categories</span>
                        <span className="text-sm opacity-75">
                          {categories.reduce((sum, cat) => sum + cat.count, 0)}
                        </span>
                      </div>
                    </button>
                    
                    {/* Category List */}
                    {categories.map((category) => (
                      <button
                        key={category._id || 'uncategorized'}
                        onClick={() => handleCategorySelect(category.name)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedCategory === category.name 
                            ? 'bg-[#00bcd4] text-white' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <span className="text-sm opacity-75">{category.count}</span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Type Filter */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Type</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleTypeSelect('')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedType === '' 
                        ? 'bg-[#00bcd4] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => handleTypeSelect('exam')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedType === 'exam' 
                        ? 'bg-[#00bcd4] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <FaGraduationCap className="mr-2" />
                      Exams
                    </div>
                  </button>
                  <button
                    onClick={() => handleTypeSelect('quiz')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedType === 'quiz' 
                        ? 'bg-[#00bcd4] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <FaQuestionCircle className="mr-2" />
                      Quizzes
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCategory ? `${selectedCategory} ` : ''}
                  {selectedType ? (selectedType === 'exam' ? 'Exams' : 'Quizzes') : 'Exams & Quizzes'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Loading...' : `${pagination.total} results found`}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-[#00bcd4]" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchQuizzes}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Quiz Grid */}
            {!loading && !error && (
              <>
                {quizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No exams or quizzes found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or browse different categories.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {quizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleQuizClick(quiz)}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                              {quiz.title}
                            </h3>
                            <div className="ml-2">
                              {getTypeIcon(quiz.quizType)}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {quiz.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(quiz.quizType)}`}>
                              {quiz.quizType === 'exam' ? 'Exam' : 'Quiz'}
                            </span>
                            {quiz.category && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                {quiz.category}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <FaQuestionCircle className="mr-1" />
                              <span>{quiz.questions?.length || 0} questions</span>
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-1" />
                              <span>{quiz.timeLimit} min</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              by {quiz.creator?.fullName || quiz.creator?.username}
                            </span>
                            <div className="flex items-center">
                              {!isAuthenticated && (
                                <span className="text-xs text-orange-600 mr-2 bg-orange-100 px-2 py-1 rounded">
                                  Login required
                                </span>
                              )}
                              <FaChevronRight className="text-[#00bcd4]" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center mt-8 space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                        className={`px-4 py-2 border rounded-md ${
                          pagination.page === i + 1
                            ? 'bg-[#00bcd4] text-white border-[#00bcd4]'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;
