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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your purchase. Your order has been confirmed and you now have access to your content.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Order ID</p>
                                <p className="font-semibold text-gray-900">{orderId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Amount Paid</p>
                                <p className="font-semibold text-gray-900">
                                    {amount === 0 ? 'Free' : `₹${amount}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Items</p>
                                <p className="font-semibold text-gray-900">{items} item{items !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleContinueLearning}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            Start Learning
                            <ArrowRight size={20} />
                        </button>

                        <button
                            onClick={handleDownloadReceipt}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Download size={20} />
                            Download Receipt
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                        <ul className="text-sm text-blue-800 space-y-1 text-left">
                            <li>• Access your purchased content from your dashboard</li>
                            <li>• Track your learning progress</li>
                            <li>• Download certificates upon completion</li>
                            <li>• Get support from our community</li>
                        </ul>
                    </div>

                    <p className="text-xs text-gray-500 mt-6">
                        A confirmation email has been sent to your registered email address.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;