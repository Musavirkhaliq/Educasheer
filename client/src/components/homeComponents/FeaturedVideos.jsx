import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaPlay, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { motion } from 'framer-motion';
import axios from 'axios';

// VideoCard component for individual video display
const VideoCard = ({ video, showOwner = true }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group h-full">
      <Link to={`/videos/${video._id}`} className="block relative">
        <div className="overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-3 sm:p-4 w-full">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
              Watch Video
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
          <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <FaEye className="w-3 h-3" />
            <span>{video.views || 0} views</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
            <BiTime className="w-3 h-3" />
            <span>{video.duration}</span>
          </div>
        </div>

        <Link to={`/videos/${video._id}`}>
          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-800 hover:text-[#00bcd4] transition-colors line-clamp-2">{video.title}</h3>
        </Link>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {video.description}
        </p>

        {showOwner && video.owner && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={video.owner.avatar || 'https://via.placeholder.com/40'}
                alt={video.owner.fullName || video.owner.username}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[100px] sm:max-w-[150px]">
              {video.owner.fullName || video.owner.username}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const FeaturedVideos = () => {
  const scrollContainerRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/v1/videos', {
          params: {
            limit: 6 // Limit to 6 videos for the featured section
          }
        });

        setVideos(response.data.data.videos || response.data.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Scroll functions for navigation buttons
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-[#01427a]/5 to-[#00bcd4]/5 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-64 h-64 rounded-full bg-gradient-to-tr from-[#00bcd4]/5 to-[#01427a]/5 blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 sm:mb-12 md:mb-16">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20 rounded-full text-[#01427a] text-xs sm:text-sm font-medium mb-3 sm:mb-4"
            >
              Curated Content
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Featured</span> Videos
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/videos"
              className="flex items-center bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md text-[#00bcd4] hover:text-white hover:bg-gradient-to-r hover:from-[#00bcd4] hover:to-[#01427a] transition-all duration-300 group text-sm sm:text-base"
            >
              <span className="mr-2 font-medium">View All Videos</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#01427a]/5 to-[#00bcd4]/5 rounded-3xl transform -rotate-1 scale-105 -z-10"></div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg relative">
            {/* Left scroll button */}
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-[#00bcd4] hover:bg-white hover:text-[#01427a] transition-all duration-300 hidden md:block"
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>

            {/* Horizontal scrollable container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 pt-2 snap-x snap-mandatory hide-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {loading ? (
                <div className="flex justify-center items-center py-8 w-full">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center w-full">
                  {error}
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-lg w-full">
                  <p className="text-gray-500">No videos available at the moment.</p>
                </div>
              ) : (
                <>
                  {videos.map((video) => (
                    <div
                      key={video._id}
                      className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[23%] snap-start px-2 first:pl-4 last:pr-4"
                    >
                      <VideoCard video={video} showOwner={true} />
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Right scroll button */}
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-[#00bcd4] hover:bg-white hover:text-[#01427a] transition-all duration-300 hidden md:block"
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>

            {/* Swipe indicator */}
            <div className="flex justify-center mt-2">
              <motion.div
                className="w-12 h-1 bg-gray-200 rounded-full relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full w-4 bg-[#00bcd4] rounded-full"
                  animate={{ x: [0, 32, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8 sm:mt-10 md:mt-12"
        >
          <Link
            to="/videos/upload"
            className="inline-flex items-center text-[#01427a] hover:text-[#00bcd4] transition-colors duration-300 font-medium text-sm sm:text-base"
          >
            <FaPlay className="mr-2" />
            <span>Want to share your knowledge? Upload your own videos</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedVideos;
