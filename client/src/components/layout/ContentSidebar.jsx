import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaGraduationCap,
  FaTrophy,
  FaChartLine,
  FaHistory,
  FaAward,
  FaUser,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';
import GamificationWidget from '../gamification/GamificationWidget';

const ContentSidebar = ({ className = '' }) => {
  const { isAuthenticated, currentUser } = useAuth();

  const examDashboardLinks = [
    { to: '/exams', icon: FaAward, label: 'All Exams', color: 'text-purple-500' },
    { to: '/test-series', icon: FaTrophy, label: 'Test Series', color: 'text-yellow-500' },
    { to: '/courses', icon: FaGraduationCap, label: 'Courses', color: 'text-blue-500' },
  ];

  const userDashboardLinks = isAuthenticated ? [
    { to: '/profile', icon: FaUser, label: 'My Profile', color: 'text-gray-600' },
    { to: '/orders', icon: FaHistory, label: 'My Orders', color: 'text-blue-600' },
    { to: '/gamification', icon: FaChartLine, label: 'Progress & Achievements', color: 'text-yellow-600' },
  ] : [];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* User Progress Widget (for authenticated users) */}
      {isAuthenticated && currentUser && (
        <div className="sticky top-6">
          <GamificationWidget compact />
        </div>
      )}

      {/* Exam Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] p-3">
          <h3 className="text-white font-semibold">Exam Dashboard</h3>
        </div>
        <div className="p-3">
          <nav className="space-y-1">
            {examDashboardLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm"
              >
                <link.icon className={`${link.color} text-sm`} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User Dashboard (for authenticated users) */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3">
            <h3 className="text-white font-semibold">My Dashboard</h3>
          </div>
          <div className="p-3">
            <nav className="space-y-1">
              {userDashboardLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm"
                >
                  <link.icon className={`${link.color} text-sm`} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Quick Actions for Non-Authenticated Users */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm p-4 text-white">
          <h3 className="font-semibold mb-3">Get Started</h3>
          <div className="space-y-2">
            <Link
              to="/register"
              className="flex items-center gap-2 w-full px-3 py-2 bg-white text-indigo-600 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              <FaUserPlus className="text-sm" />
              Sign Up
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 w-full px-3 py-2 bg-white/20 text-white rounded-md font-medium hover:bg-white/30 transition-colors text-sm border border-white/30"
            >
              <FaSignInAlt className="text-sm" />
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats (for authenticated users) */}
      {isAuthenticated && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
          <h3 className="font-semibold text-green-800 mb-3 text-sm">Quick Stats</h3>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex justify-between">
              <span>Courses Enrolled:</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>Tests Completed:</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>Current Streak:</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSidebar;