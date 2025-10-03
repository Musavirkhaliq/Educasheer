// Payment Gateway Configuration
export const PAYMENT_CONFIG = {
    // Default gateway based on region
    defaultGateway: 'razorpay', // 'razorpay' for India, 'stripe' for international
    
    // Currency settings
    currency: 'INR',
    
    // Gateway specific settings
    razorpay: {
        name: 'Educasheer',
        description: 'Online Learning Platform',
        theme: {
            color: '#2563eb'
        },
        prefill: {
            name: '',
            email: '',
            contact: ''
        }
    },
    
    stripe: {
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#2563eb',
            }
        }
    },
    
    // Supported payment methods by gateway
    supportedMethods: {
        razorpay: ['card', 'netbanking', 'wallet', 'upi'],
        stripe: ['card', 'wallet']
    },
    
    // Gateway availability by country
    gatewayAvailability: {
        IN: ['razorpay', 'stripe'],
        US: ['stripe'],
        GB: ['stripe'],
        CA: ['stripe'],
        AU: ['stripe'],
        // Add more countries as needed
    }
};

// Get preferred gateway based on user location
export const getPreferredGateway = (countryCode = 'IN') => {
    const availableGateways = PAYMENT_CONFIG.gatewayAvailability[countryCode] || ['stripe'];
    return availableGateways[0] || PAYMENT_CONFIG.defaultGateway;
};

// Format amount for display
export const formatAmount = (amount, currency = PAYMENT_CONFIG.currency) => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
};

// Convert amount to smallest currency unit (paise for INR, cents for USD)
export const toSmallestUnit = (amount, currency = PAYMENT_CONFIG.currency) => {
    const multipliers = {
        'INR': 100, // paise
        'USD': 100, // cents
        'EUR': 100, // cents
        'GBP': 100, // pence
    };
    
    return Math.round(amount * (multipliers[currency] || 100));
};

// Convert from smallest currency unit to main unit
export const fromSmallestUnit = (amount, currency = PAYMENT_CONFIG.currency) => {
    const divisors = {
        'INR': 100,
        'USD': 100,
        'EUR': 100,
        'GBP': 100,
    };
    
    return amount / (divisors[currency] || 100);
};