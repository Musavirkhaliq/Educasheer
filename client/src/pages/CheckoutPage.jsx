import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Shield, ArrowLeft } from 'lucide-react';
import PaymentGateway from '../components/PaymentGateway';
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

    const [currentOrderId, setCurrentOrderId] = useState(null);

    const handleFreeOrder = async () => {
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
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to process order');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (data) => {
        navigate('/payment-success', { 
            state: { 
                orderId: data.orderId,
                amount: finalAmount,
                items: items.length
            }
        });
    };

    const handlePaymentError = (error) => {
        setError(error);
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
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm sm:text-base"
                    >
                        <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                        Back to Cart
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
                        
                        <div className="space-y-3 sm:space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={`${item.itemType}-${item.itemId}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                    <img
                                        src={item.thumbnail || '/api/placeholder/60/45'}
                                        alt={item.title}
                                        className="w-full sm:w-15 h-32 sm:h-11 object-cover rounded"
                                    />
                                    <div className="flex-1 w-full">
                                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">{item.title}</h3>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {getItemTypeLabel(item.itemType)}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base self-start sm:self-center">₹{item.price}</span>
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
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">Payment Details</h2>
                        
                        {finalAmount === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Order</h3>
                                <p className="text-gray-600 mb-6">
                                    Your order total is ₹0. Click below to complete your order.
                                </p>
                                
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-800">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleFreeOrder}
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm sm:text-base">Processing...</span>
                                        </div>
                                    ) : (
                                        'Complete Order'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <PaymentGateway
                                orderId={currentOrderId}
                                amount={finalAmount}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                                preferredGateway="razorpay"
                                promoCode={promoCode}
                            />
                        )}

                        <p className="text-xs text-gray-500 text-center mt-4 px-2">
                            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;