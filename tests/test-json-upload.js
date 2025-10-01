// Simple test script to verify JSON upload functionality
import fs from 'fs';
import path from 'path';

// Test the JSON validation logic
const testQuestions = [
  {
    "text": "What is the capital of France?",
    "type": "multiple_choice",
    "options": [
      {"text": "London", "isCorrect": false},
      {"text": "Paris", "isCorrect": true},
      {"text": "Berlin", "isCorrect": false}
    ],
    "points": 1,
    "explanation": "Paris is the capital and largest city of France."
  },
  {
    "text": "JavaScript is a programming language.",
    "type": "true_false",
    "options": [
      {"text": "True", "isCorrect": true},
      {"text": "False", "isCorrect": false}
    ],
    "points": 1,
    "explanation": "JavaScript is indeed a programming language used for web development."
  },
  {
    "text": "What does HTML stand for?",
    "type": "short_answer",
    "correctAnswer": "HyperText Markup Language",
    "points": 2,
    "explanation": "HTML stands for HyperText Markup Language, used to create web pages."
  }
];

// Validation function (similar to what's in the controller)
function validateQuestions(questionsData) {
  if (!Array.isArray(questionsData)) {
    throw new Error("JSON must contain an array of questions");
  }

  if (questionsData.length === 0) {
    throw new Error("JSON file must contain at least one question");
  }

  const validatedQuestions = [];
  for (let i = 0; i < questionsData.length; i++) {
    const question = questionsData[i];
    
    // Required fields validation
    if (!question.text || typeof question.text !== 'string') {
      throw new Error(`Question ${i + 1}: 'text' field is required and must be a string`);
    }

    if (!question.type) {
      question.type = 'multiple_choice'; // Default type
    }

    if (!['multiple_choice', 'true_false', 'short_answer', 'essay'].includes(question.type)) {
      throw new Error(`Question ${i + 1}: Invalid question type. Must be one of: multiple_choice, true_false, short_answer, essay`);
    }

    // Validate options for multiple choice questions
    if (question.type === 'multiple_choice') {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new Error(`Question ${i + 1}: Multiple choice questions must have at least 2 options`);
      }

      let hasCorrectAnswer = false;
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        if (!option.text || typeof option.text !== 'string') {
          throw new Error(`Question ${i + 1}, Option ${j + 1}: 'text' field is required and must be a string`);
        }
        if (typeof option.isCorrect !== 'boolean') {
          throw new Error(`Question ${i + 1}, Option ${j + 1}: 'isCorrect' field is required and must be a boolean`);
        }
        if (option.isCorrect) {
          hasCorrectAnswer = true;
        }
      }

      if (!hasCorrectAnswer) {
        throw new Error(`Question ${i + 1}: At least one option must be marked as correct`);
      }
    }

    // Validate short answer questions
    if (question.type === 'short_answer') {
      if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
        throw new Error(`Question ${i + 1}: Short answer questions must have a 'correctAnswer' field`);
      }
    }

    // Set default points if not provided
    if (typeof question.points !== 'number' || question.points < 0) {
      question.points = 1;
    }

    validatedQuestions.push({
      text: question.text.trim(),
      type: question.type,
      options: question.options || [],
      correctAnswer: question.correctAnswer || '',
      points: question.points,
      explanation: question.explanation ? question.explanation.trim() : ''
    });
  }

  return validatedQuestions;
}

// Test the validation
try {
  console.log('Testing JSON validation...');
  const validated = validateQuestions(testQuestions);
  console.log('✅ Validation passed!');
  console.log(`Validated ${validated.length} questions:`);
  
  validated.forEach((q, i) => {
    console.log(`${i + 1}. ${q.text} (${q.type}, ${q.points} points)`);
    if (q.explanation) {
      console.log(`   Explanation: ${q.explanation}`);
    }
  });
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
}

// Test invalid JSON
console.log('\nTesting invalid JSON...');
const invalidQuestions = [
  {
    "text": "Invalid question",
    "type": "multiple_choice",
    "options": [
      {"text": "Option 1", "isCorrect": false}
      // Missing second option and correct answer
    ]
  }
];

try {
  validateQuestions(invalidQuestions);
  console.log('❌ Should have failed validation');
} catch (error) {
  console.log('✅ Correctly caught validation error:', error.message);
}

console.log('\n🎉 JSON upload validation tests completed!');
