import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaMoneyBillWave, FaPrint } from "react-icons/fa";

const InvoiceView = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`/api/v1/fees/invoice/${invoiceId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        setInvoice(response.data.data);
      } catch (error) {
        setError(
          error.response?.data?.message || 
          "Failed to fetch invoice details. Please try again."
        );
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <Link to="/admin/dashboard" className="text-[#00bcd4] hover:text-[#01427a] flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
              <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist or you don't have permission to view it.</p>
              <Link to="/admin/dashboard" className="text-[#00bcd4] hover:text-[#01427a] flex items-center justify-center">
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none">
          {/* Non-printable controls */}
          <div className="flex justify-between mb-8 print:hidden">
            <Link to="/admin/dashboard" className="text-[#00bcd4] hover:text-[#01427a] flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <button 
              onClick={handlePrint}
              className="bg-[#00bcd4] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#01427a] transition-colors"
            >
              <FaPrint className="mr-2" /> Print Invoice
            </button>
          </div>

          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-gray-600">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">Educasheer</h2>
              <p className="text-gray-600">123 Education Street</p>
              <p className="text-gray-600">Learning City, ED 12345</p>
              <p className="text-gray-600">support@educasheer.com</p>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-gray-600 font-medium mb-2">Bill To:</h3>
              <p className="font-bold">{invoice.user.fullName}</p>
              <p>{invoice.user.email}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-gray-600 font-medium">Issue Date: </span>
                <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600 font-medium">Due Date: </span>
                <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Status: </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "issued"
                    ? "bg-blue-100 text-blue-800"
                    : invoice.status === "overdue"
                    ? "bg-red-100 text-red-800"
                    : invoice.status === "cancelled"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      Course: {invoice.fee.course?.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.fee.description || "Course Fee"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    ${invoice.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Payment History</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {invoice.payments.map((payment) => (
                  <div key={payment._id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">
                          {payment.paymentMethod.replace('_', ' ')} 
                          {payment.transactionId && ` • ID: ${payment.transactionId}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-700">
                      ${payment.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>${invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Amount Paid:</span>
              <span className="text-green-700">${invoice.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Balance Due:</span>
              <span className={invoice.balance <= 0 ? "text-green-700" : "text-red-700"}>
                ${invoice.balance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p>If you have any questions, please contact support@educasheer.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
