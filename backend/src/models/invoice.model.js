import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
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
    payments: [{
        type: Schema.Types.ObjectId,
        ref: "Payment"
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["draft", "issued", "paid", "overdue", "cancelled"],
        default: "draft"
    },
    notes: {
        type: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

// Function to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function() {
    const count = await this.countDocuments();
    const year = new Date().getFullYear();
    return `INV-${year}-${(count + 1).toString().padStart(5, '0')}`;
};

export const Invoice = mongoose.model("Invoice", invoiceSchema);
