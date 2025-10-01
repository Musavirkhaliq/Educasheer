/**
 * Test script to create a test series linked to a course
 * This will help us test the CourseTestSeries component
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

// You need to get an admin token from the web interface and paste it here
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

const testConfig = {
  course: {
    title: 'Test Course for Test Series',
    description: 'A test course to demonstrate test series integration',
    category: 'Technology',
    level: 'beginner',
    price: 0,
    isPublished: true
  },
  testSeries: {
    title: 'Sample Test Series for Course',
    description: 'A test series linked to the test course to demonstrate the integration',
    category: 'Technology',
    difficulty: 'medium',
    price: 0,
    isPublished: true
  },
  quiz: {
    title: 'Sample Quiz in Test Series',
    description: 'A sample quiz to populate the test series',
    timeLimit: 30,
    passingScore: 70,
    quizType: 'quiz',
    difficulty: 'medium',
    questions: [
      {
        text: 'What is 2 + 2?',
        type: 'multiple-choice',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        points: 10,
        explanation: '2 + 2 equals 4'
      },
      {
        text: 'What is the capital of France?',
        type: 'multiple-choice',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        points: 10,
        explanation: 'Paris is the capital of France'
      }
    ]
  }
};

async function createTestData() {
  console.log('🧪 Creating test data: Course → Test Series → Quiz\n');

  if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
    console.log('❌ Please set ADMIN_TOKEN in the script');
    console.log('   1. Login as admin in the web interface');
    console.log('   2. Open browser dev tools → Application → Local Storage');
    console.log('   3. Copy the "accessToken" value');
    console.log('   4. Replace ADMIN_TOKEN in this script');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  };

  let courseId, testSeriesId, quizId;

  try {
    // Step 1: Create a course
    console.log('1. Creating course...');
    const courseResponse = await axios.post(`${BASE_URL}/courses`, testConfig.course, { headers });
    courseId = courseResponse.data.data._id;
    console.log(`✅ Course created with ID: ${courseId}\n`);

    // Step 2: Create a test series linked to the course
    console.log('2. Creating test series linked to course...');
    const testSeriesData = {
      ...testConfig.testSeries,
      course: courseId // Link to the course
    };
    
    const testSeriesResponse = await axios.post(`${BASE_URL}/test-series`, testSeriesData, { headers });
    testSeriesId = testSeriesResponse.data.data._id;
    console.log(`✅ Test series created with ID: ${testSeriesId}\n`);

    // Step 3: Create a quiz
    console.log('3. Creating quiz...');
    const quizData = {
      ...testConfig.quiz,
      testSeries: testSeriesId // Link to the test series
    };
    
    const quizResponse = await axios.post(`${BASE_URL}/quizzes`, quizData, { headers });
    quizId = quizResponse.data.data._id;
    console.log(`✅ Quiz created with ID: ${quizId}\n`);

    // Step 4: Add quiz to test series
    console.log('4. Adding quiz to test series...');
    await axios.post(`${BASE_URL}/test-series/${testSeriesId}/quizzes/${quizId}`, {}, { headers });
    console.log('✅ Quiz added to test series\n');

    // Step 5: Test fetching test series for course
    console.log('5. Testing course test series fetching...');
    const courseTestSeriesResponse = await axios.get(`${BASE_URL}/test-series?course=${courseId}`, { headers });
    const foundTestSeries = courseTestSeriesResponse.data.data;
    
    if (foundTestSeries.length > 0) {
      console.log(`✅ Found ${foundTestSeries.length} test series for course`);
      console.log(`   Test series: "${foundTestSeries[0].title}"`);
    } else {
      console.log('❌ No test series found for course');
    }

    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Course ID: ${courseId}`);
    console.log(`   Test Series ID: ${testSeriesId}`);
    console.log(`   Quiz ID: ${quizId}`);
    console.log(`\n🌐 You can now visit: http://localhost:3000/courses/${courseId}`);
    console.log('   to see the test series in the course page');

  } catch (error) {
    console.error('❌ Error creating test data:', error.response?.data || error.message);
    
    // Cleanup on error
    if (quizId) {
      try {
        await axios.delete(`${BASE_URL}/quizzes/${quizId}`, { headers });
        console.log('🧹 Cleaned up quiz');
      } catch (e) {}
    }
    if (testSeriesId) {
      try {
        await axios.delete(`${BASE_URL}/test-series/${testSeriesId}`, { headers });
        console.log('🧹 Cleaned up test series');
      } catch (e) {}
    }
    if (courseId) {
      try {
        await axios.delete(`${BASE_URL}/courses/${courseId}`, { headers });
        console.log('🧹 Cleaned up course');
      } catch (e) {}
    }
  }
}

createTestData();