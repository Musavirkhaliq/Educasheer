import React, { useState } from 'react';
import CourseList from '../components/CourseList';
import { useAuth } from '../context/AuthContext';

const CoursesPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      
      {currentUser && (
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Courses
              </button>
              
              {(currentUser.role === 'admin' || currentUser.role === 'tutor') && (
                <button
                  onClick={() => setActiveTab('my')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Courses
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrolled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Enrolled Courses
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {activeTab === 'all' && (
        <CourseList 
          showCreateButton={currentUser?.role === 'admin' || currentUser?.role === 'tutor'} 
          title="All Courses"
        />
      )}
      
      {activeTab === 'my' && (
        <CourseList 
          showControls={true} 
          showCreateButton={true} 
          title="My Courses"
        />
      )}
      
      {activeTab === 'enrolled' && (
        <CourseList 
          enrolledOnly={true} 
          title="Enrolled Courses"
        />
      )}
    </div>
  );
};

export default CoursesPage;
