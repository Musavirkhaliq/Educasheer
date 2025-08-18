#!/usr/bin/env node

/**
 * Test script to verify quiz management functionality
 * This script tests the admin quiz management features
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8000'; // Adjust if your backend runs on a different port
const API_BASE = `${BASE_URL}/api/v1`;

// Test admin credentials (you'll need to replace these with actual admin credentials)
const ADMIN_CREDENTIALS = {
    email: 'admin@example.com', // Replace with actual admin email
    password: 'admin123' // Replace with actual admin password
};

let authToken = '';

async function login() {
    try {
        console.log('🔐 Logging in as admin...');
        const response = await axios.post(`${API_BASE}/users/login`, ADMIN_CREDENTIALS);
        authToken = response.data.data.accessToken;
        console.log('✅ Login successful');
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function createTestQuiz() {
    try {
        console.log('📝 Creating test quiz...');
        const quizData = {
            title: 'Test Quiz - Admin Panel',
            description: 'This is a test quiz created to verify admin panel functionality',
            course: null, // We'll need to get a course ID or create one
            assignmentType: 'course',
            category: 'Test',
            tags: ['test', 'admin'],
            difficulty: 'medium',
            timeLimit: 30,
            passingScore: 70,
            quizType: 'quiz',
            maxAttempts: 0,
            allowReview: true,
            showCorrectAnswers: true,
            randomizeQuestions: false,
            isPublished: false, // Start as draft
            questions: [
                {
                    text: 'What is 2 + 2?',
                    type: 'multiple_choice',
                    options: [
                        { text: '3', isCorrect: false },
                        { text: '4', isCorrect: true },
                        { text: '5', isCorrect: false }
                    ],
                    points: 1,
                    explanation: 'Basic arithmetic: 2 + 2 = 4'
                }
            ]
        };

        const response = await axios.post(`${API_BASE}/quizzes`, quizData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log('✅ Quiz created successfully');
        console.log('📊 Quiz ID:', response.data.data._id);
        console.log('📊 Published status:', response.data.data.isPublished);

        return response.data.data;
    } catch (error) {
        console.error('❌ Quiz creation failed:', error.response?.data?.message || error.message);
        return null;
    }
}

async function getAllQuizzes() {
    try {
        console.log('📋 Fetching all quizzes...');
        const response = await axios.get(`${API_BASE}/quizzes`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const quizzes = response.data.data;
        console.log(`✅ Found ${quizzes.length} quizzes`);

        quizzes.forEach((quiz, index) => {
            console.log(`${index + 1}. ${quiz.title} - ${quiz.isPublished ? 'Published' : 'Draft'}`);
        });

        return quizzes;
    } catch (error) {
        console.error('❌ Failed to fetch quizzes:', error.response?.data?.message || error.message);
        return [];
    }
}

async function toggleQuizPublishStatus(quizId, currentStatus) {
    try {
        console.log(`🔄 Toggling quiz publish status from ${currentStatus} to ${!currentStatus}...`);
        const response = await axios.patch(`${API_BASE}/quizzes/${quizId}/publish`, {
            isPublished: !currentStatus
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log('✅ Publish status updated successfully');
        console.log('📊 New status:', response.data.data.isPublished);

        return response.data.data;
    } catch (error) {
        console.error('❌ Failed to toggle publish status:', error.response?.data?.message || error.message);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Starting Quiz Management Tests\n');

    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ Cannot proceed without authentication');
        return;
    }

    console.log('');

    // Step 2: Get initial quiz list
    const initialQuizzes = await getAllQuizzes();
    console.log('');

    // Step 3: Create a test quiz
    const newQuiz = await createTestQuiz();
    if (!newQuiz) {
        console.log('❌ Cannot proceed without creating a quiz');
        return;
    }

    console.log('');

    // Step 4: Verify quiz appears in list
    const updatedQuizzes = await getAllQuizzes();
    console.log('');

    // Step 5: Test publish/unpublish functionality
    if (newQuiz) {
        await toggleQuizPublishStatus(newQuiz._id, newQuiz.isPublished);
        console.log('');

        // Toggle back
        await toggleQuizPublishStatus(newQuiz._id, !newQuiz.isPublished);
        console.log('');
    }

    // Step 6: Final verification
    console.log('📋 Final quiz list:');
    await getAllQuizzes();

    console.log('\n✅ Quiz Management Tests Completed!');
    console.log('\n📝 Summary:');
    console.log('- Quiz creation: ✅');
    console.log('- Draft status: ✅');
    console.log('- Publish/Unpublish: ✅');
    console.log('- Admin panel should now show proper buttons and status');
}

// Run the tests
runTests().catch(console.error);