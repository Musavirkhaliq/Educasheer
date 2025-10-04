import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBook,
  FaClock,
  FaQuestionCircle,
  FaUsers,
  FaPlay,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaTag,
  FaStar,
  FaCalendarAlt,
  FaEye,
  FaTrophy,
  FaChevronDown,
  FaChevronUp,
  FaChartLine,
  FaCheckCircle
} from 'react-icons/fa';
import { testSeriesAPI } from '../services/testSeriesAPI';
import { quizAPI } from '../services/quizAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import TestSeriesLeaderboard from './TestSeriesLeaderboard';
import AddToCartButton from './cart/AddToCartButton'; // Added this import

// Constants
const QUIZ_TYPES = [
  { value: 'all', label: 'All Tests', icon: FaBook, color: 'gray' },
  { value: 'Topic Test', label: 'Topic Test', icon: FaTag, color: 'blue' },
  { value: 'Subject Test', label: 'Subject Test', icon: FaBook, color: 'green' },
  { value: 'Multi Subject', label: 'Multi Subject', icon: FaCheckCircle, color: 'purple' },
  { value: 'Full Test', label: 'Full Test', icon: FaTrophy, color: 'orange' }
];

// Reusable helper function for difficulty color styling
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    case 'mixed': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};


/**
 * A unified component to render the list of quizzes and sections.
 * It adapts its display and functionality based on the user's enrollment status,
 * ensuring a consistent UI for all user states (logged-out, logged-in not enrolled, logged-in enrolled).
 */
const TestSeriesContent = ({ testSeries, isEnrolled, userAttempts }) => {
  const { testSeriesId } = useParams();
  const [selectedQuizType, setSelectedQuizType] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});


  useEffect(() => {
    // Expand all sections by default
    const initialExpandedState = {};
    testSeries.sections?.forEach(section => {
      initialExpandedState[section._id] = true;
    });
    setExpandedSections(initialExpandedState);
  }, [testSeries.sections]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleDescription = (sectionId) => {
    setExpandedDescriptions(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getBestAttempt = (quizId) => {
    const attempts = userAttempts[quizId] || [];
    if (attempts.length === 0) return null;
    return attempts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );
  };

  const getAttemptCount = (quizId) => {
    return userAttempts[quizId]?.length || 0;
  };

  const filterQuizzesByType = (quizzes) => {
    if (selectedQuizType === 'all') return quizzes;
    return quizzes.filter(quiz => quiz.quizType === selectedQuizType);
  };
  
  const calculateSectionProgress = (section) => {
    if (!isEnrolled || !section.quizzes || section.quizzes.length === 0) {
        return { completed: 0, total: 0, percentage: 0 };
    }
    const completedQuizzes = section.quizzes.filter(quiz => {
        const attempts = userAttempts[quiz._id] || [];
        return attempts.some(attempt => attempt.isCompleted);
    }).length;

    const totalQuizzes = section.quizzes.length;
    const percentage = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;
    return { completed: completedQuizzes, total: totalQuizzes, percentage };
  };

  const getQuizTypeCounts = (quizzes) => {
    if (!quizzes) return {};
    return quizzes.reduce((acc, quiz) => {
      const type = quiz.quizType || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  };


  /**
   * Renders a single quiz item with a unified layout.
   * Actions and stats displayed are conditional on enrollment status.
   */
  const renderQuizItem = (quiz, index, isSectionQuiz = false) => {
    const bestAttempt = getBestAttempt(quiz._id);
    const attemptCount = getAttemptCount(quiz._id);
    const hasAttempts = attemptCount > 0;
    
    const sectionColors = {
      bg: isSectionQuiz ? 'from-purple-50 to-indigo-50' : 'from-gray-50 to-blue-50',
      hoverBg: isSectionQuiz ? 'hover:from-purple-100 hover:to-indigo-100' : 'hover:from-gray-100 hover:to-blue-100',
      border: isSectionQuiz ? 'border-purple-200' : 'border-gray-200',
      iconBg: isSectionQuiz ? 'bg-purple-500' : 'bg-blue-500',
      iconText: 'text-white',
      questionIcon: isSectionQuiz ? 'text-purple-500' : 'text-blue-500'
    };

    return (
      <div key={quiz._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r ${sectionColors.bg} rounded-lg border ${sectionColors.border} ${sectionColors.hoverBg} transition-all duration-200 ${isSectionQuiz ? 'ml-4' : ''}`}>
        <div className="flex items-center gap-3 flex-1 mb-2 sm:mb-0">
          <div className={`w-10 h-10 ${sectionColors.iconBg} rounded-full flex items-center justify-center text-sm font-bold ${sectionColors.iconText} flex-shrink-0`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 mb-1">{quiz.title}</h4>
            {quiz.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{quiz.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                    <FaQuestionCircle className={sectionColors.questionIcon} />
                    {quiz.questionCount || quiz.questions?.length || 0} questions
                </span>
                {quiz.timeLimit && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                        <FaClock className="text-green-500" />
                        {quiz.timeLimit} min
                    </span>
                )}
                {quiz.quizType && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                        <FaTag className="text-indigo-500" />
                        {quiz.quizType}
                    </span>
                )}
                {quiz.totalMarks && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                        <FaStar className="text-yellow-500" />
                        {quiz.totalMarks} marks
                    </span>
                )}
                {quiz.difficulty && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </span>
                )}
            </div>
            
            {isEnrolled && bestAttempt && (
                <div className="mt-2 text-xs">
                    <span className="font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                        Best Score: {bestAttempt.percentage.toFixed(2)}%
                    </span>
                </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 ml-13 sm:ml-0">
          {!isEnrolled ? (
             <Link to={`/test-series/${testSeriesId}/quiz/${quiz._id}`} className={`${sectionColors.iconBg} text-white hover:bg-opacity-80 text-xs font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1`}>
                <FaEye className="text-xs" />
                Preview
            </Link>
          ) : (
            <div className="flex items-center gap-2">
                {hasAttempts && (
                    <Link to={`/test-series/${testSeriesId}/quiz/${quiz._id}/results`} className="bg-gray-200 text-gray-800 hover:bg-gray-300 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                        Result
                    </Link>
                )}
                <Link to={`/test-series/${testSeriesId}/quiz/${quiz._id}`} className="bg-green-500 text-white hover:bg-green-600 text-xs font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1">
                    <FaPlay className="text-xs" />
                    {hasAttempts ? 'Retake' : 'Start'}
                </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  const quizzesToShow = (quizList) => filterQuizzesByType(quizList || []);

  return (
    <div>
        {/* Quiz Type Filter */}
        <div className="mb-6 pb-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by Test Type</h4>
            <div className="flex flex-wrap gap-2">
                {QUIZ_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedQuizType === type.value;
                    const colorClasses = {
                        gray: isSelected ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                        blue: isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                        green: isSelected ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
                        purple: isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
                        orange: isSelected ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    };
                    
                    return (
                        <button key={type.value} onClick={() => setSelectedQuizType(type.value)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${colorClasses[type.color]} ${isSelected ? `ring-2 ring-offset-2 ring-${type.color}-500` : ''}`}>
                            <Icon className="text-sm" />
                            {type.label}
                            {type.value === 'all' && (
                                <span className="ml-1 bg-white/30 px-1.5 py-0.5 rounded text-xs">
                                    {testSeries.quizzes?.length || 0}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
        
        {/* Quizzes List */}
        <div className="space-y-3">
            {/* Render direct quizzes */}
            {quizzesToShow(testSeries.quizzes).map((quiz, index) => renderQuizItem(quiz, index, false))}

            {/* Render section-based quizzes */}
            {testSeries.sections?.map((section) => {
                const filteredQuizzes = quizzesToShow(section.quizzes);
                if (filteredQuizzes.length === 0) return null;
                const sectionProgress = calculateSectionProgress(section);
                const quizTypeCounts = getQuizTypeCounts(section.quizzes);
                const isDescriptionExpanded = expandedDescriptions[section._id];

                return (
                    <div key={section._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection(section._id)}>
                             <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FaBook className="text-white text-sm" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-gray-800 text-base">{section.title}</h5>
                                    <p className="text-xs text-gray-500">
                                      {Object.entries(quizTypeCounts).map(([type, count], index) => (
                                          <span key={type}>
                                              {count} {type}{count > 1 ? 's' : ''}
                                              {index < Object.keys(quizTypeCounts).length - 1 ? ' • ' : ''}
                                          </span>
                                      ))}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {isEnrolled && (
                                    <div className="hidden sm:flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-600">{sectionProgress.completed}/{sectionProgress.total}</span>
                                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${sectionProgress.percentage}%` }}></div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">{sectionProgress.percentage}%</span>
                                    </div>
                                )}
                                {expandedSections[section._id] ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
                            </div>
                        </div>

                        {expandedSections[section._id] && (
                            <div className="p-4 border-t border-gray-200 space-y-3">
                                {section.description && (
                                  <div className="text-sm text-gray-600 mb-3">
                                    <p className={!isDescriptionExpanded ? 'line-clamp-2' : ''}>
                                      {section.description}
                                    </p>
                                    {section.description.length > 150 && ( // Only show button if text is long enough
                                      <button onClick={() => toggleDescription(section._id)} className="text-purple-600 hover:text-purple-800 font-semibold text-xs mt-1">
                                        {isDescriptionExpanded ? 'Read less' : 'Read more'}
                                      </button>
                                    )}
                                  </div>
                                )}
                                {filteredQuizzes.map((quiz, quizIndex) => renderQuizItem(quiz, quizIndex, true))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        
        {quizzesToShow(testSeries.quizzes).length === 0 && testSeries.sections?.every(s => quizzesToShow(s.quizzes).length === 0) && (
            <div className="text-center py-8 text-gray-500">
                <FaBook className="text-4xl mx-auto mb-4 opacity-50" />
                <p>No tests available for the selected filter.</p>
            </div>
        )}
    </div>
  );
};


const TestSeriesDetail = () => {
  const { testSeriesId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [testSeries, setTestSeries] = useState(null);
  const [userAttempts, setUserAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState({ participantCount: 0, userRank: null });

  useEffect(() => {
    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = currentUser
                ? await testSeriesAPI.getTestSeriesById(testSeriesId)
                : await testSeriesAPI.getPublicTestSeriesById(testSeriesId);
            const seriesData = response.data.data;
            setTestSeries(seriesData);

            if (currentUser && seriesData.isEnrolled) {
                await fetchUserAttempts(seriesData.quizzes, seriesData.sections);
            }
            setError('');
        } catch (error) {
            console.error('Error fetching test series details:', error);
            setError('Failed to fetch test series details');
        } finally {
            setLoading(false);
        }
    };
    
    fetchDetails();

    if (location.state?.message) {
      toast(location.state.message, { icon: 'ℹ️', duration: 4000 });
    }
  }, [testSeriesId, currentUser, location.state]);

  const fetchUserAttempts = async (quizzes = [], sections = []) => {
    const allQuizzes = [...quizzes, ...(sections?.flatMap(s => s.quizzes) || [])];
    if (!allQuizzes.length) return;

    try {
      const attemptPromises = allQuizzes.map(quiz => 
        quizAPI.getUserQuizAttempts(quiz._id).then(res => ({ [quiz._id]: res.data.data })).catch(() => ({ [quiz._id]: [] }))
      );
      const attemptsArray = await Promise.all(attemptPromises);
      const attemptsMap = Object.assign({}, ...attemptsArray);
      setUserAttempts(attemptsMap);
    } catch (error) {
      console.error('Error fetching user attempts:', error);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setEnrolling(true);
      await testSeriesAPI.enrollInTestSeries(testSeriesId);
      toast.success('Successfully enrolled in test series!');
      // Refetch details to update enrollment status and load attempts
       const response = await testSeriesAPI.getTestSeriesById(testSeriesId);
       setTestSeries(response.data.data);
       await fetchUserAttempts(response.data.data.quizzes, response.data.data.sections);

    } catch (error) {
      console.error('Error enrolling in test series:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in test series');
    } finally {
      setEnrolling(false);
    }
  };

  const calculateOverallProgress = () => {
    if (!testSeries || !testSeries.isEnrolled) return { completed: 0, total: 0, percentage: 0 };
    
    const allQuizzes = [
        ...(testSeries.quizzes || []),
        ...(testSeries.sections?.flatMap(s => s.quizzes) || [])
    ];
    
    if (allQuizzes.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completedCount = allQuizzes.filter(quiz => {
        const attempts = userAttempts[quiz._id] || [];
        return attempts.some(attempt => attempt.isCompleted);
    }).length;

    const totalCount = allQuizzes.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return { completed: completedCount, total: totalCount, percentage };
  };

  // *** START: ADDED CALCULATION LOGIC ***
  const calculatedStats = useMemo(() => {
    if (!testSeries) {
      return {
        totalQuizzes: 0,
        totalQuestions: 0,
        estimatedDuration: 0,
      };
    }

    // Consolidate all quizzes from the main array and all sections
    const allQuizzes = [
      ...(testSeries.quizzes || []),
      ...(testSeries.sections?.flatMap(s => s.quizzes) || [])
    ];

    const totalQuizzes = allQuizzes.length;

    const totalQuestions = allQuizzes.reduce((sum, quiz) => {
      // Use the same logic as renderQuizItem for consistency
      return sum + (quiz.questionCount || quiz.questions?.length || 0);
    }, 0);

    const estimatedDuration = allQuizzes.reduce((sum, quiz) => {
      // Ensure timeLimit is treated as a number
      return sum + (Number(quiz.timeLimit) || 0);
    }, 0);

    return {
      totalQuizzes,
      totalQuestions,
      estimatedDuration,
    };
  }, [testSeries]); // Recalculate only when testSeries data changes
  // *** END: ADDED CALCULATION LOGIC ***
  
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error || !testSeries) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4 max-w-4xl">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <FaTimes className="text-red-500 text-6xl mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Series Not Found</h2>
                  <p className="text-gray-600 mb-6">{error || 'The test series you are looking for does not exist.'}</p>
                  <Link to="/test-series" className="bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#0097a7] transition-colors inline-flex items-center gap-2">
                      <FaArrowLeft /> Back to Test Series
                  </Link>
              </div>
          </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const isEnrolled = testSeries.isEnrolled;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/test-series" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors">
              <FaArrowLeft />
              <span>Back to Test Series</span>
            </Link>
          </div>
          
          {/* Leaderboard Toggle Section */}
           {isEnrolled && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                 <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-200 touch-manipulation">
                     <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                             <FaTrophy className="text-white text-sm sm:text-lg" />
                         </div>
                         <div className="text-left flex-1 min-w-0">
                             <h3 className="text-base sm:text-lg font-semibold text-gray-800">Leaderboard</h3>
                             <p className="text-xs sm:text-sm text-gray-600 truncate">
                                 {leaderboardData.participantCount > 0 ? (
                                     <>
                                         {leaderboardData.participantCount} participants
                                         {leaderboardData.userRank && <span className="ml-2 text-[#00bcd4] font-medium">• You're #{leaderboardData.userRank}</span>}
                                     </>
                                 ) : 'See how you rank against others'}
                             </p>
                         </div>
                     </div>
                     <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {showLeaderboard ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                     </div>
                 </button>
                 <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showLeaderboard ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="border-t border-gray-100 p-3 sm:p-6">
                         <TestSeriesLeaderboard testSeriesId={testSeriesId} onDataLoad={setLeaderboardData} />
                     </div>
                 </div>
             </div>
           )}

          {/* Test Series Details Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white p-4 sm:p-6 lg:p-8">
              {/* ... Same as original ... */}
                 <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaBook className="text-2xl" />
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(testSeries.difficulty)} text-gray-800`}>
                        {testSeries.difficulty.charAt(0).toUpperCase() + testSeries.difficulty.slice(1)}
                      </span>
                      {testSeries.examType && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {testSeries.examType}
                        </span>
                      )}
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{testSeries.title}</h1>
                  <p className="text-white/90 text-base sm:text-lg mb-4 break-words">{testSeries.description}</p>
                  
                  {/* *** START: UPDATED JSX WITH CALCULATED VALUES *** */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{calculatedStats.totalQuizzes}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{calculatedStats.totalQuestions}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{calculatedStats.estimatedDuration}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold">{testSeries.enrolledStudents?.length || 0}</div>
                      <div className="text-white/80 text-xs sm:text-sm">Enrolled</div>
                    </div>
                  </div>
                   {/* *** END: UPDATED JSX WITH CALCULATED VALUES *** */}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    
                  {/* Progress Bar for Enrolled Users */}
                  {isEnrolled && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
                            <span className="text-sm font-bold text-green-600">{overallProgress.percentage}% Complete</span>
                        </div>
                         <p className="text-sm text-gray-600 mb-2">
                            You've completed {overallProgress.completed} out of {overallProgress.total} tests. Keep going!
                         </p>
                        <div className="flex items-center gap-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${overallProgress.percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{overallProgress.completed}/{overallProgress.total}</span>
                        </div>
                    </div>
                  )}

                  {/* Enrollment/Purchase prompt for Non-Enrolled Users */}
                  {!isEnrolled && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 mb-6 border border-blue-200">
                        {/* ... Same as original ... */}
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaInfoCircle className="text-white text-xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                              {testSeries.price > 0 ? 'Purchase Required' : 'Enrollment Required'}
                            </h3>
                            <p className="text-sm sm:text-base text-blue-800 mb-4">
                              {testSeries.price > 0
                                ? 'Purchase this test series to access all tests and track your progress.'
                                : currentUser
                                  ? 'Enroll in this free test series to access all tests and track your progress.'
                                  : 'Login and enroll in this free test series to access all tests and track your progress.'
                              }
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              {testSeries.price > 0 ? (
                                currentUser ? (
                                  <AddToCartButton itemType="testSeries" itemId={testSeriesId} size="md" />
                                ) : (
                                  <button onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)} className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto">
                                    Login to Enroll
                                  </button>
                                )
                              ) : (
                                <button onClick={handleEnroll} disabled={enrolling} className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto">
                                  {enrolling ? 'Enrolling...' : currentUser ? 'Enroll Now' : 'Login to Enroll'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                    </div>
                  )}
                  
                  {/* Unified Content Display */}
                  <TestSeriesContent 
                    testSeries={testSeries} 
                    isEnrolled={isEnrolled} 
                    userAttempts={userAttempts} 
                  />

                </div>

                {/* Sidebar */}
                <div className="space-y-4 lg:space-y-6">
                   {/* Enrollment Card */}
                   <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    {/* ... Same as original ... */}
                     <div className="text-center mb-4">
                      {testSeries.price > 0 ? (
                        <div>
                          <div className="text-3xl font-bold text-[#00bcd4] mb-1">₹{testSeries.price}</div>
                          {testSeries.originalPrice > testSeries.price && (
                            <div className="text-gray-500 line-through">₹{testSeries.originalPrice}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-green-600">Free</div>
                      )}
                    </div>

                    {isEnrolled ? (
                      <div className="text-center">
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4 flex items-center justify-center gap-2">
                          <FaCheck />
                          {testSeries.price > 0 ? 'Purchased' : 'Enrolled'}
                        </div>
                        <p className="text-sm text-gray-600">
                          You have access to all tests in this series
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {testSeries.price > 0 ? (
                          currentUser ? (
                            <AddToCartButton itemType="testSeries" itemId={testSeriesId} className="w-full" size="lg"/>
                          ) : (
                            <div className="text-center">
                              <button onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)} className="w-full bg-[#00bcd4] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#0097a7] transition-colors text-base sm:text-lg font-medium">
                                Login to Enroll
                              </button>
                              <p className="text-sm text-gray-600 mt-2">
                                Please login to add this test series to your cart
                              </p>
                            </div>
                          )
                        ) : (
                          <button onClick={handleEnroll} disabled={enrolling} className="w-full bg-[#00bcd4] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-medium">
                            {enrolling ? 'Enrolling...' : currentUser ? 'Enroll Now' : 'Login to Enroll'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* ... Rest of sidebar is the same ... */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Test Series Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{testSeries.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${getDifficultyColor(testSeries.difficulty)}`}>
                          {testSeries.difficulty?.charAt(0).toUpperCase() + testSeries.difficulty?.slice(1)}
                        </span>
                      </div>
                       {/* *** START: UPDATED SIDEBAR JSX *** */}
                       <div className="flex justify-between">
                        <span className="text-gray-600">Total Tests:</span>
                        <span className="font-medium text-blue-600">{calculatedStats.totalQuizzes}</span>
                      </div>
                      {/* *** END: UPDATED SIDEBAR JSX *** */}
                    </div>
                   </div>

                   <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <FaCheckCircle className="text-blue-600" />
                      What's Included
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><FaCheck className="text-green-500 text-xs" /><span className="text-blue-800">Unlimited test attempts</span></div>
                        <div className="flex items-center gap-2"><FaCheck className="text-green-500 text-xs" /><span className="text-blue-800">Detailed performance reports</span></div>
                        <div className="flex items-center gap-2"><FaCheck className="text-green-500 text-xs" /><span className="text-blue-800">Step-by-step solutions</span></div>
                        <div className="flex items-center gap-2"><FaCheck className="text-green-500 text-xs" /><span className="text-blue-800">Leaderboard rankings</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSeriesDetail;