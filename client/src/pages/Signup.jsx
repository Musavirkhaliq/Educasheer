import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUpload, FaGoogle, FaEnvelope } from "react-icons/fa";
import { authAPI } from "../services/api";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  // Check if Google Client ID is available
  const isGoogleClientIdAvailable = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle Google login/signup
  const handleGoogleSignup = useGoogleLogin({
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
        const successMessage = `Account created successfully! You are logged in as a ${user.role}.`;

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
        console.error("Google signup error:", error);
        setError(error.message || "Google signup failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google signup error:", error);
      setError("Google signup failed. Please try again.");
    },
    // Use implicit flow with proper scopes
    flow: 'implicit',
    // Request the necessary scopes
    scope: 'openid email profile'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === "avatar") {
        setAvatar(file);
      } else {
        setCoverImage(file);
      }
    }
  };

  // Handle resending verification email
  const handleResendVerification = async () => {
    if (!registeredEmail) return;

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authAPI.resendVerification(registeredEmail);
      setSuccess(response.data.message || "Verification email has been resent. Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification email:", error);
      setError(error.response?.data?.message || "Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResendOption(false);

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Make avatar optional
    // if (!avatar) {
    //   setError("Profile picture is required");
    //   return;
    // }

    setLoading(true);

    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      // Add avatar if provided
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      }

      // Add cover image if provided
      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }

      console.log("Sending registration data...");

      // Use the API service for registration
      const response = await fetch("/api/v1/users/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("Registration successful:", data);

      // Store the email for resend functionality
      setRegisteredEmail(formData.email);

      // Show success message with verification info
      setSuccess("Registration successful! A verification email has been sent to your email address. Please check your inbox and verify your email to complete the registration.");

      // Show resend option
      setShowResendOption(true);

      // Clear form
      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setAvatar(null);
      setCoverImage(null);

    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
        <p className="text-gray-600">Join EduCasheer and start learning</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>

          {showResendOption && (
            <div className="mt-3">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="flex items-center justify-center gap-2 text-sm bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition-colors duration-300"
              >
                <FaEnvelope />
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Choose a username"
            required
          />
        </div>

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

        <div className="mb-4">
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
              placeholder="Create a password"
              required
              minLength="8"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Profile Picture (Optional)
          </label>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <FaUpload />
              <span>{avatar ? avatar.name : "Choose file"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "avatar")}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Cover Image (Optional)
          </label>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <FaUpload />
              <span>{coverImage ? coverImage.name : "Choose file"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "coverImage")}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#00bcd4] text-white py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Creating Account..." : "Sign Up"}
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
          onClick={handleGoogleSignup}
          disabled={loading || !isGoogleClientIdAvailable}
          className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300 ${
            (loading || !isGoogleClientIdAvailable) ? "opacity-70 cursor-not-allowed" : ""
          }`}
          title={!isGoogleClientIdAvailable ? "Google signup is not configured" : ""}
        >
          <FaGoogle className="text-red-500" />
          {loading ? "Processing..." : "Sign up with Google"}
        </button>
        {!isGoogleClientIdAvailable && (
          <p className="text-xs text-gray-500 mt-1 text-center">
            Google signup is not configured correctly
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00bcd4] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
