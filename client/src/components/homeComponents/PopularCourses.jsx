import React, { useState, useEffect } from 'react';
import { BiTime } from 'react-icons/bi';
import { FiVideo } from 'react-icons/fi';
import { FaStar, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

// Function to get background color based on category
const getCategoryColor = (category) => {
  const colors = {
    'Programming': 'bg-gradient-to-br from-blue-400/20 to-blue-600/20',
    'Web Development': 'bg-gradient-to-br from-indigo-400/20 to-indigo-600/20',
    'Data Science': 'bg-gradient-to-br from-green-400/20 to-green-600/20',
    'Marketing': 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20',
    'Design': 'bg-gradient-to-br from-pink-400/20 to-pink-600/20',
    'Business': 'bg-gradient-to-br from-orange-400/20 to-orange-600/20',
    'Software Development': 'bg-gradient-to-br from-purple-400/20 to-purple-600/20',
    'Mobile Development': 'bg-gradient-to-br from-red-400/20 to-red-600/20',
  };

  return colors[category] || 'bg-gradient-to-br from-gray-400/20 to-gray-600/20';
};

const CourseCard = ({ course, index }) => {
  // Calculate total duration of all videos
  const totalDuration = course.videos?.reduce((total, video) => {
    // Parse duration in format "H:MM:SS" or "MM:SS"
    const parts = video.duration?.split(':').map(Number);
    let seconds = 0;

    if (parts?.length === 3) {
      // Format: H:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts?.length === 2) {
      // Format: MM:SS
      seconds = parts[0] * 60 + parts[1];
    }

    return total + seconds;
  }, 0) || 0;

  // Convert seconds to hours
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const formattedDuration = hours > 0
    ? `${hours}.${Math.floor(minutes / 60 * 100)}`
    : `${(minutes / 60).toFixed(1)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="relative">
        <div className={`relative overflow-hidden ${getCategoryColor(course.category)}`}>
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Course level badge */}
        <div className="absolute top-4 left-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full
            ${course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
              course.level === 'Advanced' ? 'bg-red-100 text-red-800' :
              'bg-purple-100 text-purple-800'}`}>
            {course.level}
          </span>
        </div>

        {/* Price tag */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 px-3 py-1 rounded-full shadow-md">
            <span className="text-sm font-bold text-[#01427a]">${course.price.toFixed(2)}</span>
            {course.originalPrice > course.price && (
              <span className="text-xs text-gray-500 line-through ml-1">${course.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center text-xs text-gray-600 gap-1">
            <FiVideo className="w-3.5 h-3.5 text-[#00bcd4]" />
            <span>{course.videos?.length || 0} videos</span>
          </div>
          <div className="flex items-center text-xs text-gray-600 gap-1">
            <BiTime className="w-3.5 h-3.5 text-[#00bcd4]" />
            <span>{formattedDuration} hours</span>
          </div>
          <div className="flex items-center text-xs text-gray-600 gap-1">
            <FaStar className="w-3.5 h-3.5 text-yellow-500" />
            <span>4.8</span>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-4 text-gray-800 group-hover:text-[#00bcd4] transition-colors duration-300 line-clamp-2">{course.title}</h3>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <img
              src={course.creator?.avatar}
              alt={course.creator?.fullName}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            />
            <span className="text-sm text-gray-600">{course.creator?.fullName}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Link to={`/courses/${course._id}`} className="flex items-center justify-center w-full bg-gradient-to-r from-[#00bcd4]/10 to-[#01427a]/10 text-[#01427a] py-2 rounded-lg font-medium group-hover:bg-gradient-to-r group-hover:from-[#00bcd4] group-hover:to-[#01427a] group-hover:text-white transition-all duration-300">
            <span>View Course</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/v1/courses', {
          params: {
            limit: 3, // Limit to 3 courses for the popular section
            sort: 'popular' // Sort by popularity (if supported by API)
          }
        });

        setCourses(response.data.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-[#00bcd4]/5 to-[#01427a]/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-gradient-to-tr from-[#01427a]/5 to-[#00bcd4]/5 blur-3xl"></div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20 rounded-full text-[#01427a] text-sm font-medium mb-4"
            >
              Top-Rated Courses
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Most <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bcd4] to-[#01427a]">Popular</span> Courses
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/courses"
              className="flex items-center bg-white px-6 py-3 rounded-full shadow-md text-[#00bcd4] hover:text-white hover:bg-gradient-to-r hover:from-[#00bcd4] hover:to-[#01427a] transition-all duration-300 group"
            >
              <span className="mr-2 font-medium">View All Courses</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <CourseCard key={course._id} course={course} index={index} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            to="/courses/create"
            className="inline-flex items-center text-[#01427a] hover:text-[#00bcd4] transition-colors duration-300 font-medium"
          >
            <span>Are you an educator? Create and publish your own courses</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularCourses;