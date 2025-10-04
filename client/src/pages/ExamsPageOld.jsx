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
  FaLayerGroup,
  FaFire,
  FaChartLine,

  FaRocket,
  FaEye,
  FaHeart
} from 'react-icons/fa';
import { motion } from 'framer-motion';

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
  const [currentView, setCurrentView] = useState('test-series'); // 'quizzes' or 'test-series'
  const [currentCategory, setCurrentCategory] = useState('all'); // 'all' or 'enrolled'

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
  }, [search, selectedCategory, selectedType, selectedTags, selectedDifficulty, pagination.page, currentView, currentCategory]);

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

      let response;
      if (currentCategory === 'enrolled' && isAuthenticated) {
        response = await quizAPI.getEnrolledQuizzes(params);
      } else {
        response = await quizAPI.getPublishedQuizzes(params);
      }
      
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

      let response;
      if (currentCategory === 'enrolled' && isAuthenticated) {
        response = await testSeriesAPI.getEnrolledTestSeries(params);
      } else {
        response = await testSeriesAPI.getPublishedTestSeries(params);
      }
      
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

    // For quizzes from test series, check enrollment status
    if (quiz.testSeries && !quiz.isEnrolledInTestSeries && currentCategory === 'all') {
      // Show quiz details but redirect to test series enrollment
      navigate(`/test-series/${quiz.testSeries._id}`, { 
        state: { 
          message: `You need to enroll in "${quiz.testSeries.title}" test series to access this quiz.`,
          highlightQuiz: quiz._id
        }
      });
      return;
    }

    // Navigate to quiz taking page based on context
    if (quiz.course) {
      navigate(`/courses/${quiz.course._id}/quizzes/${quiz._id}`);
    } else if (quiz.testSeries) {
      navigate(`/test-series/${quiz.testSeries._id}/quiz/${quiz._id}`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200';
      case 'medium': return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200';
      case 'hard': return 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border border-rose-200';
      default: return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Hero Section */}
      <div className="relative bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Main Title */}
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-6 text-slate-600"
              >
                <FaRocket className="text-blue-500" />
                <span className="font-medium text-sm">Boost Your Knowledge</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900 leading-tight">
                Exams & Quizzes
              </h1>
              <p className="text-lg md:text-xl mb-8 text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Master your subjects with expertly crafted assessments. Track progress and achieve excellence.
              </p>
            </div>

            {/* Modern Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto relative mb-8"
            >
              <div className="relative">
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for exams, quizzes, topics..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 text-slate-600"
            >
              <div className="flex items-center gap-2">
                <FaBookOpen className="text-blue-500" />
                <span className="font-medium">{pagination.total}+ Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTrophy className="text-amber-500" />
                <span className="font-medium">{testSeries.length}+ Test Series</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-emerald-500" />
                <span className="font-medium">10k+ Students</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Modern View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col items-center justify-center gap-6">
              {/* View Toggle Buttons - Centered */}
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Content Type Toggle */}
                <div className="bg-slate-100 rounded-xl p-1 flex">
                  <button
                    onClick={() => setCurrentView('test-series')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 relative ${currentView === 'test-series'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                      }`}
                  >
                    <FaListAlt className="text-sm" />
                    <span>Test Series</span>
                    {currentView === 'test-series' && (
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full ml-1">
                        {testSeries.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentView('quizzes')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 relative ${currentView === 'quizzes'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                      }`}
                  >
                    <FaBookOpen className="text-sm" />
                    <span>Individual Quizzes</span>
                    {currentView === 'quizzes' && (
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full ml-1">
                        {pagination.total}
                      </span>
                    )}
                  </button>
                </div>

                {/* Enrollment Category Toggle */}
                {isAuthenticated && (
                  <div className="bg-blue-50 rounded-xl p-1 flex border border-blue-200">
                    <button
                      onClick={() => setCurrentCategory('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm ${currentCategory === 'all'
                        ? 'bg-white text-blue-900 shadow-sm'
                        : 'text-blue-600 hover:text-blue-800'
                        }`}
                    >
                      <FaBook className="text-xs" />
                      <span>All {currentView === 'test-series' ? 'Test Series' : 'Quizzes'}</span>
                    </button>
                    <button
                      onClick={() => setCurrentCategory('enrolled')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm ${currentCategory === 'enrolled'
                        ? 'bg-white text-blue-900 shadow-sm'
                        : 'text-blue-600 hover:text-blue-800'
                        }`}
                    >
                      <FaUser className="text-xs" />
                      <span>Enrolled {currentView === 'test-series' ? 'Test Series' : 'Quizzes'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions - Centered below */}
              {/* <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <FaFire className="text-orange-500" />
                  <span className="text-sm font-medium">Popular Today</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FaChartLine className="text-emerald-500" />
                  <span className="text-sm font-medium">Trending</span>
                </div>
              </div> */}
            </div>
          </div>
        </motion.div>

        {/* Top Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaFilter className="text-white text-sm" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Filters & Search</h3>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${showFilters
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <FaFilter className="text-sm" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Collapsible Filters */}
            <motion.div
              initial={false}
              animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-200">
                {/* Categories Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FaTag className="text-indigo-500" />
                    Categories
                  </h4>
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <FaSpinner className="animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => handleCategorySelect('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === ''
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        All Categories ({categories.reduce((sum, cat) => sum + cat.count, 0)})
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category._id || 'uncategorized'}
                          onClick={() => handleCategorySelect(category.name)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.name
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          {category.name} ({category.count})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Type</h4>
                  <div className="space-y-2">
                    {[
                      { value: '', label: 'All Types', icon: FaBook },
                      { value: 'Topic Test', label: 'Topic Tests', icon: FaBookOpen },
                      { value: 'Subject Test', label: 'Subject Tests', icon: FaGraduationCap },
                      { value: 'Multi Subject', label: 'Multi Subject', icon: FaLayerGroup },
                      { value: 'Full Test', label: 'Full Tests', icon: FaTrophy }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleTypeSelect(type.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedType === type.value
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <type.icon className="text-xs" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Difficulty</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleDifficultySelect('')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedDifficulty === ''
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      All Levels
                    </button>
                    {['easy', 'medium', 'hard'].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => handleDifficultySelect(difficulty)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedDifficulty === difficulty
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <span className="capitalize">{difficulty}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                          difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                          {difficulty === 'easy' ? '⭐' : difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Popular Tags</h4>
                  {tagsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <FaSpinner className="animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tags.slice(0, 10).map((tag) => (
                        <button
                          key={tag.name}
                          onClick={() => handleTagSelect(tag.name)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedTags.includes(tag.name)
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          #{tag.name} ({tag.count})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {(selectedTags.length > 0 || selectedDifficulty || selectedCategory || selectedType) && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        📂 {selectedCategory}
                        <button onClick={() => handleCategorySelect('')} className="text-indigo-600 hover:text-indigo-800 ml-1">×</button>
                      </span>
                    )}
                    {selectedType && (
                      <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedType === 'exam' ? '🏆' : '📚'} {selectedType}
                        <button onClick={() => handleTypeSelect('')} className="text-purple-600 hover:text-purple-800 ml-1">×</button>
                      </span>
                    )}
                    {selectedDifficulty && (
                      <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        ⚡ {selectedDifficulty}
                        <button onClick={() => handleDifficultySelect('')} className="text-amber-600 hover:text-amber-800 ml-1">×</button>
                      </span>
                    )}
                    {selectedTags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                        #{tag}
                        <button onClick={() => handleTagSelect(tag)} className="text-emerald-600 hover:text-emerald-800 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          {/* Modern Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-slate-800 mb-2"
              >
                {currentView === 'test-series' ? (
                  currentCategory === 'enrolled' && isAuthenticated ? 
                    (selectedCategory ? `Enrolled ${selectedCategory} Test Series` : 'Enrolled Test Series') :
                    (selectedCategory ? `${selectedCategory} Test Series` : 'Available Test Series')
                ) : (
                  currentCategory === 'enrolled' && isAuthenticated ?
                    (selectedCategory ? `Enrolled ${selectedCategory} ` : 'Enrolled ') +
                      (selectedType ? (selectedType === 'exam' ? 'Exams' : 'Quizzes') : 'Quizzes') :
                    (selectedCategory ? `${selectedCategory} ` : '') +
                      (selectedType ? (selectedType === 'exam' ? 'Exams' : 'Quizzes') : 'Exams & Quizzes')
                )}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 text-slate-600"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">
                    {currentView === 'test-series' ? (
                      testSeriesLoading ? 'Loading...' : `${testSeries.length} test series found`
                    ) : (
                      loading ? 'Loading...' : `${pagination.total} results found`
                    )}
                  </span>
                </div>

                {(selectedCategory || selectedType || selectedDifficulty || selectedTags.length > 0) && (
                  <div className="flex items-center gap-2 text-sm">
                    <FaFilter className="text-blue-500" />
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
              <span className="text-sm font-medium text-slate-600">Sort by:</span>
              <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Most Popular</option>
                <option>Newest First</option>
                <option>Difficulty: Easy to Hard</option>
                <option>Difficulty: Hard to Easy</option>
                <option>Duration: Short to Long</option>
                <option>Duration: Long to Short</option>
              </select>
            </motion.div>
          </motion.div>

          {/* Modern Loading State */}
          {((currentView === 'quizzes' && loading) || (currentView === 'test-series' && testSeriesLoading)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative mb-8">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              </div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Loading Content
                </h3>
                <p className="text-slate-600 mb-4">
                  Preparing {currentView === 'test-series' ? 'test series' : 'quizzes'} for you...
                </p>

                {/* Loading Progress Dots */}
                <div className="flex items-center justify-center space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
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
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
                <FaBook className="text-rose-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-rose-800 mb-2">Something went wrong</h3>
              <p className="text-rose-600 mb-6">{currentView === 'test-series' ? testSeriesError : error}</p>
              <button
                onClick={currentView === 'test-series' ? fetchTestSeries : fetchQuizzes}
                className="bg-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors"
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
                    <h3 className="text-2xl font-semibold text-slate-800 mb-4">No Content Found</h3>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                      We couldn't find any {currentView === 'test-series' ? 'test series' : 'quizzes'} matching your criteria.
                      Try adjusting your filters or search terms.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={() => {
                          setSearch('');
                          setSelectedCategory('');
                          setSelectedType('');
                          setSelectedTags([]);
                          setSelectedDifficulty('');
                        }}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <FaRocket className="text-sm" />
                        Clear All Filters
                      </button>

                      <button
                        onClick={() => setCurrentView(currentView === 'quizzes' ? 'test-series' : 'quizzes')}
                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <FaEye className="text-sm" />
                        Browse {currentView === 'quizzes' ? 'Test Series' : 'Quizzes'}
                      </button>
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
                        y: -4,
                        transition: { duration: 0.2 }
                      }}
                      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-slate-200 hover:border-indigo-300 h-full flex flex-col hover:scale-[1.02]"
                      onClick={() => handleQuizClick(quiz)}
                    >
                      {/* Header with beautiful gradient */}
                      <div className={`relative p-6 ${
                        quiz.quizType === 'Topic Test'
                          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-l-blue-400'
                          : quiz.quizType === 'Subject Test'
                          ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-l-4 border-l-green-400'
                          : quiz.quizType === 'Multi Subject'
                          ? 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border-l-4 border-l-purple-400'
                          : quiz.quizType === 'Full Test'
                          ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-l-4 border-l-amber-400'
                          : 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 border-l-4 border-l-gray-400'
                        }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            {/* Quiz Type Badge */}
                            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 ${
                              quiz.quizType === 'Topic Test'
                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                : quiz.quizType === 'Subject Test'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                : quiz.quizType === 'Multi Subject'
                                ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200'
                                : quiz.quizType === 'Full Test'
                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200'
                                : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
                              }`}>
                              {quiz.quizType === 'Topic Test' ? (
                                <>
                                  <FaBookOpen className="text-blue-600 text-sm" />
                                  <span className="text-xs font-bold">TOPIC TEST</span>
                                </>
                              ) : quiz.quizType === 'Subject Test' ? (
                                <>
                                  <FaGraduationCap className="text-green-600 text-sm" />
                                  <span className="text-xs font-bold">SUBJECT TEST</span>
                                </>
                              ) : quiz.quizType === 'Multi Subject' ? (
                                <>
                                  <FaLayerGroup className="text-purple-600 text-sm" />
                                  <span className="text-xs font-bold">MULTI SUBJECT</span>
                                </>
                              ) : quiz.quizType === 'Full Test' ? (
                                <>
                                  <FaTrophy className="text-amber-600 text-sm" />
                                  <span className="text-xs font-bold">FULL TEST</span>
                                </>
                              ) : (
                                <>
                                  <FaQuestionCircle className="text-gray-600 text-sm" />
                                  <span className="text-xs font-bold">{quiz.quizType?.toUpperCase() || 'TEST'}</span>
                                </>
                              )}
                            </div>

                            <h3 className={`font-bold mb-3 leading-tight ${quiz.title.length > 50
                              ? 'text-base line-clamp-3 min-h-[4.5rem]'
                              : quiz.title.length > 30
                                ? 'text-lg line-clamp-2 min-h-[3.5rem]'
                                : 'text-xl min-h-[2.5rem]'
                              } ${
                                quiz.quizType === 'Topic Test' ? 'text-blue-900' 
                                : quiz.quizType === 'Subject Test' ? 'text-green-900'
                                : quiz.quizType === 'Multi Subject' ? 'text-purple-900'
                                : quiz.quizType === 'Full Test' ? 'text-amber-900'
                                : 'text-gray-900'
                              }`}>
                              {quiz.title}
                            </h3>

                            {/* Quick Stats */}
                            <div className="flex items-center space-x-4 text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <FaQuestionCircle className="text-sm" />
                                <span className="text-sm font-medium">{quiz.questions?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FaClock className="text-sm" />
                                <span className="text-sm font-medium">{quiz.timeLimit}m</span>
                              </div>
                            </div>
                          </div>

                          {/* Type Icon */}
                          <div className="ml-4">
                            <div className={`p-3 rounded-xl border ${
                              quiz.quizType === 'Topic Test'
                                ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border-blue-200'
                                : quiz.quizType === 'Subject Test'
                                ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-green-200'
                                : quiz.quizType === 'Multi Subject'
                                ? 'bg-gradient-to-br from-purple-100 to-violet-100 text-purple-700 border-purple-200'
                                : quiz.quizType === 'Full Test'
                                ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 border-amber-200'
                                : 'bg-gradient-to-br from-gray-100 to-slate-100 text-gray-700 border-gray-200'
                              }`}>
                              {quiz.quizType === 'Topic Test' ? (
                                <FaBookOpen className="text-xl" />
                              ) : quiz.quizType === 'Subject Test' ? (
                                <FaGraduationCap className="text-xl" />
                              ) : quiz.quizType === 'Multi Subject' ? (
                                <FaLayerGroup className="text-xl" />
                              ) : quiz.quizType === 'Full Test' ? (
                                <FaTrophy className="text-xl" />
                              ) : (
                                <FaQuestionCircle className="text-xl" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content - Flexible grow area */}
                      <div className="relative p-6 flex-grow flex flex-col">
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
                          {quiz.description && quiz.description.length > 120
                            ? `${quiz.description.substring(0, 120)}...`
                            : quiz.description || "Master key concepts with this expertly designed assessment. Test your knowledge and improve your skills."}
                        </p>

                        {/* Detailed Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3 text-center border border-indigo-200">
                            <div className="text-lg font-bold text-indigo-800">{quiz.questions?.length || 0}</div>
                            <div className="text-xs text-indigo-600 font-medium">Questions</div>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 text-center border border-emerald-200">
                            <div className="text-lg font-bold text-emerald-800">{quiz.timeLimit || 0}</div>
                            <div className="text-xs text-emerald-600 font-medium">Minutes</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center border border-purple-200">
                            <div className="text-lg font-bold text-purple-800">
                              {quiz.difficulty === 'easy' ? '⭐' : quiz.difficulty === 'medium' ? '⭐⭐' : quiz.difficulty === 'hard' ? '⭐⭐⭐' : '⭐'}
                            </div>
                            <div className="text-xs text-purple-600 font-medium">Level</div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                          {quiz.category && (
                            <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200 flex items-center gap-1">
                              <FaTag className="text-xs" />
                              {quiz.category}
                            </span>
                          )}
                          {quiz.difficulty && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                              {quiz.difficulty}
                            </span>
                          )}
                          {quiz.tags && quiz.tags.slice(0, 1).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200"
                            >
                              #{tag}
                            </span>
                          ))}
                          {quiz.tags && quiz.tags.length > 1 && (
                            <span className="bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                              +{quiz.tags.length - 1}
                            </span>
                          )}
                        </div>

                        {/* Additional Details */}
                        <div className="mb-4 space-y-2">
                          {quiz.course && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaBook className="text-xs" />
                              <span>Course: {quiz.course.title || 'Course Material'}</span>
                            </div>
                          )}
                          {quiz.testSeries && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaListAlt className="text-xs" />
                              <span>Series: {quiz.testSeries.title || 'Test Series'}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FaUsers className="text-xs" />
                            <span>{Math.floor(Math.random() * 500) + 50} students attempted</span>
                          </div>
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                              <FaUser className="text-slate-600 text-sm" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800 truncate max-w-[120px]">
                                {quiz.creator?.fullName || quiz.creator?.username || 'Expert Instructor'}
                              </div>
                              <div className="text-xs text-slate-500">Course Creator</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {!isAuthenticated && (
                              <span className="text-xs text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full font-semibold border border-amber-200">
                                🔐 Login
                              </span>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                className="w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 rounded-full flex items-center justify-center transition-all duration-200 border border-rose-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add to favorites logic
                                }}
                              >
                                <FaHeart className="text-rose-600 text-xs" />
                              </button>

                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                quiz.quizType === 'Topic Test'
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                                  : quiz.quizType === 'Subject Test'
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                  : quiz.quizType === 'Multi Subject'
                                  ? 'bg-gradient-to-br from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600'
                                  : quiz.quizType === 'Full Test'
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                  : 'bg-gradient-to-br from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600'
                                } shadow-lg hover:shadow-xl`}>
                                <FaPlay className="text-white text-sm ml-0.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Modern Pagination */}
              {pagination.pages > 1 && (
                <div className="flex flex-col items-center mt-12 space-y-4">
                  {/* Pagination Info */}
                  <div className="text-center">
                    <p className="text-slate-600 font-medium">
                      Showing page <span className="font-semibold text-blue-600">{pagination.page}</span> of{' '}
                      <span className="font-semibold text-blue-600">{pagination.pages}</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {pagination.total} total results
                    </p>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:hover:bg-white flex items-center gap-2"
                    >
                      ← Previous
                    </button>

                    <div className="flex space-x-1">
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
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${pagination.page === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:hover:bg-white flex items-center gap-2"
                    >
                      Next →
                    </button>
                  </div>
                </div>
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
                    <h3 className="text-2xl font-semibold text-slate-800 mb-4">No Test Series Found</h3>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                      We couldn't find any test series matching your criteria.
                      Try adjusting your filters or search terms to discover comprehensive test series.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={() => {
                          setSearch('');
                          setSelectedCategory('');
                          setSelectedDifficulty('');
                        }}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <FaRocket className="text-sm" />
                        Clear All Filters
                      </button>

                      <button
                        onClick={() => setCurrentView('quizzes')}
                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <FaEye className="text-sm" />
                        Browse Individual Quizzes
                      </button>
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
                        y: -4,
                        transition: { duration: 0.2 }
                      }}
                      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-slate-200 hover:border-purple-300 h-full hover:scale-[1.02]"
                    >
                      <Link to={`/test-series/${series._id}`} className="block h-full flex flex-col">
                        {/* Header with beautiful gradient */}
                        <div className="relative p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-l-4 border-l-purple-400">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {/* Series Type Badge */}
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-full px-3 py-1 mb-3 border border-purple-200">
                                <FaListAlt className="text-purple-600 text-sm" />
                                <span className="text-xs font-bold">TEST SERIES</span>
                                {series.examType && (
                                  <>
                                    <span className="text-purple-400">•</span>
                                    <span className="text-xs font-bold">{series.examType.toUpperCase()}</span>
                                  </>
                                )}
                              </div>

                              <h3 className={`font-bold mb-3 leading-tight text-purple-900 ${series.title.length > 50
                                ? 'text-base line-clamp-3 min-h-[4.5rem]'
                                : series.title.length > 30
                                  ? 'text-lg line-clamp-2 min-h-[3.5rem]'
                                  : 'text-xl min-h-[2.5rem]'
                                }`}>
                                {series.title}
                              </h3>

                              {/* Quick Stats */}
                              <div className="flex items-center space-x-4 text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <FaQuestionCircle className="text-sm" />
                                  <span className="text-sm font-medium">{series.totalQuizzes || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FaUsers className="text-sm" />
                                  <span className="text-sm font-medium">{series.enrolledStudentsCount || 0}</span>
                                </div>
                              </div>
                            </div>
                      
                            {/* Series Icon */}
                            <div className="ml-4">
                              <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 rounded-xl border border-purple-200">
                                <FaListAlt className="text-xl" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content - Flexible grow area */}
                        <div className="relative p-6 flex-grow flex flex-col">
                          <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
                            {series.description && series.description.length > 120
                              ? `${series.description.substring(0, 120)}...`
                              : series.description || "Comprehensive test series designed to evaluate and improve your knowledge across multiple topics with detailed analytics."}
                          </p>

                          {/* Detailed Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 text-center border border-purple-200">
                              <div className="text-lg font-bold text-purple-800">{series.totalQuizzes || 0}</div>
                              <div className="text-xs text-purple-600 font-medium">Tests</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 text-center border border-emerald-200">
                              <div className="text-lg font-bold text-emerald-800">{series.totalQuestions || Math.floor(Math.random() * 200) + 50}</div>
                              <div className="text-xs text-emerald-600 font-medium">Questions</div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 text-center border border-amber-200">
                              <div className="text-lg font-bold text-amber-800">{series.estimatedDuration || Math.floor(Math.random() * 300) + 120}</div>
                              <div className="text-xs text-amber-600 font-medium">Minutes</div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                            {series.category && (
                              <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200 flex items-center gap-1">
                                <FaTag className="text-xs" />
                                {series.category}
                              </span>
                            )}
                            {series.subject && (
                              <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200 flex items-center gap-1">
                                <FaBook className="text-xs" />
                                {series.subject}
                              </span>
                            )}
                            {series.tags && series.tags.slice(0, 1).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200"
                              >
                                #{tag}
                              </span>
                            ))}
                            {series.tags && series.tags.length > 1 && (
                              <span className="bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                                +{series.tags.length - 1}
                              </span>
                            )}
                          </div>

                          {/* Additional Details */}
                          <div className="mb-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaTrophy className="text-xs" />
                              <span>Difficulty: {series.difficulty || 'Mixed Levels'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaUsers className="text-xs" />
                              <span>{series.enrolledStudentsCount || 0} students enrolled</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FaChartLine className="text-xs" />
                              <span>Avg. Score: {Math.floor(Math.random() * 30) + 70}%</span>
                            </div>
                          </div>

                          {/* Footer - Fixed at bottom */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                <FaUser className="text-slate-600 text-sm" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800 truncate max-w-[120px]">
                                  {series.creator?.fullName || series.creator?.username || 'Expert Team'}
                                </div>
                                <div className="text-xs text-slate-500">Series Creator</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {!isAuthenticated && (
                                <span className="text-xs text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full font-semibold border border-amber-200">
                                  🔐 Login
                                </span>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                  className="w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 rounded-full flex items-center justify-center transition-all duration-200 border border-rose-200"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Add to favorites logic
                                  }}
                                >
                                  <FaHeart className="text-rose-600 text-xs" />
                                </button>

                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl">
                                  <FaPlay className="text-white text-sm ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
  );
};

export default ExamsPage;