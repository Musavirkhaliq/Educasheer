import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getCourseMaterials,
  uploadCourseMaterial,
  deleteCourseMaterial
} from '../services/courseMaterialService';
import {
  FaFile, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileExcel,
  FaFileImage, FaFileVideo, FaFileAudio, FaDownload, FaTrash,
  FaUpload, FaPlus, FaEye, FaLink, FaFileAlt, FaFileArchive,
  FaFileCode, FaFileCsv
} from 'react-icons/fa';

const CourseMaterials = ({ courseId, isInstructor }) => {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    isPublic: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Fetch materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await getCourseMaterials(courseId);
      setMaterials(data);
      setError('');
    } catch (err) {
      setError('Failed to load course materials. Please try again.');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUploadFormData({
      ...uploadFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Check if file is an image to create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!uploadFormData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('title', uploadFormData.title);
      formData.append('description', uploadFormData.description);
      formData.append('isPublic', uploadFormData.isPublic);
      formData.append('file', selectedFile);

      await uploadCourseMaterial(courseId, formData, (progress) => {
        setUploadProgress(progress);
      });

      // Reset form
      setUploadFormData({
        title: '',
        description: '',
        isPublic: true
      });
      setSelectedFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Hide form and refresh materials
      setShowUploadForm(false);
      fetchMaterials();

    } catch (err) {
      setError('Failed to upload material. Please try again.');
      console.error('Error uploading material:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await deleteCourseMaterial(materialId);
      fetchMaterials(); // Refresh materials
    } catch (err) {
      setError('Failed to delete material. Please try again.');
      console.error('Error deleting material:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const getFileIcon = (fileType, fileName = '') => {
    // First check the fileType from the server
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="w-5 h-5 text-red-600" />;
      case 'doc':
        return <FaFileWord className="w-5 h-5 text-blue-600" />;
      case 'ppt':
        return <FaFilePowerpoint className="w-5 h-5 text-orange-600" />;
      case 'xls':
        return <FaFileExcel className="w-5 h-5 text-green-600" />;
      case 'image':
        return <FaFileImage className="w-5 h-5 text-purple-600" />;
      case 'video':
        return <FaFileVideo className="w-5 h-5 text-blue-500" />;
      case 'audio':
        return <FaFileAudio className="w-5 h-5 text-yellow-600" />;
      case 'archive':
        return <FaFileArchive className="w-5 h-5 text-amber-600" />;
      case 'code':
        return <FaFileCode className="w-5 h-5 text-emerald-600" />;
      case 'csv':
        return <FaFileCsv className="w-5 h-5 text-green-500" />;
      case 'text':
        return <FaFileAlt className="w-5 h-5 text-gray-600" />;
    }

    // If fileType is not specific enough, check the file extension
    if (fileName) {
      const extension = fileName.split('.').pop().toLowerCase();

      switch (extension) {
        case 'pdf':
          return <FaFilePdf className="w-5 h-5 text-red-600" />;
        case 'doc':
        case 'docx':
          return <FaFileWord className="w-5 h-5 text-blue-600" />;
        case 'ppt':
        case 'pptx':
          return <FaFilePowerpoint className="w-5 h-5 text-orange-600" />;
        case 'xls':
        case 'xlsx':
          return <FaFileExcel className="w-5 h-5 text-green-600" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
          return <FaFileImage className="w-5 h-5 text-purple-600" />;
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'webm':
          return <FaFileVideo className="w-5 h-5 text-blue-500" />;
        case 'mp3':
        case 'wav':
        case 'ogg':
          return <FaFileAudio className="w-5 h-5 text-yellow-600" />;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
          return <FaFileArchive className="w-5 h-5 text-amber-600" />;
        case 'html':
        case 'css':
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        case 'json':
        case 'xml':
        case 'py':
        case 'java':
        case 'c':
        case 'cpp':
        case 'php':
          return <FaFileCode className="w-5 h-5 text-emerald-600" />;
        case 'csv':
          return <FaFileCsv className="w-5 h-5 text-green-500" />;
        case 'txt':
        case 'md':
          return <FaFileAlt className="w-5 h-5 text-gray-600" />;
      }
    }

    // Default icon
    return <FaFile className="w-5 h-5 text-gray-600" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00bcd4]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Course Materials
        </h3>

        {isInstructor && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-1 text-sm bg-[#00bcd4] text-white px-3 py-1.5 rounded-lg hover:bg-[#01427a] transition-colors"
          >
            {showUploadForm ? (
              <>Cancel</>
            ) : (
              <>
                <FaPlus className="w-3 h-3" />
                Upload Material
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 border-b border-red-100">
          <p>{error}</p>
          <button
            onClick={fetchMaterials}
            className="mt-2 text-sm bg-red-100 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Upload form */}
      {showUploadForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleUploadSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={uploadFormData.title}
                onChange={handleUploadFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter material title"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={uploadFormData.description}
                onChange={handleUploadFormChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter material description"
                rows="3"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#00bcd4] transition-colors">
                <input
                  type="file"
                  id="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="flex flex-col items-center justify-center py-4 cursor-pointer"
                  >
                    <FaUpload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to select a file or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        {getFileIcon(null, selectedFile.name)}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                            <FaUpload className="w-3 h-3" />
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                            <FaTrash className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Image preview */}
                    {previewUrl && (
                      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden max-w-xs mx-auto">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={uploadFormData.isPublic}
                  onChange={handleUploadFormChange}
                  className="mr-2"
                />
                <span className="text-gray-700 text-sm">Make available to all enrolled students</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#00bcd4] rounded-lg hover:bg-[#01427a] transition-colors flex items-center gap-2 relative overflow-hidden"
                disabled={uploading || !selectedFile || !uploadFormData.title.trim()}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Uploading... {uploadProgress}%</span>
                    <div className="absolute bottom-0 left-0 h-1 bg-white opacity-50" style={{ width: `${uploadProgress}%` }}></div>
                  </>
                ) : (
                  <>
                    <FaUpload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials list */}
      <div className="p-4">
        {materials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No materials available yet.</p>
            {isInstructor && !showUploadForm && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="mt-4 bg-[#00bcd4] text-white px-4 py-2 rounded-lg hover:bg-[#01427a] transition-colors flex items-center gap-2 mx-auto"
              >
                <FaPlus className="w-3 h-3" />
                Upload First Material
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {materials.map((material) => (
              <li key={material._id} className="py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    {getFileIcon(material.fileType)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Uploaded by {material.uploadedBy.fullName}</span>
                          <span>{formatDate(material.createdAt)}</span>
                          <span>{formatFileSize(material.fileSize)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00bcd4] hover:text-[#01427a] p-2 rounded-full hover:bg-gray-200 transition-colors"
                          title="Download"
                        >
                          <FaDownload className="w-4 h-4" />
                        </a>

                        {(isInstructor || material.uploadedBy._id === currentUser?._id) && (
                          <button
                            onClick={() => handleDeleteMaterial(material._id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseMaterials;
