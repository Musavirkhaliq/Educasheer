import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/quizAPI';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { useAuth } from '../context/AuthContext';
import {
  FaSearch,
  FaFilter,
  FaBook,
  FaBookOpen,
  FaUser,
  FaTimes,
  FaChevronDown,
  FaTrophy,
  FaUsers,
  FaGraduationCap
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import QuizCard from '../components/QuizCard';
import TestSeriesCard from '../components/TestSeriesCard';

const ExamsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [testSeries, setTestSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testSeriesLoading, setTestSeriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [testSeriesError, setTestSeriesError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [currentView, setCurrentView] = useState('test-series'); // 'quizzes' or 'test-series'
  const [currentCategory, setCurrentCategory] = useState('all'); // 'all' or 'enrolled'
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    if (currentView === 'quizzes') {
      fetchQuizzes();
    } else {
      fetchTestSeries();
    }
  }, [currentView, currentCategory, search, selectedCategory, selectedType, selectedDifficulty, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await quizAPI.getQuizCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
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

  const handleQuizClick = (quiz) => {
    // Check if user is authenticated before allowing quiz access
    if (!isAuthenticated) {
      const redirectUrl = quiz.testSeries
        ? `/test-series/${quiz.testSeries._id}/quiz/${quiz._id}`
        : `/quiz/${quiz._id}`;
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

    // Navigate to quiz taking page
    if (quiz.testSeries) {
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            Exams & Quizzes
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
            Master your subjects with expertly crafted assessments.
            Track progress and achieve excellence.
          </p>
        </div>
      </div>

      {/* Search Bar & Stats Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Search for exams, quizzes, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] text-gray-700 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <FaBookOpen className="mx-auto text-purple-500 text-xl sm:text-2xl mb-2" />
            <div className="text-lg sm:text-xl font-bold">{pagination.total}+</div>
            <div className="text-gray-500 text-sm sm:text-base">Quizzes</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <FaTrophy className="mx-auto text-orange-500 text-xl sm:text-2xl mb-2" />
            <div className="text-lg sm:text-xl font-bold">{testSeries.length}+</div>
            <div className="text-gray-500 text-sm sm:text-base">Test Series</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <FaUsers className="mx-auto text-emerald-500 text-xl sm:text-2xl mb-2" />
            <div className="text-lg sm:text-xl font-bold">10k+</div>
            <div className="text-gray-500 text-sm sm:text-base">Students</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-8">
              {/* Content Type Toggle */}
              <div className="bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex w-full max-w-2xl shadow-inner overflow-x-auto">
                <button
                  onClick={() => setCurrentView('test-series')}
                  className={`flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 relative transform ${currentView === 'test-series'
                    ? 'bg-white text-slate-900 shadow-lg scale-105'
                    : 'text-slate-600 hover:text-slate-800 hover:scale-102'
                    }`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${currentView === 'test-series'
                    ? 'bg-gradient-to-br from-[#00bcd4] to-[#01427a] text-white'
                    : 'bg-slate-200 text-slate-600'
                    }`}>
                    <FaGraduationCap className="text-sm sm:text-lg" />
                  </div>
                  <div className="text-left min-w-0 hidden sm:block">
                    <div className="text-sm sm:text-lg font-bold truncate">Test Series</div>
                    <div className="text-xs opacity-70 truncate">Complete test packages</div>
                  </div>
                  <div className="text-left min-w-0 sm:hidden">
                    <div className="text-sm font-bold">Test Series</div>
                  </div>
                  {currentView === 'test-series' && (
                    <span className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white text-xs px-2 sm:px-3 py-1 rounded-full font-bold flex-shrink-0">
                      {testSeries.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentView('quizzes')}
                  className={`flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 relative transform ${currentView === 'quizzes'
                    ? 'bg-white text-slate-900 shadow-lg scale-105'
                    : 'text-slate-600 hover:text-slate-800 hover:scale-102'
                    }`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${currentView === 'quizzes'
                    ? 'bg-gradient-to-br from-[#00bcd4] to-[#01427a] text-white'
                    : 'bg-slate-200 text-slate-600'
                    }`}>
                    <FaBookOpen className="text-sm sm:text-lg" />
                  </div>
                  <div className="text-left min-w-0 hidden sm:block">
                    <div className="text-sm sm:text-lg font-bold truncate">Individual Quizzes</div>
                    <div className="text-xs opacity-70 truncate">Single quiz sessions</div>
                  </div>
                  <div className="text-left min-w-0 sm:hidden">
                    <div className="text-sm font-bold">Quizzes</div>
                  </div>
                  {currentView === 'quizzes' && (
                    <span className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white text-xs px-2 sm:px-3 py-1 rounded-full font-bold flex-shrink-0">
                      {pagination.total}
                    </span>
                  )}
                </button>
              </div>

              {/* Enrollment Category Toggle */}
              {isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex w-full max-w-lg border-2 border-blue-200 shadow-inner">
                  <button
                    onClick={() => setCurrentCategory('all')}
                    className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm transform ${currentCategory === 'all'
                      ? 'bg-white text-blue-900 shadow-lg scale-105'
                      : 'text-blue-600 hover:text-blue-800 hover:scale-102'
                      }`}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 ${currentCategory === 'all'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                      : 'bg-blue-200 text-blue-600'
                      }`}>
                      <FaBook className="text-xs sm:text-sm" />
                    </div>
                    <span className="truncate">All {currentView === 'test-series' ? 'Test Series' : 'Quizzes'}</span>
                  </button>
                  <button
                    onClick={() => setCurrentCategory('enrolled')}
                    className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm transform ${currentCategory === 'enrolled'
                      ? 'bg-white text-blue-900 shadow-lg scale-105'
                      : 'text-blue-600 hover:text-blue-800 hover:scale-102'
                      }`}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 ${currentCategory === 'enrolled'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                      : 'bg-blue-200 text-blue-600'
                      }`}>
                      <FaUser className="text-xs sm:text-sm" />
                    </div>
                    <span className="truncate">Enrolled {currentView === 'test-series' ? 'Test Series' : 'Quizzes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Filter Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between text-white group"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FaFilter className="text-lg sm:text-xl" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold truncate">Filters & Search</h3>
                    <p className="text-white/80 text-xs sm:text-sm truncate">Refine your search results</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {(selectedCategory || selectedType || selectedDifficulty) && (
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      Active
                    </span>
                  )}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}>
                    <FaChevronDown className="text-sm sm:text-lg" />
                  </div>
                </div>
              </button>
            </div>

            {/* Collapsible Filter Content */}
            <motion.div
              initial={false}
              animate={{
                height: showFilters ? 'auto' : 0,
                opacity: showFilters ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FaBook className="text-white text-xs" />
                      </div>
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all duration-300 text-sm sm:text-base"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id || 'uncategorized'} value={category.name}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter (only for quizzes) */}
                  {currentView === 'quizzes' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <FaTrophy className="text-white text-xs" />
                        </div>
                        Type
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all duration-300 text-sm sm:text-base"
                      >
                        <option value="">All Types</option>
                        <option value="exam">Exams</option>
                        <option value="quiz">Quizzes</option>
                      </select>
                    </div>
                  )}

                  {/* Difficulty Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <FaGraduationCap className="text-white text-xs" />
                      </div>
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all duration-300 text-sm sm:text-base"
                    >
                      <option value="">All Levels</option>
                      <option value="easy">Easy ⭐</option>
                      <option value="medium">Medium ⭐⭐</option>
                      <option value="hard">Hard ⭐⭐⭐</option>
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedCategory || selectedType || selectedDifficulty) && (
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <FaFilter className="text-white text-xs" />
                      </div>
                      Active Filters
                    </h4>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 border-blue-200">
                          📂 <span className="truncate max-w-24 sm:max-w-none">{selectedCategory}</span>
                          <button
                            onClick={() => setSelectedCategory('')}
                            className="text-blue-600 hover:text-blue-800 ml-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedType && (
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 border-emerald-200">
                          {selectedType === 'exam' ? '🏆' : '📚'} {selectedType}
                          <button
                            onClick={() => setSelectedType('')}
                            className="text-emerald-600 hover:text-emerald-800 ml-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedDifficulty && (
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 border-amber-200">
                          ⚡ {selectedDifficulty}
                          <button
                            onClick={() => setSelectedDifficulty('')}
                            className="text-amber-600 hover:text-amber-800 ml-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start justify-between mb-8 sm:mb-12 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-xl backdrop-blur-sm"
        >
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${currentView === 'test-series'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                {currentView === 'test-series' ? (
                  <FaGraduationCap className="text-white text-lg sm:text-xl" />
                ) : (
                  <FaBookOpen className="text-white text-lg sm:text-xl" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">
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
                </h2>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-slate-600">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${currentView === 'test-series' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}></div>
                <span className="font-medium text-sm sm:text-base lg:text-lg">
                  {currentView === 'test-series' ? (
                    testSeriesLoading ? 'Loading...' : `${testSeries.length} test series found`
                  ) : (
                    loading ? 'Loading...' : `${pagination.total} results found`
                  )}
                </span>
              </div>
              {(selectedCategory || selectedType || selectedDifficulty) && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2.5 sm:px-3 py-1 rounded-full border border-purple-200">
                  <FaFilter className="text-xs" />
                  <span className="font-medium">Filtered results</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {((currentView === 'quizzes' && loading) || (currentView === 'test-series' && testSeriesLoading)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 relative mb-8">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Content</h3>
            <p className="text-slate-600">Preparing {currentView === 'test-series' ? 'test series' : 'quizzes'} for you...</p>
          </motion.div>
        )}

        {/* Error State */}
        {((currentView === 'quizzes' && error) || (currentView === 'test-series' && testSeriesError)) && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
            <FaTimes className="text-rose-600 text-4xl mx-auto mb-4" />
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
                <div className="relative mx-auto mb-8">
                  <div className="w-40 h-40 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white">
                    <FaBookOpen className="text-6xl text-blue-400" />
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg"></div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  {currentCategory === 'enrolled' ? 'No Enrolled Quizzes Yet' : 'No Quizzes Found'}
                </h3>
                <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                  {currentCategory === 'enrolled'
                    ? 'You haven\'t enrolled in any test series yet. Browse available test series to get started on your learning journey.'
                    : 'No quizzes match your current filters. Try adjusting your search criteria or browse all available content.'
                  }
                </p>
                {currentCategory === 'enrolled' && (
                  <button
                    onClick={() => setCurrentCategory('all')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Browse All Quizzes
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                {quizzes.map((quiz, index) => (
                  <QuizCard
                    key={quiz._id}
                    quiz={quiz}
                    index={index}
                    onQuizClick={handleQuizClick}
                    getDifficultyColor={getDifficultyColor}
                    isAuthenticated={isAuthenticated}
                    currentCategory={currentCategory}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentView === 'test-series' && !testSeriesLoading && !testSeriesError && (
          <>
            {testSeries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="relative mx-auto mb-8">
                  <div className="w-40 h-40 bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-100 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white">
                    <FaGraduationCap className="text-6xl text-emerald-400" />
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <FaTrophy className="text-white text-xs" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg"></div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  {currentCategory === 'enrolled' ? 'No Enrolled Test Series Yet' : 'No Test Series Found'}
                </h3>
                <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                  {currentCategory === 'enrolled'
                    ? 'You haven\'t enrolled in any test series yet. Browse available test series to start your comprehensive learning journey.'
                    : 'No test series match your current filters. Try adjusting your search criteria or browse all available content.'
                  }
                </p>
                {currentCategory === 'enrolled' && (
                  <button
                    onClick={() => setCurrentCategory('all')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Browse All Test Series
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                {testSeries.map((ts, index) => (
                  <TestSeriesCard
                    key={ts._id}
                    testSeries={ts}
                    index={index}
                    getDifficultyColor={getDifficultyColor}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExamsPage;