import React from 'react';
import CourseContentOverview from './CourseContentOverview';

// Test component to verify CourseContentOverview works
const TestCourseContent = () => {
  const mockCourse = {
    _id: '123',
    title: 'Test Course',
    description: 'A test course for demonstration',
    courseType: 'online',
    videos: [
      {
        _id: 'v1',
        title: 'Introduction to React',
        duration: '15:30'
      },
      {
        _id: 'v2',
        title: 'React Components',
        duration: '22:45'
      },
      {
        _id: 'v3',
        title: 'State Management',
        duration: '18:20'
      }
    ]
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Course Content Overview Test</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Enrolled User View:</h2>
        <CourseContentOverview 
          course={mockCourse}
          isEnrolled={true}
          canEdit={false}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Non-enrolled User View:</h2>
        <CourseContentOverview 
          course={mockCourse}
          isEnrolled={false}
          canEdit={false}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Instructor View:</h2>
        <CourseContentOverview 
          course={mockCourse}
          isEnrolled={true}
          canEdit={true}
        />
      </div>
    </div>
  );
};

export default TestCourseContent;