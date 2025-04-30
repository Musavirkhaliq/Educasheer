import React from 'react';
import { Link } from 'react-router-dom';
import VideoList from '../VideoList';
import { FaArrowRight, FaPlay } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FeaturedVideos = () => {
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
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <VideoList limit={6} showOwner={true} />
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
