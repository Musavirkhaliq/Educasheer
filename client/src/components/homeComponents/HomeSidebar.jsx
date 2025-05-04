import React from 'react';
import { useAuth } from '../../context/AuthContext';
import GamificationWidget from '../gamification/GamificationWidget';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaVideo, FaBook, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';

const HomeSidebar = () => {
  const { isAuthenticated, currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* User Gamification Widget (only for authenticated users) */}
      {isAuthenticated && currentUser && (
        <div className="mb-6">
          <GamificationWidget />
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] p-4">
          <h3 className="text-white font-medium">Quick Links</h3>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/courses" 
                className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <FaGraduationCap className="text-[#00bcd4] mr-3" />
                <span>All Courses</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/videos" 
                className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <FaVideo className="text-[#00bcd4] mr-3" />
                <span>Videos</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/blogs" 
                className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <FaBook className="text-[#00bcd4] mr-3" />
                <span>Blogs</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/centers" 
                className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <FaUsers className="text-[#00bcd4] mr-3" />
                <span>Learning Centers</span>
              </Link>
            </li>
            {!isAuthenticated && (
              <li>
                <Link 
                  to="/become-tutor" 
                  className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <FaChalkboardTeacher className="text-[#00bcd4] mr-3" />
                  <span>Become a Tutor</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Call to Action for Non-Authenticated Users */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="font-bold text-xl mb-2">Join Our Learning Community</h3>
          <p className="mb-4 text-white/90">Sign up to track your progress, earn points, and unlock achievements!</p>
          <div className="flex space-x-3">
            <Link 
              to="/register" 
              className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 bg-indigo-700 text-white rounded-md font-medium hover:bg-indigo-800 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSidebar;
