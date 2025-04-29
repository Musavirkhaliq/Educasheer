import React from 'react';
import CourseForm from '../components/CourseForm';

const CourseCreatePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      <CourseForm />
    </div>
  );
};

export default CourseCreatePage;
