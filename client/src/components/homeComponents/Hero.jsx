import React, { useState, useEffect } from "react";
import { FaSearch, FaGraduationCap, FaUsers, FaStar, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants for consistent animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: "easeOut" }
    })
  };

  // Common data structures for repeating elements
  const stats = [
    { icon: FaGraduationCap, count: "50+", label: "Offline & Online Courses" },
    { icon: FaUsers, count: "1,000+", label: "Expert Mentors" },
    { icon: FaStar, count: "100%", label: "Human-Centered" },
  ];

  const featureCards = [
    {
      title: "EduCasheer SiliconSpark",
      description: "Cutting-edge computing labs with AI and CS equipment",
      action: "Find a Center",
      icon: FaGraduationCap,
      color: "primary",
    },
    {
      title: "EduCasheer Hikmah Lounge",
      description: "Comfortable learning spaces with comprehensive resources",
      action: "Find a Center",
      icon: FaGraduationCap,
      color: "blue-600",
    },
    {
      title: "Expert Counseling",
      description: "Connect with JEE/GATE/USPC/JKSSB toppers, scientists, and researchers",
      action: "Watch Sessions",
      icon: FaUsers,
      color: "secondary",
    },
    {
      title: "CS & AI Courses",
      description: "Cutting-edge curriculum in computer science, AI, machine learning & more",
      action: "Explore Courses",
      icon: FaStar,
      color: "green-600",
    },
  ];

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
      title: "GATE Coaching",
      description: "Specialized guidance for all engineering disciplines from GATE toppers",
      category: "Engineering PG",
      icon: FaGraduationCap,
      color: "purple-600",
      link: "#gate-sessions"
    }
  ];

  const specializedSessions = [
    { title: "Research Mentorship", link: "#research-mentorship" },
    { title: "Career Guidance", link: "#career-guidance" },
    { title: "Study Abroad", link: "#study-abroad" },
    { title: "Programming", link: "#programming" },
    { title: "AI & ML", link: "#ai-ml" },
    { title: "View All", link: "#all-sessions", highlight: true }
  ];

  const centers = [
    {
      name: "Educasheers SiliconSpark",
      description: "Cutting-edge computing labs with specialized AI and CS equipment. Perfect for hands-on learning and practical skill development.",
      image: "https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      badge: "15+ Centers",
      badgeColor: "primary",
      features: [
        { icon: FaGraduationCap, text: "Advanced computing hardware", iconBg: "green-100", iconColor: "green-600" },
        { icon: FaUsers, text: "Small batch sizes (max 15 students)", iconBg: "blue-100", iconColor: "blue-600" }
      ],
      actionText: "Find a SiliconSpark Center",
      actionLink: "centers",
      actionColor: "primary"
    },
    {
      name: "Educasheer Hikmah Learning Lounge",
      description: "Comfortable learning spaces with comprehensive study resources. Designed for focused learning and collaborative projects.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      badge: "10+ Centers",
      badgeColor: "secondary",
      features: [
        { icon: FaStar, text: "Extensive library resources", iconBg: "purple-100", iconColor: "purple-600" },
        { icon: FaGraduationCap, text: "Quiet study and group work areas", iconBg: "green-100", iconColor: "green-600" }
      ],
      actionText: "Find a Hikmah Learning Lounge",
      actionLink: "centers",
      actionColor: "secondary"
    }
  ];

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
            <div className="flex flex-col sm:flex-row shadow-lg rounded-md overflow-hidden backdrop-blur-sm glass-card">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search courses, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 border-none bg-white/80 focus:outline-none focus:ring-0 pl-10 sm:pl-12 text-gray-700 text-sm sm:text-base"
                />
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-primary">
                  <FaSearch className="text-sm sm:text-base" />
                </div>
              </div>
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 sm:px-8 py-3 sm:py-4 font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center group text-sm sm:text-base">
                <span>Search</span>
                <motion.span
                  className="ml-2"
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaArrowRight className="text-xs sm:text-sm" />
                </motion.span>
              </button>
            </div>

            {/* Floating Tags - Responsive */}
            <motion.div
              className="absolute -bottom-8 sm:-bottom-6 left-0 right-0 flex justify-center gap-1 sm:gap-2 flex-wrap px-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <span className="text-[10px] sm:text-xs bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-gray-500 shadow-sm mb-1">AI & ML</span>
              <span className="text-[10px] sm:text-xs bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-gray-500 shadow-sm mb-1">Computer Science</span>
              <span className="text-[10px] sm:text-xs bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-gray-500 shadow-sm mb-1">JEE Prep</span>
              <span className="text-[10px] sm:text-xs bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-gray-500 shadow-sm mb-1">GATE Coaching</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature Cards - Enhanced with Glass Effect and Mobile Optimized */}
        <motion.div
          custom={0.6}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16"
        >
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              className="glass-card p-4 sm:p-5 rounded-xl hover:shadow-lg transition-all duration-500 relative overflow-hidden group"
              whileHover={{
                y: -5,
                transition: { duration: 0.2 }
              }}
              // Add tap animation for mobile
              whileTap={isMobile() ? { scale: 0.98 } : {}}
            >
              {/* Decorative top border */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${card.color} to-${card.color}/30`}></div>

              {/* Shine effect on hover - only on non-mobile */}
              {!isMobile() && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              )}

              {/* Mobile-optimized layout */}
              <div className="flex flex-col items-center sm:flex-row sm:items-center mb-2 sm:mb-3">
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={!isMobile() ? { scale: 1.1, rotate: 5 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-2 sm:mb-0 flex justify-center sm:justify-start"
                >
                  <IconCircle Icon={card.icon} color={card.color} size="md" className="sm:mr-3" />
                </motion.div>
                <h3 className="font-bold text-sm sm:text-base text-gray-800 text-center sm:text-left">{card.title}</h3>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed text-center sm:text-left mb-3 sm:mb-4">{card.description}</p>
              <div className="pt-2 border-t border-gray-100 flex justify-center sm:justify-start">
                <ArrowLink href="" text={card.action} color={card.color} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats - Enhanced with Visual Elements and Mobile Optimized */}
        <motion.div
          custom={0.7}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="relative mb-8 sm:mb-12 md:mb-16 py-6 sm:py-8 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/80 to-white/50 backdrop-blur-sm shadow-lg border border-white/20 overflow-hidden"
        >
          {/* Background decorative elements - Simplified for mobile */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -right-10 -top-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-primary/30 blur-lg"></div>
            <div className="absolute -left-10 -bottom-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-secondary/30 blur-lg"></div>
          </div>

          <div className="relative z-10 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center w-[calc(50%-0.5rem)] sm:w-auto" // 2 columns on mobile, auto on larger screens
                whileHover={!isMobile() ? {
                  scale: 1.05,
                  transition: { duration: 0.2 }
                } : {}}
                whileTap={isMobile() ? { scale: 0.98 } : {}}
              >
                <div className="mb-1 sm:mb-2">
                  <motion.div
                    className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 mb-1 sm:mb-2"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: isMobile() ? 30 : 20, // Slower on mobile for better performance
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <stat.icon className="text-base sm:text-lg text-primary" />
                  </motion.div>
                </div>
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-800 mb-1">{stat.count}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button - Enhanced with Animation and Mobile Optimized */}
        <motion.div
          custom={0.8}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.a
            href="#"
            className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-6 sm:px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            whileHover={!isMobile() ? { scale: 1.03 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center text-sm">
              Get Started
              <motion.span
                className="ml-2"
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: isMobile() ? 2 : 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <FaArrowRight className="text-xs" />
              </motion.span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </motion.a>
        </motion.div>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {counselingSessions.map((session, index) => (
            <motion.div
              key={index}
              className="glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-500 relative overflow-hidden group"
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

              <div className="flex flex-col items-center text-center">
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
          ))}
        </motion.div>

        {/* Additional Session Types - Enhanced with Modern Design and Mobile Optimized */}
        <motion.div
          className="mt-6 sm:mt-8 glass-card p-4 sm:p-6 rounded-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-800">More Specialized Sessions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {specializedSessions.map((session, index) => (
              <motion.a
                key={index}
                href={session.link}
                className={`${session.highlight ? 'bg-gradient-to-r from-primary/20 to-primary/10' : 'bg-white/80'} p-2 sm:p-3 rounded-lg sm:rounded-xl text-center hover:shadow-md transition-all duration-300 border border-white/50 backdrop-blur-sm`}
                whileHover={!isMobile() ? {
                  y: -3,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 }
                } : {}}
                whileTap={isMobile() ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className={`text-xs font-medium ${session.highlight ? 'text-primary' : 'text-gray-700'}`}>{session.title}</div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Offline Centers Section - Enhanced with Modern Design and Mobile Optimized */}
      <div className="container mx-auto px-4 sm:px-6 mt-8 sm:mt-12 md:mt-16 mb-8 sm:mb-12 md:mb-16 relative z-10 max-w-5xl">
        <div className="text-center mb-6 sm:mb-8">
          {/* Decorative Element */}
          <motion.div
            className="flex justify-center mb-2 sm:mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-1 w-10 sm:w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </motion.div>

          <motion.h2
            className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Nationwide <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Learning Centers</span>
          </motion.h2>

          <motion.p
            className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto mb-2 px-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Our Educasheer centers are expanding nationwide, offering state-of-the-art facilities and personalized learning experiences.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {centers.map((center, index) => (
            <motion.div
              key={index}
              className="glass-card rounded-xl shadow-lg overflow-hidden group"
              whileHover={!isMobile() ? {
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              } : {}}
              whileTap={isMobile() ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <div className="relative h-36 sm:h-44 overflow-hidden">
                <motion.img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover"
                  whileHover={!isMobile() ? { scale: 1.05 } : {}}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Floating Badge - Responsive */}
                <motion.div
                  className="absolute top-2 right-2 sm:top-3 sm:right-3"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <span className={`bg-${center.badgeColor} text-white text-[10px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center`}>
                    <FaGraduationCap className="mr-1" /> {center.badge}
                  </span>
                </motion.div>

                {/* Center Name Overlay - Responsive */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-0 drop-shadow-md">{center.name}</h3>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <p className="text-gray-600 text-xs mb-3 sm:mb-4 leading-relaxed">{center.description}</p>

                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                  <h4 className="font-medium text-gray-800 mb-2 text-xs">Center Features:</h4>
                  <ul className="space-y-2">
                    {center.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs">
                        <span className={`w-5 h-5 rounded-full bg-${feature.iconBg} flex items-center justify-center mr-2 shadow-sm`}>
                          <feature.icon className={`text-${feature.iconColor} text-[10px]`} />
                        </span>
                        <span className="text-gray-700">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <motion.div
                    whileHover={!isMobile() ? { x: 3 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowLink href={center.actionLink} text={center.actionText} color={center.actionColor} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-6 sm:mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <motion.a
            href="centers"
            className="inline-block bg-gradient-to-r from-secondary to-secondary-dark text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            whileHover={!isMobile() ? { scale: 1.03 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center text-xs sm:text-sm">
              View All Centers
              <motion.span
                className="ml-2"
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: isMobile() ? 2 : 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <FaArrowRight className="text-xs" />
              </motion.span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;