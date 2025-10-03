# 💳 Payment System - Educasheer

## 🚀 Quick Start

The payment system is now fully configured and ready to use! Here's what you need to know:

### ✅ Current Status
- **Demo Mode**: ✅ Working (when no payment gateways configured)
- **Razorpay Integration**: ✅ Ready (needs API keys)
- **Stripe Integration**: ✅ Ready (needs API keys)
- **Error Handling**: ✅ Comprehensive
- **Security**: ✅ Webhook verification included

## 🔧 Configuration

### 1. Environment Variables

Add these to your `backend/.env` file:

```env
# Razorpay (for Indian users)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Stripe (for international users)  
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

### 2. Frontend Environment Variables

Add these to your `client/.env.local`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
VITE_DEFAULT_PAYMENT_GATEWAY=razorpay
```

## 🎯 Features

### ✨ Multi-Gateway Support
- **Razorpay**: UPI, Net Banking, Cards, Wallets (India)
- **Stripe**: Cards, Digital Wallets (International)
- **Auto-Selection**: Based on user location

### 🛡️ Security Features
- Webhook signature verification
- Payment status validation
- Secure API key handling
- Error logging and monitoring

### 🎨 User Experience
- Mobile-responsive design
- Real-time payment status
- Comprehensive error messages
- Demo mode for testing

### 🔄 Demo Mode
When no payment gateways are configured:
- Automatically enables demo mode
- Simulates payment processing
- Perfect for development and testing
- No real money transactions

## 📱 How It Works

### 1. User Flow
```
Cart → Checkout → Payment Gateway → Verification → Success
```

### 2. Payment Process
1. User adds items to cart
2. Applies promo codes (optional)
3. Selects payment gateway
4. Completes payment
5. System verifies payment
6. User gets enrolled in courses

### 3. Backend Process
1. Creates order in database
2. Generates payment gateway order
3. Handles payment callbacks
4. Verifies payment signatures
5. Enrolls user in purchased content
6. Sends confirmation emails

## 🧪 Testing

### Test Cards

**Razorpay Test Cards:**
```
Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
OTP: 123456
```

**Stripe Test Cards:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Test Demo Mode
1. Don't configure any payment gateway credentials
2. System automatically runs in demo mode
3. Payments are simulated and processed automatically

## 🔍 Monitoring

### Check Payment Status
```bash
curl http://localhost:5001/api/v1/payments/status
```

### View Payment Logs
Check your server logs for payment-related events:
- Order creation
- Payment processing
- Webhook events
- Error messages

## 🚨 Troubleshooting

### Common Issues

**1. "Payment gateway not configured" error**
- Solution: Add API keys to environment variables
- Check: Ensure .env file is properly loaded

**2. Webhook verification failed**
- Solution: Verify webhook secret is correct
- Check: Ensure webhook URL is accessible

**3. Payment stuck in pending**
- Solution: Check webhook delivery in gateway dashboard
- Check: Verify order status in database

**4. Demo mode not working**
- Solution: Ensure no payment gateway credentials are set
- Check: Server logs for demo mode activation

### Debug Steps
1. Check environment variables are loaded
2. Verify API keys are correct
3. Test webhook endpoints
4. Check server logs
5. Verify database connections

## 📊 Admin Features

### Payment Settings Panel
Access via Admin Dashboard → Payment Settings:
- Configure gateway credentials
- Test connections
- View payment status
- Monitor transactions

### Order Management
- View all orders
- Track payment status
- Process refunds (if implemented)
- Generate reports

## 🔐 Security Best Practices

### Production Checklist
- [ ] Use HTTPS for all payment pages
- [ ] Validate webhook signatures
- [ ] Store API keys securely
- [ ] Enable payment logging
- [ ] Set up monitoring alerts
- [ ] Regular security audits

### Environment Security
- Never commit API keys to version control
- Use different keys for test/production
- Rotate keys regularly
- Monitor for suspicious activity

## 📈 Analytics & Reporting

### Payment Metrics
- Success/failure rates
- Popular payment methods
- Revenue tracking
- Geographic distribution

### Integration Options
- Google Analytics
- Mixpanel
- Custom dashboards
- Email notifications

## 🔄 Maintenance

### Regular Tasks
- Monitor payment success rates
- Check webhook delivery status
- Update payment gateway SDKs
- Review failed payments
- Analyze user behavior

### Monthly Reviews
- Payment conversion analysis
- Gateway fee comparison
- Performance optimization
- Security updates

## 🆘 Support

### Getting Help
1. Check this documentation
2. Review payment gateway docs:
   - [Razorpay Docs](https://razorpay.com/docs/)
   - [Stripe Docs](https://stripe.com/docs/)
3. Check server logs
4. Contact payment gateway support

### Emergency Contacts
- Razorpay Support: support@razorpay.com
- Stripe Support: support@stripe.com

## 🎉 Success!

Your payment system is now ready to handle real transactions! 

### Next Steps:
1. **Test thoroughly** with test credentials
2. **Configure webhooks** for production
3. **Switch to live keys** when ready
4. **Monitor payments** closely after launch

---

**Happy Selling! 💰**