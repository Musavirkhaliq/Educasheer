import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BiTime } from 'react-icons/bi';
import { FiVideo } from 'react-icons/fi';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CourseCard = ({ course, showControls, onDelete }) => {
  const { currentUser } = useAuth();
  const canEdit = showControls && (currentUser?.role === 'admin' || currentUser?._id === course.creator?._id);
  
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
    : `${minutes / 60}`;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/courses/${course._id}`}>
        <div className="rounded-lg mb-4 overflow-hidden">
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-48 object-cover"
          />
        </div>
      </Link>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm px-3 py-1 rounded-full bg-gray-100">{course.level}</span>
        <div className="flex items-center text-sm text-gray-500 gap-1">
          <FiVideo className="w-4 h-4" />
          <span>{course.videos?.length || 0} videos</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 gap-1">
          <BiTime className="w-4 h-4" />
          <span>{formattedDuration} hours</span>
        </div>
      </div>
      
      <Link to={`/courses/${course._id}`}>
        <h3 className="font-semibold text-lg mb-4 hover:text-blue-600 transition-colors">{course.title}</h3>
      </Link>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img 
            src={course.creator?.avatar} 
            alt={course.creator?.fullName} 
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-600">{course.creator?.fullName}</span>
        </div>
        
        {!course.isPublished && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Draft</span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-blue-600">${course.price.toFixed(2)}</span>
          {course.originalPrice > course.price && (
            <span className="text-sm text-gray-400 line-through ml-2">${course.originalPrice.toFixed(2)}</span>
          )}
        </div>
        
        {canEdit && (
          <div className="flex gap-2">
            <Link 
              to={`/courses/edit/${course._id}`}
              className="text-blue-500 hover:text-blue-700"
            >
              <FaEdit />
            </Link>
            <button 
              onClick={() => onDelete(course._id)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseList = ({ 
  userId, 
  limit, 
  showControls = false, 
  showCreateButton = false,
  enrolledOnly = false,
  title = "Courses"
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let url = '/api/v1/courses';
        const params = {};
        
        if (limit) {
          params.limit = limit;
        }
        
        if (userId) {
          url = `/api/v1/courses/creator/${userId}`;
        } else if (showControls) {
          url = '/api/v1/courses/my/courses';
        } else if (enrolledOnly) {
          url = '/api/v1/courses/my/enrolled';
        }
        
        const response = await axios.get(url, {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        setCourses(response.data.data.courses || response.data.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [userId, limit, showControls, enrolledOnly]);
  
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/v1/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Remove the deleted course from the list
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading courses...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
          <Link 
            to="/courses/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Create New Course
          </Link>
        )}
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No courses found.</p>
          {showCreateButton && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
            <Link 
              to="/courses/create"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard 
              key={course._id} 
              course={course} 
              showControls={showControls}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
