import mongoose, { Schema } from "mongoose";

const feeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "partial", "paid"],
        default: "pending"
    },
    description: {
        type: String,
        default: ""
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

// Compound index to ensure a user doesn't have duplicate fees for the same course
feeSchema.index({ user: 1, course: 1 }, { unique: true });

export const Fee = mongoose.model("Fee", feeSchema);
