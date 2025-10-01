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
    // Organized sections/chapters for better navigation
    sections: {
        type: [
            {
                title: {
                    type: String,
                    required: true,
                    trim: true
                },
                description: {
                    type: String,
                    trim: true,
                    default: ''
                },
                order: {
                    type: Number,
                    default: 0
                },
                quizzes: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: "Quiz"
                    }
                ]
            }
        ],
        default: []
    },
    // Legacy field for backward compatibility
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
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: false
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

// Pre-save middleware to clean up empty strings for ObjectId fields
testSeriesSchema.pre('save', function(next) {
    // Convert empty strings to undefined for ObjectId fields
    if (this.course === '') {
        this.course = undefined;
    }
    next();
});

// Pre-update middleware to clean up empty strings for ObjectId fields
testSeriesSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    const update = this.getUpdate();
    if (update && update.course === '') {
        update.course = undefined;
    }
    next();
});

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
    if (this.isModified('quizzes') || this.isModified('sections')) {
        try {
            const Quiz = mongoose.model('Quiz');
            
            // Safely collect all quiz IDs from both legacy quizzes array and sections
            let allQuizIds = [];
            
            // Add quizzes from legacy array
            if (this.quizzes && Array.isArray(this.quizzes)) {
                allQuizIds = [...this.quizzes];
            }
            
            // Add quizzes from sections
            if (this.sections && Array.isArray(this.sections) && this.sections.length > 0) {
                this.sections.forEach(section => {
                    if (section.quizzes && Array.isArray(section.quizzes)) {
                        allQuizIds = allQuizIds.concat(section.quizzes);
                    }
                });
            }
            
            // Remove duplicates and ensure all IDs are strings
            allQuizIds = [...new Set(allQuizIds.map(id => id ? id.toString() : null).filter(Boolean))];
            
            if (allQuizIds.length > 0) {
                const quizzes = await Quiz.find({ _id: { $in: allQuizIds } });
                
                this.totalQuizzes = quizzes.length;
                this.totalQuestions = quizzes.reduce((total, quiz) => total + (quiz.questions?.length || 0), 0);
                this.estimatedDuration = quizzes.reduce((total, quiz) => total + (quiz.timeLimit || 0), 0);
            } else {
                this.totalQuizzes = 0;
                this.totalQuestions = 0;
                this.estimatedDuration = 0;
            }
        } catch (error) {
            console.error('Error calculating test series totals:', error);
            // Don't fail the save operation due to calculation errors
            this.totalQuizzes = this.totalQuizzes || 0;
            this.totalQuestions = this.totalQuestions || 0;
            this.estimatedDuration = this.estimatedDuration || 0;
        }
    }
    next();
});

export const TestSeries = mongoose.model("TestSeries", testSeriesSchema);
