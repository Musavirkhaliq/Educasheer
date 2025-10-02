import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { CreditCard, Shield, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const CheckoutPage = () => {
    const { items, totalAmount, clearCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const promoCode = location.state?.promoCode;
    const discount = location.state?.discount || 0;
    const finalAmount = totalAmount - discount;

    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
    }, [items, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            
            // Create order
            const orderResponse = await axios.post('/api/v1/payments/create-order', {
                promoCode
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (orderResponse.data.success) {
                const { orderId, totalAmount: orderAmount, needsPayment } = orderResponse.data.data;

                if (!needsPayment) {
                    // Free order - redirect to success page
                    navigate('/payment-success', { 
                        state: { 
                            orderId,
                            amount: 0,
                            items: items.length
                        }
                    });
                    return;
                }

                // For paid orders, you would integrate with payment gateway here
                // For now, we'll simulate a successful payment
                
                // Simulate payment processing
                setTimeout(async () => {
                    try {
                        // Process payment success
                        await axios.post('/api/v1/payments/success', {
                            orderId,
                            paymentId: `pay_${Date.now()}`,
                            paymentDetails: {
                                method: 'demo',
                                amount: orderAmount,
                                currency: 'INR'
                            }
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        // Redirect to success page
                        navigate('/payment-success', { 
                            state: { 
                                orderId,
                                amount: orderAmount,
                                items: items.length
                            }
                        });
                    } catch (error) {
                        setError('Payment processing failed. Please try again.');
                        setLoading(false);
                    }
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to process payment');
            setLoading(false);
        }
    };

    const getItemTypeLabel = (itemType) => {
        switch (itemType) {
            case 'course': return 'Course';
            case 'testSeries': return 'Test Series';
            case 'program': return 'Program';
            default: return 'Item';
        }
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-4">
                                    <img
                                        src={item.thumbnail || '/api/placeholder/60/45'}
                                        alt={item.title}
                                        className="w-15 h-11 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {getItemTypeLabel(item.itemType)}
                                        </span>
                                    </div>
                                    <span className="font-semibold">₹{item.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            
                            {discount > 0 && (
                                <>
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({promoCode})</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                </>
                            )}
                            
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                <span>Total</span>
                                <span>₹{finalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                        
                        {finalAmount === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Order</h3>
                                <p className="text-gray-600 mb-6">
                                    Your order total is ₹0. Click below to complete your order.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CreditCard className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Demo Payment</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        This is a demo payment system. In production, this would integrate with 
                                        payment gateways like Razorpay, Stripe, or PayPal.
                                    </p>
                                </div>
                                
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-800 mb-1">
                                        <Shield size={16} />
                                        <span className="font-medium">Secure Payment</span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        Your payment information is encrypted and secure.
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </div>
                            ) : (
                                `${finalAmount === 0 ? 'Complete Order' : `Pay ₹${finalAmount}`}`
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;