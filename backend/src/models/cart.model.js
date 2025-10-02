import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema({
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

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.length;
    this.totalAmount = this.items.reduce((total, item) => total + item.price, 0);
    next();
});

export const Cart = mongoose.model("Cart", cartSchema);