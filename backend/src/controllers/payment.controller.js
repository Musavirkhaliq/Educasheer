import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { PromoCode } from "../models/promocode.model.js";
import { Course } from "../models/course.model.js";
import { TestSeries } from "../models/testSeries.model.js";
import { Program } from "../models/program.model.js";
import Razorpay from "razorpay";

// Initialize Razorpay (you would set these in environment variables)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'demo_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
});

// Create order
export const createOrder = async (req, res) => {
    try {
        const { promoCode } = req.body;
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
            paymentMethod: totalAmount === 0 ? 'free' : 'razorpay',
            paymentStatus: totalAmount === 0 ? 'completed' : 'pending',
            orderStatus: totalAmount === 0 ? 'confirmed' : 'pending'
        });

        await order.save();

        // If free order, process immediately
        if (totalAmount === 0) {
            await processOrderCompletion(order._id);
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId: order.orderId,
                totalAmount: order.totalAmount,
                needsPayment: totalAmount > 0
            }
        });
    } catch (error) {
        console.error("Create order error:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create order",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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