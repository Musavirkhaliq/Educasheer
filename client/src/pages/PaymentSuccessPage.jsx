import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const PaymentSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchCart } = useCart();

    const { orderId, amount, items } = location.state || {};

    useEffect(() => {
        // Refresh cart to reflect the purchase
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        // Redirect to home if no order data
        if (!orderId) {
            navigate('/');
        }
    }, [orderId, navigate]);

    const handleContinueLearning = () => {
        navigate('/dashboard');
    };

    const handleDownloadReceipt = () => {
        // In a real app, this would generate and download a PDF receipt
        alert('Receipt download functionality would be implemented here');
    };

    if (!orderId) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-2">
                        Thank you for your purchase. Your order has been confirmed and you now have access to your content.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Order ID</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">{orderId}</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Amount Paid</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                    {amount === 0 ? 'Free' : `₹${amount}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Items</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">{items} item{items !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <button
                            onClick={handleContinueLearning}
                            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                        >
                            Start Learning
                            <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                        </button>

                        <button
                            onClick={handleDownloadReceipt}
                            className="w-full bg-gray-100 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                        >
                            <Download size={16} className="sm:w-5 sm:h-5" />
                            Download Receipt
                        </button>
                    </div>

                    <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">What's Next?</h3>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1 text-left">
                            <li>• Access your purchased content from your dashboard</li>
                            <li>• Track your learning progress</li>
                            <li>• Download certificates upon completion</li>
                            <li>• Get support from our community</li>
                        </ul>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 sm:mt-6 px-2">
                        A confirmation email has been sent to your registered email address.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;