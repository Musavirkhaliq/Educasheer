import mongoose, { Schema } from "mongoose";

const materialSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    materialType: {
        type: String,
        enum: ["file", "link", "text"],
        required: true
    },
    // For file type
    fileUrl: {
        type: String,
        required: function() {
            return this.materialType === "file";
        }
    },
    fileType: {
        type: String,
        required: function() {
            return this.materialType === "file";
        }
    },
    fileSize: {
        type: Number, // in bytes
        required: function() {
            return this.materialType === "file";
        }
    },
    fileName: {
        type: String,
        required: function() {
            return this.materialType === "file";
        }
    },
    // For link type
    linkUrl: {
        type: String,
        required: function() {
            return this.materialType === "link";
        }
    },
    // For text type
    content: {
        type: String,
        required: function() {
            return this.materialType === "text";
        }
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    uploader: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

export const Material = mongoose.model("Material", materialSchema);
