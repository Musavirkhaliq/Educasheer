import React from 'react';
import { useParams } from 'react-router-dom';
import ProgramForm from '../components/ProgramForm';

const ProgramEditPage = () => {
  const { programId } = useParams();
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Program</h1>
        <ProgramForm programId={programId} />
      </div>
    </div>
  );
};

export default ProgramEditPage;
