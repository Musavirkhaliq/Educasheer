import React, { useRef } from 'react';
import { FaLaptopCode, FaCode, FaDatabase, FaChartLine, FaMobileAlt, FaGlobe, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
              Diverse Learning Paths
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Explore</span> Our Course Categories
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/categories"
              className="flex items-center bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md text-[#00bcd4] hover:text-white hover:bg-gradient-to-r hover:from-[#00bcd4] hover:to-[#01427a] transition-all duration-300 group text-sm sm:text-base"
            >
              <span className="mr-2 font-medium">View All Categories</span>
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
            to="/categories/suggest"
            className="inline-flex items-center text-[#01427a] hover:text-[#00bcd4] transition-colors duration-300 font-medium text-sm sm:text-base"
          >
            <span>Can't find what you're looking for? Suggest a new category</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;