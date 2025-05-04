import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaGraduationCap, FaUsers, FaStar, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Function to handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Search through courses and programs
      const response = await axios.get('/api/v1/search', {
        params: {
          query: searchQuery,
          types: ['courses', 'programs', 'videos']
        }
      });

      setSearchResults(response.data.data);

      // Redirect to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
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

  // Animation variants for consistent animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: "easeOut" }
    })
  };

  // Stats removed as requested



  const counselingSessions = [
    {
      title: "JEE Preparation",
      description: "Learn from AIR top 100 rankers with personalized strategies for JEE Main & Advanced",
      category: "JEE Main & Advanced",
      icon: FaGraduationCap,
      color: "primary",
      link: "#jee-sessions"
    },
    {
      title: "NEET Preparation",
      description: "Expert guidance from medical professionals and NEET top rankers",
      category: "Medical Entrance",
      icon: FaUsers,
      color: "green-600",
      link: "#neet-sessions"
    },
    {
      title: "UPSC Guidance",
      description: "Strategic preparation advice from IAS officers and successful candidates",
      category: "Civil Services",
      icon: FaStar,
      color: "secondary",
      link: "#upsc-sessions"
    },
    {
      title: "GATE Guidance",
      description: "Specialized guidance for all engineering disciplines from GATE toppers",
      category: "Engineering PG",
      icon: FaGraduationCap,
      color: "purple-600",
      link: "#gate-sessions"
    },
    {
      title: "Data Science",
      description: "Master data analysis, machine learning, and AI with guidance from industry experts",
      category: "Tech & Analytics",
      icon: FaStar,
      color: "blue-600",
      link: "#data-science-sessions"
    },
    {
      title: "MBA Preparation",
      description: "Strategic guidance for CAT, XAT, and other management entrance exams from top scorers",
      category: "Management",
      icon: FaUsers,
      color: "orange-600",
      link: "#mba-sessions"
    },
    {
      title: "Research Mentorship",
      description: "Connect with PhD scholars and researchers for guidance on academic research and publications",
      category: "Academic Research",
      icon: FaGraduationCap,
      color: "teal-600",
      link: "#research-sessions"
    },
    {
      title: "Career Mentorship",
      description: "Get guided by IIT/IISc/AIIMS experts and industry leaders for career ",
      category: "Career Development",
      icon: FaGraduationCap,
      color: "teal-600",
      link: "#career-sessions"
    }
  ];



  // Centers data moved to LearningCenters component

  // Reusable component for link with arrow
  const ArrowLink = ({ href, text, color = "primary" }) => (
    <a href={href} className={`text-${color} text-sm font-medium hover:underline flex items-center`}>
      {text} <FaArrowRight className="ml-1 text-xs" />
    </a>
  );

  // Reusable component for icon circles
  const IconCircle = ({ Icon, color, size = "md", className = "" }) => {
    const sizes = {
      sm: "w-5 h-5",
      md: "w-10 h-10",
      lg: "w-12 h-12"
    };

    return (
      <div className={`${sizes[size]} rounded-full bg-${color}/10 flex items-center justify-center ${className}`}>
        <Icon className={`text-${color} ${size === "lg" ? "text-xl" : ""}`} />
      </div>
    );
  };

  // Function to determine if we're on a mobile device
  const isMobile = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 768px)').matches;
    }
    return false;
  };

  return (
    <div className="relative overflow-hidden py-8 sm:py-12 md:py-16 lg:py-24">
      {/* Enhanced Background with Animated Elements - Simplified for mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-primary/5 z-0">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-transparent to-secondary/30"></div>

        {/* Animated Circles - Smaller and simpler on mobile */}
        <motion.div
          className="absolute top-20 right-[10%] w-40 sm:w-64 h-40 sm:h-64 rounded-full bg-primary/5 blur-2xl sm:blur-3xl"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
            x: [0, isMobile() ? 10 : 20, 0],
            y: [0, isMobile() ? -10 : -20, 0]
          }}
          transition={{
            duration: isMobile() ? 12 : 8, // Slower on mobile for better performance
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div
          className="absolute bottom-20 left-[5%] w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-secondary/5 blur-2xl sm:blur-3xl"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
            x: [0, isMobile() ? -5 : -10, 0],
            y: [0, isMobile() ? 15 : 30, 0]
          }}
          transition={{
            duration: isMobile() ? 15 : 10, // Slower on mobile for better performance
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />

        {/* Subtle Grid Pattern - Conditionally rendered for better mobile performance */}
        {!isMobile() && (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjEuOSAyLjEgMi4xdjE5LjhjMCAxLjItLjkgMi4xLTIuMSAyLjFIMTguMWMtMS4yIDAtMi4xLS45LTIuMS0yLjFWMjAuMWMwLTEuMi45LTIuMSAyLjEtMi4xaDE3Ljh6TTYwIDBIMHY2MGg2MFYweiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-5xl">
        {/* Hero Section - Improved for mobile */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          {/* Decorative Element */}
          <motion.div
            className="flex justify-center mb-3 sm:mb-4 md:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </motion.div>

          <motion.h1
            custom={0.3}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0c0c0d] leading-tight mb-3 sm:mb-4 md:mb-6"
          >
            Reinventing <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">Education</span> for <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-dark">Humanity</span>
          </motion.h1>

          <motion.p
            custom={0.4}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-1"
          >
            We believe in education that helps students reinvent concepts for themselves, not just serve capitalism. Explore our online and offline courses in computer science, AI, and more.
          </motion.p>

          {/* Enhanced Search Bar with Glass Effect - Mobile Optimized */}
          <motion.div
            custom={0.5}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="relative max-w-2xl mx-auto mb-10 sm:mb-16"
          >
            {/* Mobile-first approach with responsive design */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row shadow-lg rounded-md overflow-hidden backdrop-blur-sm glass-card">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search courses, programs, videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 border-none bg-white/80 focus:outline-none focus:ring-0 pl-10 sm:pl-12 text-gray-700 text-sm sm:text-base"
                />
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-primary">
                  <FaSearch className="text-sm sm:text-base" />
                </div>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 sm:px-8 py-3 sm:py-4 font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center group text-sm sm:text-base"
                disabled={isSearching}
              >
                <span>{isSearching ? "Searching..." : "Search All"}</span>
                <motion.span
                  className="ml-2"
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaArrowRight className="text-xs sm:text-sm" />
                </motion.span>
              </button>
            </form>
          </motion.div>
        </div>



        {/* Stats section removed as requested */}

        {/* CTA Button removed as requested */}
      </div>

      {/* Expert Counseling Section - Enhanced with Modern Design and Mobile Optimized */}
      <div className="container mx-auto px-4 sm:px-6 mt-8 sm:mt-12 relative z-10 max-w-5xl">
        <div className="text-center mb-6 sm:mb-8">
          {/* Decorative Element */}
          <motion.div
            className="flex justify-center mb-2 sm:mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-1 w-10 sm:w-12 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
          </motion.div>

          <motion.h2
            className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Expert Counseling <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Sessions</span>
          </motion.h2>

          <motion.p
            className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto mb-2 px-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Connect with JEE toppers, GATE toppers, scientists, and researchers from around the world for personalized guidance in your educational journey.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#01427a]/5 to-[#00bcd4]/5 rounded-3xl transform -rotate-1 scale-105 -z-10"></div>

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
              {counselingSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[23%] snap-start px-2 first:pl-4 last:pr-4"
                >
                  <motion.div
                    className="glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-500 relative overflow-hidden group h-full"
                    whileHover={!isMobile() ? {
                      y: -5,
                      transition: { duration: 0.2 }
                    } : {}}
                    whileTap={isMobile() ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Decorative top border */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${session.color} to-${session.color}/30`}></div>

                    {/* Shine effect on hover - only on non-mobile */}
                    {!isMobile() && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                    )}

                    <div className="flex flex-col items-center text-center h-full">
                      <motion.div
                        whileHover={!isMobile() ? {
                          scale: 1.1,
                          rotate: 5,
                          transition: { duration: 0.2 }
                        } : {}}
                      >
                        <IconCircle Icon={session.icon} color={session.color} size="md" className="mb-2" />
                      </motion.div>
                      <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">{session.title}</h3>
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{session.description}</p>
                      <div className="mt-auto w-full pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 truncate max-w-[40%]">{session.category}</span>
                        <ArrowLink href={session.link} text="View Sessions" color={session.color} />
                      </div>
                    </div>
                  </motion.div>
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

      {/* Learning Centers section moved to its own component */}
    </div>
  );
};

export default Hero;