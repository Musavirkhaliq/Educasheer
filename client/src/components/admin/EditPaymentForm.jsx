import React, { useState } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

const EditPaymentForm = ({ payment, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState(payment.amount);
  const [paymentMethod, setPaymentMethod] = useState(payment.paymentMethod);
  const [paymentDate, setPaymentDate] = useState(
    new Date(payment.paymentDate).toISOString().split("T")[0]
  );
  const [transactionId, setTransactionId] = useState(payment.transactionId || "");
  const [notes, setNotes] = useState(payment.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount) {
      setError("Amount is required");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `/api/v1/fees/payment/${payment._id}`,
        {
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

      setSuccess("Payment updated successfully");
      
      // Call the parent component's onSuccess function
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
      // Don't close the form immediately to allow user to see success message
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 2000);
      
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this payment? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.delete(
        `/api/v1/fees/payment/${payment._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      setSuccess("Payment deleted successfully");
      
      // Call the parent component's onSuccess function
      if (onSuccess) {
        onSuccess(response.data.data, true); // Pass true to indicate deletion
      }
      
      // Close the form after a short delay
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 2000);
      
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete payment. Please try again."
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
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-center">
          <FaCheckCircle className="mr-2 text-green-600 text-xl" />
          <span className="font-medium">{success}</span>
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
          required
          disabled={loading || success}
        />
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
          disabled={loading || success}
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
          disabled={loading || success}
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
          disabled={loading || success}
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
          disabled={loading || success}
        ></textarea>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading || success}
        >
          Delete Payment
        </button>
        
        <div className="flex space-x-2">
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
            disabled={loading || success}
          >
            {loading ? "Updating..." : "Update Payment"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditPaymentForm;
