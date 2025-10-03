# Payment Flow Test Guide

## 🧪 Testing the Fixed Payment System

### Test Steps:

1. **Add items to cart**
   - Go to courses/test series page
   - Add some items to cart
   - Go to cart page

2. **Proceed to checkout**
   - Click "Proceed to Checkout"
   - Should see checkout page with order summary

3. **Test payment**
   - Select Razorpay (should be default)
   - Click "Pay ₹[amount]"
   - Razorpay popup should appear

4. **Complete payment**
   - Use test card: 4111 1111 1111 1111
   - Any future expiry date
   - Any 3-digit CVV
   - OTP: 123456

5. **Verify success**
   - Should redirect to success page
   - Check backend logs for verification process
   - User should be enrolled in purchased items

### Expected Behavior:

✅ **Order Creation**: Creates order with proper orderId
✅ **Payment Gateway**: Razorpay popup appears with correct amount
✅ **Payment Processing**: Test payment goes through
✅ **Verification**: Backend verifies payment signature
✅ **Order Completion**: User gets enrolled in courses
✅ **Success Page**: Shows order confirmation

### Debug Information:

Check backend logs for:
- Order creation logs
- Razorpay order ID storage
- Payment verification logs
- Order lookup attempts
- Signature verification results

### If Issues Persist:

1. Check browser console for frontend errors
2. Check backend logs for detailed error messages
3. Verify Razorpay credentials are correct
4. Test with different browsers
5. Clear browser cache and cookies

### Common Issues & Solutions:

**Issue**: "Order not found" during verification
**Solution**: Check if orderId is being passed correctly from frontend

**Issue**: "Invalid payment signature"
**Solution**: Verify Razorpay secret key is correct

**Issue**: Payment popup doesn't appear
**Solution**: Check if Razorpay script is loading properly

**Issue**: Demo mode still showing
**Solution**: Restart backend server after adding credentials