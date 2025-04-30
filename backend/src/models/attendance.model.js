import mongoose, { Schema } from "mongoose";

const attendanceRecordSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    session: {
        type: String,
        required: true
    },
    sessionDate: {
        type: Date,
        required: true
    },
    qrCodeData: {
        type: String,
        required: true,
        unique: true
    },
    qrCodeExpiry: {
        type: Date,
        required: true
    },
    attendees: [{
        student: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        checkedInAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness of course + session combination
attendanceRecordSchema.index({ course: 1, session: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);
