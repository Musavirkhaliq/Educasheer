# Payment System Implementation

This document describes the comprehensive payment system implemented for courses, test series, and programs with cart functionality and promo codes.

## Features Implemented

### 1. Cart System
- **Add to Cart**: Users can add courses, test series, and programs to their cart
- **Remove from Cart**: Users can remove individual items from their cart
- **Clear Cart**: Users can clear their entire cart
- **Cart Persistence**: Cart data is stored in the database and persists across sessions
- **Cart Icon**: Shows cart item count in the navigation bar

### 2. Promo Code System
- **Admin Management**: Admins can create, edit, and delete promo codes
- **Flexible Discounts**: Support for percentage and fixed amount discounts
- **Usage Limits**: Set total usage limits and per-user limits
- **Item Restrictions**: Apply promo codes to specific item types or all items
- **Validation**: Real-time promo code validation during checkout
- **Expiry Dates**: Set validity periods for promo codes

### 3. Payment Processing
- **Order Creation**: Generate unique order IDs and process payments
- **Multiple Payment Methods**: Support for Razorpay, Stripe, and free orders
- **Order History**: Users can view their purchase history
- **Automatic Enrollment**: Users are automatically enrolled after successful payment
- **Payment Success Page**: Confirmation page with order details

### 4. User Interface Components
- **Cart Page**: Complete cart management interface
- **Checkout Page**: Streamlined checkout process with promo code application
- **Add to Cart Buttons**: Integrated throughout the application
- **Admin Dashboard**: Promo code management interface

## Database Models

### Cart Model
```javascript
{
  user: ObjectId,
  items: [{
    itemType: String, // 'course', 'testSeries', 'program'
    itemId: ObjectId,
    title: String,
    price: Number,
    originalPrice: Number,
    thumbnail: String
  }],
  totalAmount: Number,
  totalItems: Number
}
```

### PromoCode Model
```javascript
{
  code: String,
  description: String,
  discountType: String, // 'percentage', 'fixed'
  discountValue: Number,
  maxDiscount: Number,
  minOrderAmount: Number,
  applicableItems: String, // 'all', 'courses', 'testSeries', 'programs'
  usageLimit: Number,
  userLimit: Number,
  validFrom: Date,
  validUntil: Date,
  isActive: Boolean,
  usedBy: [{ user: ObjectId, usedCount: Number, usedAt: Date }]
}
```

### Order Model
```javascript
{
  orderId: String,
  user: ObjectId,
  items: [CartItem],
  subtotal: Number,
  discount: Number,
  promoCode: { code: String, discountAmount: Number },
  totalAmount: Number,
  paymentMethod: String,
  paymentId: String,
  paymentStatus: String, // 'pending', 'completed', 'failed', 'refunded'
  orderStatus: String, // 'pending', 'confirmed', 'cancelled'
  paymentDetails: Object
}
```

## API Endpoints

### Cart Endpoints
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/add` - Add item to cart
- `POST /api/v1/cart/remove` - Remove item from cart
- `POST /api/v1/cart/clear` - Clear cart

### Promo Code Endpoints
- `POST /api/v1/promocodes` - Create promo code (Admin)
- `GET /api/v1/promocodes` - Get all promo codes (Admin)
- `POST /api/v1/promocodes/validate` - Validate promo code
- `PUT /api/v1/promocodes/:id` - Update promo code (Admin)
- `DELETE /api/v1/promocodes/:id` - Delete promo code (Admin)

### Payment Endpoints
- `POST /api/v1/payments/create-order` - Create order
- `POST /api/v1/payments/success` - Process payment success
- `GET /api/v1/payments/orders` - Get user orders
- `GET /api/v1/payments/orders/:orderId` - Get order details

## Frontend Components

### Context
- `CartContext` - Manages cart state across the application

### Components
- `CartIcon` - Shows cart item count in navigation
- `AddToCartButton` - Reusable button for adding items to cart
- `CartPage` - Complete cart management interface
- `CheckoutPage` - Checkout process with promo code support
- `PaymentSuccessPage` - Order confirmation page
- `PromoCodeManagement` - Admin interface for managing promo codes

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install razorpay stripe
   ```

2. Add environment variables to `.env`:
   ```
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

3. The routes are automatically added to the Express app

### Frontend Setup
1. The CartProvider is already wrapped around the app in `App.jsx`
2. Cart icon is added to the navigation bar
3. Routes are configured for cart, checkout, and payment success pages

## Usage

### For Users
1. **Browse and Add to Cart**: Users can browse courses, test series, and programs and add them to their cart
2. **Manage Cart**: View cart, remove items, apply promo codes
3. **Checkout**: Complete purchase with payment processing
4. **Access Content**: Automatically enrolled in purchased items

### For Admins
1. **Create Promo Codes**: Access admin dashboard → Promo Codes tab
2. **Set Discounts**: Configure percentage or fixed amount discounts
3. **Set Restrictions**: Apply to specific item types or all items
4. **Monitor Usage**: Track promo code usage and effectiveness

## Payment Gateway Integration

### Demo Mode
- Currently configured for demo/testing purposes
- Simulates payment processing without actual charges
- All orders are processed as successful for testing

### Production Setup
1. **Razorpay Integration**:
   - Sign up for Razorpay account
   - Get API keys and add to environment variables
   - Update payment processing logic in `payment.controller.js`

2. **Stripe Integration**:
   - Sign up for Stripe account
   - Get API keys and add to environment variables
   - Implement Stripe payment processing

## Security Considerations

1. **Authentication**: All cart and payment operations require user authentication
2. **Authorization**: Admin-only access for promo code management
3. **Validation**: Server-side validation for all payment operations
4. **Encryption**: Sensitive payment data is handled securely
5. **Order Verification**: Orders are verified before processing enrollment

## Testing

### Test Scenarios
1. **Cart Operations**: Add/remove items, clear cart
2. **Promo Codes**: Create, validate, and apply promo codes
3. **Free Orders**: Process orders with zero total amount
4. **Paid Orders**: Process orders with payment simulation
5. **Error Handling**: Test invalid promo codes, expired codes, etc.

### Test Data
- Sample promo codes are created for testing
- Mock payment responses for development
- Test user accounts with different roles

## Future Enhancements

1. **Multiple Payment Gateways**: Support for PayPal, UPI, etc.
2. **Subscription Plans**: Recurring payment support
3. **Refund System**: Automated refund processing
4. **Analytics**: Payment and promo code analytics dashboard
5. **Mobile App**: React Native implementation
6. **Wishlist**: Save items for later purchase
7. **Bulk Discounts**: Quantity-based pricing
8. **Gift Cards**: Digital gift card system

## Troubleshooting

### Common Issues
1. **Cart not loading**: Check authentication and database connection
2. **Promo code not applying**: Verify code validity and restrictions
3. **Payment failing**: Check payment gateway configuration
4. **Orders not processing**: Verify order processing logic

### Debug Steps
1. Check browser console for errors
2. Verify API responses in network tab
3. Check server logs for backend errors
4. Validate database records

## Support

For technical support or questions about the payment system implementation, please refer to the codebase documentation or contact the development team.