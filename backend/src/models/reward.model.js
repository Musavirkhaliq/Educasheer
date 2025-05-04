import mongoose, { Schema } from "mongoose";

// Schema for rewards that users can redeem with points
const rewardSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    pointsCost: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: String,
        enum: ["discount", "content", "certificate", "merchandise", "other"],
        default: "other"
    },
    image: {
        type: String
    },
    code: {
        type: String
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
    },
    quantity: {
        type: Number,
        default: -1 // -1 means unlimited
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

// Schema for user reward redemptions
const redemptionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reward: {
        type: Schema.Types.ObjectId,
        ref: "Reward",
        required: true
    },
    pointsSpent: {
        type: Number,
        required: true
    },
    redeemedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
    },
    redemptionCode: {
        type: String
    },
    expiresAt: {
        type: Date
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    }
}, {
    timestamps: true
});

export const Reward = mongoose.model("Reward", rewardSchema);
export const Redemption = mongoose.model("Redemption", redemptionSchema);
