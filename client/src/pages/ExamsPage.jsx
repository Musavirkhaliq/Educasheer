import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaFilter, FaClock, FaQuestionCircle, FaGraduationCap, FaBook, FaChevronRight, FaSpinner, FaUser, FaStar, FaPlay, FaTrophy, FaBookOpen, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ExamsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
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
    fetchTags();
  }, []);

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line
  }, [search, selectedCategory, selectedType, selectedTags, selectedDifficulty, pagination.page]);

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

  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const response = await quizAPI.getQuizTags();
      setTags(response.data.data || []);
    } catch (err) {
      console.error('Failed to load tags:', err);
    } finally {
      setTagsLoading(false);
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
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      
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

  const handleTagSelect = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.includes(tag);
      const newTags = isSelected
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      return newTags;
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty === selectedDifficulty ? '' : difficulty);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleQuizClick = (quiz) => {
    // Check if user is authenticated before allowing quiz access
    if (!isAuthenticated) {
      // Redirect to login with appropriate return URL
      const redirectUrl = quiz.course
        ? `/courses/${quiz.course._id}/quizzes/${quiz._id}`
        : `/test-series/${quiz.testSeries._id}/quiz/${quiz._id}`;
      navigate(`/login?redirect=${redirectUrl}`);
      return;
    }

    // Navigate to quiz taking page based on context
    if (quiz.course) {
      navigate(`/courses/${quiz.course._id}/quizzes/${quiz._id}`);
    } else if (quiz.testSeries) {
      navigate(`/test-series/${quiz.testSeries._id}/quiz/${quiz._id}`);
    }
  };

  const getTypeIcon = (type) => {
    return type === 'exam' ? (
      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg">
        <FaTrophy className="text-xl" />
      </div>
    ) : (
      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
        <FaBookOpen className="text-xl" />
      </div>
    );
  };

  const getTypeColor = (type) => {
    return type === 'exam'
      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
  };

  const getTypeBadgeColor = (type) => {
    return type === 'exam'
      ? 'bg-red-50 text-red-700 border border-red-200'
      : 'bg-blue-50 text-blue-700 border border-blue-200';
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-50 text-green-700 border border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'hard': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
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

              {/* Difficulty Filter */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Difficulty</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDifficultySelect('')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedDifficulty === ''
                        ? 'bg-[#00bcd4] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    All Levels
                  </button>
                  {['easy', 'medium', 'hard'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => handleDifficultySelect(difficulty)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedDifficulty === difficulty
                          ? 'bg-[#00bcd4] text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{difficulty}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {difficulty === 'easy' ? '⭐' : difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Popular Tags</h4>
                {tagsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <FaSpinner className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tags.slice(0, 20).map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => handleTagSelect(tag.name)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedTags.includes(tag.name)
                            ? 'bg-[#00bcd4] text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">#{tag.name}</span>
                          <span className="text-xs opacity-75">{tag.count}</span>
                        </div>
                      </button>
                    ))}
                    {tags.length === 0 && (
                      <p className="text-gray-500 text-sm">No tags available</p>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Filters Summary */}
              {(selectedTags.length > 0 || selectedDifficulty || selectedCategory || selectedType) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Active Filters</h4>
                  <div className="space-y-2">
                    {selectedCategory && (
                      <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                        <span className="text-sm text-blue-700">📂 {selectedCategory}</span>
                        <button onClick={() => handleCategorySelect('')} className="text-blue-600 hover:text-blue-800">×</button>
                      </div>
                    )}
                    {selectedType && (
                      <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-md">
                        <span className="text-sm text-purple-700">{selectedType === 'exam' ? '🏆' : '📚'} {selectedType}</span>
                        <button onClick={() => handleTypeSelect('')} className="text-purple-600 hover:text-purple-800">×</button>
                      </div>
                    )}
                    {selectedDifficulty && (
                      <div className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded-md">
                        <span className="text-sm text-orange-700">⚡ {selectedDifficulty}</span>
                        <button onClick={() => handleDifficultySelect('')} className="text-orange-600 hover:text-orange-800">×</button>
                      </div>
                    )}
                    {selectedTags.map((tag) => (
                      <div key={tag} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-md">
                        <span className="text-sm text-green-700">#{tag}</span>
                        <button onClick={() => handleTagSelect(tag)} className="text-green-600 hover:text-green-800">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00bcd4] to-[#00acc1] rounded-full animate-pulse"></div>
                  <FaSpinner className="absolute inset-0 m-auto animate-spin text-2xl text-white" />
                </div>
                <p className="text-gray-600 mt-4 text-lg font-medium">Loading amazing quizzes...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBook className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={fetchQuizzes}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Quiz Grid */}
            {!loading && !error && (
              <>
                {quizzes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <FaBook className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">No exams or quizzes found</h3>
                    <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
                      Try adjusting your search criteria or browse different categories to discover available content.
                    </p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory('');
                        setSelectedType('');
                        setSelectedTags([]);
                        setSelectedDifficulty('');
                      }}
                      className="bg-gradient-to-r from-[#00bcd4] to-[#00acc1] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {quizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-[#00bcd4]/20 hover:-translate-y-1"
                        onClick={() => handleQuizClick(quiz)}
                      >
                        {/* Header with gradient background */}
                        <div className={`relative p-6 ${getTypeColor(quiz.quizType)} text-white`}>
                          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                            <div className="absolute top-4 right-4">
                              {quiz.quizType === 'exam' ? (
                                <FaTrophy className="text-6xl" />
                              ) : (
                                <FaBookOpen className="text-6xl" />
                              )}
                            </div>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight">
                                  {quiz.title}
                                </h3>
                                <div className="flex items-center space-x-4 text-white/90">
                                  <div className="flex items-center">
                                    <FaQuestionCircle className="mr-1.5 text-sm" />
                                    <span className="text-sm font-medium">{quiz.questions?.length || 0} questions</span>
                                  </div>
                                  <div className="flex items-center">
                                    <FaClock className="mr-1.5 text-sm" />
                                    <span className="text-sm font-medium">{quiz.timeLimit} min</span>
                                  </div>
                                </div>
                              </div>
                              {getTypeIcon(quiz.quizType)}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {quiz.description || "Test your knowledge with this comprehensive quiz covering important topics."}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-5">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getTypeBadgeColor(quiz.quizType)}`}>
                              {quiz.quizType === 'exam' ? '🏆 Exam' : '📚 Quiz'}
                            </span>
                            {quiz.category && (
                              <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
                                📂 {quiz.category}
                              </span>
                            )}
                            {quiz.difficulty && (
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                                ⚡ {quiz.difficulty}
                              </span>
                            )}
                            {quiz.tags && quiz.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-200"
                              >
                                #{tag}
                              </span>
                            ))}
                            {quiz.tags && quiz.tags.length > 3 && (
                              <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200">
                                +{quiz.tags.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-2xl font-bold text-gray-800">{quiz.questions?.length || 0}</div>
                              <div className="text-xs text-gray-500 font-medium">Questions</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-2xl font-bold text-gray-800">{quiz.timeLimit}</div>
                              <div className="text-xs text-gray-500 font-medium">Minutes</div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                <FaUser className="text-white text-xs" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {quiz.creator?.fullName || quiz.creator?.username || 'Instructor'}
                                </div>
                                <div className="text-xs text-gray-500">Course Creator</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {!isAuthenticated && (
                                <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full font-semibold border border-orange-200">
                                  🔐 Login required
                                </span>
                              )}
                              <div className="w-10 h-10 bg-[#00bcd4] rounded-full flex items-center justify-center group-hover:bg-[#00acc1] transition-colors shadow-lg">
                                <FaPlay className="text-white text-sm ml-0.5" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00bcd4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center mt-12 space-x-3">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md transition-all duration-300 disabled:hover:bg-white disabled:hover:shadow-none"
                    >
                      Previous
                    </button>

                    <div className="flex space-x-2">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                          className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 ${
                            pagination.page === i + 1
                              ? 'bg-gradient-to-r from-[#00bcd4] to-[#00acc1] text-white shadow-lg transform scale-110'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md transition-all duration-300 disabled:hover:bg-white disabled:hover:shadow-none"
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
