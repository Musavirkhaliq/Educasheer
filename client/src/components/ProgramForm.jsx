import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ProgramForm = ({ programId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userCourses, setUserCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Uncategorized',
    level: 'Mixed',
    price: 0,
    originalPrice: 0,
    tags: '',
    isPublished: false
  });

  const categories = [
    'Uncategorized',
    'Mathematics',
    'Programming',
    'Science',
    'Languages',
    'Arts',
    'History',
    'Business',
    'Technology'
  ];

  const levels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Mixed'
  ];

  useEffect(() => {
    // Fetch user's courses
    const fetchUserCourses = async () => {
      try {
        const response = await axios.get('/api/v1/courses/my/courses', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        setUserCourses(response.data.data);
      } catch (error) {
        console.error('Error fetching user courses:', error);
        setError('Failed to fetch your courses. Please try again.');
      }
    };

    // If editing an existing program, fetch program details
    const fetchProgramDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/programs/${programId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        const program = response.data.data;
        setFormData({
          title: program.title,
          description: program.description,
          category: program.category,
          level: program.level,
          price: program.price,
          originalPrice: program.originalPrice,
          tags: program.tags.join(', '),
          isPublished: program.isPublished
        });

        // Set selected courses
        setSelectedCourses(program.courses.map(course => course._id));
      } catch (error) {
        console.error('Error fetching program details:', error);
        setError('Failed to fetch program details. Please try again.');
      }
    };

    fetchUserCourses();
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const toggleCourseSelection = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('Form submission - Selected courses:', selectedCourses);
    console.log('Form submission - Form data:', formData);

    if (selectedCourses.length === 0) {
      console.error('No courses selected');
      setError('Please select at least one course for the program');
      setLoading(false);
      return;
    }

    try {
      // Validate courseIds to ensure they are valid MongoDB ObjectIds
      if (selectedCourses.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
        console.error('Invalid course ID format detected');
        setError('One or more selected courses have an invalid ID format');
        setLoading(false);
        return;
      }

      // Ensure price and originalPrice are valid numbers
      const price = parseFloat(formData.price) || 0;
      const originalPrice = parseFloat(formData.originalPrice) || price || 0;

      const programData = {
        ...formData,
        price,
        originalPrice,
        courseIds: selectedCourses
      };

      console.log('Submitting program data:', programData);

      let response;
      if (programId) {
        // Update existing program
        console.log('Updating existing program:', programId);
        response = await axios.patch(
          `/api/v1/programs/${programId}`,
          programData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        console.log('Program update response:', response.data);
        setSuccess('Program updated successfully!');
      } else {
        // Create new program
        console.log('Creating new program');
        response = await axios.post(
          '/api/v1/programs',
          programData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        console.log('Program creation response:', response.data);
        setSuccess('Program created successfully!');
      }

      // After a short delay, redirect to the programs page
      setTimeout(() => {
        navigate('/programs');
      }, 2000);
    } catch (error) {
      console.error('Error saving program:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can create programs
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'tutor') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Access Denied!</strong>
        <span className="block sm:inline"> Only admins and tutors can create programs.</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 relative inline-block">
        {programId ? 'Edit Program' : 'Create New Program'}
        <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#01427a] rounded-full"></span>
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6" role="alert">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6" role="alert">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Program Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Program Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            rows="5"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="level">
              Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originalPrice">
              Original Price ($) <span className="text-gray-500 font-normal">(for discounts)</span>
            </label>
            <input
              type="number"
              id="originalPrice"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
            Tags <span className="text-gray-500 font-normal">(comma separated)</span>
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. javascript, web development, beginner"
            className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 text-[#00bcd4] focus:ring-[#00bcd4] border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Publish this program (make it visible to all users)</span>
          </label>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Select Courses for this Program</h3>
          
          {userCourses.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
              <p className="font-medium">You don't have any courses yet!</p>
              <p className="mt-1">Please create some courses first before creating a program.</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {userCourses.map(course => (
                  <div 
                    key={course._id} 
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                      selectedCourses.includes(course._id) 
                        ? 'bg-[#00bcd4]/10 border border-[#00bcd4]/30' 
                        : 'bg-white border border-gray-200 hover:border-[#00bcd4]/30'
                    }`}
                    onClick={() => toggleCourseSelection(course._id)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedCourses.includes(course._id) 
                          ? 'bg-[#00bcd4] text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {selectedCourses.includes(course._id) ? (
                          <FaCheck className="w-3 h-3" />
                        ) : (
                          <FaTimes className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{course.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{course.level}</span>
                            <span>•</span>
                            <span>{course.videos?.length || 0} videos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={loading || userCourses.length === 0 || selectedCourses.length === 0}
            className={`bg-[#01427a] hover:bg-[#01427a]/80 text-white font-medium py-2.5 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-200 ${
              (loading || userCourses.length === 0 || selectedCourses.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              programId
                ? `Update Program (${selectedCourses.length} courses)`
                : `Create Program (${selectedCourses.length} courses)`
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/programs')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgramForm;
