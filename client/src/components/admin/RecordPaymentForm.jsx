import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";

const RecordPaymentForm = ({ fee, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [remainingAmount, setRemainingAmount] = useState(fee.amount);

  // Fetch existing payments for this fee
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`/api/v1/fees/${fee._id}/payments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        setPayments(response.data.data);

        // Calculate remaining amount
        const totalPaid = response.data.data.reduce((sum, payment) => sum + payment.amount, 0);
        setRemainingAmount(fee.amount - totalPaid);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [fee._id, fee.amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount) {
      setError("Amount is required");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (parseFloat(amount) > remainingAmount) {
      setError(`Amount cannot exceed the remaining balance of $${remainingAmount.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/fees/payment",
        {
          feeId: fee._id,
          amount: parseFloat(amount),
          paymentMethod,
          paymentDate,
          transactionId,
          notes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      // Update the fee with the new status
      const updatedFee = {
        ...fee,
        status: response.data.data.feeStatus
      };

      // Reset form fields
      setAmount("");
      setPaymentMethod("cash");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setTransactionId("");
      setNotes("");

      // Add the new payment to the list
      setPayments([response.data.data.payment, ...payments]);

      // Update remaining amount
      setRemainingAmount(remainingAmount - parseFloat(amount));

      // Show success message
      setError("");
      setSuccess(`Payment of $${parseFloat(amount).toFixed(2)} recorded successfully!`);

      // Call onSuccess with the updated fee and automatically close the form after a short delay
      setTimeout(() => {
        onSuccess(updatedFee);
      }, 1500); // Delay to allow user to see the success message and updated payment
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to record payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <FaCheckCircle className="mr-2" />
          {success}
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
            <span className="font-medium">Remaining Balance:</span>
            <span className="font-bold text-blue-700">
              ${loadingPayments ? "Loading..." : remainingAmount.toFixed(2)}
            </span>
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
          <h3 className="text-sm font-bold text-gray-700 mb-2">Payment History</h3>
          <div className="bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
            {payments.map((payment, index) => (
              <div key={payment._id || index} className="border-b border-gray-200 py-2 last:border-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaMoneyBillWave className="text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium">${payment.amount.toFixed(2)}</p>
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
          Payment Amount ($)
        </label>
        <input
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          max={remainingAmount}
          required
          disabled={loadingPayments || remainingAmount <= 0}
        />
        {remainingAmount <= 0 && (
          <p className="text-green-600 text-xs mt-1">This fee has been fully paid.</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Payment Method
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
        >
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          <option value="online">Online Payment</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Payment Date
        </label>
        <input
          type="date"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Transaction ID (Optional)
        </label>
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Notes (Optional)
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="2"
        ></textarea>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading || success}
        >
          Done
        </button>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading || success}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#00bcd4] hover:bg-[#01427a] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading || loadingPayments || remainingAmount <= 0 || success}
          >
            {loading ? "Recording..." : success ? "Payment Recorded" : "Record Payment"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RecordPaymentForm;
