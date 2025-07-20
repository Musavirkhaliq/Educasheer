# Bulk User Creation Script

This script allows you to create multiple users in the database from a JSON file.

## Usage

### Basic Usage
```bash
cd backend
node src/utils/createUsersFromJson.js path/to/users.json
```

### With Options
```bash
# Save detailed results to a JSON file
node src/utils/createUsersFromJson.js users.json --save-results

# Show help
node src/utils/createUsersFromJson.js --help
```

## JSON File Format

The JSON file should contain an array of user objects. Here's the structure:

```json
[
  {
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "password": "securePassword123",
    "role": "learner",
    "tutorStatus": "none",
    "authProvider": "local",
    "isEmailVerified": false,
    "avatar": "https://example.com/avatar.jpg",
    "coverImage": "https://example.com/cover.jpg",
    "currentLevel": 1
  }
]
```

### Required Fields
- `username` (string): Unique username for the user
- `email` (string): Unique email address
- `fullName` (string): User's full name
- `password` (string): User's password (unless using Google OAuth)

### Optional Fields
- `role` (string): User role - "learner", "tutor", or "admin" (default: "learner")
- `tutorStatus` (string): Tutor status - "none", "pending", "approved", or "rejected" (default: "none")
- `authProvider` (string): Authentication provider - "local" or "google" (default: "local")
- `isEmailVerified` (boolean): Whether email is verified (default: false)
- `avatar` (string): URL to user's avatar image (auto-generated if not provided)
- `coverImage` (string): URL to user's cover image
- `currentLevel` (number): User's current level (default: 1)
- `googleId` (string): Google OAuth ID (for Google authenticated users)

## Features

### Validation
- Validates all required fields
- Checks for valid enum values (role, tutorStatus, authProvider)
- Ensures email format is valid
- Validates that password is provided for local auth users

### Duplicate Prevention
- Checks for existing users by username, email, or Google ID
- Skips users that already exist instead of failing

### Password Security
- Automatically hashes passwords using bcrypt
- Uses the same hashing mechanism as the regular user registration

### Gamification Integration
- Automatically initializes gamification data for new users
- Gracefully handles cases where gamification service is unavailable

### Error Handling
- Continues processing even if individual users fail
- Provides detailed error messages for each failure
- Summarizes results at the end

### Results Tracking
- Shows progress during execution
- Provides detailed summary of created, skipped, and failed users
- Optionally saves detailed results to a JSON file

## Example Output

```
Found 8 users to process

Processing user 1/8: alice.johnson@example.com
✅ User created with gamification: alice.johnson@example.com

Processing user 2/8: bob.smith@example.com
✅ User created with gamification: bob.smith@example.com

Processing user 3/8: existing@example.com
⏭️  Skipped: User already exists

==================================================
BULK USER CREATION SUMMARY
==================================================
✅ Created: 6 users
⏭️  Skipped: 1 users
❌ Errors: 1 users

Errors:
- Index 7 (invalid@example): Username is required and must be a string

Database connection closed
```

## Sample File

A sample JSON file (`sample-users.json`) is provided in the backend directory with example user data demonstrating all the different field types and user roles.

## Environment Variables

Make sure your `.env` file contains:
- `MONGO_URL`: MongoDB connection string
- Other required environment variables for your application

## Notes

- The script connects to the same database as your main application
- Users are created with the same validation rules as the regular registration process
- The script will exit with code 0 on success or code 1 on failure
- All usernames and emails are automatically converted to lowercase
- Default avatars are generated using ui-avatars.com if not provided

## Troubleshooting

### Common Issues

1. **Database Connection Failed**: Check your `MONGO_URL` environment variable
2. **File Not Found**: Ensure the JSON file path is correct and the file exists
3. **Invalid JSON**: Validate your JSON file format using a JSON validator
4. **Validation Errors**: Check that all required fields are present and have correct data types
5. **Duplicate Users**: The script will skip existing users - this is normal behavior

### Getting Help

Run the script with `--help` flag to see detailed usage instructions:
```bash
node src/utils/createUsersFromJson.js --help
```
