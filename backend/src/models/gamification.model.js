import mongoose, { Schema } from "mongoose";

// Schema for user points
const userPointsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    currentLevelPoints: {
        type: Number,
        default: 0
    },
    pointsToNextLevel: {
        type: Number,
        default: 100
    },
    // Track points by category
    courseCompletionPoints: {
        type: Number,
        default: 0
    },
    videoWatchPoints: {
        type: Number,
        default: 0
    },
    quizPoints: {
        type: Number,
        default: 0
    },
    attendancePoints: {
        type: Number,
        default: 0
    },
    blogPoints: {
        type: Number,
        default: 0
    },
    commentPoints: {
        type: Number,
        default: 0
    },
    socialPoints: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Schema for point transactions (history)
const pointTransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ["earned", "spent", "bonus", "penalty"],
        default: "earned"
    },
    category: {
        type: String,
        enum: ["course_completion", "video_watch", "quiz", "attendance", "blog", "comment", "social", "other"],
        default: "other"
    },
    description: {
        type: String,
        required: true
    },
    relatedItem: {
        // Can be a course, video, quiz, etc.
        itemId: {
            type: Schema.Types.ObjectId,
            refPath: 'relatedItem.itemType'
        },
        itemType: {
            type: String,
            enum: ["Course", "Video", "Blog", "Comment", "Program", "Attendance", "Other"]
        }
    }
}, {
    timestamps: true
});

// Schema for badges/achievements
const badgeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["course", "video", "quiz", "attendance", "blog", "social", "special"],
        default: "special"
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },
    pointsAwarded: {
        type: Number,
        default: 0
    },
    criteria: {
        type: String,
        required: true
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Schema for user badges (which badges a user has earned)
const userBadgeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    badge: {
        type: Schema.Types.ObjectId,
        ref: "Badge",
        required: true
    },
    earnedAt: {
        type: Date,
        default: Date.now
    },
    displayed: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Schema for streaks
const streakSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActivityDate: {
        type: Date,
        default: Date.now
    },
    streakHistory: [{
        date: {
            type: Date
        },
        activities: [{
            type: String,
            enum: ["video_watch", "course_progress", "quiz", "comment", "login", "other"]
        }]
    }]
}, {
    timestamps: true
});

// Schema for challenges
const challengeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["daily", "weekly", "monthly", "special"],
        default: "daily"
    },
    criteria: {
        activityType: {
            type: String,
            enum: ["video_watch", "course_completion", "quiz", "attendance", "blog", "comment", "login"],
            required: true
        },
        targetCount: {
            type: Number,
            required: true
        },
        specificItems: [{
            itemId: {
                type: Schema.Types.ObjectId,
                refPath: 'specificItems.itemType'
            },
            itemType: {
                type: String,
                enum: ["Course", "Video", "Blog", "Program"]
            }
        }]
    },
    reward: {
        points: {
            type: Number,
            default: 0
        },
        badge: {
            type: Schema.Types.ObjectId,
            ref: "Badge"
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Schema for user challenge progress
const userChallengeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    challenge: {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create and export models
export const UserPoints = mongoose.model("UserPoints", userPointsSchema);
export const PointTransaction = mongoose.model("PointTransaction", pointTransactionSchema);
export const Badge = mongoose.model("Badge", badgeSchema);
export const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
export const Streak = mongoose.model("Streak", streakSchema);
export const Challenge = mongoose.model("Challenge", challengeSchema);
export const UserChallenge = mongoose.model("UserChallenge", userChallengeSchema);
