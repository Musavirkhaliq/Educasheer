import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PaymentGateway = ({ 
    orderId: initialOrderId, 
    amount, 
    onSuccess, 
    onError, 
    preferredGateway = import.meta.env.VITE_DEFAULT_PAYMENT_GATEWAY || 'razorpay',
    promoCode = null
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedGateway, setSelectedGateway] = useState(preferredGateway);
    const [paymentData, setPaymentData] = useState(null);
    const [orderId, setOrderId] = useState(initialOrderId);

    // Load payment gateway scripts
    useEffect(() => {
        if (selectedGateway === 'razorpay') {
            loadRazorpayScript();
        } else if (selectedGateway === 'stripe') {
            loadStripeScript();
        }
    }, [selectedGateway]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const loadStripeScript = () => {
        return new Promise((resolve) => {
            if (window.Stripe) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const initiatePayment = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            
            // Create order with selected payment gateway
            const response = await axios.post('/api/v1/payments/create-order', {
                paymentGateway: selectedGateway,
                promoCode
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const { paymentData: data, paymentGateway, demoMode, orderId: newOrderId } = response.data.data;
                
                // Set the orderId if it wasn't provided initially
                if (!orderId && newOrderId) {
                    setOrderId(newOrderId);
                }
                
                setPaymentData(data);

                if (demoMode) {
                    await handleDemoPayment(data, newOrderId || orderId);
                } else if (paymentGateway === 'razorpay') {
                    await handleRazorpayPayment(data, newOrderId || orderId);
                } else if (paymentGateway === 'stripe') {
                    await handleStripePayment(data, newOrderId || orderId);
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async (data, currentOrderId) => {
        const scriptLoaded = await loadRazorpayScript();
        
        if (!scriptLoaded) {
            setError('Failed to load Razorpay. Please try again.');
            setLoading(false);
            return;
        }

        const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: 'Educasheer',
            description: 'Course Purchase',
            order_id: data.id,
            handler: async (response) => {
                try {
                    const token = localStorage.getItem('accessToken');
                    
                    console.log('Razorpay payment response:', response);
                    console.log('Using orderId for verification:', currentOrderId);
                    
                    const verifyResponse = await axios.post('/api/v1/payments/verify/razorpay', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: currentOrderId
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    console.log('Verification response:', verifyResponse.data);

                    if (verifyResponse.data.success) {
                        onSuccess(verifyResponse.data.data);
                    } else {
                        setError('Payment verification failed: ' + (verifyResponse.data.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    setError('Payment verification failed: ' + (error.response?.data?.message || error.message));
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: 'Student',
                email: 'student@example.com',
                contact: '9999999999'
            },
            theme: {
                color: '#2563eb'
            },
            modal: {
                ondismiss: () => {
                    setLoading(false);
                    setError('Payment cancelled');
                }
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const handleStripePayment = async (data, currentOrderId) => {
        const scriptLoaded = await loadStripeScript();
        
        if (!scriptLoaded) {
            setError('Failed to load Stripe. Please try again.');
            setLoading(false);
            return;
        }

        const stripe = window.Stripe(data.publishableKey);
        
        const { error, paymentIntent } = await stripe.confirmPayment({
            clientSecret: data.clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success`,
            },
            redirect: 'if_required'
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (paymentIntent.status === 'succeeded') {
            try {
                const token = localStorage.getItem('accessToken');
                
                const verifyResponse = await axios.post('/api/v1/payments/verify/stripe', {
                    payment_intent_id: paymentIntent.id,
                    orderId: currentOrderId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (verifyResponse.data.success) {
                    onSuccess(verifyResponse.data.data);
                } else {
                    setError('Payment verification failed');
                }
            } catch (error) {
                setError('Payment verification failed');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDemoPayment = async (data, currentOrderId) => {
        // Simulate payment processing in demo mode
        setTimeout(async () => {
            try {
                const token = localStorage.getItem('accessToken');
                
                // Simulate successful payment
                const verifyResponse = await axios.post('/api/v1/payments/success', {
                    orderId: currentOrderId,
                    paymentId: `demo_${Date.now()}`,
                    paymentDetails: {
                        method: 'demo',
                        amount: data.amount,
                        currency: 'INR',
                        demo: true
                    }
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (verifyResponse.data.success) {
                    onSuccess({ orderId: currentOrderId });
                } else {
                    setError('Demo payment processing failed');
                }
            } catch (error) {
                setError('Demo payment processing failed');
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="space-y-4">
            {/* Demo Mode Warning */}
            {paymentData?.demo && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-1">
                        <AlertCircle size={16} />
                        <span className="font-medium">Demo Mode</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                        Payment gateways are not configured. This is a demo payment that will be processed automatically.
                    </p>
                </div>
            )}

            {/* Payment Gateway Selection */}
            <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Select Payment Method</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => setSelectedGateway('razorpay')}
                        className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                            selectedGateway === 'razorpay'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Razorpay</div>
                            <div className="text-sm text-gray-600">UPI, Cards, Net Banking</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedGateway('stripe')}
                        className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                            selectedGateway === 'stripe'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Stripe</div>
                            <div className="text-sm text-gray-600">International Cards</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-1">
                    <Shield size={16} />
                    <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-green-700">
                    Your payment information is encrypted and secure. We don't store your card details.
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle size={16} />
                        <span className="font-medium">Payment Error</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
            )}

            {/* Payment Button */}
            <button
                onClick={initiatePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </div>
                ) : (
                    paymentData?.demo ? `Demo Pay ₹${amount}` : `Pay ₹${amount}`
                )}
            </button>

            {/* Payment Gateway Info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
                <p>
                    {selectedGateway === 'razorpay' 
                        ? 'Powered by Razorpay - India\'s leading payment gateway'
                        : 'Powered by Stripe - Trusted by millions worldwide'
                    }
                </p>
                <p>By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
        </div>
    );
};

export default PaymentGateway;