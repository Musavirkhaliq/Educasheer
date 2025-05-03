import React, { useState } from 'react';
import CenterList from '../components/center/CenterList';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaUsers, FaSchool } from 'react-icons/fa';

const CentersPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Learning Centers</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover our network of learning centers where students can access hands-on education, 
            specialized equipment, and in-person guidance from our expert tutors.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center px-6 py-3 rounded-full transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-[#00bcd4] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaSchool className="mr-2" />
            <span>All Centers</span>
          </button>

          {(currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === 'manage'
                  ? 'bg-[#00bcd4] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaUsers className="mr-2" />
              <span>Manage Centers</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search centers..."
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="absolute right-3 top-3 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Center Lists */}
        <div className="mt-8">
          {activeTab === 'all' && (
            <CenterList
              showCreateButton={currentUser?.role === 'admin'}
              title="All Centers"
              search={searchQuery}
            />
          )}

          {activeTab === 'manage' && currentUser?.role === 'admin' && (
            <CenterList
              showControls={true}
              showCreateButton={true}
              title="Manage Centers"
              search={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CentersPage;
