import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to login after 3 seconds if successful
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        console.log("Verifying email with token:", token);

        // Use the authAPI to verify the email
        const response = await authAPI.verifyEmail(token);

        console.log("Verification response:", response);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully. You can now log in.");
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage(error.response?.data?.message || "Failed to verify email. The link may be expired or invalid.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Email Verification</h1>
        </div>

        {status === "verifying" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4] mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email address...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p>{message}</p>
              <p className="mt-2 text-sm">Redirecting to login page in 3 seconds...</p>
            </div>
            <Link
              to="/login"
              className="inline-block bg-[#00bcd4] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300"
            >
              Go to Login Now
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p>{message}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Link
                to="/login"
                className="inline-block bg-[#00bcd4] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300"
              >
                Go to Login
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
