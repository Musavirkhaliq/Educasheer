import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated, currentUser } = useAuth();

  // Check if Google Client ID is available
  const isGoogleClientIdAvailable = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle Google login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await userInfoResponse.json();
        console.log("Google user info:", userInfo);

        // Login with Google
        const user = await googleLogin(userInfo);

        // Show success message
        const successMessage = `Login successful! You are logged in as a ${user.role}.`;

        // Redirect based on role
        if (user.role === "admin") {
          setTimeout(() => navigate("/admin"), 500);
        } else if (user.role === "tutor") {
          setTimeout(() => navigate("/profile"), 500);
        } else {
          setTimeout(() => navigate("/profile"), 500);
        }

        // Alert the user about their role
        alert(successMessage);
      } catch (error) {
        console.error("Google login error:", error);
        setError(error.message || "Google login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
    },
    // Only flow will be 'implicit' by default
    flow: 'implicit'
  });

  // If user is already authenticated, redirect to appropriate page
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log("User already authenticated, redirecting...");
      if (currentUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use the login function from AuthContext
      const user = await login(formData.email, formData.password);

      // Show success message with role information
      const successMessage = `Login successful! You are logged in as a ${user.role}.`;

      // Redirect based on role
      if (user.role === "admin") {
        // Admin dashboard
        setTimeout(() => navigate("/admin"), 500);
      } else if (user.role === "tutor") {
        // Tutor dashboard
        setTimeout(() => navigate("/profile"), 500);
      } else {
        // Learner profile page
        setTimeout(() => navigate("/profile"), 500);
      }

      // Alert the user about their role
      alert(successMessage);

    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-600">Sign in to continue to EduCasheer</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="mt-1 text-right">
            <Link to="/forgot-password" className="text-sm text-[#00bcd4] hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#00bcd4] text-white py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-4 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !isGoogleClientIdAvailable}
          className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300 ${
            (loading || !isGoogleClientIdAvailable) ? "opacity-70 cursor-not-allowed" : ""
          }`}
          title={!isGoogleClientIdAvailable ? "Google login is not configured" : ""}
        >
          <FaGoogle className="text-red-500" />
          {loading ? "Processing..." : "Sign in with Google"}
        </button>
        {!isGoogleClientIdAvailable && (
          <p className="text-xs text-gray-500 mt-1 text-center">
            Google login is not configured correctly
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#00bcd4] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
