import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";
import FeeManagement from "../components/admin/FeeManagement";
import TestimonialManagement from "../components/admin/TestimonialManagement";
import CenterManagement from "../components/admin/CenterManagement";
import GamificationAdmin from "../components/admin/gamification/GamificationAdmin";

const AdminDashboard = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Verify admin status on component mount and when currentUser changes
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (isAuthenticated && currentUser) {
        console.log("AdminDashboard: Verifying admin status for user:", currentUser);

        if (currentUser.role !== "admin") {
          console.log("AdminDashboard: User is not admin, redirecting to home", currentUser);
          // Force logout to clear any stale data
          await logout();
          return;
        }

        // Double-check with the server
        try {
          const response = await axios.get("/api/v1/admin/users", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });

          // If we get here, the user is confirmed as admin
          console.log("AdminDashboard: Admin status confirmed by server");
          setIsAdmin(true);
        } catch (error) {
          console.error("AdminDashboard: Failed to verify admin status:", error);
          if (error.response?.status === 403) {
            console.log("AdminDashboard: Server rejected admin access, logging out");
            // User is not actually an admin according to the server
            await logout();
          }
        }
      }
    };

    verifyAdminStatus();
  }, [currentUser, isAuthenticated, logout]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("AdminDashboard: User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Redirect if user is not an admin
  if (currentUser?.role !== "admin") {
    console.log("AdminDashboard: User is not admin, redirecting to home", currentUser);
    return <Navigate to="/" />;
  }

  console.log("AdminDashboard: User is admin, showing admin dashboard", currentUser);

  // Fetch tutor applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (activeTab === "applications") {
        setLoading(true);
        try {
          const response = await axios.get("/api/v1/tutor-applications/all", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });
          setApplications(response.data.data);
        } catch (error) {
          setError("Failed to fetch tutor applications");
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchApplications();
  }, [activeTab]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab === "users") {
        setLoading(true);
        try {
          const response = await axios.get("/api/v1/admin/users", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });
          setUsers(response.data.data);
        } catch (error) {
          setError("Failed to fetch users");
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [activeTab]);

  // Handle application review
  const handleApplicationReview = async (applicationId, status, adminFeedback = "") => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.patch(
        `/api/v1/tutor-applications/review/${applicationId}`,
        { status, adminFeedback },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      // Update applications list
      setApplications(applications.map(app =>
        app._id === applicationId
          ? { ...app, status, adminFeedback }
          : app
      ));

      setSuccess(`Application ${status} successfully`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        `Failed to ${status} application`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle user role update
  const handleRoleUpdate = async (userId, role) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.patch(
        `/api/v1/admin/users/${userId}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      // Update users list
      setUsers(users.map(user =>
        user._id === userId
          ? { ...user, role }
          : user
      ));

      setSuccess(`User role updated to ${role} successfully`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update user role"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "applications"
              ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("applications")}
        >
          Tutor Applications
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "users"
              ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "centers"
              ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("centers")}
        >
          Manage Centers
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "fees"
              ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("fees")}
        >
          Fee Management
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "testimonials"
              ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("testimonials")}
        >
          Testimonials
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "gamification"
              ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("gamification")}
        >
          Gamification
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {/* Tutor Applications Tab */}
          {activeTab === "applications" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tutor Applications</h2>

              {applications.length === 0 ? (
                <p className="text-gray-600">No applications found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Applicant
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Qualifications
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Status
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((application) => (
                        <tr key={application._id}>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={application.user.avatar}
                                  alt={application.user.fullName}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {application.user.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {application.user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                              {application.qualifications}
                            </div>
                            <button
                              className="text-xs text-[#00bcd4] hover:underline mt-1"
                              onClick={() => {
                                alert(`
                                  Qualifications: ${application.qualifications}

                                  Experience: ${application.experience}

                                  Specialization: ${application.specialization}
                                `);
                              }}
                            >
                              View Details
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              application.status === "approved" ? "bg-green-100 text-green-800" :
                              application.status === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                            {application.status === "pending" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const feedback = prompt("Enter feedback for approval (optional):");
                                    handleApplicationReview(application._id, "approved", feedback || "");
                                  }}
                                  className="text-green-600 hover:text-green-900 bg-green-100 px-3 py-1 rounded"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const feedback = prompt("Enter feedback for rejection (recommended):");
                                    if (feedback) {
                                      handleApplicationReview(application._id, "rejected", feedback);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {application.status !== "pending" && (
                              <span className="text-gray-500">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Manage Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Users</h2>

              {users.length === 0 ? (
                <p className="text-gray-600">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          User
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Role
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Tutor Status
                        </th>
                        <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.avatar}
                                  alt={user.fullName}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin" ? "bg-purple-100 text-purple-800" :
                              user.role === "tutor" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {user.tutorStatus && user.tutorStatus !== "none" ? (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.tutorStatus === "approved" ? "bg-green-100 text-green-800" :
                                user.tutorStatus === "rejected" ? "bg-red-100 text-red-800" :
                                user.tutorStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {user.tutorStatus.charAt(0).toUpperCase() + user.tutorStatus.slice(1)}
                              </span>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                              value={user.role}
                              onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                              disabled={user._id === currentUser._id} // Can't change own role
                            >
                              <option value="learner">Learner</option>
                              <option value="tutor">Tutor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Fee Management Tab */}
          {activeTab === "fees" && (
            <FeeManagement />
          )}

          {/* Testimonial Management Tab */}
          {activeTab === "testimonials" && (
            <TestimonialManagement />
          )}

          {/* Center Management Tab */}
          {activeTab === "centers" && (
            <CenterManagement />
          )}

          {/* Gamification Management Tab */}
          {activeTab === "gamification" && (
            <GamificationAdmin />
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
