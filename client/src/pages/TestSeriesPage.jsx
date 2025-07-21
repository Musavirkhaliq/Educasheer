import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import TestSeriesList from '../components/TestSeriesList';
import { useAuth } from '../context/AuthContext';

const TestSeriesPage = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    examType: '',
    subject: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      examType: '',
      subject: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value) || searchQuery;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Series</h1>
            <p className="text-gray-600">
              Practice with comprehensive test series designed for various competitive exams
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search test series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-[#00bcd4] text-white border-[#00bcd4]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaFilter />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {Object.values(filters).filter(v => v).length + (searchQuery ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaTimes />
                  Clear
                </button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                    >
                      <option value="">All Categories</option>
                      <option value="General">General</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medical">Medical</option>
                      <option value="Management">Management</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                    >
                      <option value="">All Levels</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Type
                    </label>
                    <input
                      type="text"
                      value={filters.examType}
                      onChange={(e) => handleFilterChange('examType', e.target.value)}
                      placeholder="e.g., JEE, NEET, CAT"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={filters.subject}
                      onChange={(e) => handleFilterChange('subject', e.target.value)}
                      placeholder="e.g., Mathematics, Physics"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Series List */}
          <TestSeriesList
            search={searchQuery}
            filters={filters}
            title="Available Test Series"
          />
        </div>
      </div>
    </div>
  );
};

export default TestSeriesPage;
