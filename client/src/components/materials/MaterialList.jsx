import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileArchive,
  FaDownload, FaTrash, FaPlus, FaLink, FaExternalLinkAlt, FaAlignLeft
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import TextContentModal from './TextContentModal';

const MaterialList = ({ videoId, courseId, showControls = false }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        let url;

        if (videoId) {
          url = `/materials/video/${videoId}`;
        } else if (courseId) {
          url = `/materials/course/${courseId}`;
        } else {
          return;
        }

        const response = await api.get(url);
        setMaterials(response.data.data);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Failed to load materials');
      } finally {
        setLoading(false);
      }
    };

    if (videoId || courseId) {
      fetchMaterials();
    }
  }, [videoId, courseId]);

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await api.delete(`/materials/${materialId}`);

      // Remove the deleted material from the state
      setMaterials(materials.filter(material => material._id !== materialId));
    } catch (error) {
      console.error('Error deleting material:', error);

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        setError('Your session has expired. Please refresh the page and try again.');
      } else {
        alert('Failed to delete material');
      }
    }
  };

  const getMaterialIcon = (material) => {
    // Check material type first
    if (material.materialType === 'link') {
      return <FaLink className="text-blue-500" />;
    } else if (material.materialType === 'text') {
      return <FaAlignLeft className="text-green-500" />;
    } else if (material.materialType === 'file') {
      // For file type, check the file extension
      switch (material.fileType?.toLowerCase()) {
        case 'pdf':
          return <FaFilePdf className="text-red-500" />;
        case 'doc':
        case 'docx':
          return <FaFileWord className="text-blue-500" />;
        case 'xls':
        case 'xlsx':
          return <FaFileExcel className="text-green-500" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return <FaFileImage className="text-purple-500" />;
        case 'zip':
        case 'rar':
          return <FaFileArchive className="text-yellow-500" />;
        default:
          return <FaFileAlt className="text-gray-500" />;
      }
    }

    // Fallback
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Text Content Modal */}
      <TextContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedMaterial?.title || "Content"}
        content={selectedMaterial?.content || ""}
      />

      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">
            Course Materials
          </h3>
          {showControls && (currentUser?.role === 'admin' || currentUser?.role === 'tutor') && (
            <Link
              to={videoId ? `/videos/${videoId}/materials/add` : `/courses/${courseId}/materials/add`}
              className="flex items-center gap-2 bg-[#00bcd4] text-white px-3 py-1.5 rounded-lg hover:bg-[#01427a] transition-all duration-300 text-sm"
            >
              <FaPlus className="w-3 h-3" />
              Add Material
            </Link>
          )}
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-gray-500 font-medium mb-2">No Materials Available</h4>
            <p className="text-gray-400 text-sm">
              {showControls
                ? "Add study materials to enhance your course content."
                : "No study materials have been added for this content yet."}
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {materials.map((material) => (
            <li key={material._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                  {getMaterialIcon(material)}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-gray-800 font-medium truncate">{material.title}</h4>
                  {material.description && (
                    <p className="text-gray-500 text-sm mt-1">{material.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {/* Show different info based on material type */}
                    {material.materialType === 'file' && (
                      <>
                        <span>{material.fileType?.toUpperCase()}</span>
                        <span>{formatFileSize(material.fileSize)}</span>
                      </>
                    )}
                    {material.materialType === 'link' && (
                      <span className="text-blue-500">External Link</span>
                    )}
                    {material.materialType === 'text' && (
                      <span className="text-green-500">Text Content</span>
                    )}
                    <span>Added {new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {/* Different actions based on material type */}
                  {material.materialType === 'file' && (
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={material.fileName}
                      className="text-[#00bcd4] hover:text-[#01427a] p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      title="Download"
                    >
                      <FaDownload className="w-4 h-4" />
                    </a>
                  )}

                  {material.materialType === 'link' && (
                    <a
                      href={material.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00bcd4] hover:text-[#01427a] p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      title="Open Link"
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                    </a>
                  )}

                  {material.materialType === 'text' && (
                    <button
                      onClick={() => {
                        setSelectedMaterial(material);
                        setModalOpen(true);
                      }}
                      className="text-[#00bcd4] hover:text-[#01427a] p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      title="View Content"
                    >
                      <FaFileAlt className="w-4 h-4" />
                    </button>
                  )}

                  {showControls && (
                    currentUser?.role === 'admin' ||
                    (material.uploader._id === currentUser?._id)
                  ) && (
                    <button
                      onClick={() => handleDeleteMaterial(material._id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MaterialList;
