import React, { useState } from 'react';
import { FaSave, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AccountSettings = ({ user }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Handle input change for account details
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle input change for password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update account details
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await profileAPI.updateAccountDetails({
        fullName: formData.fullName,
        email: formData.email,
      });

      if (response.data.data) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update the current user in context if you have a setter
        if (typeof setCurrentUser === 'function') {
          setCurrentUser(updatedUser);
        }

        setMessage({ type: 'success', text: 'Account details updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update account details.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const response = await profileAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });

      // Clear password fields
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password.'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Account Details Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Account Details</h2>

        <form onSubmit={handleUpdateAccount}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={user?.username || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">Username cannot be changed</p>
            </div>

            <div>
              <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                Role
              </label>
              <input
                type="text"
                id="role"
                value={(user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)) || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {message.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-70"
              disabled={isUpdating}
            >
              <FaSave className="mr-2" />
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        <form onSubmit={handleChangePassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="oldPassword" className="block text-gray-700 font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                required
                minLength="8"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
                required
                minLength="8"
              />
            </div>
          </div>

          {passwordMessage.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              passwordMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#00bcd4] to-[#01427a] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-70"
              disabled={isChangingPassword}
            >
              <FaLock className="mr-2" />
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Danger Zone */}
      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          Danger Zone
        </h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-4">
            Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
          </p>

          <button
            type="button"
            className="bg-white border border-red-500 text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-all duration-300"
            onClick={() => {
              // Show confirmation dialog before proceeding
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                // Implement account deletion logic here
                alert('Account deletion is not implemented in this demo.');
              }
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
