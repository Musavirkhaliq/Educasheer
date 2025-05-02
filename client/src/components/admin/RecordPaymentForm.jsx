import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMoneyBillWave, FaCheckCircle, FaFileInvoice } from "react-icons/fa";

const RecordPaymentForm = ({ fee, onSuccess, onCancel, onGenerateInvoice }) => {
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
  const [generateInvoiceAfterPayment, setGenerateInvoiceAfterPayment] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

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

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const response = await axios.post(
        "/api/v1/fees/invoice",
        {
          feeId: fee._id,
          notes: notes || `Invoice generated after payment on ${new Date().toLocaleDateString()}`
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      // Call the parent component's onGenerateInvoice function if provided
      if (onGenerateInvoice) {
        onGenerateInvoice(response.data.data);
      }

      // Update success message
      setSuccess(prev => prev + " Invoice generated successfully!");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Payment recorded but failed to generate invoice. You can generate it manually later."
      );
    } finally {
      setGeneratingInvoice(false);
    }
  };

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
      const newRemainingAmount = remainingAmount - parseFloat(amount);
      setRemainingAmount(newRemainingAmount);

      // Show success message
      setError("");
      const amountValue = parseFloat(amount);
      const newStatus = response.data.data.feeStatus;

      let statusMessage = "";
      if (newStatus === "paid") {
        statusMessage = "PAID (fully paid)";
      } else if (newStatus === "partial") {
        statusMessage = "PARTIAL (partially paid)";
      } else {
        statusMessage = newStatus.toUpperCase();
      }

      setSuccess(`Payment of $${amountValue.toFixed(2)} recorded successfully! The fee status is now ${statusMessage}.`);

      // Call onSuccess immediately with the updated fee
      // This will update the fee list in the parent component
      onSuccess(updatedFee);

      // If user opted to generate invoice automatically, do it now
      if (generateInvoiceAfterPayment) {
        handleGenerateInvoice();
      }

      // Don't close the form yet, let the user see the success message and updated payment history
      // The form will be closed by the parent component
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
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-center">
          <FaCheckCircle className="mr-2 text-green-600 text-xl" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <div className="mb-4">
        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Total Fee</h4>
            <p className="text-xl font-bold text-blue-900">${fee.amount.toFixed(2)}</p>
            <p className="text-xs text-blue-700 mt-1">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg shadow-sm">
            <h4 className="text-sm font-medium text-green-800 mb-1">Amount Paid</h4>
            <p className="text-xl font-bold text-green-900">
              ${loadingPayments ? "Loading..." : (fee.amount - remainingAmount).toFixed(2)}
            </p>
            <p className="text-xs text-green-700 mt-1">{payments.length} payment(s) recorded</p>
          </div>

          <div className={`p-3 rounded-lg shadow-sm ${remainingAmount <= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <h4 className={`text-sm font-medium mb-1 ${remainingAmount <= 0 ? "text-green-800" : "text-red-800"}`}>
              {remainingAmount <= 0 ? "Fully Paid" : "Balance Due"}
            </h4>
            <p className={`text-xl font-bold ${remainingAmount <= 0 ? "text-green-900" : "text-red-900"}`}>
              ${loadingPayments ? "Loading..." : remainingAmount.toFixed(2)}
            </p>
            <div className="flex items-center mt-1">
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
              {new Date(fee.dueDate) < new Date() && fee.status !== "paid" && (
                <span className="ml-2 text-xs text-red-600 font-medium">Overdue</span>
              )}
            </div>
          </div>
        </div>

        {/* Course and Student Details */}
        <div className="bg-gray-100 p-3 rounded mb-4">
          <div className="flex items-start">
            {fee.course.thumbnail && (
              <img
                src={fee.course.thumbnail}
                alt={fee.course.title}
                className="w-12 h-12 rounded object-cover mr-3"
              />
            )}
            <div className="flex-1">
              <h3 className="text-md font-medium text-gray-800">{fee.course.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Student:</span> {fee.user.fullName}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Email:</span> {fee.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Fee Created:</span> {new Date(fee.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Description:</span> {fee.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Payment History</h3>
          <div className="bg-gray-50 p-2 rounded max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <tr key={payment._id || index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-600 mr-1" />
                        <span className="text-sm font-medium">${payment.amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {payment.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {payment.transactionId || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Notes section below the table */}
            {payments.some(payment => payment.notes) && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <h4 className="text-xs font-semibold mb-1">Payment Notes:</h4>
                {payments.filter(payment => payment.notes).map((payment, index) => (
                  <div key={`note-${payment._id || index}`} className="mb-1 pb-1 border-b border-gray-100 last:border-0">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</span>: {payment.notes}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
          disabled={loadingPayments || remainingAmount <= 0 || success}
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
          disabled={success}
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
          disabled={success}
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
          disabled={success}
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
          disabled={success}
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-[#00bcd4]"
            checked={generateInvoiceAfterPayment}
            onChange={(e) => setGenerateInvoiceAfterPayment(e.target.checked)}
            disabled={success || loading}
          />
          <span className="ml-2 text-gray-700">Generate invoice automatically after payment</span>
        </label>
      </div>

      <div className="flex justify-between">
        {success ? (
          <div className="flex justify-center w-full space-x-4">
            {!generateInvoiceAfterPayment && !generatingInvoice && !success.includes("Invoice generated") ? (
              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="bg-[#00bcd4] hover:bg-[#01427a] text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
                disabled={generatingInvoice}
              >
                {generatingInvoice ? (
                  "Generating..."
                ) : (
                  <>
                    <FaFileInvoice className="mr-2" />
                    Generate Invoice
                  </>
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onCancel}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Done
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
                disabled={loading || loadingPayments || remainingAmount <= 0}
              >
                {loading ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default RecordPaymentForm;
