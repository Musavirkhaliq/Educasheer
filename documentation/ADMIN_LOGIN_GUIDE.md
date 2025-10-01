# 🔐 Admin Login Guide for Testing JSON Upload

## Quick Fix for the 500 Error

The 500 Internal Server Error you're seeing is because you need to be logged in as an admin user to access the JSON upload functionality.

## Admin Login Credentials

Use these credentials to login as admin:

- **Email**: `admin@educasheer.com`
- **Password**: `educasheer@musa123`

## Step-by-Step Testing Instructions

### 1. Login as Admin
1. Go to `http://localhost:5173`
2. Click "Login" 
3. Enter the admin credentials above
4. You should be redirected to the dashboard

### 2. Access Quiz Management
1. Navigate to Admin Dashboard → Quiz Management
2. You should now see the "Import Questions" button (blue button)

### 3. Test JSON Upload
1. Click the blue "Import Questions" button
2. Fill in the quiz details:
   - Title: "Test Quiz"
   - Description: "Testing JSON import"
   - Select any course
3. In the import section, upload the `test-questions.json` file
4. You should see the questions preview
5. Click "Import Questions" then "Create Quiz"

## Test JSON File

Use this content for testing (save as `test-questions.json`):

```json
[
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
    "explanation": "JavaScript is indeed a programming language."
  }
]
```

## Troubleshooting

### If you still get authentication errors:
1. Check browser console for token information
2. Try logging out and logging back in
3. Clear browser localStorage and try again

### If the "Import Questions" button is not visible:
1. Make sure you're logged in as admin (not regular user)
2. Check that you're in the Quiz Management section
3. Look for the blue button next to "Create Quiz"

## Expected Behavior After Login

Once logged in as admin, you should see:
- ✅ "Import Questions" button in Quiz Management
- ✅ No 500 errors when uploading JSON
- ✅ Question preview and validation
- ✅ Successful quiz creation with imported questions

## Testing the Complete Flow

1. **Login** → Use admin credentials
2. **Navigate** → Admin Dashboard → Quiz Management  
3. **Import** → Click "Import Questions" → Upload JSON
4. **Create** → Fill quiz details → Import questions → Save
5. **Test** → Take the quiz as a student to see explanations

The JSON upload functionality should work perfectly once you're authenticated as an admin user!
