import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoList from '../components/VideoList';
import { SearchBar } from '../components';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const VideosPage = () => {
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Mathematics',
    'Programming',
    'Science',
    'Languages',
    'Arts',
    'History'
  ];

  // Check if user can upload videos
  const canUploadVideos = currentUser?.role === 'admin' || currentUser?.role === 'tutor';

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Videos</h1>

        {canUploadVideos && (
          <Link
            to="/videos/upload"
            className="flex items-center justify-center sm:justify-start bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors duration-300 text-sm sm:text-base"
          >
            <FaPlus className="mr-2" />
            <span>Add Video</span>
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for videos..."
          initialValue={searchQuery}
        />
      </div>

      <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-1">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-sm ${
                activeCategory === category
                  ? 'bg-[#00bcd4] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <VideoList
        category={activeCategory === 'All' ? null : activeCategory}
        showOwner={true}
        search={searchQuery}
      />
    </div>
  );
};

export default VideosPage;
