import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FaPlus, FaMoneyBillWave, FaFileInvoice, FaSearch } from "react-icons/fa";
import AddFeeForm from "./AddFeeForm";
import RecordPaymentForm from "./RecordPaymentForm";
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
  const [showAddFeeForm, setShowAddFeeForm] = useState(addFeeParam === 'true');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam || "");

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
    setFees(fees.map(fee => fee._id === updatedFee._id ? updatedFee : fee));
    setShowPaymentForm(false);
    setSuccess("Payment recorded successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle invoice generation success
  const handleInvoiceGenerated = (newInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    setShowInvoiceForm(false);
    setSuccess("Invoice generated successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

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
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
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
                            Amount
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
                        {filteredFees.map((fee) => (
                          <tr key={fee._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{fee.course.title}</div>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedFee(fee);
                                    setShowPaymentForm(true);
                                  }}
                                  className="text-[#00bcd4] hover:text-[#01427a] flex items-center"
                                  title="Record Payment"
                                >
                                  <FaMoneyBillWave className="mr-1" />
                                  <span>Record Payment</span>
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
                              </div>
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
    </div>
  );
};

export default FeeManagement;
