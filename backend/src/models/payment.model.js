import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fee: {
        type: Schema.Types.ObjectId,
        ref: "Fee",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "bank_transfer", "credit_card", "debit_card", "online", "other"],
        default: "cash"
    },
    transactionId: {
        type: String
    },
    notes: {
        type: String
    },
    recordedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

export const Payment = mongoose.model("Payment", paymentSchema);
