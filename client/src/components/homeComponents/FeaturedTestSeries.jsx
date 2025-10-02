import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaPlay,
  FaClock,
  FaQuestionCircle,
  FaUsers,
  FaStar,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaBookOpen,
  FaTimes,
  FaInfoCircle,
  FaGraduationCap,
  FaCheckCircle,
  FaTag
} from 'react-icons/fa';

const TestSeriesCard = ({ testSeries, delay, onKnowMore }) => {
  // Check if we're on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  };

  // Get category-based colors - More vibrant colors
  const getCategoryColors = (category) => {
    const categoryLower = (category || 'general').toLowerCase();

    const colorMap = {
      'engineering': {
        bg: 'from-blue-400/20 to-indigo-500/20',
        text: 'text-blue-700',
        bgColor: 'bg-blue-200',
        icon: 'text-blue-600',
        gradient: 'from-blue-600 to-indigo-700'
      },
      'medical': {
        bg: 'from-green-400/20 to-emerald-500/20',
        text: 'text-green-700',
        bgColor: 'bg-green-200',
        icon: 'text-green-600',
        gradient: 'from-green-600 to-emerald-700'
      },
      'management': {
        bg: 'from-purple-400/20 to-violet-500/20',
        text: 'text-purple-700',
        bgColor: 'bg-purple-200',
        icon: 'text-purple-600',
        gradient: 'from-purple-600 to-violet-700'
      },
      'board exams': {
        bg: 'from-orange-400/20 to-red-500/20',
        text: 'text-orange-700',
        bgColor: 'bg-orange-200',
        icon: 'text-orange-600',
        gradient: 'from-orange-600 to-red-700'
      },
      'competitive': {
        bg: 'from-pink-400/20 to-rose-500/20',
        text: 'text-pink-700',
        bgColor: 'bg-pink-200',
        icon: 'text-pink-600',
        gradient: 'from-pink-600 to-rose-700'
      },
      'banking': {
        bg: 'from-teal-400/20 to-cyan-500/20',
        text: 'text-teal-700',
        bgColor: 'bg-teal-200',
        icon: 'text-teal-600',
        gradient: 'from-teal-600 to-cyan-700'
      },
      'ssc': {
        bg: 'from-amber-400/20 to-yellow-500/20',
        text: 'text-amber-700',
        bgColor: 'bg-amber-200',
        icon: 'text-amber-600',
        gradient: 'from-amber-600 to-yellow-700'
      },
      'general': {
        bg: 'from-slate-400/20 to-gray-500/20',
        text: 'text-slate-700',
        bgColor: 'bg-slate-200',
        icon: 'text-slate-600',
        gradient: 'from-slate-600 to-gray-700'
      },
      'government': {
        bg: 'from-blue-100/20 to-green-100/20',
        text: 'text-blue-900',
        bgColor: 'bg-blue-200',
        icon: 'text-green-700',
        gradient: 'from-blue-800 to-green-700'
      },
      'jkssb': {
        bg: 'from-emerald-100/20 to-blue-100/20',
        text: 'text-emerald-900',
        bgColor: 'bg-emerald-200',
        icon: 'text-blue-700',
        gradient: 'from-emerald-700 to-blue-800'
}
    };

    return colorMap[categoryLower] || colorMap['general'];
  };

  const colors = getCategoryColors(testSeries.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileTap={isMobileDevice() ? { scale: 0.98 } : {}}
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-80 flex flex-col"
      style={{ touchAction: "manipulation" }}
    >
      {/* Featured Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <FaStar className="w-2.5 h-2.5 mr-1" />
          Featured
        </span>
      </div>

      {/* Thumbnail */}
      <div className={`relative h-24 bg-gradient-to-br ${colors.bg} overflow-hidden flex-shrink-0`}>
        {testSeries.thumbnail ? (
          <img
            src={testSeries.thumbnail}
            alt={testSeries.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaBookOpen className={`text-2xl ${colors.icon}`} />
          </div>
        )}

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <FaPlay className={`${colors.icon} text-xs ml-0.5`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Category & Exam Type */}
        <div className="flex items-center gap-1 mb-2 min-h-[20px]">
          <span className={`text-xs font-medium ${colors.text} ${colors.bgColor} px-1.5 py-0.5 rounded truncate flex-shrink-0 max-w-[60%]`} title={testSeries.category || 'General'}>
            {testSeries.category || 'General'}
          </span>
          {testSeries.examType && (
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded truncate flex-shrink-0 max-w-[35%]" title={testSeries.examType}>
              {testSeries.examType}
            </span>
          )}
        </div>

        {/* Title - Fixed height */}
        <div className="h-10 mb-2">
          <h3 className={`text-sm font-bold text-gray-900 line-clamp-2 group-hover:${colors.text} transition-colors duration-300`} title={testSeries.title}>
            {testSeries.title}
          </h3>
        </div>

        {/* Description - Fixed height */}
        <div className="h-8 mb-3">
          <p className="text-xs text-gray-600 line-clamp-2">
            {testSeries.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <div className="flex items-center min-w-0">
            <FaQuestionCircle className={`mr-1 ${colors.icon} flex-shrink-0`} />
            <span className="truncate">{testSeries.totalQuizzes || 0}</span>
          </div>
          <div className="flex items-center min-w-0">
            <FaClock className={`mr-1 ${colors.icon} flex-shrink-0`} />
            <span className="truncate">{testSeries.estimatedDuration || 0}m</span>
          </div>
          <div className="flex items-center min-w-0">
            <FaUsers className={`mr-1 ${colors.icon} flex-shrink-0`} />
            <span className="truncate">{testSeries.enrolledStudentsCount || 0}</span>
          </div>
        </div>

        {/* Spacer to push price and button to bottom */}
        <div className="flex-grow"></div>

        {/* Price */}
        <div className="mb-2">
          {testSeries.price > 0 ? (
            <div className="flex items-center">
              <span className={`text-sm font-bold ${colors.text}`}>₹{testSeries.price}</span>
              {testSeries.originalPrice > testSeries.price && (
                <span className="text-xs text-gray-500 line-through ml-1">₹{testSeries.originalPrice}</span>
              )}
            </div>
          ) : (
            <span className="text-sm font-bold text-green-600">Free</span>
          )}
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onKnowMore(testSeries)}
            className="flex-1 bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
          >
            <FaInfoCircle className="text-xs mr-1" />
            <span>Know More</span>
          </button>

          <Link
            to={`/test-series/${testSeries._id}`}
            className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white py-1 px-2 rounded text-xs font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center`}
          >
            <span className="mr-1">Start</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Test Series Detail Modal Component
const TestSeriesModal = ({ testSeries, isOpen, onClose }) => {
  if (!isOpen || !testSeries) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00bcd4]/10 to-[#01427a]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                {testSeries.thumbnail ? (
                  <img
                    src={testSeries.thumbnail}
                    alt={testSeries.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <FaBookOpen className="text-2xl text-[#00bcd4]" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <FaStar className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                  {testSeries.examType && (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {testSeries.examType}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">{testSeries.title}</h2>
                <p className="text-sm text-gray-600">{testSeries.category}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Test Series</h3>
              <p className="text-gray-600 leading-relaxed">{testSeries.description}</p>
            </div>

            {/* Key Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FaQuestionCircle className="text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{testSeries.totalQuizzes || 0} Tests</div>
                    <div className="text-sm text-gray-600">Comprehensive coverage</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FaClock className="text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{testSeries.estimatedDuration || 0} Minutes</div>
                    <div className="text-sm text-gray-600">Total duration</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <FaUsers className="text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{testSeries.enrolledStudentsCount || 0} Students</div>
                    <div className="text-sm text-gray-600">Already enrolled</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <FaGraduationCap className="text-orange-600" />
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">{testSeries.difficulty || 'Medium'}</div>
                    <div className="text-sm text-gray-600">Difficulty level</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Get</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="text-gray-700">Detailed performance analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="text-gray-700">Step-by-step solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="text-gray-700">Progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="text-gray-700">Leaderboard rankings</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="text-gray-700">Mobile-friendly interface</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Pricing</h3>
                  <div className="flex items-center gap-2">
                    {testSeries.price > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-[#00bcd4]">₹{testSeries.price}</span>
                        {testSeries.originalPrice > testSeries.price && (
                          <span className="text-lg text-gray-500 line-through">₹{testSeries.originalPrice}</span>
                        )}
                        {testSeries.originalPrice > testSeries.price && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            Save ₹{testSeries.originalPrice - testSeries.price}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-green-600">Free</span>
                    )}
                  </div>
                </div>
                <FaTag className="text-3xl text-gray-300" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Close
              </button>
              <Link
                to={`/test-series/${testSeries._id}`}
                className="flex-1 bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                <span className="mr-2">Start Test Series</span>
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const FeaturedTestSeries = () => {
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestSeries, setSelectedTestSeries] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchFeaturedTestSeries();
  }, []);

  const fetchFeaturedTestSeries = async () => {
    try {
      // Try to fetch from API first
      const response = await fetch('/api/public/test-series?limit=8');

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        if (data.success && data.data && data.data.length > 0) {
          // Use the API data - enrolledStudentsCount should be included
          setTestSeries(data.data);
          return;
        }
      }

      // Fallback to mock data only if API completely fails
      const mockTestSeries = [
        {
          _id: '1',
          title: 'JEE Main 2024 Complete Test Series',
          slug: 'jee-main-2024-complete',
          description: 'Comprehensive test series covering all topics for JEE Main 2024 with detailed solutions and performance analysis.',
          category: 'Engineering',
          difficulty: 'hard',
          examType: 'JEE Main',
          totalQuizzes: 25,
          estimatedDuration: 180,
          enrolledStudents: Array(1247).fill().map((_, i) => ({ _id: `user_${i}` })),
          price: 999,
          originalPrice: 1499,
          thumbnail: ''
        },
        {
          _id: '2',
          title: 'NEET Biology Mock Tests',
          slug: 'neet-biology-mock-tests',
          description: 'Focused biology test series for NEET preparation with chapter-wise and full-length tests.',
          category: 'Medical',
          difficulty: 'medium',
          examType: 'NEET',
          totalQuizzes: 15,
          estimatedDuration: 120,
          enrolledStudents: Array(892).fill().map((_, i) => ({ _id: `user_${i}` })),
          price: 0,
          originalPrice: 0,
          thumbnail: ''
        },
        {
          _id: '3',
          title: 'CAT Quantitative Aptitude',
          slug: 'cat-quantitative-aptitude',
          description: 'Master quantitative aptitude for CAT with our comprehensive test series and detailed explanations.',
          category: 'Management',
          difficulty: 'hard',
          examType: 'CAT',
          totalQuizzes: 20,
          estimatedDuration: 150,
          enrolledStudents: Array(634).fill().map((_, i) => ({ _id: `user_${i}` })),
          price: 799,
          originalPrice: 1199,
          thumbnail: ''
        },
        {
          _id: '4',
          title: 'Class 12 Physics Practice Tests',
          slug: 'class-12-physics-practice',
          description: 'Complete physics test series for Class 12 board exams with NCERT-based questions.',
          category: 'Board Exams',
          difficulty: 'medium',
          examType: 'CBSE',
          totalQuizzes: 12,
          estimatedDuration: 90,
          enrolledStudents: Array(2156).fill().map((_, i) => ({ _id: `user_${i}` })),
          price: 0,
          originalPrice: 0,
          thumbnail: ''
        },
        {
          _id: '5',
          title: 'SBI PO Banking Preparation',
          slug: 'sbi-po-banking-prep',
          description: 'Complete banking exam preparation with quantitative aptitude, reasoning, and English.',
          category: 'Banking',
          difficulty: 'medium',
          examType: 'SBI PO',
          totalQuizzes: 18,
          estimatedDuration: 135,
          enrolledStudents: Array(478).fill().map((_, i) => ({ _id: `user_${i}` })),
          price: 599,
          originalPrice: 899,
          thumbnail: ''
        },
        {
          _id: '6',
          title: 'SSC CGL General Studies',
          slug: 'ssc-cgl-general-studies',
          description: 'Comprehensive general studies preparation for SSC CGL with current affairs and static GK.',
          category: 'SSC',
          difficulty: 'easy',
          examType: 'SSC CGL',
          totalQuizzes: 22,
          estimatedDuration: 110,
          enrolledStudents: Array(1823).fill().map((_, i) => ({ _id: `user_${i}` })),
          price: 0,
          originalPrice: 0,
          thumbnail: ''
        }
      ];

      setTestSeries(mockTestSeries);
    } catch (error) {
      console.error('Error fetching featured test series:', error);
      // Set empty array on error
      setTestSeries([]);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleKnowMore = (testSeries) => {
    setSelectedTestSeries(testSeries);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestSeries(null);
  };

  // Scroll functions for navigation buttons
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bcd4]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (testSeries.length === 0) {
    return null; // Don't render if no test series available
  }

  return (
    <>
      <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-bl from-[#00bcd4]/5 to-[#01427a]/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-gradient-to-tr from-[#01427a]/5 to-[#00bcd4]/5 blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 sm:mb-12 md:mb-16">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full text-[#01427a] text-xs sm:text-sm font-medium mb-3 sm:mb-4"
              >
                <FaTrophy className="inline mr-1" />
                Featured Test Series
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Featured</span> Test Series
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-600 mt-2 text-sm sm:text-base"
              >
                Practice with expert-designed test series for competitive exams
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/exams"
                className="flex items-center bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md text-[#00bcd4] hover:text-white hover:bg-gradient-to-r hover:from-[#00bcd4] hover:to-[#01427a] transition-all duration-300 group text-sm sm:text-base"
              >
                <span className="mr-2 font-medium">View All Test Series</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00bcd4]/5 to-[#01427a]/5 rounded-3xl transform rotate-1 scale-105 -z-10"></div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg relative">
              {/* Left scroll button */}
              <button
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-[#00bcd4] hover:bg-white hover:text-[#01427a] transition-all duration-300 hidden md:block"
                aria-label="Scroll left"
              >
                <FaChevronLeft />
              </button>

              {/* Horizontal scrollable container */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-4 pt-2 snap-x snap-mandatory hide-scrollbar"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {testSeries.map((series, index) => (
                  <div
                    key={series._id}
                    className="flex-shrink-0 w-[70%] sm:w-[40%] md:w-[28%] lg:w-[20%] snap-start px-2 first:pl-4 last:pr-4"
                  >
                    <TestSeriesCard
                      testSeries={series}
                      delay={0.1 + index * 0.05}
                      onKnowMore={handleKnowMore}
                    />
                  </div>
                ))}
              </div>

              {/* Right scroll button */}
              <button
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-[#00bcd4] hover:bg-white hover:text-[#01427a] transition-all duration-300 hidden md:block"
                aria-label="Scroll right"
              >
                <FaChevronRight />
              </button>

              {/* Swipe indicator */}
              <div className="flex justify-center mt-2">
                <motion.div
                  className="w-12 h-1 bg-gray-200 rounded-full relative overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="absolute top-0 left-0 h-full w-4 bg-[#00bcd4] rounded-full"
                    animate={{ x: [0, 32, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Test Series Detail Modal */}
      <TestSeriesModal
        testSeries={selectedTestSeries}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default FeaturedTestSeries;