import mongoose, { Schema } from "mongoose";

const courseMaterialSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true,
        enum: ["pdf", "doc", "ppt", "xls", "image", "video", "audio", "other"]
    },
    fileSize: {
        type: Number, // in bytes
        required: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const CourseMaterial = mongoose.model("CourseMaterial", courseMaterialSchema);
