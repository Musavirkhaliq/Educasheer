import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/quizAPI';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { useAuth } from '../context/AuthContext';
import {
  FaSearch,
  FaFilter,
  FaBookOpen,
  FaTimes,
  FaChevronDown,
  FaGraduationCap,
  FaCheckCircle,
  FaInfoCircle,
  FaEye,
  FaUserCheck
} from 'react-icons/fa';
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
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Exams & Quizzes</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl">
            Master your subjects with expertly crafted assessments. Track progress and achieve excellence.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm p-4 -mt-6 sm:-mt-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for exams, quizzes, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] text-gray-700"
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm p-2 overflow-x-auto">
          <nav className="flex flex-nowrap min-w-max sm:flex-wrap gap-1">
            <button
              onClick={() => setCurrentView('test-series')}
              className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${currentView === 'test-series'
                ? 'bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/20'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FaGraduationCap className={`${currentView === 'test-series' ? 'text-[#00bcd4]' : 'text-gray-500'}`} />
              Test Series
            </button>

            <button
              onClick={() => setCurrentView('quizzes')}
              className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${currentView === 'quizzes'
                ? 'bg-[#00bcd4]/10 text-[#00bcd4] border border-[#00bcd4]/20'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FaBookOpen className={`${currentView === 'quizzes' ? 'text-[#00bcd4]' : 'text-gray-500'}`} />
              Individual Quizzes
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setCurrentCategory(currentCategory === 'all' ? 'enrolled' : 'all')}
                className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 relative ${currentCategory === 'enrolled'
                  ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                  }`}
              >
                {currentCategory === 'enrolled' ? (
                  <FaUserCheck className="text-green-600" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
                <span className="font-semibold">
                  {currentCategory === 'enrolled' ? 'My Enrolled Content' : 'Browse All Content'}
                </span>
                {currentCategory === 'enrolled' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Enrolled Mode Banner */}
        {currentCategory === 'enrolled' && isAuthenticated && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUserCheck className="text-green-600 text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-1">
                  Viewing Your Enrolled {currentView === 'test-series' ? 'Test Series' : 'Quizzes'}
                </h3>
                <p className="text-green-700 text-sm">
                  {currentView === 'test-series'
                    ? 'These are the test series you have enrolled in. You can access all quizzes within these series.'
                    : 'These are the quizzes from your enrolled test series. Continue your learning journey!'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <FaInfoCircle className="text-sm" />
                <span className="text-xs font-medium">Enrolled Only</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between text-gray-700 hover:text-[#00bcd4] transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaFilter className="text-[#00bcd4]" />
                <span className="font-medium">Filters</span>
                {(selectedCategory || selectedType || selectedDifficulty) && (
                  <span className="bg-[#00bcd4]/10 text-[#00bcd4] px-2 py-1 rounded-full text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
              <FaChevronDown className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="exam">Exams</option>
                      <option value="quiz">Quizzes</option>
                    </select>
                  </div>
                )}

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || selectedType || selectedDifficulty) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory('')}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedType && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {selectedType}
                        <button
                          onClick={() => setSelectedType('')}
                          className="text-green-600 hover:text-green-800 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedDifficulty && (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        {selectedDifficulty}
                        <button
                          onClick={() => setSelectedDifficulty('')}
                          className="text-yellow-600 hover:text-yellow-800 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 relative inline-block">
              {currentView === 'test-series' ? (
                currentCategory === 'enrolled' && isAuthenticated ?
                  'My Enrolled Test Series' : 'Available Test Series'
              ) : (
                currentCategory === 'enrolled' && isAuthenticated ?
                  'My Enrolled Quizzes' : 'Available Exams & Quizzes'
              )}
              <span className={`absolute bottom-0 left-0 w-1/3 h-1 rounded-full ${currentCategory === 'enrolled' ? 'bg-green-500' : 'bg-[#00bcd4]'
                }`}></span>
            </h2>

            {currentCategory === 'enrolled' && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                <FaCheckCircle className="text-xs" />
                <span>Enrolled</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {currentView === 'test-series' ? (
                testSeriesLoading ? 'Loading...' : `${testSeries.length} ${currentCategory === 'enrolled' ? 'enrolled ' : ''}test series found`
              ) : (
                loading ? 'Loading...' : `${pagination.total} ${currentCategory === 'enrolled' ? 'enrolled ' : ''}results found`
              )}
            </div>

            {currentCategory === 'enrolled' && isAuthenticated && (
              <button
                onClick={() => setCurrentCategory('all')}
                className="text-sm text-[#00bcd4] hover:text-[#01427a] font-medium flex items-center gap-1 transition-colors"
              >
                <FaEye className="text-xs" />
                Browse All
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {((currentView === 'quizzes' && loading) || (currentView === 'test-series' && testSeriesLoading)) && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4] mb-4"></div>
              <p className="text-gray-600">Loading {currentView === 'test-series' ? 'test series' : 'quizzes'}...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {((currentView === 'quizzes' && error) || (currentView === 'test-series' && testSeriesError)) && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-sm" role="alert">
            <div className="flex items-center gap-3">
              <FaTimes className="h-6 w-6 text-red-500" />
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-2 text-sm">{currentView === 'test-series' ? testSeriesError : error}</p>
            <button
              onClick={() => {
                if (currentView === 'test-series') {
                  fetchTestSeries();
                } else {
                  fetchQuizzes();
                }
              }}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content Grid */}
        {currentView === 'quizzes' && !loading && !error && (
          <>
            {quizzes.length === 0 ? (
              <div className={`text-center py-16 rounded-xl shadow-sm border ${currentCategory === 'enrolled'
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-100'
                }`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${currentCategory === 'enrolled'
                  ? 'bg-green-100'
                  : 'bg-gray-100'
                  }`}>
                  {currentCategory === 'enrolled' ? (
                    <FaUserCheck className="h-8 w-8 text-green-500" />
                  ) : (
                    <FaBookOpen className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className={`text-xl font-medium mb-2 ${currentCategory === 'enrolled' ? 'text-green-800' : 'text-gray-800'
                  }`}>
                  {currentCategory === 'enrolled'
                    ? 'No Enrolled Quizzes Yet'
                    : 'No Quizzes Found'}
                </h3>
                <p className={`mb-6 max-w-md mx-auto ${currentCategory === 'enrolled' ? 'text-green-700' : 'text-gray-500'
                  }`}>
                  {currentCategory === 'enrolled'
                    ? "You haven't enrolled in any test series yet. Browse available test series to start your learning journey!"
                    : "There are no quizzes available at the moment. Check back later for new content."}
                </p>
                {currentCategory === 'enrolled' && (
                  <button
                    onClick={() => setCurrentCategory('all')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FaEye className="text-sm" />
                    Browse All Test Series
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Test Series Grid */}
        {currentView === 'test-series' && !testSeriesLoading && !testSeriesError && (
          <>
            {testSeries.length === 0 ? (
              <div className={`text-center py-16 rounded-xl shadow-sm border ${currentCategory === 'enrolled'
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-100'
                }`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${currentCategory === 'enrolled'
                  ? 'bg-green-100'
                  : 'bg-gray-100'
                  }`}>
                  {currentCategory === 'enrolled' ? (
                    <FaUserCheck className="h-8 w-8 text-green-500" />
                  ) : (
                    <FaGraduationCap className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className={`text-xl font-medium mb-2 ${currentCategory === 'enrolled' ? 'text-green-800' : 'text-gray-800'
                  }`}>
                  {currentCategory === 'enrolled'
                    ? 'No Enrolled Test Series Yet'
                    : 'No Test Series Found'}
                </h3>
                <p className={`mb-6 max-w-md mx-auto ${currentCategory === 'enrolled' ? 'text-green-700' : 'text-gray-500'
                  }`}>
                  {currentCategory === 'enrolled'
                    ? "You haven't enrolled in any test series yet. Start your learning journey by enrolling in available test series!"
                    : "There are no test series available at the moment. Check back later for new content."}
                </p>
                {currentCategory === 'enrolled' && (
                  <button
                    onClick={() => setCurrentCategory('all')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FaEye className="text-sm" />
                    Browse All Test Series
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {testSeries.map((series, index) => (
                  <TestSeriesCard
                    key={series._id}
                    testSeries={series}
                    index={index}
                    getDifficultyColor={getDifficultyColor}
                    currentCategory={currentCategory}
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