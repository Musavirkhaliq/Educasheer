import mongoose, { Schema } from "mongoose";

// Schema for test series leaderboard entries
const leaderboardEntrySchema = new Schema({
    testSeries: {
        type: Schema.Types.ObjectId,
        ref: "TestSeries",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    totalScore: {
        type: Number,
        default: 0
    },
    totalMaxScore: {
        type: Number,
        default: 0
    },
    averagePercentage: {
        type: Number,
        default: 0
    },
    completedQuizzes: {
        type: Number,
        default: 0
    },
    totalQuizzes: {
        type: Number,
        default: 0
    },
    completionPercentage: {
        type: Number,
        default: 0
    },
    totalTimeSpent: {
        type: Number, // in seconds
        default: 0
    },
    averageTimePerQuiz: {
        type: Number, // in seconds
        default: 0
    },
    bestAttempts: [{
        quiz: {
            type: Schema.Types.ObjectId,
            ref: "Quiz"
        },
        attempt: {
            type: Schema.Types.ObjectId,
            ref: "QuizAttempt"
        },
        score: Number,
        percentage: Number,
        timeSpent: Number
    }],
    rank: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
leaderboardEntrySchema.index({ testSeries: 1, averagePercentage: -1 });
leaderboardEntrySchema.index({ testSeries: 1, user: 1 }, { unique: true });
leaderboardEntrySchema.index({ testSeries: 1, rank: 1 });

// Method to calculate and update leaderboard entry
leaderboardEntrySchema.methods.updateStats = async function() {
    const QuizAttempt = mongoose.model('QuizAttempt');
    const TestSeries = mongoose.model('TestSeries');
    
    try {
        console.log(`updateStats called for user ${this.user} in test series ${this.testSeries}`);
        
        // Get test series details
        const testSeries = await TestSeries.findById(this.testSeries).populate('quizzes sections.quizzes');
        if (!testSeries) {
            console.log(`Test series ${this.testSeries} not found`);
            return;
        }
        
        console.log(`Found test series: ${testSeries.title}`);

        // Collect all quiz IDs from test series with data corruption handling
        let allQuizIds = [];
        
        // Process main quizzes array
        if (testSeries.quizzes && Array.isArray(testSeries.quizzes)) {
            testSeries.quizzes.forEach(quiz => {
                try {
                    if (typeof quiz === 'string' && mongoose.Types.ObjectId.isValid(quiz)) {
                        allQuizIds.push(quiz);
                    } else if (quiz && quiz._id && mongoose.Types.ObjectId.isValid(quiz._id)) {
                        allQuizIds.push(quiz._id.toString());
                    } else if (quiz && typeof quiz === 'object' && quiz.toString && mongoose.Types.ObjectId.isValid(quiz.toString())) {
                        allQuizIds.push(quiz.toString());
                    }
                } catch (err) {
                    console.log(`Skipping invalid quiz ID in main array: ${quiz}`);
                }
            });
        }
        
        // Process section quizzes
        if (testSeries.sections && Array.isArray(testSeries.sections)) {
            testSeries.sections.forEach(section => {
                if (section.quizzes && Array.isArray(section.quizzes)) {
                    section.quizzes.forEach(quiz => {
                        try {
                            if (typeof quiz === 'string' && mongoose.Types.ObjectId.isValid(quiz)) {
                                allQuizIds.push(quiz);
                            } else if (quiz && quiz._id && mongoose.Types.ObjectId.isValid(quiz._id)) {
                                allQuizIds.push(quiz._id.toString());
                            } else if (quiz && typeof quiz === 'object' && quiz.toString && mongoose.Types.ObjectId.isValid(quiz.toString())) {
                                allQuizIds.push(quiz.toString());
                            }
                        } catch (err) {
                            console.log(`Skipping invalid quiz ID in section: ${quiz}`);
                        }
                    });
                }
            });
        }
        
        // Remove duplicates and ensure all are valid ObjectIds
        allQuizIds = [...new Set(allQuizIds)].filter(id => mongoose.Types.ObjectId.isValid(id));
        console.log(`Found ${allQuizIds.length} valid quiz IDs in test series`);
        
        // Get all attempts for this user in this test series
        const attempts = await QuizAttempt.find({
            user: this.user,
            quiz: { $in: allQuizIds },
            isCompleted: true
        }).populate('quiz', 'title');
        
        console.log(`Found ${attempts.length} completed attempts for user ${this.user}`);

        // Group attempts by quiz and get best attempt for each
        const bestAttemptsByQuiz = {};
        let totalScore = 0;
        let totalMaxScore = 0;
        let totalTimeSpent = 0;
        
        attempts.forEach(attempt => {
            const quizId = attempt.quiz._id.toString();
            
            if (!bestAttemptsByQuiz[quizId] || attempt.percentage > bestAttemptsByQuiz[quizId].percentage) {
                bestAttemptsByQuiz[quizId] = attempt;
            }
        });

        // Calculate stats from best attempts
        const bestAttempts = Object.values(bestAttemptsByQuiz);
        console.log(`Processing ${bestAttempts.length} best attempts`);
        
        bestAttempts.forEach(attempt => {
            totalScore += attempt.score;
            totalMaxScore += attempt.maxScore;
            totalTimeSpent += attempt.timeSpent || 0;
        });

        console.log(`Calculated totals: score=${totalScore}, maxScore=${totalMaxScore}, time=${totalTimeSpent}`);

        // Update leaderboard entry
        this.totalScore = totalScore;
        this.totalMaxScore = totalMaxScore;
        this.averagePercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
        this.completedQuizzes = bestAttempts.length;
        this.totalQuizzes = allQuizIds.length;
        this.completionPercentage = allQuizIds.length > 0 ? Math.round((bestAttempts.length / allQuizIds.length) * 100) : 0;
        this.totalTimeSpent = totalTimeSpent;
        this.averageTimePerQuiz = bestAttempts.length > 0 ? Math.round(totalTimeSpent / bestAttempts.length) : 0;
        this.bestAttempts = bestAttempts.map(attempt => ({
            quiz: attempt.quiz._id,
            attempt: attempt._id,
            score: attempt.score,
            percentage: attempt.percentage,
            timeSpent: attempt.timeSpent || 0
        }));
        this.lastUpdated = new Date();

        console.log(`Saving leaderboard entry with ${this.completedQuizzes} completed quizzes`);
        await this.save();
        
        return this;
    } catch (error) {
        console.error('Error updating leaderboard stats:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    }
};

// Static method to update ranks for a test series
leaderboardEntrySchema.statics.updateRanks = async function(testSeriesId) {
    try {
        // Get all entries for this test series that have at least one completed quiz
        const entries = await this.find({ 
            testSeries: testSeriesId,
            completedQuizzes: { $gt: 0 } // Only include users who have completed at least one quiz
        }).sort({ 
            averagePercentage: -1,      // Primary: Average performance (most important)
            completionPercentage: -1,   // Secondary: How much of the series completed
            totalScore: -1,             // Tertiary: Total points earned
            totalTimeSpent: 1           // Quaternary: Lower time is better (efficiency)
        });

        // Update ranks with proper handling of ties
        let currentRank = 1;
        for (let i = 0; i < entries.length; i++) {
            // Check if this entry has the same performance as the previous one
            if (i > 0) {
                const current = entries[i];
                const previous = entries[i - 1];
                
                // If performance metrics are different, update rank
                if (current.averagePercentage !== previous.averagePercentage ||
                    current.completionPercentage !== previous.completionPercentage ||
                    current.totalScore !== previous.totalScore) {
                    currentRank = i + 1;
                }
                // If all metrics are the same, keep the same rank (tie)
            }
            
            entries[i].rank = currentRank;
            await entries[i].save();
        }

        return entries;
    } catch (error) {
        console.error('Error updating ranks:', error);
        throw error;
    }
};

export const LeaderboardEntry = mongoose.model("LeaderboardEntry", leaderboardEntrySchema);