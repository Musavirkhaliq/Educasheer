import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FaDownload, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFileImage,
  FaFileArchive, 
  FaFile, 
  FaTrash,
  FaFileAlt,
  FaFilePowerpoint
} from 'react-icons/fa';

const CourseMaterialsList = ({ courseId }) => {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/courses/${courseId}/materials`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setMaterials(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load course materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await axios.delete(`/api/v1/materials/${materialId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // Refresh materials list
      fetchMaterials();
    } catch (err) {
      console.error('Error deleting material:', err);
      setError('Failed to delete material. Please try again.');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="h-5 w-5 text-red-500" />;
      case 'doc':
        return <FaFileWord className="h-5 w-5 text-blue-500" />;
      case 'ppt':
        return <FaFilePowerpoint className="h-5 w-5 text-orange-500" />;
      case 'xls':
        return <FaFileExcel className="h-5 w-5 text-green-500" />;
      case 'image':
        return <FaFileImage className="h-5 w-5 text-purple-500" />;
      default:
        return <FaFileAlt className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canDelete = (material) => {
    return currentUser && (
      material.uploadedBy._id === currentUser._id || 
      currentUser.role === 'admin'
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <FaFileAlt className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-600">No materials have been uploaded for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map((material) => (
        <div 
          key={material._id} 
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-4 flex items-start gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              {getFileIcon(material.fileType)}
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">{material.title}</h4>
                  {material.description && (
                    <p className="text-gray-600 text-sm mt-1">{material.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={material.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00bcd4] hover:text-[#01427a] p-1"
                    title="Download"
                  >
                    <FaDownload />
                  </a>
                  
                  {canDelete(material) && (
                    <button
                      onClick={() => handleDeleteMaterial(material._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>
                  Uploaded by {material.uploadedBy.fullName}
                </span>
                <span>
                  {formatDate(material.createdAt)}
                </span>
                <span>
                  {formatFileSize(material.fileSize)}
                </span>
                <span className="capitalize">
                  {material.fileType} file
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseMaterialsList;
