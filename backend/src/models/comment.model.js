import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course"
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    isReply: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for replies
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

CommentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", CommentSchema);
