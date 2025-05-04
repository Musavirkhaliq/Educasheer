import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaGraduationCap, FaUsers, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Center Card component for individual center display
const CenterCard = ({ center, index }) => {
  // Function to determine if we're on a mobile device
  const isMobile = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 768px)').matches;
    }
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group h-full"
      whileHover={!isMobile() ? {
        y: -5,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={isMobile() ? { scale: 0.98 } : {}}
    >
      <div className="relative">
        <div className="relative overflow-hidden">
          <img
            src={center.image}
            alt={center.name}
            className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-3 sm:p-4 w-full">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                View Center
              </span>
            </div>
          </div>
        </div>

        {/* Center Badge */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <span className={`text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full
            bg-${center.badgeColor} text-white`}>
            {center.badge}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-800 hover:text-[#00bcd4] transition-colors line-clamp-2">{center.name}</h3>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {center.description}
        </p>

        <div className="space-y-2 mb-3">
          {center.features.map((feature, idx) => (
            <div key={idx} className="flex items-center text-xs text-gray-600 gap-1">
              <feature.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-${feature.iconColor}`} />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 sm:pt-4 border-t border-gray-100">
          <Link to={center.actionLink} className="flex items-center justify-center w-full bg-gradient-to-r from-[#00bcd4]/10 to-[#01427a]/10 text-[#01427a] py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium group-hover:bg-gradient-to-r group-hover:from-[#00bcd4] group-hover:to-[#01427a] group-hover:text-white transition-all duration-300">
            <span>{center.actionText}</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const LearningCenters = () => {
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

  // Centers data
  const centers = [
    {
      name: "Educasheers SiliconSpark",
      description: "Cutting-edge computing labs with specialized AI and CS equipment. Perfect for hands-on learning and practical skill development.",
      image: "https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      badge: "15+ Centers",
      badgeColor: "primary",
      features: [
        { icon: FaGraduationCap, text: "Advanced computing hardware", iconBg: "green-100", iconColor: "green-600" },
        { icon: FaUsers, text: "Small batch sizes (max 15 students)", iconBg: "blue-100", iconColor: "blue-600" }
      ],
      actionText: "Find a SiliconSpark Center",
      actionLink: "/centers",
    },
    {
      name: "Educasheer Hikmah Learning Lounge",
      description: "Comfortable learning spaces with comprehensive study resources. Designed for focused learning and collaborative projects.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      badge: "10+ Centers",
      badgeColor: "secondary",
      features: [
        { icon: FaStar, text: "Extensive library resources", iconBg: "purple-100", iconColor: "purple-600" },
        { icon: FaGraduationCap, text: "Quiet study and group work areas", iconBg: "green-100", iconColor: "green-600" }
      ],
      actionText: "Find a Hikmah Learning Lounge",
      actionLink: "/centers",
    },
    {
      name: "Educasheer Tech Hub",
      description: "State-of-the-art technology centers with the latest equipment for programming, robotics, and digital creation.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      badge: "8+ Centers",
      badgeColor: "blue-500",
      features: [
        { icon: FaGraduationCap, text: "Latest programming tools", iconBg: "blue-100", iconColor: "blue-600" },
        { icon: FaUsers, text: "Robotics and AI labs", iconBg: "purple-100", iconColor: "purple-600" }
      ],
      actionText: "Find a Tech Hub",
      actionLink: "/centers",
    },
    {
      name: "Educasheer Science Labs",
      description: "Fully equipped science laboratories for physics, chemistry, and biology experiments and practical learning.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      badge: "12+ Centers",
      badgeColor: "green-500",
      features: [
        { icon: FaGraduationCap, text: "Modern lab equipment", iconBg: "green-100", iconColor: "green-600" },
        { icon: FaUsers, text: "Supervised experiments", iconBg: "blue-100", iconColor: "blue-600" }
      ],
      actionText: "Find a Science Lab",
      actionLink: "/centers",
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
              Nationwide Presence
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Learning</span> Centers
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/centers"
              className="flex items-center bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md text-[#00bcd4] hover:text-white hover:bg-gradient-to-r hover:from-[#00bcd4] hover:to-[#01427a] transition-all duration-300 group text-sm sm:text-base"
            >
              <span className="mr-2 font-medium">View All Centers</span>
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
              {centers.map((center, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[23%] snap-start px-2 first:pl-4 last:pr-4"
                >
                  <CenterCard center={center} index={index} />
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
            to="/centers/contact"
            className="inline-flex items-center text-[#01427a] hover:text-[#00bcd4] transition-colors duration-300 font-medium text-sm sm:text-base"
          >
            <span>Interested in partnering with us? Contact us to establish a center in your area</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LearningCenters;
