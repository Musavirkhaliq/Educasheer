import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add a function to clear all auth data
  const clearAllAuthData = () => {
    console.log('AuthContext - Clearing all auth data');
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Clear sessionStorage
    sessionStorage.removeItem('lastAuthCheck');
    sessionStorage.removeItem('userRole');

    // Clear any other potential auth-related items
    localStorage.removeItem('admin');
    sessionStorage.removeItem('admin');

    // Reset state
    setCurrentUser(null);

    console.log('AuthContext - All auth data cleared successfully');
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const lastAuthCheck = sessionStorage.getItem('lastAuthCheck');
      const storedRole = sessionStorage.getItem('userRole');

      console.log('AuthContext - Checking auth status:', {
        hasUser: !!user,
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        lastAuthCheck,
        storedRole
      });

      // If any essential auth data is missing, clear everything
      if (!user || !token || !refreshToken) {
        console.log('AuthContext - Missing essential auth data, clearing everything');
        clearAllAuthData();
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(user);

        // Check for role mismatch between localStorage and sessionStorage
        if (storedRole && parsedUser.role !== storedRole) {
          console.log('AuthContext - Role mismatch between localStorage and sessionStorage!', {
            localStorageRole: parsedUser.role,
            sessionStorageRole: storedRole
          });
          console.log('AuthContext - Clearing potentially stale data');
          clearAllAuthData();
          setLoading(false);
          return;
        }

        // Always verify with the server to get the latest user data
        try {
          console.log('AuthContext - Verifying authentication with server...');
          const response = await authAPI.getCurrentUser();
          console.log('AuthContext - Server verification successful:', response.data);

          // Update user data with the latest from the server
          const serverUser = response.data.data;

          // Check if the stored user ID matches the server user ID
          if (parsedUser._id !== serverUser._id) {
            console.log('AuthContext - User ID mismatch detected!', {
              storedUserId: parsedUser._id,
              serverUserId: serverUser._id
            });
            console.log('AuthContext - Clearing inconsistent user data');
            clearAllAuthData();
            setLoading(false);
            return;
          }

          // Update state with server data
          setCurrentUser(serverUser);

          // Update localStorage with the latest user data
          localStorage.setItem('user', JSON.stringify(serverUser));

          // Update sessionStorage for consistency
          sessionStorage.setItem('userRole', serverUser.role);
          sessionStorage.setItem('lastAuthCheck', Date.now().toString());

          console.log('AuthContext - User data updated from server:', serverUser);
        } catch (verifyError) {
          console.error('AuthContext - Server verification failed:', verifyError);

          // If server verification fails due to auth issues, clear all data
          if (verifyError.response?.status === 401 || verifyError.response?.status === 403) {
            console.log('AuthContext - Auth token invalid or unauthorized, clearing all data');
            clearAllAuthData();
          } else {
            // For other errors (like network issues), use localStorage as temporary fallback
            // But only if the data is recent (within the last hour)
            const lastCheck = parseInt(lastAuthCheck || '0');
            const oneHourAgo = Date.now() - (60 * 60 * 1000);

            if (lastCheck > oneHourAgo) {
              console.log('AuthContext - Using recent localStorage data as fallback:', parsedUser);
              setCurrentUser(parsedUser);
              sessionStorage.setItem('userRole', parsedUser.role);
            } else {
              console.log('AuthContext - Stored data is too old, clearing everything');
              clearAllAuthData();
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        clearAllAuthData();
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    console.log('AuthContext - Login attempt with email:', email);

    try {
      // First, clear ALL existing auth data to prevent role conflicts
      clearAllAuthData();
      console.log('AuthContext - Cleared all previous auth data before login');

      const response = await authAPI.login({ email, password });
      console.log('AuthContext - Login response:', response.data);

      const { user, accessToken, refreshToken } = response.data.data;

      // Store auth data in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Also update sessionStorage for consistency
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('lastAuthCheck', Date.now().toString());

      console.log('AuthContext - New user data stored in localStorage:', user);
      console.log('AuthContext - Setting current user with role:', user.role);

      // Update state
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = async (googleData) => {
    setLoading(true);
    setError(null);
    console.log('AuthContext - Google login attempt with data:', googleData);

    try {
      // First, clear ALL existing auth data to prevent role conflicts
      clearAllAuthData();
      console.log('AuthContext - Cleared all previous auth data before Google login');

      const requestData = {
        googleId: googleData.sub,
        email: googleData.email,
        fullName: googleData.name,
        avatar: googleData.picture
      };

      console.log('AuthContext - Sending request data to backend:', requestData);

      const response = await authAPI.googleLogin(requestData);

      console.log('AuthContext - Google login response:', response.data);

      const { user, accessToken, refreshToken } = response.data.data;

      // Store auth data in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Also update sessionStorage for consistency
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('lastAuthCheck', Date.now().toString());

      console.log('AuthContext - New user data stored in localStorage:', user);
      console.log('AuthContext - Setting current user with role:', user.role);

      // Update state
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('AuthContext - Google login error:', error);
      setError(error.response?.data?.message || 'Google login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    console.log('AuthContext - Logging out user:', currentUser);

    try {
      // First clear all client-side data to prevent any auth issues
      clearAllAuthData();

      // Then call the logout API endpoint
      await authAPI.logout();
      console.log('AuthContext - Server logout successful');
    } catch (error) {
      console.error('AuthContext - Logout error:', error);
      // Make sure data is cleared even if server logout fails
      clearAllAuthData();
    } finally {
      setLoading(false);

      // Clear any potential cached data in memory
      window.sessionStorage.clear();

      // Force a complete page reload to ensure all components and state are reset
      console.log('AuthContext - Forcing page reload to clear all state');
      window.location.href = '/login';
    }
  };

  // Update the navbar based on auth state
  const updateNavbar = () => {
    const navbarElement = document.getElementById('navbar');
    if (navbarElement) {
      if (currentUser) {
        navbarElement.classList.add('logged-in');
      } else {
        navbarElement.classList.remove('logged-in');
      }
    }
  };

  // Call updateNavbar whenever currentUser changes
  useEffect(() => {
    updateNavbar();
  }, [currentUser]);

  // Store the current user role in sessionStorage to detect changes
  useEffect(() => {
    if (currentUser) {
      const previousRole = sessionStorage.getItem('userRole');

      // If role has changed, update sessionStorage
      if (previousRole && previousRole !== currentUser.role) {
        console.log('AuthContext - Role changed from', previousRole, 'to', currentUser.role);
      }

      sessionStorage.setItem('userRole', currentUser.role);
      sessionStorage.setItem('lastAuthCheck', Date.now().toString());
    }
  }, [currentUser]);

  // Context value
  const value = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    login,
    googleLogin,
    register,
    logout,
    clearAllAuthData,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
