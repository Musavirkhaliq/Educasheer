import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../../services/api';
import { FaTrophy, FaMedal, FaUsers, FaChartLine, FaSpinner } from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const GamificationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await gamificationAPI.getGamificationStats();
        setStats(response.data.data);
      } catch (err) {
        console.error('Error fetching gamification stats:', err);
        setError('Failed to load gamification statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No gamification statistics available.</p>
      </div>
    );
  }

  // Prepare data for points by category chart
  const pointsByCategoryData = {
    labels: stats.pointsByCategory.map(item => formatCategory(item._id)),
    datasets: [
      {
        label: 'Points',
        data: stats.pointsByCategory.map(item => item.total),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for top badges chart
  const topBadgesData = {
    labels: stats.topBadges.map(item => item.badge.name),
    datasets: [
      {
        label: 'Times Awarded',
        data: stats.topBadges.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for top challenges chart
  const topChallengesData = {
    labels: stats.topChallenges.map(item => item.challenge.title),
    datasets: [
      {
        label: 'Times Completed',
        data: stats.topChallenges.map(item => item.count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<FaUsers className="text-blue-500" />} 
          color="blue"
        />
        <StatCard 
          title="Total Badges" 
          value={stats.totalBadges} 
          icon={<FaMedal className="text-yellow-500" />} 
          color="yellow"
        />
        <StatCard 
          title="Total Challenges" 
          value={stats.totalChallenges} 
          icon={<FaTrophy className="text-purple-500" />} 
          color="purple"
        />
        <StatCard 
          title="Total Points Awarded" 
          value={stats.totalPointsAwarded.toLocaleString()} 
          icon={<FaChartLine className="text-green-500" />} 
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Points by Category */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Points by Category</h3>
          <div className="h-64">
            <Doughnut 
              data={pointsByCategoryData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Top Badges */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Badges Awarded</h3>
          <div className="h-64">
            <Bar 
              data={topBadgesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Top Challenges */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Challenges Completed</h3>
          <div className="h-64">
            <Bar 
              data={topChallengesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Helper function to format category names
const formatCategory = (category) => {
  switch (category) {
    case 'course_completion':
      return 'Course Completion';
    case 'video_watch':
      return 'Video Watching';
    case 'quiz':
      return 'Quizzes';
    case 'attendance':
      return 'Attendance';
    case 'blog':
      return 'Blog Posts';
    case 'comment':
      return 'Comments';
    case 'social':
      return 'Social Activity';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  }
};

export default GamificationDashboard;
