import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FaPlus, FaMoneyBillWave, FaFileInvoice, FaSearch, FaEdit, FaPencilAlt } from "react-icons/fa";
import AddFeeForm from "./AddFeeForm";
import RecordPaymentForm from "./RecordPaymentForm";
import EditFeeForm from "./EditFeeForm";
import EditPaymentForm from "./EditPaymentForm";
import InvoiceGenerator from "./InvoiceGenerator";
import UserFeeDetails from "./UserFeeDetails";

const FeeManagement = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Get URL parameters
  const tabParam = queryParams.get('tab');
  const addFeeParam = queryParams.get('addFee');
  const userIdParam = queryParams.get('userId');
  const courseIdParam = queryParams.get('courseId');

  const [activeTab, setActiveTab] = useState(tabParam === 'fees' ? 'fees' : 'fees');
  const [fees, setFees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showAddFeeForm, setShowAddFeeForm] = useState(addFeeParam === 'true');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditFeeForm, setShowEditFeeForm] = useState(false);
  const [showEditPaymentForm, setShowEditPaymentForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam || "");
  const [payments, setPayments] = useState([]);

  // Fetch fees
  useEffect(() => {
    const fetchFees = async () => {
      if (activeTab === "fees" && selectedUser) {
        setLoading(true);
        try {
          let url = `/api/v1/fees/user/${selectedUser._id}`;
          const params = new URLSearchParams();

          if (filterStatus) {
            params.append("status", filterStatus);
          }

          if (params.toString()) {
            url += `?${params.toString()}`;
          }

          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });
          setFees(response.data.data);
        } catch (error) {
          setError("Failed to fetch fees");
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else if (activeTab === "fees" && !selectedUser) {
        // Clear fees when no user is selected
        setFees([]);
      }
    };

    fetchFees();
  }, [activeTab, filterStatus, selectedUser]);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (activeTab === "invoices" && selectedUser) {
        setLoading(true);
        try {
          let url = `/api/v1/fees/invoices?userId=${selectedUser._id}`;

          if (filterStatus) {
            url += `&status=${filterStatus}`;
          }

          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          });
          setInvoices(response.data.data);
        } catch (error) {
          setError("Failed to fetch invoices");
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else if (activeTab === "invoices" && !selectedUser) {
        // Clear invoices when no user is selected
        setInvoices([]);
      }
    };

    fetchInvoices();
  }, [activeTab, filterStatus, selectedUser]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/v1/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        setUsers(response.data.data);

        // If userId is provided in URL, select that user
        if (userIdParam) {
          const userFromParam = response.data.data.find(user => user._id === userIdParam);
          if (userFromParam) {
            setSelectedUser(userFromParam);
            setActiveTab("userDetails");
          }
        }
      } catch (error) {
        setError("Failed to fetch users");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userIdParam]);

  // Handle fee creation success
  const handleFeeCreated = (newFee) => {
    setFees([newFee, ...fees]);
    setShowAddFeeForm(false);
    setSuccess("Fee created successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle payment recording success
  const handlePaymentRecorded = (updatedFee) => {
    // Update the fee in the fees list
    setFees(fees.map(fee => fee._id === updatedFee._id ? updatedFee : fee));

    // Show success message
    setSuccess(`Payment recorded successfully for ${updatedFee.course.title}`);

    // Don't close the payment form immediately to allow for invoice generation
    // The form will be closed by the user or after invoice generation
  };

  // Handle invoice generation from payment form
  const handleInvoiceFromPayment = (newInvoice) => {
    // Add the new invoice to the invoices list
    setInvoices([newInvoice, ...invoices]);

    // Update success message
    setSuccess(prev => `${prev}. Invoice generated successfully.`);

    // Close the payment form after a short delay
    setTimeout(() => {
      setShowPaymentForm(false);
      setSelectedFee(null);
    }, 2000);

    // Clear success message after a longer delay
    setTimeout(() => setSuccess(""), 5000);
  };

  // Handle invoice generation success
  const handleInvoiceGenerated = (newInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    setShowInvoiceForm(false);
    setSuccess("Invoice generated successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle fee update success
  const handleFeeUpdated = (updatedFee) => {
    // Update the fee in the fees list
    setFees(fees.map(fee => fee._id === updatedFee._id ? updatedFee : fee));
    setShowEditFeeForm(false);
    setSuccess("Fee updated successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle payment update success
  const handlePaymentUpdated = (data, isDeleted = false) => {
    if (isDeleted) {
      // If payment was deleted, fetch updated payments
      fetchPaymentsForFee(selectedFee._id);

      // Update fee status if provided
      if (data.feeStatus && selectedFee) {
        const updatedFee = { ...selectedFee, status: data.feeStatus };
        setFees(fees.map(fee => fee._id === selectedFee._id ? updatedFee : fee));
        setSelectedFee(updatedFee);
      }

      setShowEditPaymentForm(false);
      setSuccess("Payment deleted successfully");
    } else {
      // If payment was updated
      const updatedPayment = data.payment;

      // Update the payment in the payments list
      setPayments(payments.map(payment =>
        payment._id === updatedPayment._id ? updatedPayment : payment
      ));

      // Update fee status if provided
      if (data.feeStatus && selectedFee) {
        const updatedFee = { ...selectedFee, status: data.feeStatus };
        setFees(fees.map(fee => fee._id === selectedFee._id ? updatedFee : fee));
        setSelectedFee(updatedFee);
      }

      setShowEditPaymentForm(false);
      setSuccess("Payment updated successfully");
    }

    setTimeout(() => setSuccess(""), 3000);
  };

  // Fetch payments for a fee
  const fetchPaymentsForFee = async (feeId) => {
    try {
      const response = await axios.get(`/api/v1/fees/${feeId}/payments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });
      setPayments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    }
  };

  // Calculate fee statistics
  const calculateFeeStats = () => {
    if (!fees.length) return { totalFees: 0, paidAmount: 0, pendingAmount: 0 };

    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);

    // Calculate paid amount by fetching all payments
    const paidAmount = fees.reduce((sum, fee) => {
      if (fee.status === "paid") return sum + fee.amount;
      if (fee.status === "partial") {
        // For partial payments, we need to estimate the paid amount
        // This will be updated with actual data when we view payments
        return sum + (fee.amount * 0.5); // Estimate 50% paid for partial status
      }
      return sum;
    }, 0);

    const pendingAmount = totalFees - paidAmount;

    return { totalFees, paidAmount, pendingAmount };
  };

  const { totalFees, paidAmount, pendingAmount } = calculateFeeStats();

  // Filter fees by search query
  const filteredFees = fees.filter(fee => {
    const userFullName = fee.user?.fullName?.toLowerCase() || "";
    const userEmail = fee.user?.email?.toLowerCase() || "";
    const courseTitle = fee.course?.title?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return userFullName.includes(query) ||
           userEmail.includes(query) ||
           courseTitle.includes(query);
  });

  // Filter invoices by search query
  const filteredInvoices = invoices.filter(invoice => {
    const userFullName = invoice.user?.fullName?.toLowerCase() || "";
    const userEmail = invoice.user?.email?.toLowerCase() || "";
    const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return userFullName.includes(query) ||
           userEmail.includes(query) ||
           invoiceNumber.includes(query);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Success and Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span className="font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* User Selection */}
      <div className={`mb-6 ${!selectedUser ? 'p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {!selectedUser ? "First, Select a User" : "Selected User"}
        </h3>

        {!selectedUser && (
          <p className="text-gray-600 mb-4">
            Search for a user to view their details, manage fees, record payments, and generate invoices.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {selectedUser ? (
            <div className="flex items-center bg-[#00bcd4]/10 text-[#00bcd4] px-4 py-3 rounded-lg">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.fullName}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-medium text-lg">{selectedUser.fullName}</div>
                <div className="text-sm">{selectedUser.email}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setActiveTab("fees");
                }}
                className="ml-4 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="border border-gray-300 rounded-lg px-4 py-3 pr-10 w-full text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <FaSearch className="absolute right-3 top-4 text-gray-400" />
              {searchQuery && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users
                    .filter(user =>
                      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(user => (
                      <div
                        key={user._id}
                        className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery("");
                          setActiveTab("userDetails");
                        }}
                      >
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs - Only show when a user is selected */}
      {selectedUser && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "userDetails"
                ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("userDetails")}
          >
            User Details
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "fees"
                ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("fees")}
          >
            Manage Fees
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "payments"
                ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              if (selectedFee) {
                setActiveTab("payments");
              } else {
                alert("Please select a fee first to view payments");
              }
            }}
          >
            Payments
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "invoices"
                ? "text-[#00bcd4] border-b-2 border-[#00bcd4]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("invoices")}
          >
            Invoices
          </button>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === "fees" && (
        <div>
          {!selectedUser ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-medium text-gray-600 mb-2">Please Select a User First</h3>
              <p className="text-gray-500">
                Search for a user above to manage their fees, record payments, and generate invoices.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Manage Fees for {selectedUser.fullName}</h2>
                <div className="flex gap-2">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                  <button
                    onClick={() => setShowAddFeeForm(true)}
                    className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-colors"
                  >
                    <FaPlus /> Add Fee
                  </button>
                </div>
              </div>

              {/* Fee Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Total Fees</h4>
                  <p className="text-2xl font-bold text-blue-900">${totalFees.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-green-800 mb-2">Paid Amount</h4>
                  <p className="text-2xl font-bold text-green-900">${paidAmount.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-red-800 mb-2">Pending Amount</h4>
                  <p className="text-2xl font-bold text-red-900">${pendingAmount.toFixed(2)}</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  {filteredFees.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">No fees found for this user.</p>
                      <button
                        onClick={() => setShowAddFeeForm(true)}
                        className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-colors mx-auto"
                      >
                        <FaPlus /> Add Fee
                      </button>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Fee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
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
                        {filteredFees.map((fee) => {
                          // Calculate balance for this fee
                          const feeBalance = fee.status === "paid" ? 0 :
                                           fee.status === "partial" ? fee.amount * 0.5 : // Estimate
                                           fee.amount;

                          return (
                            <tr key={fee._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {fee.course.thumbnail && (
                                    <img
                                      src={fee.course.thumbnail}
                                      alt={fee.course.title}
                                      className="w-10 h-10 rounded object-cover mr-3"
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{fee.course.title}</div>
                                    <div className="text-xs text-gray-500">
                                      Created: {new Date(fee.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">${fee.amount.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-medium ${feeBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ${feeBalance.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(fee.dueDate).toLocaleDateString()}
                                </div>
                                {new Date(fee.dueDate) < new Date() && fee.status !== "paid" && (
                                  <div className="text-xs text-red-600 font-medium">Overdue</div>
                                )}
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedFee(fee);
                                      setShowPaymentForm(true);
                                    }}
                                    className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                                    title="Record Payment"
                                    disabled={fee.status === "paid"}
                                  >
                                    <FaMoneyBillWave className="mr-1" />
                                    <span>Payment</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFee(fee);
                                      setShowInvoiceForm(true);
                                    }}
                                    className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                                    title="Generate Invoice"
                                  >
                                    <FaFileInvoice className="mr-1" />
                                    <span>Invoice</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFee(fee);
                                      setShowEditFeeForm(true);
                                    }}
                                    className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                                    title="Edit Fee"
                                  >
                                    <FaEdit className="mr-1" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedFee(fee);
                                      fetchPaymentsForFee(fee._id);
                                      setActiveTab("payments");
                                    }}
                                    className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                                    title="View Payments"
                                  >
                                    <span>Payments</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div>
          {!selectedUser ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-medium text-gray-600 mb-2">Please Select a User First</h3>
              <p className="text-gray-500">
                Search for a user above to view and manage their invoices.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Invoices for {selectedUser.fullName}</h2>
                <div>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="issued">Issued</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  {filteredInvoices.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">No invoices found for this user.</p>
                      <p className="text-gray-500">
                        Go to the "Manage Fees" tab to generate invoices for this user's fees.
                      </p>
                    </div>
                  ) : (
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
                            Paid
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
                        {filteredInvoices.map((invoice) => (
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
                                ${invoice.amountPaid.toFixed(2)}
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
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && selectedFee && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Payments for {selectedFee.course.title} - {selectedUser.fullName}
            </h2>
            <button
              onClick={() => {
                setShowPaymentForm(true);
              }}
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-colors"
              disabled={selectedFee.status === "paid"}
            >
              <FaPlus /> Record Payment
            </button>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-medium text-blue-800 mb-2">Total Fee</h4>
              <p className="text-2xl font-bold text-blue-900">${selectedFee.amount.toFixed(2)}</p>
              <p className="text-xs text-blue-700 mt-1">Due: {new Date(selectedFee.dueDate).toLocaleDateString()}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-medium text-green-800 mb-2">Amount Paid</h4>
              <p className="text-2xl font-bold text-green-900">
                ${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
              </p>
              <p className="text-xs text-green-700 mt-1">{payments.length} payment(s) recorded</p>
            </div>

            <div className={`p-4 rounded-lg shadow-sm ${selectedFee.status === "paid" ? "bg-green-50" : "bg-red-50"}`}>
              <h4 className={`text-lg font-medium mb-2 ${selectedFee.status === "paid" ? "text-green-800" : "text-red-800"}`}>
                {selectedFee.status === "paid" ? "Fully Paid" : "Balance Due"}
              </h4>
              <p className={`text-2xl font-bold ${selectedFee.status === "paid" ? "text-green-900" : "text-red-900"}`}>
                ${Math.max(0, selectedFee.amount - payments.reduce((sum, payment) => sum + payment.amount, 0)).toFixed(2)}
              </p>
              <div className="flex items-center mt-1">
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    selectedFee.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : selectedFee.status === "partial"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedFee.status.charAt(0).toUpperCase() + selectedFee.status.slice(1)}
                </span>
                {new Date(selectedFee.dueDate) < new Date() && selectedFee.status !== "paid" && (
                  <span className="ml-2 text-xs text-red-600 font-medium">Overdue</span>
                )}
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              {selectedFee.course.thumbnail && (
                <img
                  src={selectedFee.course.thumbnail}
                  alt={selectedFee.course.title}
                  className="w-16 h-16 rounded object-cover mr-4"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">{selectedFee.course.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fee Created:</span> {new Date(selectedFee.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Description:</span> {selectedFee.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Student:</span> {selectedFee.user.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {selectedFee.user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading payments...</div>
          ) : (
            <div className="overflow-x-auto">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Payment History</h3>
              {payments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">No payments recorded for this fee.</p>
                  {selectedFee.status !== "paid" && (
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-colors mx-auto"
                    >
                      <FaPlus /> Record Payment
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recorded By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(payment.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ${payment.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.transactionId || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.recordedBy?.fullName || "Admin"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowEditPaymentForm(true);
                              }}
                              className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                              title="Edit Payment"
                            >
                              <FaPencilAlt className="mr-1" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Payment Notes */}
                  {payments.some(payment => payment.notes) && (
                    <div className="p-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold mb-2">Payment Notes:</h4>
                      {payments.filter(payment => payment.notes).map((payment) => (
                        <div key={`note-${payment._id}`} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</span>: {payment.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Related Invoices */}
              {invoices.filter(invoice => invoice.fee._id === selectedFee._id).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Related Invoices</h3>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance
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
                        {invoices
                          .filter(invoice => invoice.fee._id === selectedFee._id)
                          .map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {invoice.invoiceNumber}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(invoice.issueDate).toLocaleDateString()}
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
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User Details Tab */}
      {activeTab === "userDetails" && selectedUser && (
        <UserFeeDetails userId={selectedUser._id} />
      )}

      {/* Add Fee Modal */}
      {showAddFeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedUser ? `Add New Fee for ${selectedUser.fullName}` : "Add New Fee"}
            </h2>
            <AddFeeForm
              users={users}
              selectedUser={selectedUser}
              selectedCourseId={selectedCourseId}
              onSuccess={handleFeeCreated}
              onCancel={() => {
                setShowAddFeeForm(false);
                // Clear URL parameters
                window.history.replaceState({}, document.title, "/admin/dashboard");
              }}
              disableUserSelection={!!selectedUser} // Disable user selection if a user is already selected
            />
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentForm && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
            <RecordPaymentForm
              fee={selectedFee}
              onSuccess={handlePaymentRecorded}
              onCancel={() => setShowPaymentForm(false)}
              onGenerateInvoice={handleInvoiceFromPayment}
            />
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showInvoiceForm && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Generate Invoice</h2>
            <InvoiceGenerator
              fee={selectedFee}
              onSuccess={handleInvoiceGenerated}
              onCancel={() => setShowInvoiceForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {showEditFeeForm && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Fee</h2>
            <EditFeeForm
              fee={selectedFee}
              onSuccess={handleFeeUpdated}
              onCancel={() => setShowEditFeeForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditPaymentForm && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Payment</h2>
            <EditPaymentForm
              payment={selectedPayment}
              onSuccess={handlePaymentUpdated}
              onCancel={() => setShowEditPaymentForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
