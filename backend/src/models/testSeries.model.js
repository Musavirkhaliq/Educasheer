import mongoose, { Schema } from "mongoose";

// Schema for test series
const testSeriesSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: false,
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
        required: false,
        default: ''
    },
    quizzes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Quiz"
        }
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: false,
        trim: true,
        default: 'General'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "mixed"],
        default: "medium"
    },
    examType: {
        type: String,
        required: false,
        trim: true,
        default: '' // e.g., "JEE", "NEET", "CAT", etc.
    },
    subject: {
        type: String,
        required: false,
        trim: true,
        default: '' // e.g., "Mathematics", "Physics", "Chemistry", etc.
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0 // Free by default
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    enrolledStudents: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    totalQuizzes: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    estimatedDuration: {
        type: Number, // in minutes
        default: 0
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: false
    },
    instructions: {
        type: String,
        trim: true,
        default: ''
    },
    allowReview: {
        type: Boolean,
        default: true
    },
    showResults: {
        type: Boolean,
        default: true
    },
    randomizeQuizOrder: {
        type: Boolean,
        default: false
    },
    maxAttempts: {
        type: Number,
        default: 0 // 0 means unlimited attempts
    }
}, {
    timestamps: true
});

// Create indexes for better performance
testSeriesSchema.index({ title: 1 });
testSeriesSchema.index({ slug: 1 });
testSeriesSchema.index({ category: 1 });
testSeriesSchema.index({ examType: 1 });
testSeriesSchema.index({ subject: 1 });
testSeriesSchema.index({ isPublished: 1 });
testSeriesSchema.index({ creator: 1 });
testSeriesSchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug from title
testSeriesSchema.pre('save', function(next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Pre-save middleware to calculate totals
testSeriesSchema.pre('save', async function(next) {
    if (this.isModified('quizzes')) {
        try {
            const Quiz = mongoose.model('Quiz');
            const quizzes = await Quiz.find({ _id: { $in: this.quizzes } });
            
            this.totalQuizzes = quizzes.length;
            this.totalQuestions = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
            this.estimatedDuration = quizzes.reduce((total, quiz) => total + quiz.timeLimit, 0);
        } catch (error) {
            console.error('Error calculating test series totals:', error);
        }
    }
    next();
});

export const TestSeries = mongoose.model("TestSeries", testSeriesSchema);
