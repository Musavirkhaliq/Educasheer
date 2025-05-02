import React, { useState } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

const EditFeeForm = ({ fee, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState(fee.amount);
  const [dueDate, setDueDate] = useState(
    new Date(fee.dueDate).toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(fee.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set minimum due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDueDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount || !dueDate) {
      setError("Amount and Due Date are required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `/api/v1/fees/${fee._id}`,
        {
          amount: parseFloat(amount),
          dueDate,
          description
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      setSuccess("Fee updated successfully");
      
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
        "Failed to update fee. Please try again."
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
        <div className="bg-gray-100 p-3 rounded mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Student:</span>
            <span>{fee.user.fullName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Course:</span>
            <span>{fee.course.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current Status:</span>
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

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount ($)
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
          Due Date
        </label>
        <input
          type="date"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={minDueDate}
          required
          disabled={loading || success}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description (Optional)
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          disabled={loading || success}
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
          disabled={loading || success}
        >
          {loading ? "Updating..." : "Update Fee"}
        </button>
      </div>
    </form>
  );
};

export default EditFeeForm;
