import React from 'react';
import ProgramForm from '../components/ProgramForm';

const ProgramCreatePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Program</h1>
        <ProgramForm />
      </div>
    </div>
  );
};

export default ProgramCreatePage;
