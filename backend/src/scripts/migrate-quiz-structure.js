#!/usr/bin/env node

/**
 * Migration script to transition from course-based quizzes to test-series-only structure
 * This script will:
 * 1. Find all quizzes that are directly assigned to courses
 * 2. Create default test series for those courses
 * 3. Move quizzes from courses to the new test series
 * 4. Update the quiz model structure
 */

import mongoose from 'mongoose';
import { Quiz } from '../models/quiz.model.js';
import { Course } from '../models/course.model.js';
import { TestSeries } from '../models/testSeries.model.js';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educasheer';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function migrateQuizStructure() {
    console.log('🔄 Starting quiz structure migration...\n');

    try {
        // Step 1: Find all quizzes that are directly assigned to courses (without test series)
        const courseQuizzes = await Quiz.find({
            course: { $exists: true, $ne: null },
            testSeries: { $exists: false }
        }).populate('course', 'title description category creator');

        console.log(`📊 Found ${courseQuizzes.length} quizzes directly assigned to courses\n`);

        if (courseQuizzes.length === 0) {
            console.log('✅ No migration needed - all quizzes are already assigned to test series');
            return;
        }

        // Step 2: Group quizzes by course
        const quizzesByCourse = {};
        courseQuizzes.forEach(quiz => {
            const courseId = quiz.course._id.toString();
            if (!quizzesByCourse[courseId]) {
                quizzesByCourse[courseId] = {
                    course: quiz.course,
                    quizzes: []
                };
            }
            quizzesByCourse[courseId].quizzes.push(quiz);
        });

        console.log(`📚 Found ${Object.keys(quizzesByCourse).length} courses with direct quiz assignments\n`);

        // Step 3: Create default test series for each course and migrate quizzes
        let migratedCount = 0;
        let createdTestSeriesCount = 0;

        for (const [courseId, data] of Object.entries(quizzesByCourse)) {
            const { course, quizzes } = data;

            console.log(`🔄 Processing course: "${course.title}" (${quizzes.length} quizzes)`);

            // Check if a default test series already exists for this course
            let testSeries = await TestSeries.findOne({
                course: courseId,
                title: { $regex: `^${course.title}.*Default.*Test Series$`, $options: 'i' }
            });

            if (!testSeries) {
                // Create a default test series for this course
                testSeries = await TestSeries.create({
                    title: `${course.title} - Default Test Series`,
                    description: `Default test series for ${course.title} course. Contains all quizzes originally assigned directly to the course.`,
                    course: courseId,
                    category: course.category || 'General',
                    difficulty: 'mixed',
                    creator: course.creator,
                    isPublished: true, // Make it published so existing functionality works
                    quizzes: quizzes.map(q => q._id)
                });

                createdTestSeriesCount++;
                console.log(`  ✅ Created default test series: "${testSeries.title}"`);
            } else {
                // Add quizzes to existing test series
                const existingQuizIds = testSeries.quizzes.map(id => id.toString());
                const newQuizIds = quizzes
                    .filter(q => !existingQuizIds.includes(q._id.toString()))
                    .map(q => q._id);

                if (newQuizIds.length > 0) {
                    testSeries.quizzes.push(...newQuizIds);
                    await testSeries.save();
                    console.log(`  ✅ Added ${newQuizIds.length} quizzes to existing test series`);
                }
            }

            // Step 4: Update quizzes to reference the test series instead of course
            for (const quiz of quizzes) {
                await Quiz.findByIdAndUpdate(quiz._id, {
                    testSeries: testSeries._id,
                    $unset: { course: 1 } // Remove the course field
                });
                migratedCount++;
                console.log(`    ✅ Migrated quiz: "${quiz.title}"`);
            }

            // Step 5: Recalculate test series totals
            const allQuizzes = await Quiz.find({ _id: { $in: testSeries.quizzes } });
            const totalQuizzes = allQuizzes.length;
            const totalQuestions = allQuizzes.reduce((total, q) => total + (q.questions?.length || 0), 0);
            const estimatedDuration = allQuizzes.reduce((total, q) => total + (q.timeLimit || 0), 0);

            await TestSeries.findByIdAndUpdate(testSeries._id, {
                totalQuizzes,
                totalQuestions,
                estimatedDuration
            });

            console.log(`  📊 Updated test series totals: ${totalQuizzes} quizzes, ${totalQuestions} questions, ${estimatedDuration} minutes\n`);
        }

        console.log('🎉 Migration completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Created ${createdTestSeriesCount} new test series`);
        console.log(`   - Migrated ${migratedCount} quizzes`);
        console.log(`   - Processed ${Object.keys(quizzesByCourse).length} courses\n`);

        // Step 6: Verify migration
        const remainingCourseQuizzes = await Quiz.find({
            course: { $exists: true, $ne: null },
            testSeries: { $exists: false }
        });

        if (remainingCourseQuizzes.length === 0) {
            console.log('✅ Verification passed: All quizzes are now assigned to test series');
        } else {
            console.log(`⚠️  Warning: ${remainingCourseQuizzes.length} quizzes still directly assigned to courses`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

async function main() {
    try {
        await connectDB();
        await migrateQuizStructure();
        console.log('\n✅ Migration script completed successfully');
    } catch (error) {
        console.error('\n❌ Migration script failed:', error);
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

export { migrateQuizStructure };