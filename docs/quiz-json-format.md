# Quiz JSON Import Format

This document describes the JSON format for importing quiz questions into the Educasheer platform.

## Overview

The JSON file should contain an array of question objects. Each question object represents a single quiz question with its options, correct answers, and explanations.

## Supported Question Types

1. **multiple_choice** - Questions with multiple options where one or more can be correct
2. **true_false** - True/False questions
3. **short_answer** - Questions requiring a short text answer
4. **essay** - Questions requiring a longer text response

## JSON Structure

```json
[
  {
    "text": "Question text here",
    "type": "multiple_choice",
    "options": [
      {"text": "Option 1", "isCorrect": false},
      {"text": "Option 2", "isCorrect": true},
      {"text": "Option 3", "isCorrect": false}
    ],
    "points": 1,
    "explanation": "Explanation of the correct answer"
  }
]
```

## Field Descriptions

### Required Fields

- **text** (string): The question text
- **type** (string): Question type - one of: `multiple_choice`, `true_false`, `short_answer`, `essay`

### Optional Fields

- **points** (number): Points awarded for correct answer (default: 1)
- **explanation** (string): Explanation shown after quiz completion

### Type-Specific Fields

#### Multiple Choice Questions
- **options** (array): Array of option objects
  - **text** (string): Option text
  - **isCorrect** (boolean): Whether this option is correct

#### True/False Questions
- **options** (array): Array with exactly 2 options for True/False
  - If not provided, will auto-generate True/False options
  - One option must be marked as correct

#### Short Answer Questions
- **correctAnswer** (string): The expected correct answer

#### Essay Questions
- No additional fields required (manually graded)

## Validation Rules

1. **Question text** must be a non-empty string
2. **Question type** must be one of the supported types
3. **Multiple choice** questions must have at least 2 options with at least one correct answer
4. **True/false** questions must have exactly one correct answer
5. **Short answer** questions must have a correctAnswer field
6. **Points** must be a positive number (defaults to 1)
7. **Explanation** is optional but must be a string if provided

## Sample Files

### Multiple Choice Example
```json
[
  {
    "text": "What is the capital of France?",
    "type": "multiple_choice",
    "options": [
      {"text": "London", "isCorrect": false},
      {"text": "Paris", "isCorrect": true},
      {"text": "Berlin", "isCorrect": false},
      {"text": "Madrid", "isCorrect": false}
    ],
    "points": 1,
    "explanation": "Paris is the capital and largest city of France."
  }
]
```

### True/False Example
```json
[
  {
    "text": "The Earth is flat.",
    "type": "true_false",
    "options": [
      {"text": "True", "isCorrect": false},
      {"text": "False", "isCorrect": true}
    ],
    "points": 1,
    "explanation": "The Earth is a sphere, not flat. This has been scientifically proven."
  }
]
```

### Short Answer Example
```json
[
  {
    "text": "What is 2 + 2?",
    "type": "short_answer",
    "correctAnswer": "4",
    "points": 1,
    "explanation": "2 + 2 equals 4 in basic arithmetic."
  }
]
```

### Mixed Question Types Example
```json
[
  {
    "text": "Which programming language is known for its use in web development?",
    "type": "multiple_choice",
    "options": [
      {"text": "Python", "isCorrect": false},
      {"text": "JavaScript", "isCorrect": true},
      {"text": "C++", "isCorrect": false},
      {"text": "Assembly", "isCorrect": false}
    ],
    "points": 2,
    "explanation": "JavaScript is primarily used for web development, both frontend and backend."
  },
  {
    "text": "HTML stands for HyperText Markup Language.",
    "type": "true_false",
    "options": [
      {"text": "True", "isCorrect": true},
      {"text": "False", "isCorrect": false}
    ],
    "points": 1,
    "explanation": "HTML indeed stands for HyperText Markup Language."
  },
  {
    "text": "What does CSS stand for?",
    "type": "short_answer",
    "correctAnswer": "Cascading Style Sheets",
    "points": 1,
    "explanation": "CSS stands for Cascading Style Sheets, used for styling web pages."
  },
  {
    "text": "Explain the difference between HTML and CSS.",
    "type": "essay",
    "points": 5,
    "explanation": "HTML provides structure and content, while CSS provides styling and layout."
  }
]
```

## Error Handling

The system will validate your JSON file and provide specific error messages for:
- Invalid JSON format
- Missing required fields
- Invalid question types
- Incorrect option structures
- Missing correct answers

## Best Practices

1. **Use clear, concise question text**
2. **Provide meaningful explanations** to help students learn
3. **Set appropriate point values** based on question difficulty
4. **Test your JSON file** with a small sample before importing large sets
5. **Use consistent formatting** for better readability
6. **Include diverse question types** for comprehensive assessment

## File Size Limits

- Maximum file size: 16MB
- Recommended: Keep individual JSON files under 1MB for better performance
- For large question sets, consider splitting into multiple files

## Import Process

1. Navigate to Quiz Management → Create/Edit Quiz
2. Click "Import JSON" button
3. Select your JSON file
4. Review the preview of imported questions
5. Click "Import Questions" to add them to your quiz
6. Save the quiz to persist changes

## Troubleshooting

### Common Issues

1. **"Invalid JSON format"** - Check for syntax errors, missing commas, or brackets
2. **"Question must have correct answer"** - Ensure at least one option is marked as correct
3. **"Invalid question type"** - Use only supported types: multiple_choice, true_false, short_answer, essay
4. **"Options array required"** - Multiple choice questions need an options array

### Validation Tools

You can use online JSON validators to check your file format before importing:
- JSONLint.com
- JSON Formatter & Validator

For questions or support, contact the system administrator.
