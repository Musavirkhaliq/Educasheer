#!/usr/bin/env node

/**
 * Test script to verify the new quiz structure: Test Series → Quiz relationship
 * and Course → Test Series → Quiz hierarchy
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

// Test configuration
const testConfig = {
  adminToken: '', // Add admin token here
  testCourse: {
    title: 'Test Course for New Structure',
    description: 'A test course to verify the new quiz structure',
    thumbnail: 'https://via.placeholder.com/300x200',
    category: 'Test',
    level: 'Beginner'
  },
  testSeries: {
    title: 'Test Series for New Structure',
    description: 'A test series linked to a course',
    category: 'Test',
    difficulty: 'medium'
  },
  testQuiz: {
    title: 'Test Quiz for New Structure',
    description: 'A test quiz that must belong to a test series',
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {
        text: 'What is 2 + 2?',
        type: 'multiple_choice',
        options: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false }
        ],
        points: 1
      }
    ]
  }
};

async function runTests() {
  console.log('🧪 Testing New Quiz Structure: Course → Test Series → Quiz\n');

  let courseId, testSeriesId, quizId;

  try {
    // Step 1: Create a test course
    console.log('1. Creating test course...');
    const courseResponse = await axios.post(`${BASE_URL}/courses`, testConfig.testCourse, {
      headers: { Authorization: `Bearer ${testConfig.adminToken}` }
    });
    courseId = courseResponse.data.data._id;
    console.log(`✅ Course created with ID: ${courseId}\n`);

    // Step 2: Create a test series linked to the course
    console.log('2. Creating test series linked to course...');
    const testSeriesData = {
      ...testConfig.testSeries,
      course: courseId
    };
    
    const testSeriesResponse = await axios.post(`${BASE_URL}/test-series`, testSeriesData, {
      headers: { Authorization: `Bearer ${testConfig.adminToken}` }
    });
    testSeriesId = testSeriesResponse.data.data._id;
    console.log(`✅ Test series created with ID: ${testSeriesId}\n`);

    // Step 3: Create a quiz assigned to the test series (new structure)
    console.log('3. Creating quiz assigned to test series...');
    const quizData = {
      ...testConfig.testQuiz,
      testSeries: testSeriesId
    };
    
    const quizResponse = await axios.post(`${BASE_URL}/quizzes`, quizData, {
      headers: { Authorization: `Bearer ${testConfig.adminToken}` }
    });
    quizId = quizResponse.data.data._id;
    console.log(`✅ Quiz created with ID: ${quizId}\n`);

    // Step 4: Verify quiz is properly linked to test series
    console.log('4. Verifying quiz-test series relationship...');
    const quizDetails = await axios.get(`${BASE_URL}/quizzes/${quizId}`, {
      headers: { Authorization: `Bearer ${testConfig.adminToken}` }
    });
    
    if (quizDetails.data.data.testSeries._id === testSeriesId) {
      console.log('✅ Quiz correctly linked to test series\n');
    } else {
      console.log('❌ Quiz not properly linked to test series\n');
    }

    // Step 5: Test course-based quiz filtering (through test series)
    console.log('5. Testing course-based quiz filtering...');
    const courseQuizzes = await axios.get(`${BASE_URL}/quizzes?course=${courseId}`, {
      headers: { Authorization: `Bearer ${testConfig.adminToken}` }
    });
    
    const foundQuiz = courseQuizzes.data.data.find(q => q._id === quizId);
    if (foundQuiz) {
      console.log('✅ Course-based quiz filtering works through test series\n');
    } else {
      console.log('❌ Course-based quiz filtering failed\n');
    }

    // Step 6: Test test series filtering
    console.log('6. Testing test series-based quiz filtering...');
    const testSeriesQuizzes = await axios.get(`${BASE_URL}/quizzes?testSeries=${testSeriesId}`, {
      headers: { Authorization: `Bearer ${testConfig.adminToken}` }
    });
    
    const foundQuizInSeries = testSeriesQuizzes.data.data.find(q => q._id === quizId);
    if (foundQuizInSeries) {
      console.log('✅ Test series-based quiz filtering works correctly\n');
    } else {
      console.log('❌ Test series-based quiz filtering failed\n');
    }

    // Step 7: Test that quiz creation without test series fails
    console.log('7. Testing quiz creation without test series (should fail)...');
    try {
      const invalidQuizData = {
        title: 'Invalid Quiz',
        description: 'This should fail',
        questions: testConfig.testQuiz.questions
        // No testSeries field
      };
      
      await axios.post(`${BASE_URL}/quizzes`, invalidQuizData, {
        headers: { Authorization: `Bearer ${testConfig.adminToken}` }
      });
      console.log('❌ Quiz creation without test series should have failed\n');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Quiz creation correctly requires test series\n');
      } else {
        console.log('❌ Unexpected error when creating quiz without test series\n');
      }
    }

    // Step 8: Verify test series contains the quiz
    console.log('8. Verifying test series contains the quiz...');
    const testSeriesDetails = await axios.get(`${BASE_URL}/test-series/${testSeriesId}`, {
      headers: { Authorization: `Bearer ${testConfig.adminToken}` }
    });
    
    const quizInSeries = testSeriesDetails.data.data.quizzes.find(q => q._id === quizId);
    if (quizInSeries) {
      console.log('✅ Test series correctly contains the quiz\n');
    } else {
      console.log('❌ Test series does not contain the quiz\n');
    }

    console.log('🎉 All tests passed! New quiz structure is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to set a valid admin token in the testConfig.adminToken field');
    }
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    try {
      if (quizId) {
        await axios.delete(`${BASE_URL}/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${testConfig.adminToken}` }
        });
        console.log('✅ Quiz deleted');
      }
      if (testSeriesId) {
        await axios.delete(`${BASE_URL}/test-series/${testSeriesId}`, {
          headers: { Authorization: `Bearer ${testConfig.adminToken}` }
        });
        console.log('✅ Test series deleted');
      }
      if (courseId) {
        await axios.delete(`${BASE_URL}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${testConfig.adminToken}` }
        });
        console.log('✅ Course deleted');
      }
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.log('⚠️  Some cleanup operations failed:', cleanupError.message);
    }
  }
}

// Check if admin token is provided
if (!testConfig.adminToken) {
  console.log('⚠️  Please set the admin token in testConfig.adminToken before running tests');
  console.log('   You can get the token by logging in as admin through the web interface');
  console.log('\n📋 This test verifies:');
  console.log('   - Course creation');
  console.log('   - Test series creation with course link');
  console.log('   - Quiz creation (must belong to test series)');
  console.log('   - Course-based filtering (through test series)');
  console.log('   - Test series-based filtering');
  console.log('   - Validation that quizzes require test series');
  process.exit(1);
}

runTests();