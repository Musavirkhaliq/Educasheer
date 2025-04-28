import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoList from '../components/VideoList';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const VideosPage = () => {
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Videos</h1>
        
        {canUploadVideos && (
          <Link
            to="/videos/upload"
            className="flex items-center bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors duration-300"
          >
            <FaPlus className="mr-2" />
            <span>Add Video</span>
          </Link>
        )}
      </div>
      
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
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
      />
    </div>
  );
};

export default VideosPage;
