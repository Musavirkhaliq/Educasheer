# Payment Gateway Setup Guide

This guide will help you configure Razorpay and Stripe payment gateways for your Educasheer application.

## Overview

The application supports two payment gateways:
- **Razorpay**: Primary gateway for Indian users (supports UPI, Net Banking, Cards, Wallets)
- **Stripe**: International gateway for global users (supports Cards, Digital Wallets)

## 1. Razorpay Setup

### Step 1: Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account or log in to existing account
3. Complete KYC verification for live mode

### Step 2: Get API Keys
1. Navigate to Settings → API Keys
2. Generate API Keys for Test Mode (for development)
3. Generate API Keys for Live Mode (for production)
4. Copy the Key ID and Key Secret

### Step 3: Configure Environment Variables
Add these to your `backend/.env` file:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx  # Use rzp_live_ for production
RAZORPAY_KEY_SECRET=your_secret_key_here
```

### Step 4: Configure Webhooks (Optional but Recommended)
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/v1/payments/webhook/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret and add to environment variables:
```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## 2. Stripe Setup

### Step 1: Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a new account or log in
3. Complete account verification

### Step 2: Get API Keys
1. Navigate to Developers → API Keys
2. Copy the Publishable Key and Secret Key
3. For testing, use the test keys (starting with pk_test_ and sk_test_)
4. For production, use live keys (starting with pk_live_ and sk_live_)

### Step 3: Configure Environment Variables
Add these to your `backend/.env` file:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx  # Use sk_live_ for production
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx  # Use pk_live_ for production
```

### Step 4: Configure Webhooks
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/v1/payments/webhook/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

## 3. Testing the Integration

### Test Razorpay
Use these test card details:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

### Test Stripe
Use these test card details:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

## 4. Production Deployment

### Before Going Live:
1. **Razorpay**:
   - Complete KYC verification
   - Switch to live API keys
   - Update webhook URLs to production domain
   - Test with small amounts

2. **Stripe**:
   - Activate your account
   - Switch to live API keys
   - Update webhook URLs to production domain
   - Test with small amounts

### Security Checklist:
- [ ] Environment variables are properly secured
- [ ] Webhook endpoints are properly secured
- [ ] SSL certificate is installed and working
- [ ] Payment verification is implemented
- [ ] Error handling is comprehensive
- [ ] Logging is configured for payment events

## 5. Configuration Options

### Default Gateway Selection
Edit `client/src/config/payment.js` to set the default gateway:
```javascript
export const PAYMENT_CONFIG = {
    defaultGateway: 'razorpay', // or 'stripe'
    // ... other config
};
```

### Currency Settings
The application is configured for INR by default. To change:
```javascript
// In client/src/config/payment.js
export const PAYMENT_CONFIG = {
    currency: 'USD', // or 'EUR', 'GBP', etc.
    // ... other config
};
```

## 6. Monitoring and Analytics

### Payment Tracking
The application includes payment event tracking. You can integrate with:
- Google Analytics
- Mixpanel
- Custom analytics solutions

### Error Monitoring
Consider integrating with error monitoring services:
- Sentry
- Bugsnag
- LogRocket

## 7. Common Issues and Solutions

### Issue: Razorpay payments failing
**Solution**: Check if:
- API keys are correct
- Webhook URL is accessible
- Amount is in correct format (paise)

### Issue: Stripe payments not working internationally
**Solution**: 
- Ensure your Stripe account supports international payments
- Check if the customer's country is supported
- Verify currency settings

### Issue: Webhook verification failing
**Solution**:
- Ensure webhook secret is correctly configured
- Check if the webhook URL is accessible from the internet
- Verify the signature verification logic

## 8. Support and Documentation

### Razorpay Resources:
- [API Documentation](https://razorpay.com/docs/)
- [Integration Guide](https://razorpay.com/docs/payments/)
- [Support](https://razorpay.com/support/)

### Stripe Resources:
- [API Documentation](https://stripe.com/docs/api)
- [Integration Guide](https://stripe.com/docs/payments)
- [Support](https://support.stripe.com/)

## 9. Testing Checklist

Before deploying to production:

- [ ] Test successful payments with both gateways
- [ ] Test failed payments and error handling
- [ ] Test webhook processing
- [ ] Test order completion and user enrollment
- [ ] Test refund processing (if implemented)
- [ ] Test with different payment methods
- [ ] Test mobile responsiveness
- [ ] Test with different browsers
- [ ] Verify SSL certificate is working
- [ ] Test payment verification logic

## 10. Maintenance

### Regular Tasks:
- Monitor payment success rates
- Check webhook delivery status
- Review failed payments and reasons
- Update API keys before expiration
- Monitor for new payment methods
- Keep payment gateway SDKs updated

### Monthly Reviews:
- Analyze payment conversion rates
- Review payment gateway fees
- Check for new features or improvements
- Update test cases if needed