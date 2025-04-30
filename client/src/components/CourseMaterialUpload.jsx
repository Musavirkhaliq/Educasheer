import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FaUpload, 
  FaFileAlt, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFileImage,
  FaFileArchive, 
  FaFile
} from 'react-icons/fa';

const CourseMaterialUpload = ({ courseId, onMaterialUploaded }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const getFileIcon = () => {
    if (!file) return <FaUpload className="h-10 w-10 text-gray-400" />;

    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="h-10 w-10 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="h-10 w-10 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="h-10 w-10 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="h-10 w-10 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <FaFileArchive className="h-10 w-10 text-yellow-500" />;
      default:
        return <FaFileAlt className="h-10 w-10 text-gray-500" />;
    }
  };

  const getFileType = () => {
    if (!file) return 'other';

    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'ppt':
      case 'pptx':
        return 'ppt';
      case 'xls':
      case 'xlsx':
        return 'xls';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video';
      case 'mp3':
      case 'wav':
        return 'audio';
      default:
        return 'other';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Create form data for file upload
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('isPublic', formData.isPublic);
    uploadData.append('file', file);

    try {
      const response = await axios.post(
        `/api/v1/courses/${courseId}/materials`,
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setSuccess('Material uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        isPublic: true
      });
      setFile(null);
      
      // Notify parent component
      if (onMaterialUploaded) {
        onMaterialUploaded(response.data.data);
      }
    } catch (err) {
      console.error('Error uploading material:', err);
      setError(err.response?.data?.message || 'Failed to upload material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is instructor or admin
  const canUpload = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.role === 'tutor'
  );

  if (!canUpload) {
    return null; // Don't render anything if user can't upload
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaUpload className="text-[#00bcd4]" />
        Upload Course Material
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g. Course Syllabus"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Brief description of this material"
            rows="3"
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-gray-700 font-medium mb-2">
            File *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#00bcd4] transition-colors duration-300">
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              className="hidden"
              required
            />
            <label
              htmlFor="file"
              className="cursor-pointer flex flex-col items-center justify-center py-4"
            >
              {getFileIcon()}

              <span className="mt-2 text-sm font-medium text-gray-700">
                {file ? file.name : 'Click to upload file'}
              </span>
              {file && (
                <span className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: 10MB. Supported formats: PDF, DOC, PPT, XLS, images, etc.
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-gray-700">
            Make this material available to all enrolled students
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Material'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseMaterialUpload;
