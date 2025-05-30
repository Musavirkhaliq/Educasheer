import React from 'react';
import CourseDetail from '../components/CourseDetail';

const CourseDetailPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <CourseDetail />
      </div>
    </div>
  );
};

export default CourseDetailPage;
