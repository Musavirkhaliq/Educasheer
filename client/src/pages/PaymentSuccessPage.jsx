import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const PaymentSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const { orderId, amount, items } = location.state || {};

    useEffect(() => {
        // Fetch order details and refresh cart
        let isMounted = true;
        
        const fetchOrderAndCart = async () => {
            if (!orderId || !isMounted) return;
            
            try {
                const token = localStorage.getItem('accessToken');
                
                // Fetch order details to get purchased items
                const orderResponse = await axios.get(`/api/v1/payments/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (orderResponse.data.success && isMounted) {
                    setOrderDetails(orderResponse.data.data);
                }
                
                // Refresh cart to reflect the purchase
                if (isMounted) {
                    await fetchCart();
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchOrderAndCart();
        
        // Cleanup function to prevent state updates on unmounted component
        return () => {
            isMounted = false;
        };
    }, [orderId]); // Only depend on orderId

    useEffect(() => {
        // Redirect to home if no order data
        if (!orderId) {
            navigate('/');
        }
    }, [orderId, navigate]);

    const handleContinueLearning = () => {
        if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
            navigate('/profile');
            return;
        }

        const purchasedItems = orderDetails.items;
        
        // If only one item, navigate directly to it
        if (purchasedItems.length === 1) {
            const item = purchasedItems[0];
            navigateToItem(item);
        } else {
            // Multiple items - show options or navigate to first course/testSeries
            const firstCourse = purchasedItems.find(item => item.itemType === 'course');
            const firstTestSeries = purchasedItems.find(item => item.itemType === 'testSeries');
            const firstProgram = purchasedItems.find(item => item.itemType === 'program');
            
            // Priority: course > testSeries > program > profile
            if (firstCourse) {
                navigateToItem(firstCourse);
            } else if (firstTestSeries) {
                navigateToItem(firstTestSeries);
            } else if (firstProgram) {
                navigateToItem(firstProgram);
            } else {
                navigate('/profile');
            }
        }
    };

    const navigateToItem = (item) => {
        switch (item.itemType) {
            case 'course':
                navigate(`/courses/${item.itemId}`);
                break;
            case 'testSeries':
                navigate(`/test-series/${item.itemId}`);
                break;
            case 'program':
                navigate(`/programs/${item.itemId}`);
                break;
            default:
                navigate('/profile');
        }
    };

    const getStartButtonText = () => {
        if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
            return 'Go to Profile';
        }

        const purchasedItems = orderDetails.items;
        
        if (purchasedItems.length === 1) {
            const item = purchasedItems[0];
            switch (item.itemType) {
                case 'course':
                    return 'Start Course';
                case 'testSeries':
                    return 'Start Test Series';
                case 'program':
                    return 'Start Program';
                default:
                    return 'Start Learning';
            }
        } else {
            // Multiple items
            const hasCourse = purchasedItems.some(item => item.itemType === 'course');
            const hasTestSeries = purchasedItems.some(item => item.itemType === 'testSeries');
            const hasProgram = purchasedItems.some(item => item.itemType === 'program');
            
            if (hasCourse && hasTestSeries) {
                return 'Start Learning';
            } else if (hasCourse) {
                return 'Start Courses';
            } else if (hasTestSeries) {
                return 'Start Test Series';
            } else if (hasProgram) {
                return 'Start Programs';
            } else {
                return 'Start Learning';
            }
        }
    };

    const handleDownloadReceipt = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/v1/payments/orders/${orderId}/receipt`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-${orderId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download receipt. Please try again.');
            }
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Failed to download receipt. Please try again.');
        }
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

                    {/* Purchased Items */}
                    {orderDetails && orderDetails.items && orderDetails.items.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Your Purchased Items</h3>
                            <div className="space-y-3">
                                {orderDetails.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <img
                                            src={item.thumbnail || '/api/placeholder/48/36'}
                                            alt={item.title}
                                            className="w-12 h-9 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {item.itemType === 'course' ? 'Course' : 
                                                 item.itemType === 'testSeries' ? 'Test Series' : 
                                                 item.itemType === 'program' ? 'Program' : 'Item'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => navigateToItem(item)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Access →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 sm:space-y-4">
                        <button
                            onClick={handleContinueLearning}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    {getStartButtonText()}
                                    <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDownloadReceipt}
                            className="w-full bg-gray-100 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                        >
                            <Download size={16} className="sm:w-5 sm:h-5" />
                            Download Receipt
                        </button>

                        {orderDetails && orderDetails.items && orderDetails.items.length > 1 && (
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-green-50 border border-green-200 text-green-700 py-2 sm:py-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                            >
                                View All My Content
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/orders')}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                        >
                            View All Orders
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