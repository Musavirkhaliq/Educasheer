import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaGraduationCap, FaUsers, FaStar } from 'react-icons/fa';
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
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 group h-full"
      whileHover={!isMobile() ? {
        y: -5,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={isMobile() ? { scale: 0.98 } : {}}
    >
      <div className="relative">
        <div className="relative overflow-hidden h-48 sm:h-52 md:h-56">
          <img
            src={center.image}
            alt={center.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

          {/* Center Badge */}
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full
              bg-${center.badgeColor} text-white shadow-lg backdrop-blur-sm flex items-center`}>
              <FaGraduationCap className="mr-1 text-[10px]" /> {center.badge}
            </span>
          </div>

          {/* Center Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg sm:text-xl text-white mb-0 drop-shadow-md">{center.name}</h3>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3">
          {center.description}
        </p>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4 shadow-inner">
          <h4 className="font-medium text-gray-800 mb-3 text-xs sm:text-sm border-b border-gray-200 pb-2">What We Offer:</h4>
          <div className="space-y-3">
            {center.features.map((feature, idx) => (
              <div key={idx} className="flex items-start text-xs sm:text-sm text-gray-700 gap-3">
                <span className={`w-6 h-6 rounded-full bg-${feature.iconBg} flex items-center justify-center shadow-sm mt-0.5`}>
                  <feature.icon className={`text-${feature.iconColor} text-xs`} />
                </span>
                <span className="flex-1">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <Link
            to={center.actionLink}
            className="flex items-center justify-center w-full bg-gradient-to-r from-[#00bcd4]/10 to-[#01427a]/10 text-[#01427a] py-2.5 rounded-lg text-sm font-medium hover:bg-gradient-to-r hover:from-[#00bcd4] hover:to-[#01427a] hover:text-white transition-all duration-300 group shadow-sm hover:shadow"
          >
            <span>{center.actionText}</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const LearningCenters = () => {

  // Centers data
  const centers = [
    {
      name: "Educasheers SiliconSpark",
      description: "Our computing centers provide cutting-edge AI chips, embedded systems, and specialized hardware for hands-on learning in computer science, AI, and machine learning.",
      image: "https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      badge: "15+ Centers",
      badgeColor: "primary",
      features: [
        { icon: FaGraduationCap, text: "AI accelerator chips & GPU clusters", iconBg: "green-100", iconColor: "green-600" },
        { icon: FaUsers, text: "Embedded systems & IoT workstations", iconBg: "blue-100", iconColor: "blue-600" },
        { icon: FaStar, text: "Robotics & automation equipment", iconBg: "purple-100", iconColor: "purple-600" }
      ],
      actionText: "Find a SiliconSpark Center",
      actionLink: "/centers",
    },
    {
      name: "Educasheer Hikmah Learning Lounge",
      description: "Our learning lounges offer comprehensive library resources, collaborative spaces, and a peaceful environment designed for focused study, research, and knowledge sharing.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      badge: "10+ Centers",
      badgeColor: "secondary",
      features: [
        { icon: FaStar, text: "Extensive digital & physical libraries", iconBg: "purple-100", iconColor: "purple-600" },
        { icon: FaGraduationCap, text: "Quiet study & collaborative zones", iconBg: "green-100", iconColor: "green-600" },
        { icon: FaUsers, text: "Research assistance & mentorship", iconBg: "blue-100", iconColor: "blue-600" }
      ],
      actionText: "Find a Hikmah Learning Lounge",
      actionLink: "/centers",
    },
    {
      name: "Educasheer Science Labs",
      description: "Our science laboratories foster a research mindset through hands-on experimentation, providing state-of-the-art equipment for physics, chemistry, and biology exploration.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      badge: "12+ Centers",
      badgeColor: "green-500",
      features: [
        { icon: FaGraduationCap, text: "Advanced scientific instruments", iconBg: "green-100", iconColor: "green-600" },
        { icon: FaUsers, text: "Research project mentorship", iconBg: "blue-100", iconColor: "blue-600" },
        { icon: FaStar, text: "Experimental design workshops", iconBg: "purple-100", iconColor: "purple-600" }
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
              Specialized Offline Facilities
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

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-gray-600 max-w-md mt-2 hidden md:block"
            >
              Our nationwide centers offer specialized facilities for computing, research, and hands-on experimentation
            </motion.p>
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
            {/* Centers grid container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
              {centers.map((center, index) => (
                <div key={index} className="flex-1">
                  <CenterCard center={center} index={index} />
                </div>
              ))}
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
            <span>Experience hands-on learning with our specialized facilities. Visit a center near you today!</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LearningCenters;
