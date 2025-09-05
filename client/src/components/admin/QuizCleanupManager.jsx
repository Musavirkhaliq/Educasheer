import React, { useState, useEffect } from 'react';
import { FaTrash, FaClock, FaChartBar, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const QuizCleanupManager = () => {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    completedAttempts: 0,
    incompleteAttempts: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [oldAttemptsDays, setOldAttemptsDays] = useState(365);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/quiz-cleanup/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching cleanup stats:', error);
      toast.error('Failed to fetch cleanup statistics');
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredAttempts = async () => {
    try {
      setCleanupLoading(true);
      const response = await fetch('/api/v1/admin/quiz-cleanup/expired', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully cleaned up ${data.data.cleanedCount} expired attempts`);
        fetchStats(); // Refresh stats
      } else {
        throw new Error('Failed to cleanup expired attempts');
      }
    } catch (error) {
      console.error('Error cleaning up expired attempts:', error);
      toast.error('Failed to cleanup expired attempts');
    } finally {
      setCleanupLoading(false);
    }
  };

  const cleanupOldAttempts = async () => {
    if (!window.confirm(`Are you sure you want to delete all completed attempts older than ${oldAttemptsDays} days? This action cannot be undone.`)) {
      return;
    }

    try {
      setCleanupLoading(true);
      const response = await fetch('/api/v1/admin/quiz-cleanup/old', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ daysOld: oldAttemptsDays })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully cleaned up ${data.data.cleanedCount} old attempts`);
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cleanup old attempts');
      }
    } catch (error) {
      console.error('Error cleaning up old attempts:', error);
      toast.error(error.message || 'Failed to cleanup old attempts');
    } finally {
      setCleanupLoading(false);
    }
  };

  const performFullCleanup = async () => {
    if (!window.confirm('Are you sure you want to perform a full cleanup? This will remove expired attempts and optionally old completed attempts.')) {
      return;
    }

    try {
      setCleanupLoading(true);
      const response = await fetch('/api/v1/admin/quiz-cleanup/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          cleanupExpired: true,
          cleanupOld: false,
          oldAttemptsDays: oldAttemptsDays
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const results = data.data;
        toast.success(`Cleanup completed! Expired: ${results.expiredCleaned}, Old: ${results.oldCleaned}`);
        fetchStats(); // Refresh stats
      } else {
        throw new Error('Failed to perform full cleanup');
      }
    } catch (error) {
      console.error('Error performing full cleanup:', error);
      toast.error('Failed to perform full cleanup');
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Cleanup Manager</h2>
        <p className="text-gray-600">
          Manage quiz attempts and clean up expired or old data to optimize database performance.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaChartBar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Attempts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalAttempts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FaChartBar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.completedAttempts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.incompleteAttempts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaChartBar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : `${stats.averageScore.toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cleanup Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expired Attempts Cleanup */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaClock className="text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Cleanup Expired Attempts</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Remove quiz attempts that have been in progress for longer than the quiz time limit plus grace period.
            This helps clean up abandoned attempts and allows users to start fresh.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                This will remove incomplete attempts that have exceeded their time limit.
              </span>
            </div>
          </div>
          <button
            onClick={cleanupExpiredAttempts}
            disabled={cleanupLoading}
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {cleanupLoading ? (
              <FaSync className="animate-spin mr-2" />
            ) : (
              <FaClock className="mr-2" />
            )}
            Cleanup Expired Attempts
          </button>
        </div>

        {/* Old Attempts Cleanup */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaTrash className="text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Cleanup Old Attempts</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Remove completed quiz attempts older than a specified number of days.
            This helps reduce database size but will permanently delete historical data.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delete attempts older than (days):
            </label>
            <input
              type="number"
              min="30"
              max="3650"
              value={oldAttemptsDays}
              onChange={(e) => setOldAttemptsDays(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-600 mr-2" />
              <span className="text-sm text-red-800">
                This action cannot be undone. Minimum 30 days required.
              </span>
            </div>
          </div>
          <button
            onClick={cleanupOldAttempts}
            disabled={cleanupLoading || oldAttemptsDays < 30}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {cleanupLoading ? (
              <FaSync className="animate-spin mr-2" />
            ) : (
              <FaTrash className="mr-2" />
            )}
            Cleanup Old Attempts
          </button>
        </div>
      </div>

      {/* Full Cleanup */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaSync className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Full Cleanup</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Perform a comprehensive cleanup that removes expired attempts and provides statistics.
            This is the recommended maintenance action to run regularly.
          </p>
          <div className="flex gap-4">
            <button
              onClick={performFullCleanup}
              disabled={cleanupLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {cleanupLoading ? (
                <FaSync className="animate-spin mr-2" />
              ) : (
                <FaSync className="mr-2" />
              )}
              Perform Full Cleanup
            </button>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <FaSync className="animate-spin mr-2" />
              ) : (
                <FaSync className="mr-2" />
              )}
              Refresh Stats
            </button>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Automatic Cleanup</h4>
        <p className="text-blue-700 text-sm">
          The system automatically runs cleanup tasks every hour to remove expired attempts.
          Old completed attempts are automatically cleaned up daily (attempts older than 1 year).
          You can use this interface for manual cleanup or to adjust the cleanup parameters.
        </p>
      </div>
    </div>
  );
};

export default QuizCleanupManager;