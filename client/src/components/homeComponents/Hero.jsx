import React, { useState, useEffect } from "react";
import { FaSearch, FaGraduationCap, FaUsers, FaStar, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: FaGraduationCap, count: "10,000+", label: "Courses" },
    { icon: FaUsers, count: "500,000+", label: "Students" },
    { icon: FaStar, count: "95%", label: "Satisfaction" },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50 py-16 md:py-24">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#00bcd4]/10 to-transparent w-1/2 h-1/2 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-[#01427a]/10 to-transparent w-1/2 h-1/2 rounded-full blur-3xl"></div>

        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 border border-[#00bcd4]/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 border border-[#01427a]/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-20 h-20 border border-[#00bcd4]/30 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Section - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-block px-4 py-1 bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20 rounded-full"
              >
                <span className="text-[#01427a] font-medium text-sm">Unlock Your Learning Potential</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0c0c0d] leading-tight"
              >
                Empowering You to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Learn</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01427a] to-[#00bcd4]">Succeed</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-lg md:text-xl text-[#6c6c6c] max-w-xl"
              >
                Explore expertly curated educational videos on diverse topics from industry leaders and educators. Start your learning journey today.
              </motion.p>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search for courses, topics, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full border-none shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] pl-12"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6c6c6c]" />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center group">
                Start Learning Now
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="bg-white border border-[#00bcd4] text-[#00bcd4] px-8 py-3 rounded-full font-medium hover:bg-[#00bcd4] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                Browse Free Resources
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  className="bg-white p-4 rounded-xl shadow-sm text-center"
                >
                  <div className="bg-gradient-to-br from-[#00bcd4]/10 to-[#01427a]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="text-2xl text-[#00bcd4]" />
                  </div>
                  <div className="font-bold text-2xl text-[#01427a]">
                    {stat.count}
                  </div>
                  <div className="text-sm text-[#6c6c6c]">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Section - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/6502da06dd3676099cf24de0_Top-educational-software.webp"
                alt="Learning Environment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#01427a]/70 to-[#00bcd4]/30" />

              {/* Floating Badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="absolute top-6 left-6"
              >
                <span className="bg-white/90 text-[#01427a] px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center">
                  <FaStar className="mr-2 text-[#00bcd4]" />
                  Learn Anytime, Anywhere
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="absolute top-20 left-10"
              >
                <span className="bg-white/90 text-[#01427a] px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center">
                  <FaGraduationCap className="mr-2 text-[#00bcd4]" />
                  10,000+ Videos Available
                </span>
              </motion.div>

              {/* Additional floating element */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                className="absolute bottom-6 right-6"
              >
                <div className="bg-white/90 px-4 py-3 rounded-xl text-sm font-medium shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[#01427a] font-semibold">Live Classes Available</span>
                  </div>
                  <p className="text-[#6c6c6c] text-xs mt-1">Join expert-led sessions today</p>
                </div>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-[#00bcd4]/10 rounded-full blur-md"></div>
            <div className="absolute -top-5 -left-5 w-20 h-20 bg-[#01427a]/10 rounded-full blur-md"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
