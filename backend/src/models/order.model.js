import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({
    itemType: {
        type: String,
        enum: ["course", "testSeries", "program"],
        required: true
    },
    itemId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: function() {
            if (this.itemType === 'course') return 'Course';
            if (this.itemType === 'testSeries') return 'TestSeries';
            if (this.itemType === 'program') return 'Program';
        }
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        default: ''
    }
});

const orderSchema = new Schema({
    orderId: {
        type: String,
        unique: true,
        default: function() {
            const timestamp = Date.now().toString();
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            return `EDU${timestamp.slice(-6)}${random}`;
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    promoCode: {
        code: String,
        discountAmount: Number
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "stripe", "paypal", "free"],
        required: true
    },
    paymentId: {
        type: String,
        required: false
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    },
    paymentDetails: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', function(next) {
    if (!this.orderId || this.orderId === '') {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderId = `EDU${timestamp.slice(-6)}${random}`;
    }
    next();
});

// Index for better performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);