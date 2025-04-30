import React, { useState } from 'react';
import ProgramList from '../components/ProgramList';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaChalkboardTeacher, FaBookOpen } from 'react-icons/fa';

const ProgramsPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Learning Programs</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl">
            Comprehensive learning paths designed to help you master multiple skills through structured courses.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        {currentUser && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-2 -mt-8">
            <nav className="flex flex-wrap">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 py-3 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-[#01427a]/10 text-[#01427a]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaBookOpen className={`${activeTab === 'all' ? 'text-[#01427a]' : 'text-gray-500'}`} />
                All Programs
              </button>
              
              {(currentUser.role === 'admin' || currentUser.role === 'tutor') && (
                <button
                  onClick={() => setActiveTab('my')}
                  className={`flex items-center gap-2 py-3 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === 'my'
                      ? 'bg-[#01427a]/10 text-[#01427a]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaChalkboardTeacher className={`${activeTab === 'my' ? 'text-[#01427a]' : 'text-gray-500'}`} />
                  My Programs
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`flex items-center gap-2 py-3 px-5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'enrolled'
                    ? 'bg-[#01427a]/10 text-[#01427a]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaGraduationCap className={`${activeTab === 'enrolled' ? 'text-[#01427a]' : 'text-gray-500'}`} />
                Enrolled Programs
              </button>
            </nav>
          </div>
        )}
        
        {/* Program Lists */}
        <div className="mt-8">
          {activeTab === 'all' && (
            <ProgramList 
              showCreateButton={currentUser?.role === 'admin' || currentUser?.role === 'tutor'} 
              title="All Programs"
            />
          )}
          
          {activeTab === 'my' && (
            <ProgramList 
              showControls={true} 
              showCreateButton={true} 
              title="My Programs"
            />
          )}
          
          {activeTab === 'enrolled' && (
            <ProgramList 
              enrolledOnly={true} 
              title="Enrolled Programs"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramsPage;
