import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TutorApplicationForm = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    qualifications: "",
    experience: "",
    specialization: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [application, setApplication] = useState(null);

  // Check if user already has an application
  useEffect(() => {
    const checkApplication = async () => {
      try {
        const response = await axios.get("/api/v1/tutor-applications/my-application", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        setApplication(response.data.data);
      } catch (error) {
        // No application found or other error
        if (error.response?.status !== 404) {
          console.error("Error checking application:", error);
        }
      }
    };

    if (currentUser) {
      checkApplication();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/v1/tutor-applications/submit",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      setSuccess("Your tutor application has been submitted successfully!");
      setApplication(response.data.data);
      
      // Update user in localStorage with new tutorStatus
      const user = JSON.parse(localStorage.getItem("user"));
      user.tutorStatus = "pending";
      localStorage.setItem("user", JSON.stringify(user));
      
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to submit application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // If user already has an application, show its status
  if (application) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tutor Application Status</h2>
        
        <div className="mb-4">
          <p className="text-gray-700">
            <span className="font-semibold">Status:</span>{" "}
            <span className={`font-medium ${
              application.status === "approved" ? "text-green-600" : 
              application.status === "rejected" ? "text-red-600" : 
              "text-yellow-600"
            }`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </p>
        </div>
        
        {application.status === "approved" && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Your application has been approved! You are now a tutor.
          </div>
        )}
        
        {application.status === "rejected" && application.adminFeedback && (
          <div className="mb-4">
            <p className="font-semibold text-gray-700">Feedback:</p>
            <p className="text-gray-600">{application.adminFeedback}</p>
          </div>
        )}
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Application</h3>
          
          <div className="mb-3">
            <p className="font-medium text-gray-700">Qualifications:</p>
            <p className="text-gray-600">{application.qualifications}</p>
          </div>
          
          <div className="mb-3">
            <p className="font-medium text-gray-700">Experience:</p>
            <p className="text-gray-600">{application.experience}</p>
          </div>
          
          <div className="mb-3">
            <p className="font-medium text-gray-700">Specialization:</p>
            <p className="text-gray-600">{application.specialization}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show application form if user doesn't have an application yet
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Apply to Become a Tutor</h2>
      <p className="text-gray-600 mb-6">
        Fill out the form below to apply for a tutor position. Our admin team will review your application.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="qualifications" className="block text-gray-700 font-medium mb-2">
            Qualifications
          </label>
          <textarea
            id="qualifications"
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Enter your educational qualifications"
            rows="3"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="experience" className="block text-gray-700 font-medium mb-2">
            Teaching Experience
          </label>
          <textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="Describe your teaching experience"
            rows="3"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="specialization" className="block text-gray-700 font-medium mb-2">
            Specialization
          </label>
          <textarea
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4]"
            placeholder="What subjects do you specialize in?"
            rows="3"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#00bcd4] text-white py-2 rounded-lg font-medium hover:bg-[#01427a] transition-colors duration-300 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default TutorApplicationForm;
