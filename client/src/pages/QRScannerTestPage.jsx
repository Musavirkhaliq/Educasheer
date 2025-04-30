import React, { useState } from 'react';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRCodeScanner from '../components/QRCodeScanner';

const QRScannerTestPage = () => {
  const [showGenerator, setShowGenerator] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">QR Code Attendance System Test</h1>
      
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setShowGenerator(true);
            setShowScanner(false);
          }}
          className={`px-4 py-2 rounded-lg ${
            showGenerator ? 'bg-[#00bcd4] text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          QR Generator (Instructor)
        </button>
        <button
          onClick={() => {
            setShowGenerator(false);
            setShowScanner(true);
          }}
          className={`px-4 py-2 rounded-lg ${
            showScanner ? 'bg-[#00bcd4] text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          QR Scanner (Student)
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        {showGenerator && (
          <QRCodeGenerator 
            courseId="test-course-id" 
            courseName="Test Course" 
          />
        )}
        
        {showScanner && (
          <QRCodeScanner 
            courseId="test-course-id" 
            courseName="Test Course" 
            onSuccess={() => alert('Scan successful!')}
          />
        )}
      </div>
    </div>
  );
};

export default QRScannerTestPage;
