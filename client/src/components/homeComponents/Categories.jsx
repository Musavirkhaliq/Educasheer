import React, { useEffect, useState, useRef } from 'react';
import { FaLaptopCode, FaCode, FaDatabase, FaChartLine, FaMobileAlt, FaGlobe, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';

const CategoryCard = ({ icon: Icon, title, description, color, delay }) => {
  // Check if we're on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileTap={isMobileDevice() ? { scale: 0.98 } : {}}
      className="group relative bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
      style={{ touchAction: "manipulation" }}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
      <div className={`relative z-10 flex flex-col items-center text-center`}>
        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full ${color.replace('bg-', 'bg-').replace('500', '100')} mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`text-xl sm:text-2xl md:text-3xl ${color.replace('bg-', 'text-')}`} />
        </div>
        <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-800 group-hover:text-[#00bcd4] transition-colors duration-300">{title}</h4>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">{description}</p>

        <div className="mt-4 sm:mt-6 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-300">
          <button className="flex items-center text-[#00bcd4] font-medium text-xs sm:text-sm">
            <span className="mr-2">Learn More</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className={`absolute -bottom-20 -right-20 w-32 sm:w-40 h-32 sm:h-40 rounded-full ${color.replace('bg-', 'bg-').replace('500', '50')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </motion.div>
  );
};

const Categories = () => {
  const scrollContainerRef = useRef(null);
  const controls = useAnimation();

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

  const categories = [
    {
      icon: FaLaptopCode,
      title: "Computer Science",
      description: "Explore the fundamentals of computing and algorithms.",
      color: "bg-blue-500"
    },
    {
      icon: FaCode,
      title: "Programming",
      description: "Learn various programming languages and paradigms.",
      color: "bg-green-500"
    },
    {
      icon: FaGlobe,
      title: "Software Development",
      description: "Master the art of building robust software applications.",
      color: "bg-purple-500"
    },
    {
      icon: FaGlobe,
      title: "Web Development",
      description: "Create responsive and dynamic websites.",
      color: "bg-red-500"
    },
    {
      icon: FaChartLine,
      title: "Data Science & Analytics",
      description: "Dive into data analysis and machine learning.",
      color: "bg-yellow-500"
    },
    {
      icon: FaMobileAlt,
      title: "Mobile App Development",
      description: "Build mobile applications for iOS and Android.",
      color: "bg-indigo-500"
    },
    {
      icon: FaDatabase,
      title: "Database Management",
      description: "Learn to manage and optimize databases.",
      color: "bg-pink-500"
    }
  ];

  return (
    <section className="py-10 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 w-40 sm:w-64 h-40 sm:h-64 rounded-full bg-gradient-to-br from-[#00bcd4]/5 to-[#01427a]/5 blur-2xl sm:blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-10 sm:-ml-20 -mb-10 sm:-mb-20 w-40 sm:w-64 h-40 sm:h-64 rounded-full bg-gradient-to-tr from-[#01427a]/5 to-[#00bcd4]/5 blur-2xl sm:blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-2 sm:px-3 py-1 bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20 rounded-full text-[#01427a] text-xs sm:text-sm font-medium mb-3 sm:mb-4"
          >
            Diverse Learning Paths
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900"
          >
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Course Categories</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-600"
          >
            Find the perfect learning path tailored to your interests and career goals
          </motion.p>
        </div>

        {/* Horizontal scrollable container for all screen sizes */}
        <div className="relative">
          {/* Left scroll button */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-[#00bcd4] hover:bg-white hover:text-[#01427a] transition-all duration-300 hidden md:block"
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>

          {/* Horizontal scrollable container */}
          <motion.div
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-8 pt-2 snap-x snap-mandatory hide-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[23%] snap-start px-2 first:pl-4 last:pr-4"
              >
                <CategoryCard
                  icon={category.icon}
                  title={category.title}
                  description={category.description}
                  color={category.color}
                  delay={0.1 + index * 0.05}
                />
              </div>
            ))}
          </motion.div>

          {/* Right scroll button */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-[#00bcd4] hover:bg-white hover:text-[#01427a] transition-all duration-300 hidden md:block"
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>

          {/* Swipe indicator for all screen sizes */}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8 sm:mt-12 md:mt-16"
        >
          <button className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center mx-auto group text-xs sm:text-sm">
            <span>Explore All Categories</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;