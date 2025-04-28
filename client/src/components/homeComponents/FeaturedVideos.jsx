import React from 'react';
import { Link } from 'react-router-dom';
import VideoList from '../VideoList';
import { FaArrowRight } from 'react-icons/fa';

const FeaturedVideos = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Videos</h2>
          <Link 
            to="/videos" 
            className="flex items-center text-[#00bcd4] hover:text-[#01427a] transition-colors duration-300"
          >
            <span className="mr-2">View All</span>
            <FaArrowRight />
          </Link>
        </div>
        
        <VideoList limit={6} showOwner={true} />
      </div>
    </section>
  );
};

export default FeaturedVideos;
