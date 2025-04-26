import React from "react";
import TutorApplicationForm from "../components/TutorApplicationForm";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const TutorApplication = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect if user is already a tutor
  if (currentUser?.role === "tutor") {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">You're Already a Tutor</h2>
          <p className="text-gray-600 mb-4">
            You already have tutor privileges on the platform. You can now create and manage courses.
          </p>
          <a
            href="/tutor/dashboard"
            className="inline-block bg-[#00bcd4] text-white px-6 py-2 rounded-lg hover:bg-[#01427a] transition-colors duration-300"
          >
            Go to Tutor Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Redirect if user is an admin
  if (currentUser?.role === "admin") {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access</h2>
          <p className="text-gray-600 mb-4">
            As an admin, you already have full privileges on the platform, including tutor capabilities.
          </p>
          <a
            href="/admin/dashboard"
            className="inline-block bg-[#00bcd4] text-white px-6 py-2 rounded-lg hover:bg-[#01427a] transition-colors duration-300"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <TutorApplicationForm />
    </div>
  );
};

export default TutorApplication;
