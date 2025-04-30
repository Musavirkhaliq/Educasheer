import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaVideo, FaGraduationCap, FaLayerGroup, FaBook, FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "../../utils/NavigationLinks";

const MobileNav = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  // Close drawer when location changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Handle body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDrawerOpen]);

  // Bottom navigation items
  const bottomNavItems = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Videos", path: "/videos", icon: FaVideo },
    { name: "Courses", path: "/courses", icon: FaGraduationCap },
    { name: "Programs", path: "/programs", icon: FaLayerGroup },
    { name: "Menu", path: "#", icon: FaBars, action: () => setIsDrawerOpen(true) },
  ];

  // Drawer animation variants
  const drawerVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  // Handle swipe to close drawer
  const handleSwipeRight = (info) => {
    if (info.offset.x > 100) {
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Top Mobile Header */}
      <header
        className={`lg:hidden flex py-2 h-16 w-full z-40 sticky top-0 transition-all duration-500 ${
          scrolled
            ? 'glass-effect shadow-glass-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              className="flex items-center"
              whileTap={{ scale: 0.95 }}
            >
              <div className="logo-container">
                <img
                  src="/images/logo.png"
                  alt="EduCasheer Logo"
                  className="h-8 w-auto logo-white"
                />
              </div>
            </motion.div>
          </Link>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile")}
                className="p-1.5 rounded-full glass-effect"
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
              </motion.div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="btn-glass text-primary neon-border px-4 py-1.5 rounded-full text-sm font-medium"
              >
                Login
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-effect shadow-glass-lg border-t border-white/20">
        <div className="flex justify-around items-center h-16">
          {bottomNavItems.map((item, index) => (
            <motion.div
              key={index}
              className="flex-1 h-full"
              whileTap={{ scale: 0.9 }}
            >
              {item.action ? (
                <button
                  onClick={item.action}
                  className="w-full h-full flex flex-col items-center justify-center space-y-1"
                >
                  <item.icon className={`text-xl ${location.pathname === item.path ? 'text-primary' : 'text-gray-600'}`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              ) : (
                <Link
                  to={item.path}
                  className="w-full h-full flex flex-col items-center justify-center space-y-1"
                >
                  <item.icon
                    className={`text-xl ${location.pathname === item.path ? 'text-primary' : 'text-gray-600'}`}
                  />
                  <span className={`text-xs font-medium ${location.pathname === item.path ? 'text-primary' : 'text-gray-600'}`}>
                    {item.name}
                  </span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="mobile-indicator"
                      className="absolute bottom-0 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full shadow-neon"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white z-50 lg:hidden glass-effect-dark overflow-y-auto"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => handleSwipeRight(info)}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="logo-container">
                    <img
                      src="/images/logo.png"
                      alt="EduCasheer Logo"
                      className="h-8 w-auto logo-white-dark"
                    />
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <FaTimes className="text-white text-xl" />
                </motion.button>
              </div>

              {/* User Info (if authenticated) */}
              {isAuthenticated && (
                <motion.div
                  variants={itemVariants}
                  className="p-4 border-b border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-neon"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-neon">
                        {currentUser?.fullName?.charAt(0) || <FaUserCircle className="text-2xl" />}
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-medium">{currentUser?.fullName || "User"}</h3>
                      <p className="text-white/70 text-sm">{currentUser?.email || ""}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/profile")}
                      className="flex-1 py-2 rounded-lg bg-white/10 text-white text-sm font-medium"
                    >
                      Profile
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        logout();
                        navigate('/');
                        setIsDrawerOpen(false);
                      }}
                      className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium"
                    >
                      Logout
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Navigation Links */}
              <div className="p-4">
                <h3 className="text-white/80 text-sm font-medium mb-2">Navigation</h3>
                <div className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={link.address}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          location.pathname === link.address
                            ? 'bg-white/10 text-primary'
                            : 'text-white hover:bg-white/5'
                        }`}
                      >
                        <span className={location.pathname === link.address ? 'text-primary' : 'text-white/70'}>
                          {link.icon}
                        </span>
                        <span>{link.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Auth Buttons (if not authenticated) */}
              {!isAuthenticated && (
                <motion.div
                  variants={itemVariants}
                  className="p-4 mt-4 border-t border-white/10"
                >
                  <div className="flex space-x-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate("/login");
                        setIsDrawerOpen(false);
                      }}
                      className="flex-1 py-3 rounded-lg bg-white/10 text-white text-sm font-medium"
                    >
                      Login
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate("/signup");
                        setIsDrawerOpen(false);
                      }}
                      className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium shadow-neon"
                    >
                      Register
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Swipe indicator */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <motion.div
                  className="w-12 h-1 bg-white/20 rounded-full"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Extra padding for bottom navigation */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default MobileNav;
