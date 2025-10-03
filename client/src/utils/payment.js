import axios from 'axios';

// Load external payment scripts
export const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Get user's country code (you can enhance this with a geolocation service)
export const getUserCountry = async () => {
    try {
        // You can use a service like ipapi.co or similar
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.country_code || 'IN';
    } catch (error) {
        console.error('Failed to get user country:', error);
        return 'IN'; // Default to India
    }
};

// Validate payment data
export const validatePaymentData = (gateway, data) => {
    if (gateway === 'razorpay') {
        return data.id && data.amount && data.currency && data.key;
    } else if (gateway === 'stripe') {
        return data.clientSecret && data.publishableKey;
    }
    return false;
};

// Format error messages for better UX
export const formatPaymentError = (error, gateway) => {
    const commonErrors = {
        'network_error': 'Network error. Please check your connection and try again.',
        'card_declined': 'Your card was declined. Please try a different payment method.',
        'insufficient_funds': 'Insufficient funds. Please try a different payment method.',
        'expired_card': 'Your card has expired. Please use a different card.',
        'incorrect_cvc': 'Your card\'s security code is incorrect.',
        'processing_error': 'There was an error processing your payment. Please try again.',
        'authentication_required': 'Additional authentication is required for this payment.',
    };

    // Gateway specific error handling
    if (gateway === 'razorpay') {
        const razorpayErrors = {
            'BAD_REQUEST_ERROR': 'Invalid payment request. Please try again.',
            'GATEWAY_ERROR': 'Payment gateway error. Please try again.',
            'NETWORK_ERROR': commonErrors.network_error,
            'SERVER_ERROR': 'Server error. Please try again later.',
        };
        
        return razorpayErrors[error.code] || error.description || 'Payment failed. Please try again.';
    } else if (gateway === 'stripe') {
        const stripeErrors = {
            'card_error': commonErrors.card_declined,
            'validation_error': 'Please check your payment details and try again.',
            'api_error': 'Payment service error. Please try again.',
            'authentication_error': 'Authentication failed. Please try again.',
            'rate_limit_error': 'Too many requests. Please wait and try again.',
        };
        
        return stripeErrors[error.type] || error.message || 'Payment failed. Please try again.';
    }

    return error.message || 'Payment failed. Please try again.';
};

// Track payment events (for analytics)
export const trackPaymentEvent = (event, data = {}) => {
    // You can integrate with analytics services like Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', event, {
            event_category: 'Payment',
            ...data
        });
    }
    
    console.log('Payment Event:', event, data);
};

// Retry payment with exponential backoff
export const retryPayment = async (paymentFunction, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await paymentFunction();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Check payment status
export const checkPaymentStatus = async (orderId) => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`/api/v1/payments/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data;
    } catch (error) {
        console.error('Failed to check payment status:', error);
        throw error;
    }
};

// Generate receipt data
export const generateReceiptData = (order) => {
    return {
        orderId: order.orderId,
        date: new Date(order.createdAt).toLocaleDateString(),
        items: order.items.map(item => ({
            name: item.title,
            type: item.itemType,
            price: item.price
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId
    };
};