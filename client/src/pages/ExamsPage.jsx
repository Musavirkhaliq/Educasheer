import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/quizAPI';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { useAuth } from '../context/AuthContext';
import {
  FaSearch,
  FaFilter,
  FaClock,
  FaQuestionCircle,
  FaGraduationCap,
  FaBook,
  FaSpinner,
  FaUser,
  FaPlay,
  FaTrophy,
  FaBookOpen,
  FaUsers,
  FaListAlt,
  FaTag,
  FaFire,
  FaChartLine,
  FaMedal,
  FaLightbulb,
  FaRocket,
  FaEye,
  FaHeart,
  FaShare,
  FaDownload
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ExamsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [testSeries, setTestSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testSeriesLoading, setTestSeriesLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [error, setError] = useState('');
  const [testSeriesError, setTestSeriesError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState('quizzes'); // 'quizzes' or 'test-series'

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchTestSeries();
  }, []);

  useEffect(() => {
    if (currentView === 'quizzes') {
      fetchQuizzes();
    } else {
      fetchTestSeries();
    }
    // eslint-disable-next-line
  }, [search, selectedCategory, selectedType, selectedTags, selectedDifficulty, pagination.page, currentView]);

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

  const fetchTestSeries = async () => {
    setTestSeriesLoading(true);
    setTestSeriesError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const response = await testSeriesAPI.getPublishedTestSeries(params);
      setTestSeries(response.data.data || []);
    } catch (err) {
      setTestSeriesError('Failed to load test series.');
      console.error('Error fetching test series:', err);
    } finally {
      setTestSeriesLoading(false);
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
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-50 text-green-700 border border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'hard': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center text-white"
          >
            {/* Main Title with Enhanced Typography */}
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20"
              >
                <FaRocket className="text-yellow-300" />
                <span className="font-semibold">Boost Your Knowledge</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
                Exams & Quizzes
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Master your subjects with our expertly crafted assessments. Track progress, compete with peers, and achieve excellence.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-3xl mx-auto relative mb-8"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                  <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search for exams, quizzes, topics, or difficulty levels..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full pl-16 pr-6 py-5 bg-transparent text-gray-800 text-lg placeholder-gray-500 focus:outline-none rounded-2xl"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 transition-colors cursor-pointer">
                      <FaSearch className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 text-white/90"
            >
              <div className="flex items-center gap-2">
                <FaBookOpen className="text-cyan-300" />
                <span className="font-semibold">{pagination.total}+ Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTrophy className="text-yellow-300" />
                <span className="font-semibold">{testSeries.length}+ Test Series</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-green-300" />
                <span className="font-semibold">10k+ Students</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* View Toggle Buttons */}
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 rounded-2xl p-2 flex shadow-inner">
                  <button
                    onClick={() => setCurrentView('quizzes')}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${currentView === 'quizzes'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                  >
                    {currentView === 'quizzes' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-3">
                      <FaBookOpen className="text-lg" />
                      <span>Individual Quizzes</span>
                      {currentView === 'quizzes' && (
                        <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                          {pagination.total}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentView('test-series')}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${currentView === 'test-series'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                  >
                    {currentView === 'test-series' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-3">
                      <FaListAlt className="text-lg" />
                      <span>Test Series</span>
                      {currentView === 'test-series' && (
                        <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                          {testSeries.length}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaFire className="text-orange-500" />
                  <span className="text-sm font-medium">Popular Today</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaChartLine className="text-green-500" />
                  <span className="text-sm font-medium">Trending</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar - Categories */}
          <div className="lg:w-1/4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 sticky top-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <FaFilter className="text-white text-sm" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors"
                >
                  <FaFilter className="text-gray-600" />
                </button>
              </div>

              <div className={`space-y-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaTag className="text-primary-500" />
                    Categories
                  </h4>
                </div>

                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary-500 rounded-full animate-pulse"></div>
                      <FaSpinner className="absolute inset-0 m-auto animate-spin text-white text-sm" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* All Categories */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategorySelect('')}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${selectedCategory === ''
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-200'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${selectedCategory === '' ? 'bg-white' : 'bg-primary-500'}`}></div>
                          <span className="font-medium">All Categories</span>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${selectedCategory === ''
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700'
                          }`}>
                          {categories.reduce((sum, cat) => sum + cat.count, 0)}
                        </span>
                      </div>
                    </motion.button>

                    {/* Category List */}
                    <div className="space-y-2">
                      {categories.map((category, index) => (
                        <motion.button
                          key={category._id || 'uncategorized'}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCategorySelect(category.name)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${selectedCategory === category.name
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                            : 'hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-200'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${selectedCategory === category.name ? 'bg-white' : 'bg-primary-500'}`}></div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <span className={`text-sm px-2 py-1 rounded-full ${selectedCategory === category.name
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700'
                              }`}>
                              {category.count}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Type Filter */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Type</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleTypeSelect('')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedType === ''
                      ? 'bg-[#00bcd4] text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => handleTypeSelect('exam')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedType === 'exam'
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
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedType === 'quiz'
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
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedDifficulty === ''
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
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedDifficulty === difficulty
                        ? 'bg-[#00bcd4] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{difficulty}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
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
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedTags.includes(tag.name)
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
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Enhanced Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex-1">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-black text-gray-800 mb-2"
                >
                  {currentView === 'test-series' ? (
                    selectedCategory ? `${selectedCategory} Test Series` : 'Available Test Series'
                  ) : (
                    selectedCategory ? `${selectedCategory} ` : '' +
                      (selectedType ? (selectedType === 'exam' ? 'Exams' : 'Quizzes') : 'Exams & Quizzes')
                  )}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4 text-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">
                      {currentView === 'test-series' ? (
                        testSeriesLoading ? 'Loading...' : `${testSeries.length} test series found`
                      ) : (
                        loading ? 'Loading...' : `${pagination.total} results found`
                      )}
                    </span>
                  </div>

                  {(selectedCategory || selectedType || selectedDifficulty || selectedTags.length > 0) && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaFilter className="text-primary-500" />
                      <span>Filtered results</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sort Options */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 mt-4 md:mt-0"
              >
                <span className="text-sm font-medium text-gray-600">Sort by:</span>
                <select className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Most Popular</option>
                  <option>Newest First</option>
                  <option>Difficulty: Easy to Hard</option>
                  <option>Difficulty: Hard to Easy</option>
                  <option>Duration: Short to Long</option>
                  <option>Duration: Long to Short</option>
                </select>
              </motion.div>
            </motion.div>

            {/* Enhanced Loading State */}
            {((currentView === 'quizzes' && loading) || (currentView === 'test-series' && testSeriesLoading)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative mb-8">
                  {/* Animated Loading Rings */}
                  <div className="w-20 h-20 relative">
                    <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-secondary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>

                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
                    >
                      {currentView === 'test-series' ? (
                        <FaListAlt className="text-white text-sm" />
                      ) : (
                        <FaBookOpen className="text-white text-sm" />
                      )}
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Loading Amazing Content
                  </h3>
                  <p className="text-gray-600 text-lg font-medium mb-4">
                    Preparing {currentView === 'test-series' ? 'test series' : 'quizzes'} for you...
                  </p>

                  {/* Loading Progress Dots */}
                  <div className="flex items-center justify-center space-x-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Error State */}
            {((currentView === 'quizzes' && error) || (currentView === 'test-series' && testSeriesError)) && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBook className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-600 mb-6">{currentView === 'test-series' ? testSeriesError : error}</p>
                <button
                  onClick={currentView === 'test-series' ? fetchTestSeries : fetchQuizzes}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Content Grid */}
            {currentView === 'quizzes' && !loading && !error && (
              <>
                {quizzes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="relative mx-auto mb-8"
                    >
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 via-blue-50 to-primary-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <FaBook className="text-5xl text-gray-400" />
                      </div>

                      {/* Floating Elements */}
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center"
                      >
                        <FaSearch className="text-white text-sm" />
                      </motion.div>

                      <motion.div
                        animate={{ y: [5, -5, 5] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                        className="absolute -bottom-2 -left-2 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
                      >
                        <FaFilter className="text-white text-xs" />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-3xl font-bold text-gray-800 mb-4">No Content Found</h3>
                      <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                        We couldn't find any {currentView === 'test-series' ? 'test series' : 'quizzes'} matching your criteria.
                        Try adjusting your filters or search terms.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSearch('');
                            setSelectedCategory('');
                            setSelectedType('');
                            setSelectedTags([]);
                            setSelectedDifficulty('');
                          }}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                        >
                          <FaRocket className="text-sm" />
                          Clear All Filters
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentView(currentView === 'quizzes' ? 'test-series' : 'quizzes')}
                          className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:border-primary-300 hover:text-primary-600 transition-all duration-300 flex items-center gap-2"
                        >
                          <FaEye className="text-sm" />
                          Browse {currentView === 'quizzes' ? 'Test Series' : 'Quizzes'}
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {quizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{
                          y: -8,
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-white/20 hover:border-primary-200"
                        onClick={() => handleQuizClick(quiz)}
                      >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Header with enhanced gradient background */}
                        <div className={`relative p-6 ${getTypeColor(quiz.quizType)} text-white overflow-hidden`}>
                          {/* Animated Background Elements */}
                          <div className="absolute top-0 right-0 w-40 h-40 opacity-20">
                            <motion.div
                              className="absolute top-4 right-4"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                              {quiz.quizType === 'exam' ? (
                                <FaTrophy className="text-6xl" />
                              ) : (
                                <FaBookOpen className="text-6xl" />
                              )}
                            </motion.div>
                          </div>

                          {/* Floating Particles */}
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-2 left-4 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
                            <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-white/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                {/* Quiz Type Badge */}
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                                  {quiz.quizType === 'exam' ? (
                                    <>
                                      <FaMedal className="text-yellow-300 text-sm" />
                                      <span className="text-xs font-bold">EXAM</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaLightbulb className="text-blue-300 text-sm" />
                                      <span className="text-xs font-bold">QUIZ</span>
                                    </>
                                  )}
                                </div>

                                <h3 className="text-xl font-bold mb-3 quiz-title leading-tight">
                                  {quiz.title}
                                </h3>

                                {/* Enhanced Stats */}
                                <div className="flex items-center space-x-4 text-white/90">
                                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                                    <FaQuestionCircle className="text-sm" />
                                    <span className="text-sm font-semibold">{quiz.questions?.length || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                                    <FaClock className="text-sm" />
                                    <span className="text-sm font-semibold">{quiz.timeLimit}m</span>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Type Icon */}
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative"
                              >
                                {getTypeIcon(quiz.quizType)}
                                <div className="absolute -inset-1 bg-white/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Content */}
                        <div className="relative p-6 z-10">
                          <p className="text-gray-600 text-sm mb-5 quiz-description leading-relaxed">
                            {quiz.description && quiz.description.length > 100
                              ? `${quiz.description.substring(0, 100)}...`
                              : quiz.description || "Master key concepts with this expertly designed assessment."}
                          </p>

                          {/* Enhanced Tags */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {quiz.category && (
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1"
                              >
                                <FaTag className="text-xs" />
                                {quiz.category}
                              </motion.span>
                            )}
                            {quiz.difficulty && (
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 ${getDifficultyColor(quiz.difficulty)}`}
                              >
                                <FaFire className="text-xs" />
                                {quiz.difficulty}
                              </motion.span>
                            )}
                            {quiz.tags && quiz.tags.slice(0, 2).map((tag, tagIndex) => (
                              <motion.span
                                key={tagIndex}
                                whileHover={{ scale: 1.05 }}
                                className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-3 py-2 rounded-xl text-xs font-bold border border-purple-200"
                              >
                                #{tag}
                              </motion.span>
                            ))}
                            {quiz.tags && quiz.tags.length > 2 && (
                              <span className="bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold">
                                +{quiz.tags.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Enhanced Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border border-blue-200">
                              <div className="text-2xl font-black text-blue-700 mb-1">{quiz.questions?.length || 0}</div>
                              <div className="text-xs text-blue-600 font-bold">Questions</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border border-green-200">
                              <div className="text-2xl font-black text-green-700 mb-1">{quiz.timeLimit}</div>
                              <div className="text-xs text-green-600 font-bold">Minutes</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center border border-purple-200">
                              <div className="text-2xl font-black text-purple-700 mb-1">
                                {quiz.difficulty === 'easy' ? '⭐' : quiz.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                              </div>
                              <div className="text-xs text-purple-600 font-bold">Level</div>
                            </div>
                          </div>

                          {/* Enhanced Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                                  <FaUser className="text-white text-sm" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-800">
                                  {quiz.creator?.fullName || quiz.creator?.username || 'Expert Instructor'}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">Course Creator</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              {!isAuthenticated && (
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  className="text-xs text-orange-600 bg-gradient-to-r from-orange-50 to-orange-100 px-3 py-2 rounded-full font-bold border border-orange-200 flex items-center gap-1"
                                >
                                  🔐 Login
                                </motion.span>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Add to favorites logic
                                  }}
                                >
                                  <FaHeart className="text-gray-600 text-xs" />
                                </motion.button>

                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center group-hover:shadow-lg transition-all duration-300 shadow-md"
                                >
                                  <FaPlay className="text-white text-sm ml-0.5" />
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Hover Effects */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 via-transparent to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Enhanced Pagination */}
                {pagination.pages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mt-16 space-y-6"
                  >
                    {/* Pagination Info */}
                    <div className="text-center">
                      <p className="text-gray-600 font-medium">
                        Showing page <span className="font-bold text-primary-600">{pagination.page}</span> of{' '}
                        <span className="font-bold text-primary-600">{pagination.pages}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {pagination.total} total results
                      </p>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-lg hover:border-primary-200 transition-all duration-300 disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ x: pagination.page === 1 ? 0 : [-2, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          ←
                        </motion.div>
                        Previous
                      </motion.button>

                      <div className="flex space-x-2">
                        {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                          let pageNum;
                          if (pagination.pages <= 7) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 4) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.pages - 3) {
                            pageNum = pagination.pages - 6 + i;
                          } else {
                            pageNum = pagination.page - 3 + i;
                          }

                          return (
                            <motion.button
                              key={pageNum}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                              className={`w-14 h-14 rounded-2xl font-bold transition-all duration-300 ${pagination.page === pageNum
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl transform scale-110 border-2 border-primary-300'
                                : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-lg hover:border-primary-200'
                                }`}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        })}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.pages}
                        className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-lg hover:border-primary-200 transition-all duration-300 disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2"
                      >
                        Next
                        <motion.div
                          animate={{ x: pagination.page === pagination.pages ? 0 : [2, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          →
                        </motion.div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Enhanced Test Series Grid */}
            {currentView === 'test-series' && !testSeriesLoading && !testSeriesError && (
              <>
                {testSeries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="relative mx-auto mb-8"
                    >
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 via-purple-50 to-primary-50 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <FaListAlt className="text-5xl text-gray-400" />
                      </div>

                      {/* Floating Elements */}
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <FaTrophy className="text-white text-sm" />
                      </motion.div>

                      <motion.div
                        animate={{ y: [5, -5, 5] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                        className="absolute -bottom-2 -left-2 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
                      >
                        <FaUsers className="text-white text-xs" />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-3xl font-bold text-gray-800 mb-4">No Test Series Found</h3>
                      <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                        We couldn't find any test series matching your criteria.
                        Try adjusting your filters or search terms to discover comprehensive test series.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSearch('');
                            setSelectedCategory('');
                            setSelectedDifficulty('');
                          }}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                        >
                          <FaRocket className="text-sm" />
                          Clear All Filters
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentView('quizzes')}
                          className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:border-primary-300 hover:text-primary-600 transition-all duration-300 flex items-center gap-2"
                        >
                          <FaEye className="text-sm" />
                          Browse Individual Quizzes
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {testSeries.map((series, index) => (
                      <motion.div
                        key={series._id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{
                          y: -8,
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-white/20 hover:border-primary-200"
                      >
                        <Link to={`/test-series/${series._id}`} className="block h-full">
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          {/* Enhanced Header with gradient background */}
                          <div className="relative p-6 bg-gradient-to-br from-purple-500 via-purple-600 to-primary-600 text-white overflow-hidden">
                            {/* Animated Background Elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 opacity-20">
                              <motion.div
                                className="absolute top-4 right-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                              >
                                <FaListAlt className="text-6xl" />
                              </motion.div>
                            </div>

                            {/* Floating Particles */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="absolute top-2 left-4 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
                              <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                              <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-white/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                            </div>

                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  {/* Series Type Badge */}
                                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                                    <FaTrophy className="text-yellow-300 text-sm" />
                                    <span className="text-xs font-bold">TEST SERIES</span>
                                    {series.examType && (
                                      <>
                                        <span className="text-white/60">•</span>
                                        <span className="text-xs font-bold">{series.examType.toUpperCase()}</span>
                                      </>
                                    )}
                                  </div>

                                  <h3 className="text-xl font-bold mb-3 leading-tight line-clamp-2">
                                    {series.title}
                                  </h3>

                                  <p className="text-white/90 text-sm mb-4 line-clamp-2 leading-relaxed">
                                    {series.description || "Comprehensive test series designed to evaluate and improve your knowledge across multiple topics."}
                                  </p>

                                  {/* Enhanced Quick Stats */}
                                  <div className="flex items-center space-x-4 text-white/90">
                                    <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                                      <FaQuestionCircle className="text-sm" />
                                      <span className="text-sm font-semibold">{series.totalQuizzes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                                      <FaUsers className="text-sm" />
                                      <span className="text-sm font-semibold">{series.enrolledStudents?.length || 0}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Enhanced Series Icon */}
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className="relative"
                                >
                                  <div className="p-3 bg-gradient-to-br from-white/20 to-white/10 rounded-xl text-white shadow-lg backdrop-blur-sm">
                                    <FaListAlt className="text-xl" />
                                  </div>
                                  <div className="absolute -inset-1 bg-white/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </motion.div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Content */}
                          <div className="relative p-6 z-10">
                            {/* Enhanced Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              {series.category && (
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1"
                                >
                                  <FaTag className="text-xs" />
                                  {series.category}
                                </motion.span>
                              )}
                              {series.subject && (
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-3 py-2 rounded-xl text-xs font-bold border border-green-200 flex items-center gap-1"
                                >
                                  <FaBook className="text-xs" />
                                  {series.subject}
                                </motion.span>
                              )}
                              {series.tags && series.tags.slice(0, 2).map((tag, tagIndex) => (
                                <motion.span
                                  key={tagIndex}
                                  whileHover={{ scale: 1.05 }}
                                  className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-3 py-2 rounded-xl text-xs font-bold border border-purple-200"
                                >
                                  #{tag}
                                </motion.span>
                              ))}
                              {series.tags && series.tags.length > 2 && (
                                <span className="bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold">
                                  +{series.tags.length - 2}
                                </span>
                              )}
                            </div>

                            {/* Enhanced Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border border-blue-200">
                                <div className="text-2xl font-black text-blue-700 mb-1">{series.totalQuizzes || 0}</div>
                                <div className="text-xs text-blue-600 font-bold">Tests</div>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border border-green-200">
                                <div className="text-2xl font-black text-green-700 mb-1">{series.estimatedDuration || 0}</div>
                                <div className="text-xs text-green-600 font-bold">Minutes</div>
                              </div>
                            </div>

                            {/* Additional Stats Row */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center border border-purple-200">
                                <div className="text-2xl font-black text-purple-700 mb-1">{series.totalQuestions || 0}</div>
                                <div className="text-xs text-purple-600 font-bold">Questions</div>
                              </div>
                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center border border-orange-200">
                                <div className="text-2xl font-black text-orange-700 mb-1">{series.enrolledStudents?.length || 0}</div>
                                <div className="text-xs text-orange-600 font-bold">Enrolled</div>
                              </div>
                            </div>

                            {/* Enhanced Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <FaUser className="text-white text-sm" />
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-800">
                                    {series.creator?.fullName || series.creator?.username || 'Expert Team'}
                                  </div>
                                  <div className="text-xs text-gray-500 font-medium">Series Creator</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                {!isAuthenticated && (
                                  <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    className="text-xs text-orange-600 bg-gradient-to-r from-orange-50 to-orange-100 px-3 py-2 rounded-full font-bold border border-orange-200 flex items-center gap-1"
                                  >
                                    🔐 Login
                                  </motion.span>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      // Add to favorites logic
                                    }}
                                  >
                                    <FaHeart className="text-gray-600 text-xs" />
                                  </motion.button>

                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:shadow-lg transition-all duration-300 shadow-md"
                                  >
                                    <FaPlay className="text-white text-sm ml-0.5" />
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Hover Effects */}
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ExamsPage;