import mongoose, { Schema } from "mongoose";

const promocodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    maxDiscount: {
        type: Number,
        default: null // Only for percentage discounts
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    applicableItems: {
        type: String,
        enum: ["all", "courses", "testSeries", "programs"],
        default: "all"
    },
    specificItems: [{
        itemType: {
            type: String,
            enum: ["course", "testSeries", "program"]
        },
        itemId: {
            type: Schema.Types.ObjectId,
            refPath: 'specificItems.itemType'
        }
    }],
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    userLimit: {
        type: Number,
        default: 1 // How many times a single user can use this code
    },
    usedBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        usedCount: {
            type: Number,
            default: 1
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }],
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

// Index for better performance
promocodeSchema.index({ code: 1 });
promocodeSchema.index({ validFrom: 1, validUntil: 1 });
promocodeSchema.index({ isActive: 1 });

export const PromoCode = mongoose.model("PromoCode", promocodeSchema);