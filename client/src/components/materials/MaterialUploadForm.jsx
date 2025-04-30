import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUpload, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage,
  FaFileArchive, FaLink, FaAlignLeft, FaFile, FaGlobe, FaFont
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MaterialUploadForm = () => {
  const { videoId, courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoId: videoId || '',
    materialType: 'file', // Default to file type
    linkUrl: '',
    content: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [videos, setVideos] = useState([]);

  // Fetch videos if courseId is provided
  useEffect(() => {
    const fetchCourseVideos = async () => {
      if (courseId) {
        try {
          const response = await api.get(`/courses/${courseId}`);

          setVideos(response.data.data.videos || []);

          // If videos are available, set the first video as default
          if (response.data.data.videos && response.data.data.videos.length > 0) {
            setFormData(prev => ({
              ...prev,
              videoId: response.data.data.videos[0]._id
            }));
          }
        } catch (error) {
          console.error('Error fetching course videos:', error);
          setError('Failed to load course videos');
        }
      }
    };

    fetchCourseVideos();
  }, [courseId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      setError('Title is required');
      return;
    }

    if (!formData.videoId) {
      setError('Video is required');
      return;
    }

    // Validate based on material type
    if (formData.materialType === 'file' && !file) {
      setError('File is required for file type material');
      return;
    }

    if (formData.materialType === 'link' && !formData.linkUrl) {
      setError('URL is required for link type material');
      return;
    }

    if (formData.materialType === 'text' && !formData.content) {
      setError('Content is required for text type material');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;

      if (formData.materialType === 'file') {
        // For file type, use FormData
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('videoId', formData.videoId);
        formDataToSend.append('materialType', formData.materialType);
        formDataToSend.append('material', file);

        response = await api.post('/materials/video', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // For link and text types, use JSON
        response = await api.post('/materials/video', {
          title: formData.title,
          description: formData.description,
          videoId: formData.videoId,
          materialType: formData.materialType,
          linkUrl: formData.materialType === 'link' ? formData.linkUrl : undefined,
          content: formData.materialType === 'text' ? formData.content : undefined
        });
      }

      setSuccess('Material added successfully!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        videoId: videoId || (videos.length > 0 ? videos[0]._id : ''),
        materialType: 'file',
        linkUrl: '',
        content: ''
      });
      setFile(null);

      // Redirect after a short delay
      setTimeout(() => {
        if (videoId) {
          navigate(`/videos/${videoId}`);
        } else if (courseId) {
          navigate(`/courses/${courseId}`);
        }
      }, 2000);
    } catch (error) {
      console.error('Error adding material:', error);

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        setError('Your session has expired. Please refresh the page and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to add material');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FaUpload className="w-6 h-6 text-gray-400" />;

    const fileType = file.name.split('.').pop().toLowerCase();

    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="w-6 h-6 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="w-6 h-6 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="w-6 h-6 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <FaFileArchive className="w-6 h-6 text-yellow-500" />;
      default:
        return <FaFileAlt className="w-6 h-6 text-gray-500" />;
    }
  };

  // Check if user is authorized
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'tutor') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>You don't have permission to add materials.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 max-w-2xl mx-auto">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Upload Course Material
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Add study materials for students to download
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <p>{success}</p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            placeholder="Enter material title"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            placeholder="Enter material description"
            rows="3"
          />
        </div>

        {!videoId && courseId && videos.length > 0 && (
          <div className="mb-4">
            <label htmlFor="videoId" className="block text-gray-700 font-medium mb-2">
              Video *
            </label>
            <select
              id="videoId"
              name="videoId"
              value={formData.videoId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
              required
            >
              <option value="">Select a video</option>
              {videos.map((video) => (
                <option key={video._id} value={video._id}>
                  {video.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Material Type *
          </label>
          <div className="flex flex-wrap gap-4">
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              formData.materialType === 'file'
                ? 'border-[#00bcd4] bg-[#00bcd4]/5 text-[#00bcd4]'
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="materialType"
                value="file"
                checked={formData.materialType === 'file'}
                onChange={handleChange}
                className="hidden"
              />
              <FaFile className="mr-2" />
              <span>File</span>
            </label>

            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              formData.materialType === 'link'
                ? 'border-[#00bcd4] bg-[#00bcd4]/5 text-[#00bcd4]'
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="materialType"
                value="link"
                checked={formData.materialType === 'link'}
                onChange={handleChange}
                className="hidden"
              />
              <FaGlobe className="mr-2" />
              <span>Link</span>
            </label>

            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              formData.materialType === 'text'
                ? 'border-[#00bcd4] bg-[#00bcd4]/5 text-[#00bcd4]'
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="materialType"
                value="text"
                checked={formData.materialType === 'text'}
                onChange={handleChange}
                className="hidden"
              />
              <FaFont className="mr-2" />
              <span>Text</span>
            </label>
          </div>
        </div>

        {/* File Upload (for file type) */}
        {formData.materialType === 'file' && (
          <div className="mb-6">
            <label htmlFor="material" className="block text-gray-700 font-medium mb-2">
              Material File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#00bcd4] transition-colors duration-300">
              <input
                type="file"
                id="material"
                name="material"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="material"
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

                {!file && (
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, Word, Excel, Images, ZIP (max 10MB)
                  </span>
                )}
              </label>
            </div>
          </div>
        )}

        {/* URL Input (for link type) */}
        {formData.materialType === 'link' && (
          <div className="mb-6">
            <label htmlFor="linkUrl" className="block text-gray-700 font-medium mb-2">
              URL *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                <FaLink />
              </span>
              <input
                type="url"
                id="linkUrl"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
                placeholder="https://example.com/resource"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the full URL including https:// or http://
            </p>
          </div>
        )}

        {/* Text Content (for text type) */}
        {formData.materialType === 'text' && (
          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
              placeholder="Enter your text content here..."
              rows="8"
              required
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (videoId) {
                navigate(`/videos/${videoId}`);
              } else if (courseId) {
                navigate(`/courses/${courseId}`);
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-2 hover:bg-gray-50 transition-colors duration-300"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#01427a] transition-colors duration-300 flex items-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FaUpload className="w-4 h-4" />
                <span>Upload Material</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialUploadForm;
