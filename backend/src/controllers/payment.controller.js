import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { PromoCode } from "../models/promocode.model.js";
import { Course } from "../models/course.model.js";
import { TestSeries } from "../models/testSeries.model.js";
import { Program } from "../models/program.model.js";
import { User } from "../models/user.model.js";
import Razorpay from "razorpay";
import Stripe from "stripe";
import crypto from "crypto";
import { generateReceipt, generateReceiptHTML } from "../utils/receiptGenerator.js";

// Initialize payment gateways conditionally
let razorpay = null;
let stripe = null;

// Initialize Razorpay only if credentials are available
console.log('Razorpay initialization check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('Razorpay initialized successfully');
    } catch (error) {
        console.error('Razorpay initialization error:', error);
    }
} else {
    console.log('Razorpay credentials missing - running in demo mode');
}

// Initialize Stripe only if credentials are available
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Payment gateway configuration
const PAYMENT_CONFIG = {
    currency: 'INR',
    defaultGateway: 'razorpay', // razorpay for India, stripe for international
    webhookSecret: {
        stripe: process.env.STRIPE_WEBHOOK_SECRET
    }
};

// Create order
export const createOrder = async (req, res) => {
    try {
        const { promoCode, paymentGateway = PAYMENT_CONFIG.defaultGateway } = req.body;
        const userId = req.user._id;

        // Get user's cart
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Validate cart items
        for (const item of cart.items) {
            if (!item.itemType || !item.itemId || !item.title || item.price === undefined) {
                console.error("Invalid cart item:", item);
                return res.status(400).json({
                    success: false,
                    message: "Invalid cart item found. Please refresh your cart."
                });
            }
        }

        let subtotal = cart.totalAmount;
        let discount = 0;
        let promoCodeData = null;

        // Apply promo code if provided
        if (promoCode) {
            const promo = await PromoCode.findOne({ 
                code: promoCode.toUpperCase(),
                isActive: true
            });

            if (promo) {
                // Validate promo code (similar to validatePromoCode logic)
                const now = new Date();
                if (now >= promo.validFrom && now <= promo.validUntil) {
                    if (!promo.usageLimit || promo.usedCount < promo.usageLimit) {
                        const userUsage = promo.usedBy.find(usage => usage.user.toString() === userId.toString());
                        if (!userUsage || userUsage.usedCount < promo.userLimit) {
                            if (subtotal >= promo.minOrderAmount) {
                                // Calculate discount
                                if (promo.discountType === 'percentage') {
                                    discount = (subtotal * promo.discountValue) / 100;
                                    if (promo.maxDiscount && discount > promo.maxDiscount) {
                                        discount = promo.maxDiscount;
                                    }
                                } else {
                                    discount = Math.min(promo.discountValue, subtotal);
                                }

                                promoCodeData = {
                                    code: promo.code,
                                    discountAmount: discount
                                };
                            }
                        }
                    }
                }
            }
        }

        const totalAmount = subtotal - discount;

        // Create order
        const order = new Order({
            user: userId,
            items: cart.items,
            subtotal,
            discount,
            promoCode: promoCodeData,
            totalAmount,
            paymentMethod: totalAmount === 0 ? 'free' : paymentGateway,
            paymentStatus: totalAmount === 0 ? 'completed' : 'pending',
            orderStatus: totalAmount === 0 ? 'confirmed' : 'pending'
        });

        await order.save();

        // If free order, process immediately
        if (totalAmount === 0) {
            await processOrderCompletion(order._id);
            return res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: {
                    orderId: order.orderId,
                    totalAmount: order.totalAmount,
                    needsPayment: false
                }
            });
        }

        // Check if we're in demo mode (no payment gateways configured)
        const isDemoMode = !razorpay && !stripe;
        
        // If at least one gateway is configured, proceed with real payment
        const hasConfiguredGateway = razorpay || stripe;
        
        if (isDemoMode) {
            // Demo mode - simulate payment gateway response
            const paymentData = {
                demo: true,
                orderId: order.orderId,
                amount: order.totalAmount,
                message: "Demo mode - Payment gateways not configured"
            };

            return res.status(201).json({
                success: true,
                message: "Order created successfully (Demo Mode)",
                data: {
                    orderId: order.orderId,
                    totalAmount: order.totalAmount,
                    needsPayment: true,
                    paymentGateway: 'demo',
                    paymentData,
                    demoMode: true
                }
            });
        }

        // If requested gateway is not available, fallback to available one
        if (paymentGateway === 'razorpay' && !razorpay && stripe) {
            paymentGateway = 'stripe';
        } else if (paymentGateway === 'stripe' && !stripe && razorpay) {
            paymentGateway = 'razorpay';
        }

        // Validate payment gateway availability
        if (paymentGateway === 'razorpay' && !razorpay) {
            return res.status(400).json({
                success: false,
                message: "Razorpay is not configured. Please contact support."
            });
        }
        
        if (paymentGateway === 'stripe' && !stripe) {
            return res.status(400).json({
                success: false,
                message: "Stripe is not configured. Please contact support."
            });
        }

        // Create payment gateway order
        let paymentData = {};
        
        if (paymentGateway === 'razorpay') {
            paymentData = await createRazorpayOrder(order);
        } else if (paymentGateway === 'stripe') {
            paymentData = await createStripePaymentIntent(order);
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId: order.orderId,
                totalAmount: order.totalAmount,
                needsPayment: true,
                paymentGateway,
                paymentData
            }
        });
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create order",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create Razorpay order
const createRazorpayOrder = async (order) => {
    try {
        console.log('createRazorpayOrder called, razorpay instance:', razorpay ? 'INITIALIZED' : 'NULL');
        if (!razorpay) {
            console.error('Razorpay instance is null. Environment check:');
            console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
            console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
            throw new Error("Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.");
        }

        const options = {
            amount: Math.round(order.totalAmount * 100), // Amount in paise
            currency: PAYMENT_CONFIG.currency,
            receipt: order.orderId,
            notes: {
                orderId: order.orderId,
                userId: order.user.toString()
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);
        
        // Store the Razorpay order ID in our order for reference
        await Order.findOneAndUpdate(
            { orderId: order.orderId }, 
            { paymentGatewayOrderId: razorpayOrder.id }
        );
        
        return {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        };
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        throw new Error(error.message || "Failed to create Razorpay order");
    }
};

// Create Stripe payment intent
const createStripePaymentIntent = async (order) => {
    try {
        if (!stripe) {
            throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.");
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100), // Amount in paise
            currency: PAYMENT_CONFIG.currency.toLowerCase(),
            metadata: {
                orderId: order.orderId,
                userId: order.user.toString()
            },
            automatic_payment_methods: {
                enabled: true
            }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        };
    } catch (error) {
        console.error("Stripe payment intent creation error:", error);
        throw new Error(error.message || "Failed to create Stripe payment intent");
    }
};

// Process payment success
export const processPaymentSuccess = async (req, res) => {
    try {
        const { orderId, paymentId, paymentDetails } = req.body;

        const order = await Order.findOne({ orderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update order with payment details
        order.paymentId = paymentId;
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.paymentDetails = paymentDetails || {};

        await order.save();

        // Process order completion
        await processOrderCompletion(order._id);

        res.json({
            success: true,
            message: "Payment processed successfully",
            data: order
        });
    } catch (error) {
        console.error("Process payment success error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process payment"
        });
    }
};

// Process order completion (enroll user in purchased items)
const processOrderCompletion = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            throw new Error("Order not found");
        }

        // Enroll user in purchased items
        for (const item of order.items) {
            let Model;
            
            switch (item.itemType) {
                case "course":
                    Model = Course;
                    break;
                case "testSeries":
                    Model = TestSeries;
                    break;
                case "program":
                    Model = Program;
                    break;
                default:
                    continue;
            }

            await Model.findByIdAndUpdate(
                item.itemId,
                { $addToSet: { enrolledStudents: order.user } }
            );
        }

        // Update promo code usage if used
        if (order.promoCode && order.promoCode.code) {
            const promo = await PromoCode.findOne({ code: order.promoCode.code });
            if (promo) {
                promo.usedCount += 1;
                
                const userUsage = promo.usedBy.find(usage => usage.user.toString() === order.user.toString());
                if (userUsage) {
                    userUsage.usedCount += 1;
                    userUsage.usedAt = new Date();
                } else {
                    promo.usedBy.push({
                        user: order.user,
                        usedCount: 1,
                        usedAt: new Date()
                    });
                }
                
                await promo.save();
            }
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: order.user },
            { items: [], totalAmount: 0, totalItems: 0 }
        );

        console.log(`Order ${order.orderId} completed successfully`);
    } catch (error) {
        console.error("Process order completion error:", error);
        throw error;
    }
};

// Get user orders
export const getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user._id;

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments({ user: userId });

        res.json({
            success: true,
            data: {
                orders,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get orders"
        });
    }
};

// Get order details
export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ 
            orderId, 
            user: userId 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Get order details error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get order details"
        });
    }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req, res) => {
    try {
        console.log('Razorpay verification request body:', req.body);
        
        if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
            console.log('Razorpay not configured');
            return res.status(400).json({
                success: false,
                message: "Razorpay is not configured"
            });
        }

        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderId 
        } = req.body;

        console.log('Verification data:', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature: razorpay_signature ? 'present' : 'missing',
            orderId
        });

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        console.log('Signature verification:', {
            expected: expectedSignature,
            received: razorpay_signature,
            match: expectedSignature === razorpay_signature
        });

        if (expectedSignature !== razorpay_signature) {
            console.log('Signature verification failed');
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Find and update order
        console.log('Looking for order with orderId:', orderId);
        let order = await Order.findOne({ orderId });
        console.log('Order found:', order ? 'yes' : 'no');
        
        if (!order) {
            // Try to find by Razorpay order ID as fallback
            console.log('Trying to find by Razorpay order ID:', razorpay_order_id);
            order = await Order.findOne({ 
                paymentGatewayOrderId: razorpay_order_id 
            });
            console.log('Order found by razorpay_order_id:', order ? 'yes' : 'no');
            
            // List recent orders for debugging
            const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).select('orderId paymentGatewayOrderId createdAt');
            console.log('Recent orders:', recentOrders.map(o => ({ 
                orderId: o.orderId, 
                paymentGatewayOrderId: o.paymentGatewayOrderId,
                created: o.createdAt 
            })));
        }
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update order with payment details
        order.paymentId = razorpay_payment_id;
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.paymentDetails = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            gateway: 'razorpay'
        };

        await order.save();

        // Process order completion
        await processOrderCompletion(order._id);

        res.json({
            success: true,
            message: "Payment verified successfully",
            data: { orderId: order.orderId }
        });
    } catch (error) {
        console.error("Razorpay verification error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
};

// Verify Stripe payment
export const verifyStripePayment = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(400).json({
                success: false,
                message: "Stripe is not configured"
            });
        }

        const { payment_intent_id, orderId } = req.body;

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: "Payment not completed"
            });
        }

        // Find and update order
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update order with payment details
        order.paymentId = payment_intent_id;
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.paymentDetails = {
            payment_intent_id,
            gateway: 'stripe',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
        };

        await order.save();

        // Process order completion
        await processOrderCompletion(order._id);

        res.json({
            success: true,
            message: "Payment verified successfully",
            data: { orderId: order.orderId }
        });
    } catch (error) {
        console.error("Stripe verification error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
};

// Razorpay webhook handler
export const handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookBody = JSON.stringify(req.body);

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(webhookBody)
            .digest('hex');

        if (webhookSignature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.notes?.orderId;

            if (orderId) {
                const order = await Order.findOne({ orderId });
                if (order && order.paymentStatus === 'pending') {
                    order.paymentStatus = 'completed';
                    order.orderStatus = 'confirmed';
                    order.paymentId = payment.id;
                    await order.save();
                    await processOrderCompletion(order._id);
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Razorpay webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(400).json({ error: 'Stripe is not configured' });
        }

        const sig = req.headers['stripe-signature'];
        const webhookSecret = PAYMENT_CONFIG.webhookSecret.stripe;

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata?.orderId;

            if (orderId) {
                const order = await Order.findOne({ orderId });
                if (order && order.paymentStatus === 'pending') {
                    order.paymentStatus = 'completed';
                    order.orderStatus = 'confirmed';
                    order.paymentId = paymentIntent.id;
                    await order.save();
                    await processOrderCompletion(order._id);
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// Generate receipt PDF
export const generateReceiptPDF = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ 
            orderId, 
            user: userId 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const user = await User.findById(userId);
        const pdfBuffer = await generateReceipt(order, user);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${orderId}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Generate receipt PDF error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate receipt"
        });
    }
};

// Generate receipt HTML (for preview)
export const generateReceiptPreview = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ 
            orderId, 
            user: userId 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const user = await User.findById(userId);
        const html = generateReceiptHTML(order, user);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error("Generate receipt preview error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate receipt preview"
        });
    }
};

// Get payment gateway status
export const getPaymentGatewayStatus = async (req, res) => {
    try {
        const status = {
            razorpay: {
                configured: !!razorpay,
                hasKeyId: !!process.env.RAZORPAY_KEY_ID,
                hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
            },
            stripe: {
                configured: !!stripe,
                hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
                hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY
            },
            defaultGateway: PAYMENT_CONFIG.defaultGateway
        };

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Get payment gateway status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment gateway status'
        });
    }
};