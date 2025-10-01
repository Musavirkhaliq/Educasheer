/**
 * Test script to verify the test series sections implementation
 * This script tests the new section-based organization feature
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testSectionsImplementation() {
  console.log('🧪 Testing Test Series Sections Implementation\n');

  try {
    // 1. Create a test series
    console.log('1. Creating a test series...');
    const testSeriesResponse = await api.post('/test-series', {
      title: 'Mathematics Test Series with Sections',
      description: 'A comprehensive math test series organized by chapters',
      category: 'Mathematics',
      difficulty: 'medium',
      examType: 'JEE',
      subject: 'Mathematics'
    });
    
    const testSeriesId = testSeriesResponse.data.data._id;
    console.log(`✅ Test series created with ID: ${testSeriesId}\n`);

    // 2. Add sections to the test series
    console.log('2. Adding sections to test series...');
    
    const sections = [
      {
        title: 'Chapter 1: Algebra',
        description: 'Basic algebraic concepts and equations',
        order: 0
      },
      {
        title: 'Chapter 2: Geometry',
        description: 'Geometric shapes and theorems',
        order: 1
      },
      {
        title: 'Chapter 3: Calculus',
        description: 'Differential and integral calculus',
        order: 2
      }
    ];

    const createdSections = [];
    for (const section of sections) {
      const sectionResponse = await api.post(`/test-series/${testSeriesId}/sections`, section);
      createdSections.push(sectionResponse.data.data);
      console.log(`✅ Section created: ${section.title}`);
    }
    console.log('');

    // 3. Create some test quizzes
    console.log('3. Creating test quizzes...');
    
    const quizzes = [
      {
        title: 'Linear Equations Quiz',
        description: 'Test your knowledge of linear equations',
        timeLimit: 30,
        passingScore: 60,
        testSeries: testSeriesId,
        questions: [
          {
            text: 'What is the solution to 2x + 5 = 11?',
            type: 'multiple-choice',
            options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
            correctAnswer: 1,
            points: 10
          },
          {
            text: 'Solve for y: 3y - 7 = 14',
            type: 'multiple-choice',
            options: ['y = 5', 'y = 6', 'y = 7', 'y = 8'],
            correctAnswer: 2,
            points: 10
          }
        ]
      },
      {
        title: 'Quadratic Equations Quiz',
        description: 'Advanced algebra with quadratic equations',
        timeLimit: 45,
        passingScore: 70,
        testSeries: testSeriesId,
        questions: [
          {
            text: 'What are the roots of x² - 5x + 6 = 0?',
            type: 'multiple-choice',
            options: ['x = 1, 6', 'x = 2, 3', 'x = -2, -3', 'x = 0, 5'],
            correctAnswer: 1,
            points: 15
          }
        ]
      },
      {
        title: 'Triangle Properties Quiz',
        description: 'Basic properties of triangles',
        timeLimit: 25,
        passingScore: 60,
        testSeries: testSeriesId,
        questions: [
          {
            text: 'What is the sum of angles in a triangle?',
            type: 'multiple-choice',
            options: ['90°', '180°', '270°', '360°'],
            correctAnswer: 1,
            points: 10
          }
        ]
      },
      {
        title: 'Derivatives Quiz',
        description: 'Basic differentiation problems',
        timeLimit: 40,
        passingScore: 75,
        testSeries: testSeriesId,
        questions: [
          {
            text: 'What is the derivative of x²?',
            type: 'multiple-choice',
            options: ['x', '2x', 'x²', '2x²'],
            correctAnswer: 1,
            points: 15
          }
        ]
      }
    ];

    const createdQuizzes = [];
    for (const quiz of quizzes) {
      const quizResponse = await api.post('/quizzes', quiz);
      createdQuizzes.push(quizResponse.data.data);
      console.log(`✅ Quiz created: ${quiz.title}`);
    }
    console.log('');

    // 4. Organize quizzes into sections
    console.log('4. Organizing quizzes into sections...');
    
    // Get the updated test series with sections
    const updatedTestSeries = await api.get(`/test-series/${testSeriesId}`);
    const sectionsWithIds = updatedTestSeries.data.data.sections;
    
    // Add quizzes to appropriate sections
    const algebraSection = sectionsWithIds.find(s => s.title.includes('Algebra'));
    const geometrySection = sectionsWithIds.find(s => s.title.includes('Geometry'));
    const calculusSection = sectionsWithIds.find(s => s.title.includes('Calculus'));
    
    // Add algebra quizzes
    await api.post(`/test-series/${testSeriesId}/sections/${algebraSection._id}/quizzes/${createdQuizzes[0]._id}`);
    await api.post(`/test-series/${testSeriesId}/sections/${algebraSection._id}/quizzes/${createdQuizzes[1]._id}`);
    console.log('✅ Added algebra quizzes to Algebra section');
    
    // Add geometry quiz
    await api.post(`/test-series/${testSeriesId}/sections/${geometrySection._id}/quizzes/${createdQuizzes[2]._id}`);
    console.log('✅ Added geometry quiz to Geometry section');
    
    // Add calculus quiz
    await api.post(`/test-series/${testSeriesId}/sections/${calculusSection._id}/quizzes/${createdQuizzes[3]._id}`);
    console.log('✅ Added calculus quiz to Calculus section');
    console.log('');

    // 5. Verify the final structure
    console.log('5. Verifying final test series structure...');
    const finalTestSeries = await api.get(`/test-series/${testSeriesId}`);
    const finalData = finalTestSeries.data.data;
    
    console.log(`📊 Test Series: ${finalData.title}`);
    console.log(`📊 Total Sections: ${finalData.sections.length}`);
    console.log(`📊 Total Quizzes: ${finalData.totalQuizzes}`);
    console.log(`📊 Total Questions: ${finalData.totalQuestions}`);
    console.log(`📊 Estimated Duration: ${finalData.estimatedDuration} minutes\n`);
    
    finalData.sections.forEach((section, index) => {
      console.log(`📁 Section ${index + 1}: ${section.title}`);
      console.log(`   Description: ${section.description}`);
      console.log(`   Quizzes: ${section.quizzes.length}`);
      section.quizzes.forEach((quiz, qIndex) => {
        console.log(`   ${qIndex + 1}. ${quiz.title} (${quiz.questions?.length || 0} questions, ${quiz.timeLimit} min)`);
      });
      console.log('');
    });

    // 6. Test section management operations
    console.log('6. Testing section management operations...');
    
    // Update a section
    await api.put(`/test-series/${testSeriesId}/sections/${algebraSection._id}`, {
      title: 'Chapter 1: Advanced Algebra',
      description: 'Advanced algebraic concepts including quadratic equations'
    });
    console.log('✅ Updated section title and description');
    
    // Test reordering sections
    const reorderData = [
      { sectionId: calculusSection._id, order: 0 },
      { sectionId: algebraSection._id, order: 1 },
      { sectionId: geometrySection._id, order: 2 }
    ];
    await api.put(`/test-series/${testSeriesId}/sections/reorder`, { sectionOrders: reorderData });
    console.log('✅ Reordered sections (Calculus first, then Algebra, then Geometry)');
    
    console.log('\n🎉 All tests passed! Sections implementation is working correctly.');
    console.log(`\n🔗 Test Series ID for manual testing: ${testSeriesId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.details) {
      console.error('Error details:', error.response.data.details);
    }
  }
}

// Run the test
if (require.main === module) {
  testSectionsImplementation();
}

module.exports = { testSectionsImplementation };