import React, { useState } from 'react';
import CourseList from '../components/CourseList';
import { SearchBar } from '../components';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaChalkboardTeacher, FaBookOpen } from 'react-icons/fa';

const CoursesPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Explore Our Courses</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl">
            Discover a wide range of courses designed to help you learn new skills, advance your career, and achieve your goals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm p-4 -mt-6 sm:-mt-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for courses..."
            initialValue={searchQuery}
          />
        </div>

        {/* Tabs Navigation */}
        {currentUser && (
          <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm p-2 overflow-x-auto">
            <nav className="flex flex-nowrap min-w-max sm:flex-wrap">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${activeTab === 'all'
                  ? 'bg-[#00bcd4]/10 text-[#00bcd4]'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <FaBookOpen className={`${activeTab === 'all' ? 'text-[#00bcd4]' : 'text-gray-500'}`} />
                All Courses
              </button>

              {(currentUser.role === 'admin' || currentUser.role === 'tutor') && (
                <button
                  onClick={() => setActiveTab('my')}
                  className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${activeTab === 'my'
                    ? 'bg-[#00bcd4]/10 text-[#00bcd4]'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <FaChalkboardTeacher className={`${activeTab === 'my' ? 'text-[#00bcd4]' : 'text-gray-500'}`} />
                  My Courses
                </button>
              )}

              <button
                onClick={() => setActiveTab('enrolled')}
                className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${activeTab === 'enrolled'
                  ? 'bg-[#00bcd4]/10 text-[#00bcd4]'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <FaGraduationCap className={`${activeTab === 'enrolled' ? 'text-[#00bcd4]' : 'text-gray-500'}`} />
                Enrolled Courses
              </button>
            </nav>
          </div>
        )}

        {/* Course Lists */}
        <div className="mt-8">
          {activeTab === 'all' && (
            <CourseList
              showCreateButton={currentUser?.role === 'admin' || currentUser?.role === 'tutor'}
              title="All Courses"
              search={searchQuery}
            />
          )}

          {activeTab === 'my' && (
            <CourseList
              showControls={true}
              showCreateButton={true}
              title="My Courses"
              search={searchQuery}
            />
          )}

          {activeTab === 'enrolled' && (
            <CourseList
              enrolledOnly={true}
              title="Enrolled Courses"
              search={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
