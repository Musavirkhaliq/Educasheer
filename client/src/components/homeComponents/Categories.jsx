import React from 'react';
import { FaLaptopCode, FaCode, FaDatabase, FaChartLine, FaMobileAlt, FaGlobe, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CategoryCard = ({ icon: Icon, title, description, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
      <div className={`relative z-10 flex flex-col items-center text-center`}>
        <div className={`w-16 h-16 flex items-center justify-center rounded-full ${color.replace('bg-', 'bg-').replace('500', '100')} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`text-3xl ${color.replace('bg-', 'text-')}`} />
        </div>
        <h4 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-[#00bcd4] transition-colors duration-300">{title}</h4>
        <p className="text-gray-600">{description}</p>

        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="flex items-center text-[#00bcd4] font-medium">
            <span className="mr-2">Learn More</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full ${color.replace('bg-', 'bg-').replace('500', '50')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </motion.div>
  );
};

const Categories = () => {
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
    <section className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-[#00bcd4]/5 to-[#01427a]/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-gradient-to-tr from-[#01427a]/5 to-[#00bcd4]/5 blur-3xl"></div>

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-3 py-1 bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20 rounded-full text-[#01427a] text-sm font-medium mb-4"
          >
            Diverse Learning Paths
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Course Categories</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Find the perfect learning path tailored to your interests and career goals
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              icon={category.icon}
              title={category.title}
              description={category.description}
              color={category.color}
              delay={0.1 + index * 0.05}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <button className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center mx-auto group">
            <span>Explore All Categories</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;