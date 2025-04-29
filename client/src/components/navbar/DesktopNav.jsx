import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown, FaUserCircle, FaGraduationCap, FaVideo, FaBook, FaHeadset, FaEdit } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

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

  const studyMaterials = [
    {
      title: "Mathematics",
      link: "https://github.com/Musavirkhaliq/lecture-notes/tree/main/Mathematics",
      icon: <FaBook className="text-blue-500" />
    },
    {
      title: "Solved Previous Year Questions",
      link: "https://github.com/Musavirkhaliq/lecture-notes/tree/main/Solved%20Previous%20Papers",
      icon: <FaBook className="text-green-500" />
    },
    {
      title: "ML-Study-Guide",
      link: "https://github.com/Musavirkhaliq/ML-Study-Guide",
      icon: <FaBook className="text-purple-500" />
    },
    {
      title: "Statistics",
      link: "https://github.com/Musavirkhaliq/lecture-notes/tree/main/Statistics",
      icon: <FaBook className="text-red-500" />
    },
  ];

  const categories = [
    { title: "Advanced Python Programs", link: "#", icon: <FaBook className="text-blue-500" /> },
    { title: "Math's Calculus Programs", link: "#", icon: <FaBook className="text-green-500" /> },
    { title: "AI and ML Programs", link: "#", icon: <FaBook className="text-purple-500" /> },
    { title: "Popular Libraries Program", link: "#", icon: <FaBook className="text-red-500" /> },
  ];

  return (
    <header
      className={`hidden lg:flex py-2 h-20 w-full z-50 sticky top-0 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white font-bold text-2xl px-3 py-1 rounded-lg mr-2">EC</div>
              <span className="text-xl font-bold text-gray-800">EduCasheer</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden xl:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                location.pathname === '/' ? 'text-[#00bcd4]' : 'text-gray-700 hover:text-[#00bcd4]'
              }`}
            >
              <FaGraduationCap className="text-[#00bcd4]" />
              <span>Home</span>
              {location.pathname === '/' && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00bcd4] rounded-full"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/videos"
              className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                location.pathname.startsWith('/videos') ? 'text-[#00bcd4]' : 'text-gray-700 hover:text-[#00bcd4]'
              }`}
            >
              <FaVideo className="text-[#00bcd4]" />
              <span>Videos</span>
              {location.pathname.startsWith('/videos') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00bcd4] rounded-full"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/courses"
              className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                location.pathname.startsWith('/courses') ? 'text-[#00bcd4]' : 'text-gray-700 hover:text-[#00bcd4]'
              }`}
            >
              <FaGraduationCap className="text-[#00bcd4]" />
              <span>Courses</span>
              {location.pathname.startsWith('/courses') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00bcd4] rounded-full"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            {/* Study Material Dropdown */}
            <div className="relative group">
              <button className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                scrolled ? 'text-gray-700 hover:text-[#00bcd4]' : 'text-gray-700 hover:text-[#00bcd4]'
              }`}>
                <FaBook className="text-[#00bcd4]" />
                <span>Study Material</span>
                <FaAngleDown className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute left-0 top-full hidden group-hover:block pt-2 z-50">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-64 overflow-hidden">
                  <ul className="py-2">
                    {studyMaterials.map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4] transition-colors duration-300"
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                scrolled ? 'text-gray-700 hover:text-[#00bcd4]' : 'text-gray-700 hover:text-[#00bcd4]'
              }`}>
                <FaBook className="text-[#00bcd4]" />
                <span>Categories</span>
                <FaAngleDown className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute left-0 top-full hidden group-hover:block pt-2 z-50">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-64 overflow-hidden">
                  <ul className="py-2">
                    {categories.map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.link}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4] transition-colors duration-300"
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Link
              to="/blogs"
              className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                location.pathname.startsWith('/blogs') ? 'text-[#00bcd4]' : 'text-gray-700 hover:text-[#00bcd4]'
              }`}
            >
              <FaEdit className="text-[#00bcd4]" />
              <span>Blogs</span>
              {location.pathname.startsWith('/blogs') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00bcd4] rounded-full"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>

            <Link
              to="/contact"
              className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                location.pathname.startsWith('/contact') ? 'text-[#00bcd4]' : 'text-gray-700 hover:text-[#00bcd4]'
              }`}
            >
              <FaHeadset className="text-[#00bcd4]" />
              <span>Contact Us</span>
              {location.pathname.startsWith('/contact') && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00bcd4] rounded-full"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-gray-700 font-medium">
                  Welcome, {currentUser?.fullName?.split(' ')[0]}
                </div>
                <div className="relative group">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-[#00bcd4]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00bcd4] to-[#01427a] flex items-center justify-center text-white">
                        {currentUser?.fullName?.charAt(0) || <FaUserCircle className="text-xl" />}
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-10 hidden group-hover:block border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-gray-50">
                      <div className="truncate">{currentUser?.fullName}</div>
                      <div className="truncate text-xs text-gray-400 mt-1">
                        Role: {currentUser?.role?.charAt(0).toUpperCase() + currentUser?.role?.slice(1)}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4]"
                      >
                        <FaUserCircle className="mr-3 text-[#00bcd4]" />
                        My Profile
                      </Link>
                      <Link
                        to="/my-courses"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4]"
                      >
                        <FaGraduationCap className="mr-3 text-[#00bcd4]" />
                        My Courses
                      </Link>
                    </div>

                    {/* Role-specific links */}
                    <div className="py-1 border-t border-gray-100">
                      {/* Admin-specific links */}
                      {currentUser?.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4] bg-purple-50"
                        >
                          <FaUserCircle className="mr-3 text-purple-500" />
                          Admin Dashboard
                        </Link>
                      )}

                      {/* Tutor-specific links */}
                      {currentUser?.role === "tutor" && (
                        <Link
                          to="/tutor/dashboard"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4] bg-blue-50"
                        >
                          <FaUserCircle className="mr-3 text-blue-500" />
                          Tutor Dashboard
                        </Link>
                      )}

                      {/* Learner-specific links */}
                      {currentUser?.role === "learner" && currentUser?.tutorStatus === "none" && (
                        <Link
                          to="/become-tutor"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4] bg-green-50"
                        >
                          <FaUserCircle className="mr-3 text-green-500" />
                          Become a Tutor
                        </Link>
                      )}

                      {/* Application status link */}
                      {currentUser?.role === "learner" && currentUser?.tutorStatus === "pending" && (
                        <Link
                          to="/become-tutor"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00bcd4] bg-yellow-50"
                        >
                          <FaUserCircle className="mr-3 text-yellow-500" />
                          Application Status
                        </Link>
                      )}
                    </div>

                    <div className="py-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white border border-[#00bcd4] text-[#00bcd4] px-6 py-2.5 rounded-full font-medium hover:bg-[#00bcd4] hover:text-white transition-all duration-300 shadow-sm"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DesktopNav;
