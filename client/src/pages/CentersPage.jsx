import React, { useState } from 'react';
import CenterList from '../components/center/CenterList';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaUsers, FaSchool, FaChair } from 'react-icons/fa';

const CentersPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#00bcd4] to-[#0097a7] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Learning Centers</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover our network of premium learning centers where students can access hands-on education,
              specialized equipment, and in-person guidance from our expert tutors.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-white" />
                <span>Multiple Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-white" />
                <span>Study Community</span>
              </div>
              <div className="flex items-center gap-2">
                <FaChair className="text-white" />
                <span>Reserved Seating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 -mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaMapMarkerAlt className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Multiple Locations</h3>
              <p className="text-gray-600 text-sm">Study centers across the city</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Study Community</h3>
              <p className="text-gray-600 text-sm">Connect with fellow learners</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaChair className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Easy Booking</h3>
              <p className="text-gray-600 text-sm">Reserve your seat instantly</p>
            </div>
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
    </div>
  );
};

export default CentersPage;
