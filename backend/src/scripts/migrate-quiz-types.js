#!/usr/bin/env node

/**
 * Migration script to update quiz types from old values to new values
 * This script will:
 * 1. Find all quizzes with old quiz types ("quiz", "exam")
 * 2. Update them to new quiz types ("Topic Test", "Subject Test", "Multi Subject", "Full Test")
 * 3. Provide mapping logic based on quiz characteristics
 */

import mongoose from 'mongoose';
import { Quiz } from '../models/quiz.model.js';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educasheer';

// Mapping from old quiz types to new quiz types
const QUIZ_TYPE_MAPPING = {
    'quiz': 'Topic Test',      // Default mapping for old "quiz" type
    'exam': 'Full Test'        // Default mapping for old "exam" type
};

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

function determineNewQuizType(quiz) {
    const questionCount = quiz.questions?.length || 0;
    const timeLimit = quiz.timeLimit || 0;
    const oldType = quiz.quizType;
    return 'Topic Test'
}

async function migrateQuizTypes() {
    console.log('🔄 Starting quiz type migration...\n');

    try {
        // Step 1: Find all quizzes with old quiz types
        const oldQuizzes = await Quiz.find({
            quizType: { $in: ['quiz', 'exam'] }
        });

        console.log(`📊 Found ${oldQuizzes.length} quizzes with old quiz types\n`);

        if (oldQuizzes.length === 0) {
            console.log('✅ No migration needed - all quizzes already have new quiz types');
            return;
        }

        // Step 2: Group by old type for reporting
        const typeStats = {
            'quiz': 0,
            'exam': 0
        };

        oldQuizzes.forEach(quiz => {
            typeStats[quiz.quizType]++;
        });

        console.log('📈 Current distribution:');
        console.log(`   - Quizzes: ${typeStats.quiz}`);
        console.log(`   - Exams: ${typeStats.exam}\n`);

        // Step 3: Update each quiz
        let migratedCount = 0;
        const newTypeStats = {
            'Topic Test': 0,
            'Subject Test': 0,
            'Multi Subject': 0,
            'Full Test': 0
        };

        for (const quiz of oldQuizzes) {
            const oldType = quiz.quizType;
            const newType = determineNewQuizType(quiz);

            await Quiz.findByIdAndUpdate(quiz._id, {
                quizType: newType
            });

            newTypeStats[newType]++;
            migratedCount++;

            console.log(`✅ Updated "${quiz.title}": ${oldType} → ${newType} (${quiz.questions?.length || 0} questions, ${quiz.timeLimit || 0}min)`);
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Migrated ${migratedCount} quizzes`);
        console.log(`\n📈 New distribution:`);
        console.log(`   - Topic Tests: ${newTypeStats['Topic Test']}`);
        console.log(`   - Subject Tests: ${newTypeStats['Subject Test']}`);
        console.log(`   - Multi Subject: ${newTypeStats['Multi Subject']}`);
        console.log(`   - Full Tests: ${newTypeStats['Full Test']}\n`);

        // Step 4: Verify migration
        const remainingOldQuizzes = await Quiz.find({
            quizType: { $in: ['quiz', 'exam'] }
        });

        if (remainingOldQuizzes.length === 0) {
            console.log('✅ Verification passed: All quizzes now have new quiz types');
        } else {
            console.log(`⚠️  Warning: ${remainingOldQuizzes.length} quizzes still have old quiz types`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

async function main() {
    try {
        await connectDB();
        await migrateQuizTypes();
        console.log('\n✅ Quiz type migration completed successfully');
    } catch (error) {
        console.error('\n❌ Quiz type migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
    }
}

// Run the migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { migrateQuizTypes };