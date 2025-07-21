import mongoose, { Schema } from "mongoose";

// Schema for quiz questions
const questionSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["multiple_choice", "true_false", "short_answer", "essay"],
        default: "multiple_choice"
    },
    options: [{
        text: {
            type: String,
            required: function() {
                return this.parent().type === "multiple_choice";
            }
        },
        isCorrect: {
            type: Boolean,
            required: function() {
                return this.parent().type === "multiple_choice" || this.parent().type === "true_false";
            }
        }
    }],
    correctAnswer: {
        type: String,
        required: function() {
            return this.type === "short_answer";
        }
    },
    points: {
        type: Number,
        default: 1,
        min: 0
    },
    explanation: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Schema for quizzes
const quizSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: function() {
            return !this.testSeries; // Course is required only if testSeries is not provided
        }
    },
    testSeries: {
        type: Schema.Types.ObjectId,
        ref: "TestSeries",
        required: function() {
            return !this.course; // TestSeries is required only if course is not provided
        }
    },
    questions: [questionSchema],
    timeLimit: {
        type: Number, // in minutes
        default: 30
    },
    passingScore: {
        type: Number, // percentage
        default: 70,
        min: 0,
        max: 100
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    allowReview: {
        type: Boolean,
        default: true
    },
    showCorrectAnswers: {
        type: Boolean,
        default: true
    },
    randomizeQuestions: {
        type: Boolean,
        default: false
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    quizType: {
        type: String,
        enum: ["quiz", "exam"],
        default: "quiz"
    },
    category: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },
    maxAttempts: {
        type: Number,
        default: 0 // 0 means unlimited attempts
    }
}, {
    timestamps: true
});

// Schema for quiz attempts
const quizAttemptSchema = new Schema({
    quiz: {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    answers: [{
        question: {
            type: Schema.Types.ObjectId
        },
        selectedOptions: [{
            type: Schema.Types.ObjectId
        }],
        textAnswer: {
            type: String
        },
        isCorrect: {
            type: Boolean
        },
        pointsEarned: {
            type: Number,
            default: 0
        }
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    score: {
        type: Number,
        default: 0
    },
    maxScore: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    isPassed: {
        type: Boolean,
        default: false
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    }
}, {
    timestamps: true
});

// Create compound index to ensure uniqueness of quiz attempts
quizAttemptSchema.index({ quiz: 1, user: 1, createdAt: 1 });

export const Question = mongoose.model("Question", questionSchema);
export const Quiz = mongoose.model("Quiz", quizSchema);
export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
