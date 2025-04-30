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

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      console.log('AuthContext - Checking auth status:', { hasUser: !!user, hasToken: !!token });

      if (user && token) {
        try {
          const parsedUser = JSON.parse(user);
          console.log('AuthContext - User found in localStorage:', parsedUser);

          // Set the current user from localStorage without server verification
          // This ensures the user stays logged in even if the server is temporarily unavailable
          setCurrentUser(parsedUser);

          // Optionally verify with the server in the background
          // but don't log the user out if it fails
          try {
            console.log('AuthContext - Verifying authentication with server...');
            const response = await authAPI.getCurrentUser();
            console.log('AuthContext - Server verification successful:', response.data);

            // Update user data with the latest from the server
            setCurrentUser(response.data.data);
          } catch (verifyError) {
            console.error('AuthContext - Server verification failed:', verifyError);
            // Don't clear user data on verification failure
            // The token refresh interceptor will handle this if needed
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setCurrentUser(null);
        }
      } else {
        console.log('AuthContext - No user or token found in localStorage');
        setCurrentUser(null);
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
      const response = await authAPI.login({ email, password });
      console.log('AuthContext - Login response:', response.data);

      const { user, accessToken, refreshToken } = response.data.data;

      // Store auth data in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('AuthContext - User data stored in localStorage');
      console.log('AuthContext - Setting current user:', user);

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

    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setLoading(false);
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

  // Context value
  const value = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
