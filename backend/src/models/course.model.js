import mongoose, { Schema } from "mongoose";

// Define the module schema for offline courses
const moduleSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    topics: [{
        type: String,
        required: true
    }],
    duration: {
        type: String, // e.g., "2 hours"
    }
});

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
    courseType: {
        type: String,
        enum: ["online", "offline"],
        default: "online"
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    // Offline course specific fields
    location: {
        type: String,
        required: function() {
            return this.courseType === "offline";
        }
    },
    startDate: {
        type: Date,
        required: function() {
            return this.courseType === "offline";
        }
    },
    endDate: {
        type: Date,
        required: function() {
            return this.courseType === "offline";
        }
    },
    schedule: {
        type: String, // e.g., "Mon, Wed, Fri 10:00 AM - 12:00 PM"
        required: function() {
            return this.courseType === "offline";
        }
    },
    modules: [moduleSchema], // Syllabus modules for offline courses
    maxStudents: {
        type: Number,
        default: 20 // Default max students for offline courses
    },
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
