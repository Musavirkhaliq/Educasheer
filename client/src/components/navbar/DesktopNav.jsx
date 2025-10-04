import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown, FaUserCircle, FaGraduationCap, FaVideo, FaBook, FaHeadset, FaEdit, FaLayerGroup, FaMapMarkerAlt, FaTrophy, FaShoppingBag } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import CartIcon from "../cart/CartIcon";

const DesktopNav = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Combined resources menu
  const resources = [
    {
      title: "Study Materials",
      items: [
        { title: "Mathematics", link: "https://github.com/Musavirkhaliq/lecture-notes/tree/main/Mathematics", icon: <FaBook className="text-blue-500" /> },
        { title: "Solved Previous Papers", link: "https://github.com/Musavirkhaliq/lecture-notes/tree/main/Solved%20Previous%20Papers", icon: <FaBook className="text-green-500" /> },
        { title: "ML-Study-Guide", link: "https://github.com/Musavirkhaliq/ML-Study-Guide", icon: <FaBook className="text-purple-500" /> },
        { title: "Statistics", link: "https://github.com/Musavirkhaliq/lecture-notes/tree/main/Statistics", icon: <FaBook className="text-red-500" /> },
      ]
    },
    {
      title: "Categories",
      items: [
        { title: "Advanced Python Programs", link: "#", icon: <FaBook className="text-blue-500" /> },
        { title: "Math's Calculus Programs", link: "#", icon: <FaBook className="text-green-500" /> },
        { title: "AI and ML Programs", link: "#", icon: <FaBook className="text-purple-500" /> },
        { title: "Popular Libraries Program", link: "#", icon: <FaBook className="text-red-500" /> },
      ]
    }
  ];

  return (
    <header
      className={`hidden lg:flex py-2 h-16 w-full z-50 sticky top-0 transition-all duration-500 ${
        scrolled
          ? 'glass-effect shadow-glass-sm translate-y-0'
          : 'bg-transparent -translate-y-1'
      }`}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center group"
          >
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="logo-container">
                <img
                  src="/images/logo.png"
                  alt="EduCasheer Logo"
                  className="h-10 w-auto logo-white"
                />
              </div>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden xl:flex items-center space-x-4 2xl:space-x-6 3xl:space-x-8">
            {/* Main navigation links */}
            <Link
              to="/"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname === '/'
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaGraduationCap className={`${location.pathname === '/' ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Home</span>
              {location.pathname === '/' && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/videos"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname.startsWith('/videos')
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaVideo className={`${location.pathname.startsWith('/videos') ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Videos</span>
              {location.pathname.startsWith('/videos') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/courses"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname.startsWith('/courses')
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaGraduationCap className={`${location.pathname.startsWith('/courses') ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Courses</span>
              {location.pathname.startsWith('/courses') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/programs"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname.startsWith('/programs')
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaLayerGroup className={`${location.pathname.startsWith('/programs') ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Programs</span>
              {location.pathname.startsWith('/programs') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/exams"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname.startsWith('/exams')
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaTrophy className={`${location.pathname.startsWith('/exams') ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Exams</span>
              {location.pathname.startsWith('/exams') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/centers"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname.startsWith('/centers')
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaMapMarkerAlt className={`${location.pathname.startsWith('/centers') ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Centers</span>
              {location.pathname.startsWith('/centers') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>



            {/* Resources Dropdown - Combined Study Materials and Categories */}
            <div className="relative group">
              <button className={`flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                scrolled ? 'text-gray-700 hover:text-primary' : 'text-gray-700 hover:text-primary'
              }`}>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FaBook className="text-primary" />
                </motion.div>
                <span>Resources</span>
                <FaAngleDown className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute left-0 top-full hidden group-hover:block pt-2 z-50">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card w-72 overflow-hidden"
                >
                  {resources.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={sectionIndex > 0 ? "border-t border-white/10" : ""}>
                      <div className="px-4 py-2 font-medium text-primary/80 text-sm bg-white/10 backdrop-blur-sm">
                        {section.title}
                      </div>
                      <ul className="py-1">
                        {section.items.map((item, index) => (
                          <li key={index}>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-white/20 hover:text-primary transition-colors duration-300"
                            >
                              <motion.span
                                className="mr-3"
                                whileHover={{ rotate: 15 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                {item.icon}
                              </motion.span>
                              {item.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            <Link
              to="/blogs"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname.startsWith('/blogs')
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaEdit className={`${location.pathname.startsWith('/blogs') ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Blogs</span>
              {location.pathname.startsWith('/blogs') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/contact"
              className={`relative flex items-center space-x-2 font-medium transition-all duration-300 py-1 ${
                location.pathname.startsWith('/contact')
                  ? 'neon-text'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaHeadset className={`${location.pathname.startsWith('/contact') ? 'text-primary animate-pulse-slow' : 'text-primary'}`} />
              </motion.div>
              <span>Contact</span>
              {location.pathname.startsWith('/contact') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>
          </div>

          {/* Cart and Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && <CartIcon />}
            {isAuthenticated ? (
              <div className="relative group">
                <motion.button
                  className="flex items-center space-x-2 p-1.5 rounded-full glass-effect hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary shadow-neon"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-neon">
                      {currentUser?.fullName?.charAt(0) || <FaUserCircle className="text-lg" />}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 mr-1">{currentUser?.fullName?.split(' ')[0]}</span>
                  <FaAngleDown className="text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
                </motion.button>

                <div className="absolute right-0 top-full hidden group-hover:block pt-2 z-50">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card w-56 overflow-hidden"
                  >
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-primary transition-all duration-200"
                      >
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <FaUserCircle className="mr-3 text-primary" />
                        </motion.div>
                        My Profile
                      </Link>
                      <Link
                        to="/courses"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-primary transition-all duration-200"
                      >
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <FaGraduationCap className="mr-3 text-primary" />
                        </motion.div>
                        My Courses
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-primary transition-all duration-200"
                      >
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <FaShoppingBag className="mr-3 text-primary" />
                        </motion.div>
                        My Orders
                      </Link>
                      <Link
                        to="/gamification"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-primary transition-all duration-200"
                      >
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <FaTrophy className="mr-3 text-primary" />
                        </motion.div>
                        My Achievements
                      </Link>
                    </div>

                    {/* Role-specific links - Only show if user has a special role */}
                    {(currentUser?.role === "admin" || currentUser?.role === "tutor" ||
                      (currentUser?.role === "learner" && currentUser?.tutorStatus)) && (
                      <div className="py-1 border-t border-white/10">
                        {currentUser?.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-purple-500 transition-all duration-200"
                          >
                            <motion.div
                              whileHover={{ rotate: 15 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <FaUserCircle className="mr-3 text-purple-500" />
                            </motion.div>
                            Admin Dashboard
                          </Link>
                        )}

                        {currentUser?.role === "tutor" && (
                          <Link
                            to="/tutor/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-blue-500 transition-all duration-200"
                          >
                            <motion.div
                              whileHover={{ rotate: 15 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <FaUserCircle className="mr-3 text-blue-500" />
                            </motion.div>
                            Tutor Dashboard
                          </Link>
                        )}

                        {currentUser?.role === "learner" && currentUser?.tutorStatus === "none" && (
                          <Link
                            to="/become-tutor"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-green-500 transition-all duration-200"
                          >
                            <motion.div
                              whileHover={{ rotate: 15 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <FaUserCircle className="mr-3 text-green-500" />
                            </motion.div>
                            Become a Tutor
                          </Link>
                        )}

                        {currentUser?.role === "learner" && currentUser?.tutorStatus === "pending" && (
                          <Link
                            to="/become-tutor"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-yellow-500 transition-all duration-200"
                          >
                            <motion.div
                              whileHover={{ rotate: 15 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <FaUserCircle className="mr-3 text-yellow-500" />
                            </motion.div>
                            Application Status
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="py-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/30 hover:text-red-500 transition-all duration-200"
                      >
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </motion.div>
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                  className="btn-glass text-primary neon-border px-5 py-1.5 rounded-full text-sm font-medium hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-secondary transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-1.5 rounded-full text-sm font-medium shadow-neon hover:shadow-neon-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Register
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DesktopNav;
