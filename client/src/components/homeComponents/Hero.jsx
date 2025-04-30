import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaGraduationCap, FaUsers, FaStar, FaArrowRight, FaPlay } from "react-icons/fa";
import { motion, useAnimation } from "framer-motion";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const controls = useAnimation();

  // Detect if device is mobile for conditional rendering
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle swipe gesture for stats on mobile
  const handleDragEnd = (event, info) => {
    if (info.offset.x > 50) {
      // Swiped right
      setCurrentStat(prev => (prev === 0 ? 2 : prev - 1));
    } else if (info.offset.x < -50) {
      // Swiped left
      setCurrentStat(prev => (prev === 2 ? 0 : prev + 1));
    }
  };

  const stats = [
    { icon: FaGraduationCap, count: "10,000+", label: "Courses" },
    { icon: FaUsers, count: "500,000+", label: "Students" },
    { icon: FaStar, count: "95%", label: "Satisfaction" },
  ];

  return (
    <div className="relative overflow-hidden py-12 sm:py-16 md:py-24">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-cyan-50 opacity-80"></div>

        {/* Conditional rendering based on device type */}
        {!isMobile ? (
          // Desktop animations - full experience
          <>
            {/* Animated blobs */}
            <motion.div
              className="absolute top-0 right-0 bg-gradient-to-bl from-primary/10 to-transparent w-1/2 h-1/2 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            ></motion.div>

            <motion.div
              className="absolute bottom-0 left-0 bg-gradient-to-tr from-secondary/10 to-transparent w-1/2 h-1/2 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            ></motion.div>

            {/* Decorative circles */}
            <motion.div
              className="absolute top-20 left-10 w-64 h-64 border border-primary/20 rounded-full"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>

            <motion.div
              className="absolute bottom-20 right-10 w-40 h-40 border border-secondary/20 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>

            <motion.div
              className="absolute top-40 right-20 w-20 h-20 border border-primary/30 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
          </>
        ) : (
          // Mobile - simplified static elements for better performance
          <>
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary/10 to-transparent w-1/2 h-1/2 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-secondary/10 to-transparent w-1/2 h-1/2 rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-10 w-64 h-64 border border-primary/20 rounded-full"></div>
          </>
        )}

        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-glass-shine opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-block px-4 py-1 glass-effect rounded-full shadow-glass-sm"
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-secondary font-medium text-sm neon-text">Unlock Your Learning Potential</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0c0c0d] leading-tight"
              >
                Empowering You to <span className="gradient-text animate-glow">Learn</span> and <span className="gradient-text animate-glow">Succeed</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl"
              >
                Explore expertly curated educational videos on diverse topics from industry leaders and educators. Start your learning journey today.
              </motion.p>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="relative"
            >
              <div className="glass-effect rounded-full shadow-glass p-1">
                <input
                  type="text"
                  placeholder="Search for courses, topics, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-none bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary pl-12"
                />
                <motion.div
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaSearch />
                </motion.div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-medium shadow-neon hover:shadow-neon-lg transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Start Learning Now
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
              <motion.button
                className="btn-glass neon-border text-primary px-8 py-3 rounded-full font-medium hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaPlay className="mr-2 inline-block" />
                Browse Free Resources
              </motion.button>
            </motion.div>

            {/* Stats */}
            {/* Desktop Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="hidden sm:grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-6 sm:pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card p-3 sm:p-4 text-center"
                >
                  <motion.div
                    className="bg-gradient-to-br from-primary/20 to-secondary/10 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-neon"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <stat.icon className="text-xl sm:text-2xl text-primary" />
                  </motion.div>
                  <div className="font-bold text-lg sm:text-xl md:text-2xl gradient-text">
                    {stat.count}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile Stats with Swipe */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="sm:hidden pt-6"
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="glass-card p-4 text-center relative overflow-hidden"
              >
                <motion.div
                  className="flex transition-all duration-300 ease-out"
                  animate={{ x: -currentStat * 100 + '%' }}
                >
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="w-full flex-shrink-0 px-4"
                    >
                      <motion.div
                        className="bg-gradient-to-br from-primary/20 to-secondary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-neon"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <stat.icon className="text-2xl text-primary" />
                      </motion.div>
                      <div className="font-bold text-2xl gradient-text">
                        {stat.count}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Swipe indicator */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                  {stats.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${currentStat === index ? 'bg-primary' : 'bg-gray-300'}`}
                      animate={{ scale: currentStat === index ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 1, repeat: currentStat === index ? Infinity : 0 }}
                    />
                  ))}
                </div>

                {/* Swipe hint */}
                <div className="absolute -bottom-3 left-0 right-0 text-xs text-center text-gray-400">
                  Swipe to see more
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Section - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-glass-lg glass-card"
              whileTap={{ scale: 0.98 }}
              // Only enable drag on desktop for better performance
              {...(!isMobile && {
                drag: true,
                dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
                dragElastic: 0.1,
                dragTransition: { bounceStiffness: 600, bounceDamping: 20 }
              })}
            >
              <img
                src="https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/6502da06dd3676099cf24de0_Top-educational-software.webp"
                alt="Learning Environment"
                className="w-full h-full object-cover"
                loading="lazy"
                srcSet="
                  https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/6502da06dd3676099cf24de0_Top-educational-software.webp 1200w,
                  https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/6502da06dd3676099cf24de0_Top-educational-software.webp?width=800 800w,
                  https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/6502da06dd3676099cf24de0_Top-educational-software.webp?width=500 500w
                "
                sizes="(max-width: 768px) 100vw, 50vw"
                width="800"
                height="600"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/70 to-primary/30" />

              {/* Conditional rendering for badges based on device */}
              {!isMobile ? (
                // Desktop - full animations
                <>
                  {/* Floating Badges */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="absolute top-6 left-6"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="glass-effect px-4 py-2 rounded-full text-sm font-medium shadow-glass flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      >
                        <FaStar className="mr-2 text-primary" />
                      </motion.div>
                      <span className="neon-text">Learn Anytime, Anywhere</span>
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    className="absolute top-20 left-10"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="glass-effect px-4 py-2 rounded-full text-sm font-medium shadow-glass flex items-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FaGraduationCap className="mr-2 text-primary" />
                      </motion.div>
                      <span className="neon-text">10,000+ Videos Available</span>
                    </span>
                  </motion.div>

                  {/* Additional floating element */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                    className="absolute bottom-6 right-6"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="glass-effect px-4 py-3 rounded-xl text-sm font-medium shadow-glass">
                      <div className="flex items-center space-x-2">
                        <motion.div
                          className="w-3 h-3 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                        <span className="text-secondary font-semibold neon-text">Live Classes Available</span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">Join expert-led sessions today</p>
                    </div>
                  </motion.div>
                </>
              ) : (
                // Mobile - simplified badges with minimal animations
                <>
                  {/* Single badge for mobile */}
                  <div className="absolute top-4 left-4">
                    <span className="glass-effect px-3 py-1 rounded-full text-xs font-medium shadow-glass flex items-center">
                      <FaStar className="mr-1 text-primary" />
                      <span>Learn Anytime, Anywhere</span>
                    </span>
                  </div>

                  {/* Simplified live classes badge */}
                  <div className="absolute bottom-4 right-4">
                    <div className="glass-effect px-3 py-2 rounded-xl text-xs font-medium shadow-glass">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-secondary font-semibold">Live Classes</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Play button overlay - simplified for mobile */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!isMobile ? (
                  <motion.button
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neon border border-white/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FaPlay className="text-white text-xl ml-1" />
                    </motion.div>
                  </motion.button>
                ) : (
                  <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neon border border-white/30">
                    <FaPlay className="text-white text-lg ml-1" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Decorative elements - only on desktop */}
            {!isMobile && (
              <>
                <motion.div
                  className="absolute -bottom-5 -right-5 w-20 h-20 bg-primary/20 rounded-full blur-md"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity }}
                ></motion.div>
                <motion.div
                  className="absolute -top-5 -left-5 w-20 h-20 bg-secondary/20 rounded-full blur-md"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                ></motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
