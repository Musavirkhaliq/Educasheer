import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ImageUpload = ({ 
  currentImage, 
  onImageChange, 
  onImageRemove, 
  placeholder = "Upload image",
  className = "",
  size = "medium" // small, medium, large
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: "w-20 h-20",
    medium: "w-32 h-32", 
    large: "w-48 h-48"
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/v1/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const imageUrl = response.data.data.imageUrl;
      onImageChange(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      {currentImage ? (
        <div className="relative group">
          <div className={`${sizeClasses[size]} rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50`}>
            <img
              src={currentImage}
              alt="Uploaded"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/200x200/e2e8f0/64748b?text=Image+Error";
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            title="Remove image"
          >
            <FaTrash size={12} />
          </button>
        </div>
      ) : (
        <div
          className={`${sizeClasses[size]} border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <FaSpinner className="animate-spin text-blue-500" size={20} />
              <span className="text-xs text-gray-600">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <FaImage size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />
              <span className={`text-center ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                {placeholder}
              </span>
              <span className="text-xs text-gray-400">
                {size === 'small' ? 'Click' : 'Click or drag'}
              </span>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
