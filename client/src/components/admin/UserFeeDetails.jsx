import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaFileInvoice, FaChevronDown, FaChevronUp } from "react-icons/fa";
import RecordPaymentForm from "./RecordPaymentForm";

const UserFeeDetails = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [fees, setFees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFee, setExpandedFee] = useState(null);
  const [feePayments, setFeePayments] = useState({});
  const [coursesWithoutFees, setCoursesWithoutFees] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [success, setSuccess] = useState("");

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

  // Fetch user invoices
  useEffect(() => {
    const fetchUserInvoices = async () => {
      try {
        const response = await axios.get(`/api/v1/fees/invoices?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        setInvoices(response.data.data);
      } catch (error) {
        console.error("Failed to fetch user invoices:", error);
      }
    };

    fetchUserInvoices();
  }, [userId]);

  // Fetch user's enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!userId) return;

      try {
        // We need to impersonate the user to get their enrolled courses
        // This is a workaround since we don't have a direct admin API to get a user's enrolled courses
        const token = localStorage.getItem("accessToken");

        // First, get all courses
        const allCoursesResponse = await axios.get('/api/v1/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allCourses = allCoursesResponse.data.data.courses || [];

        // Then filter courses where the user is in enrolledStudents
        const userEnrolledCourses = allCourses.filter(course =>
          course.enrolledStudents && course.enrolledStudents.includes(userId)
        );

        if (userEnrolledCourses.length === 0) {
          // If we couldn't find any enrolled courses, try another approach
          // Get all courses and check if the user is enrolled
          const coursesResponse = await axios.get('/api/v1/courses', {
            headers: { Authorization: `Bearer ${token}` }
          });

          const courses = coursesResponse.data.data.courses || [];

          // For each course, check if the user is enrolled
          const enrolledCoursesPromises = courses.map(async (course) => {
            try {
              const courseDetailResponse = await axios.get(`/api/v1/courses/${course._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              const courseDetail = courseDetailResponse.data.data;

              // Check if the user is in enrolledStudents
              if (courseDetail.enrolledStudents &&
                  courseDetail.enrolledStudents.includes(userId)) {
                return courseDetail;
              }
              return null;
            } catch (error) {
              console.error(`Error fetching course ${course._id}:`, error);
              return null;
            }
          });

          const resolvedCourses = await Promise.all(enrolledCoursesPromises);
          const filteredCourses = resolvedCourses.filter(course => course !== null);

          setEnrolledCourses(filteredCourses);
        } else {
          setEnrolledCourses(userEnrolledCourses);
        }
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
      }
    };

    fetchEnrolledCourses();
  }, [userId]);

  // Fetch payments for a specific fee
  const fetchFeePayments = async (feeId) => {
    try {
      const response = await axios.get(`/api/v1/fees/${feeId}/payments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      setFeePayments(prev => ({
        ...prev,
        [feeId]: response.data.data
      }));

      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch payments for fee ${feeId}:`, error);
      return [];
    }
  };

  // Toggle expanded fee and fetch payments if needed
  const toggleFeeExpansion = async (feeId) => {
    if (expandedFee === feeId) {
      setExpandedFee(null);
    } else {
      setExpandedFee(feeId);

      // Fetch payments if not already loaded
      if (!feePayments[feeId]) {
        await fetchFeePayments(feeId);
      }
    }
  };

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

  // Handle payment recording success
  const handlePaymentRecorded = (updatedFee) => {
    // Update the fee in the fees list
    setFees(fees.map(fee => fee._id === updatedFee._id ? updatedFee : fee));

    // Close the payment form
    setShowPaymentForm(false);
    setSelectedFee(null);

    // Refresh the payments for this fee
    if (expandedFee === updatedFee._id) {
      fetchFeePayments(updatedFee._id);
    }

    // Show success message
    setSuccess("Payment recorded successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

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
      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

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

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-blue-800 mb-2">Total Fees</h4>
          <p className="text-2xl font-bold text-blue-900">${totalFees.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-green-800 mb-2">Paid</h4>
          <p className="text-2xl font-bold text-green-900">${paidFees.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-red-800 mb-2">Pending</h4>
          <p className="text-2xl font-bold text-red-900">${pendingFees.toFixed(2)}</p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
        {enrolledCourses.length === 0 ? (
          <p className="text-gray-500">This user is not enrolled in any courses.</p>
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrolledCourses.map((course) => {
                    // Find if there's a fee for this course
                    const courseFee = fees.find(fee => fee.course._id === course._id);

                    return (
                      <tr key={course._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                                {course.category && `Category: ${course.category}`}
                              </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!courseFee && (
                            <button
                              onClick={() => window.location.href = `/admin/dashboard?tab=fees&addFee=true&userId=${userId}&courseId=${course._id}`}
                              className="text-[#00bcd4] hover:text-[#01427a]"
                            >
                              Assign Fee
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

      {/* Fees List */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Fee History</h3>
        {fees.length === 0 ? (
          <p className="text-gray-500">No fees found for this user.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fees.map((fee) => (
                  <React.Fragment key={fee._id}>
                    <tr
                      className={`${expandedFee === fee._id ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}
                      onClick={() => toggleFeeExpansion(fee._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedFee === fee._id ? (
                            <FaChevronUp className="text-gray-500 mr-2" />
                          ) : (
                            <FaChevronDown className="text-gray-500 mr-2" />
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {fee.course.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${fee.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            fee.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : fee.status === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(fee.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row expansion
                              setSelectedFee(fee);
                              setShowPaymentForm(true);
                            }}
                            className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                            title="Record Payment"
                          >
                            <FaMoneyBillWave className="mr-1" />
                            <span>Record Payment</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Payment details row */}
                    {expandedFee === fee._id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50 border-b">
                          <div className="text-sm">
                            <h4 className="font-medium text-gray-700 mb-2">Payment History</h4>

                            {!feePayments[fee._id] ? (
                              <p className="text-gray-500 italic">Loading payment history...</p>
                            ) : feePayments[fee._id].length === 0 ? (
                              <p className="text-gray-500 italic">No payments recorded yet.</p>
                            ) : (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {feePayments[fee._id].map((payment) => (
                                  <div key={payment._id} className="bg-white p-2 rounded border border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        <FaMoneyBillWave className="text-green-600 mr-2" />
                                        <div>
                                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                                          <p className="text-xs text-gray-500">
                                            {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod.replace('_', ' ')}
                                          </p>
                                        </div>
                                      </div>
                                      {payment.transactionId && (
                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                          ID: {payment.transactionId}
                                        </span>
                                      )}
                                    </div>
                                    {payment.notes && (
                                      <p className="text-xs text-gray-600 mt-1 italic">{payment.notes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Invoices</h3>
        {invoices.length === 0 ? (
          <p className="text-gray-500">No invoices found for this user.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.fee.course?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${invoice.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${invoice.balance.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "issued"
                            ? "bg-blue-100 text-blue-800"
                            : invoice.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : invoice.status === "cancelled"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/invoice/${invoice._id}`}
                        className="text-[#00bcd4] hover:text-[#01427a]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
            <RecordPaymentForm
              fee={selectedFee}
              onSuccess={handlePaymentRecorded}
              onCancel={() => {
                setShowPaymentForm(false);
                setSelectedFee(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFeeDetails;
