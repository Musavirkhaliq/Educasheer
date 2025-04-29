import React from 'react';
import { useParams } from 'react-router-dom';
import CourseForm from '../components/CourseForm';

const CourseEditPage = () => {
  const { courseId } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      <CourseForm courseId={courseId} />
    </div>
  );
};

export default CourseEditPage;
