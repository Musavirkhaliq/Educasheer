import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        default: "Uncategorized"
    },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Mixed"],
        default: "Mixed"
    },
    price: {
        type: Number,
        default: 0 // Free by default
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    enrolledStudents: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

export const Course = mongoose.model("Course", courseSchema);
