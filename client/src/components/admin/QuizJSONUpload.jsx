import React, { useState } from 'react';
import { FaUpload, FaFileAlt, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const QuizJSONUpload = ({ onQuestionsImported }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setQuestions([]);
      setShowPreview(false);
    } else {
      toast.error('Please select a valid JSON file');
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Upload and validate JSON file
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a JSON file first');
      return;
    }

    try {
      setUploading(true);

      const token = localStorage.getItem('accessToken');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);

      if (!token) {
        toast.error('No authentication token found. Please login as admin.');
        return;
      }

      const formData = new FormData();
      formData.append('jsonFile', file);

      const response = await axios.post('/api/v1/quizzes/upload-questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const { questions: validatedQuestions } = response.data.data;
      setQuestions(validatedQuestions);
      setShowPreview(true);
      toast.success(`Successfully validated ${validatedQuestions.length} questions`);
      
    } catch (error) {
      console.error('Error uploading JSON:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login as admin.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload JSON file');
      }
    } finally {
      setUploading(false);
    }
  };

  // Import questions to quiz form
  const handleImportQuestions = () => {
    if (questions.length === 0) {
      toast.error('No questions to import');
      return;
    }

    onQuestionsImported(questions);
    toast.success(`Imported ${questions.length} questions successfully`);
    
    // Reset component
    setFile(null);
    setQuestions([]);
    setShowPreview(false);
  };

  // Clear selection
  const handleClear = () => {
    setFile(null);
    setQuestions([]);
    setShowPreview(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Import Questions from JSON</h3>
      
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-[#00bcd4] bg-cyan-50' 
            : 'border-gray-300 hover:border-[#00bcd4]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
        
        {file ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              Drag and drop your JSON file here, or{' '}
              <label className="text-[#00bcd4] hover:text-[#0097a7] cursor-pointer font-medium">
                browse
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">Only JSON files are supported</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex items-center gap-2 bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#0097a7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaUpload />
          {uploading ? 'Validating...' : 'Validate JSON'}
        </button>

        {file && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FaTimes />
            Clear
          </button>
        )}

        {questions.length > 0 && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showPreview ? <FaEyeSlash /> : <FaEye />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        )}
      </div>

      {/* Questions Preview */}
      {showPreview && questions.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-semibold text-gray-800">
              Questions Preview ({questions.length} questions)
            </h4>
            <button
              onClick={handleImportQuestions}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaCheck />
              Import Questions
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">Question {index + 1}</h5>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {question.type.replace('_', ' ')}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{question.text}</p>

                {question.image && (
                  <div className="mb-3">
                    <img
                      src={question.image}
                      alt="Question image"
                      className="max-w-full h-auto max-h-48 rounded-lg border border-gray-200 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}

                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          option.isCorrect
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {option.isCorrect && <FaCheck className="text-white text-xs" />}
                        </span>
                        <div className="flex-1">
                          <span className={option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}>
                            {option.text}
                          </span>
                          {/* Option Image */}
                          {option.image && (
                            <div className="mt-1">
                              <img
                                src={option.image}
                                alt="Option"
                                className="w-16 h-10 rounded border object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/64x40/e2e8f0/64748b?text=?";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'short_answer' && (
                  <div className="bg-green-50 p-2 rounded border-l-4 border-green-500">
                    <span className="text-sm text-green-700">
                      <strong>Correct Answer:</strong> {question.correctAnswer}
                    </span>
                  </div>
                )}
                
                {question.explanation && (
                  <div className="mt-3 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <p className="text-sm text-blue-700">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON Format Help */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-2">Expected JSON Format:</h5>
        <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`[
  {
    "text": "What is the capital of France?",
    "type": "multiple_choice",
    "image": "https://example.com/question-image.jpg",
    "options": [
      {"text": "London", "isCorrect": false, "image": "https://example.com/london.jpg"},
      {"text": "Paris", "isCorrect": true, "image": "https://example.com/paris.jpg"},
      {"text": "Berlin", "isCorrect": false, "image": "https://example.com/berlin.jpg"}
    ],
    "points": 1,
    "explanation": "Paris is the capital and largest city of France."
  },
  {
    "text": "What landmark is shown in this image?",
    "type": "multiple_choice",
    "image": "https://example.com/landmark.jpg",
    "options": [
      {"text": "Big Ben", "isCorrect": false},
      {"text": "Eiffel Tower", "isCorrect": true},
      {"text": "Statue of Liberty", "isCorrect": false}
    ],
    "points": 2,
    "explanation": "The image shows the Eiffel Tower."
  }
]`}
        </pre>
      </div>
    </div>
  );
};

export default QuizJSONUpload;
