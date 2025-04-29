import React, { useState } from 'react';
import { FaCamera, FaEdit } from 'react-icons/fa';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProfileHeader = ({ user }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);

  // Function to handle avatar change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await profileAPI.updateAvatar(formData);

      // Update user in context
      if (response.data.data) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Update the current user in context if you have a setter
        if (typeof setCurrentUser === 'function') {
          setCurrentUser(updatedUser);
        } else {
          // Refresh the page as fallback
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to handle cover image change
  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverImageFile(file);
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('coverImage', file);

      const response = await profileAPI.updateCoverImage(formData);

      // Update user in context
      if (response.data.data) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Update the current user in context if you have a setter
        if (typeof setCurrentUser === 'function') {
          setCurrentUser(updatedUser);
        } else {
          // Refresh the page as fallback
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 w-full rounded-t-lg overflow-hidden relative bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20">
        {user?.coverImage ? (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20 flex items-center justify-center">
            <span className="text-gray-500">No cover image</span>
          </div>
        )}

        {/* Cover Image Upload Button */}
        <label
          htmlFor="coverImageUpload"
          className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <FaCamera className="text-[#00bcd4]" />
          <input
            type="file"
            id="coverImageUpload"
            className="hidden"
            accept="image/*"
            onChange={handleCoverImageChange}
            disabled={isUpdating}
          />
        </label>
      </div>

      {/* Profile Info Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end px-6 -mt-16 relative z-10">
        {/* Avatar */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-r from-[#00bcd4] to-[#01427a] flex items-center justify-center text-white text-4xl">
                {user?.fullName?.charAt(0)}
              </div>
            )}
          </div>

          {/* Avatar Upload Button */}
          <label
            htmlFor="avatarUpload"
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <FaCamera className="text-[#00bcd4]" />
            <input
              type="file"
              id="avatarUpload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUpdating}
            />
          </label>
        </div>

        {/* User Info */}
        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left pb-4">
          <h1 className="text-2xl font-bold text-gray-800">{user?.fullName}</h1>
          <p className="text-gray-600">@{user?.username}</p>
          <div className="mt-2">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#00bcd4]/20 to-[#01427a]/20 rounded-full text-sm font-medium text-[#01427a]">
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </span>

            {user?.tutorStatus && user.tutorStatus !== 'none' && (
              <span className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user.tutorStatus === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : user.tutorStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Tutor: {user.tutorStatus.charAt(0).toUpperCase() + user.tutorStatus.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
