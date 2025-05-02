import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaFileInvoice, FaGraduationCap, FaBook, FaCalendarAlt } from "react-icons/fa";

const UserFeeDetails = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [fees, setFees] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coursesWithoutFees, setCoursesWithoutFees] = useState([]);

  // Fetch user details from admin endpoint
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // First try to get the user from the admin users list
        const response = await axios.get(`/api/v1/admin/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });

        // Find the user with the matching ID
        const foundUser = response.data.data.find(user => user._id === userId);

        if (foundUser) {
          setUser(foundUser);
        } else {
          setError("User not found");
        }
      } catch (error) {
        setError("Failed to fetch user details");
        console.error(error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Fetch user fees
  useEffect(() => {
    const fetchUserFees = async () => {
      try {
        const response = await axios.get(`/api/v1/fees/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        setFees(response.data.data);
      } catch (error) {
        setError("Failed to fetch user fees");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFees();
  }, [userId]);

  // Fetch user's enrolled courses - improved version
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!userId) return;

      try {
        const token = localStorage.getItem("accessToken");

        // Get all courses
        const allCoursesResponse = await axios.get('/api/v1/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allCourses = allCoursesResponse.data.data.courses || [];

        // Get user details to check enrollments
        const userResponse = await axios.get(`/api/v1/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);

        // If we have user details with enrollments, use that
        if (userResponse && userResponse.data && userResponse.data.data &&
            userResponse.data.data.enrolledCourses) {
          const enrolledCourseIds = userResponse.data.data.enrolledCourses;
          const userCourses = allCourses.filter(course =>
            enrolledCourseIds.includes(course._id)
          );
          setEnrolledCourses(userCourses);
          return;
        }

        // Otherwise, filter courses where the user is in enrolledStudents
        const userEnrolledCourses = allCourses.filter(course =>
          course.enrolledStudents && course.enrolledStudents.includes(userId)
        );

        if (userEnrolledCourses.length > 0) {
          setEnrolledCourses(userEnrolledCourses);
          return;
        }

        // If still no courses found, check each course individually
        const coursesWithDetailPromises = allCourses.map(async (course) => {
          try {
            const courseDetailResponse = await axios.get(`/api/v1/courses/${course._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const courseDetail = courseDetailResponse.data.data;

            if (courseDetail.enrolledStudents &&
                courseDetail.enrolledStudents.includes(userId)) {
              return courseDetail;
            }
            return null;
          } catch (error) {
            return null;
          }
        });

        const resolvedCourses = await Promise.all(coursesWithDetailPromises);
        const filteredCourses = resolvedCourses.filter(course => course !== null);

        setEnrolledCourses(filteredCourses);
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
      }
    };

    fetchEnrolledCourses();
  }, [userId]);

  // Identify courses without fees
  useEffect(() => {
    if (enrolledCourses.length > 0 && fees.length > 0) {
      // Get course IDs that already have fees
      const courseIdsWithFees = fees.map(fee => fee.course._id);

      // Filter enrolled courses that don't have fees
      const coursesWithNoFees = enrolledCourses.filter(
        course => !courseIdsWithFees.includes(course._id)
      );

      setCoursesWithoutFees(coursesWithNoFees);
    }
  }, [enrolledCourses, fees]);

  // Calculate total fees and payments
  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const pendingFees = fees.filter(fee => fee.status !== "paid").reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = totalFees - pendingFees;

  if (loading) {
    return <div className="text-center py-4">Loading user details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* User Info */}
      {user && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h3 className="text-xl font-semibold">{user.fullName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <FaGraduationCap className="text-blue-800 mr-2 text-xl" />
            <h4 className="text-lg font-medium text-blue-800">Enrolled Courses</h4>
          </div>
          <p className="text-2xl font-bold text-blue-900">{enrolledCourses.length}</p>
          <p className="text-xs text-blue-700 mt-1">Total courses this student is enrolled in</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <FaMoneyBillWave className="text-green-800 mr-2 text-xl" />
            <h4 className="text-lg font-medium text-green-800">Total Fees</h4>
          </div>
          <p className="text-2xl font-bold text-green-900">${totalFees.toFixed(2)}</p>
          <p className="text-xs text-green-700 mt-1">
            Paid: ${(totalFees - pendingFees).toFixed(2)} | Pending: ${pendingFees.toFixed(2)}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <FaCalendarAlt className="text-purple-800 mr-2 text-xl" />
            <h4 className="text-lg font-medium text-purple-800">Fee Status</h4>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              {fees.filter(fee => fee.status === "paid").length} Paid
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              {fees.filter(fee => fee.status === "partial").length} Partial
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
              {fees.filter(fee => fee.status === "pending").length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaBook className="text-gray-700 mr-2" />
          <h3 className="text-lg font-semibold">Enrolled Courses & Fee Status</h3>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500 mb-2">This user is not enrolled in any courses.</p>
            <p className="text-sm text-gray-400">Enroll the user in courses to manage fees.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrolledCourses.map((course) => {
                    // Find if there's a fee for this course
                    const courseFee = fees.find(fee => fee.course._id === course._id);

                    // Calculate balance if fee exists
                    const balance = courseFee ?
                      (courseFee.status === "paid" ? 0 :
                       courseFee.status === "partial" ? courseFee.amount * 0.5 : // Estimate
                       courseFee.amount) : 0;

                    return (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {course.thumbnail && (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-10 h-10 rounded object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{course.title}</div>
                              <div className="text-xs text-gray-500">
                                {course.category && `Category: ${course.category}`} • {course.level || "Mixed"} Level
                              </div>
                              {course.price > 0 && (
                                <div className="text-xs text-gray-500">
                                  Price: ${course.price.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {courseFee ? (
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                courseFee.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : courseFee.status === "partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {courseFee.status.charAt(0).toUpperCase() + courseFee.status.slice(1)} - ${courseFee.amount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              No Fee Assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {courseFee ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(courseFee.dueDate).toLocaleDateString()}
                              </div>
                              {new Date(courseFee.dueDate) < new Date() && courseFee.status !== "paid" && (
                                <div className="text-xs text-red-600 font-medium">Overdue</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {courseFee ? (
                            <div className={`text-sm font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${balance.toFixed(2)}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!courseFee ? (
                            <button
                              onClick={() => window.location.href = `/admin/dashboard?tab=fees&addFee=true&userId=${userId}&courseId=${course._id}`}
                              className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                            >
                              <FaMoneyBillWave className="mr-1" />
                              <span>Assign Fee</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => window.location.href = `/admin/dashboard?tab=fees&userId=${userId}`}
                              className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                            >
                              <FaMoneyBillWave className="mr-1" />
                              <span>Manage Fee</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Courses Without Fees */}
      {coursesWithoutFees.length > 0 && (
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-md font-medium text-yellow-800 mb-2 flex items-center">
            <FaMoneyBillWave className="mr-2" />
            Courses Without Fees
          </h4>
          <p className="text-sm text-yellow-700 mb-3">
            The following courses have no fees assigned. Consider adding fees for these courses.
          </p>
          <div className="flex flex-wrap gap-2">
            {coursesWithoutFees.map(course => (
              <div key={course._id} className="bg-white px-3 py-2 rounded-lg border border-yellow-200 flex items-center">
                <span className="text-sm font-medium mr-2">{course.title}</span>
                <button
                  onClick={() => window.location.href = `/admin/dashboard?tab=fees&addFee=true&userId=${userId}&courseId=${course._id}`}
                  className="text-xs bg-[#00bcd4] text-white px-2 py-1 rounded hover:bg-[#01427a]"
                >
                  Assign Fee
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFeeDetails;
