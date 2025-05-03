import mongoose, { Schema } from "mongoose";

const testimonialSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
