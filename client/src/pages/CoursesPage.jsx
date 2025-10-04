import React, { useState } from 'react';
import CourseList from '../components/CourseList';
import { SearchBar } from '../components';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaChalkboardTeacher, FaBookOpen } from 'react-icons/fa';
import EnhancedContainer from '../components/layout/EnhancedContainer';

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
        <EnhancedContainer maxWidth="11xl" padding="responsive">
          <div className="py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6">
                Explore Our Courses
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl leading-relaxed">
                Discover a wide range of courses designed to help you learn new skills, advance your career, and achieve your goals.
              </p>
            </div>
          </div>
        </EnhancedContainer>
      </div>

      <EnhancedContainer 
        maxWidth="10xl" 
        padding="responsive"
        className="py-6 sm:py-8 lg:py-12"
      >
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8 lg:mb-12 bg-white rounded-xl shadow-sm p-4 lg:p-6 -mt-6 sm:-mt-8 lg:-mt-12">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for courses..."
            initialValue={searchQuery}
          />
        </div>

        {/* Tabs Navigation */}
        {currentUser && (
          <div className="mb-6 sm:mb-8 lg:mb-12 bg-white rounded-xl shadow-sm p-2 lg:p-3 overflow-x-auto">
            <nav className="flex flex-nowrap min-w-max lg:flex-wrap lg:justify-center xl:justify-start gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 py-3 px-5 lg:px-6 xl:px-8 rounded-lg font-medium text-sm lg:text-base whitespace-nowrap transition-all duration-200 ${activeTab === 'all'
                  ? 'bg-[#00bcd4]/10 text-[#00bcd4] shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <FaBookOpen className={`${activeTab === 'all' ? 'text-[#00bcd4]' : 'text-gray-500'}`} />
                All Courses
              </button>

              {(currentUser.role === 'admin' || currentUser.role === 'tutor') && (
                <button
                  onClick={() => setActiveTab('my')}
                  className={`flex items-center gap-2 py-3 px-5 lg:px-6 xl:px-8 rounded-lg font-medium text-sm lg:text-base whitespace-nowrap transition-all duration-200 ${activeTab === 'my'
                    ? 'bg-[#00bcd4]/10 text-[#00bcd4] shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <FaChalkboardTeacher className={`${activeTab === 'my' ? 'text-[#00bcd4]' : 'text-gray-500'}`} />
                  My Courses
                </button>
              )}

              <button
                onClick={() => setActiveTab('enrolled')}
                className={`flex items-center gap-2 py-3 px-5 lg:px-6 xl:px-8 rounded-lg font-medium text-sm lg:text-base whitespace-nowrap transition-all duration-200 ${activeTab === 'enrolled'
                  ? 'bg-[#00bcd4]/10 text-[#00bcd4] shadow-sm'
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
        <div>
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
      </EnhancedContainer>
    </div>
  );
};

export default CoursesPage;
