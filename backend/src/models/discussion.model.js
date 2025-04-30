import mongoose, { Schema } from "mongoose";

const discussionMessageSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "DiscussionMessage",
        default: null
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    isInstructor: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const DiscussionMessage = mongoose.model("DiscussionMessage", discussionMessageSchema);
