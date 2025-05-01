import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMoneyBillWave } from "react-icons/fa";

const InvoiceGenerator = ({ fee, onSuccess, onCancel }) => {
  const [notes, setNotes] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPayments, setFetchingPayments] = useState(true);
  const [error, setError] = useState("");

  // Fetch payments for this fee
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`/api/v1/fees/${fee._id}/payments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        setPayments(response.data.data);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setFetchingPayments(false);
      }
    };

    fetchPayments();
  }, [fee._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/fees/invoice",
        {
          feeId: fee._id,
          notes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      onSuccess(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to generate invoice. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate total paid amount
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = fee.amount - totalPaid;

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="bg-gray-100 p-3 rounded mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Student:</span>
            <span>{fee.user.fullName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Course:</span>
            <span>{fee.course.title}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Total Fee:</span>
            <span>${fee.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Amount Paid:</span>
            <span className="font-bold text-green-700">${fetchingPayments ? "Loading..." : totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Balance:</span>
            <span className="font-bold text-blue-700">${fetchingPayments ? "Loading..." : balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                fee.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : fee.status === "partial"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Payment History (Will be included in invoice)</h3>
          <div className="bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
            {payments.map((payment, index) => (
              <div key={payment._id || index} className="bg-white p-2 rounded border border-gray-200 mb-2 last:mb-0">
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
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Invoice Notes (Optional)
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="3"
          placeholder="Add any additional notes for this invoice..."
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#00bcd4] hover:bg-[#01427a] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading || fetchingPayments}
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </form>
  );
};

export default InvoiceGenerator;
