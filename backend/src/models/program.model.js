import mongoose, { Schema } from "mongoose";

const programSchema = new Schema({
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
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: "Course"
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
    }],
    duration: {
        type: String, // Total duration of all courses in the program
        default: "0h 0m"
    },
    totalCourses: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export const Program = mongoose.model("Program", programSchema);
