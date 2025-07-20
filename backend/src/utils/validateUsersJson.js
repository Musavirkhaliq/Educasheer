import fs from "fs";
import path from "path";

// Validate user data structure
const validateUserData = (userData, index) => {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  if (!userData.username || typeof userData.username !== 'string') {
    errors.push('Username is required and must be a string');
  } else if (userData.username.length < 3) {
    warnings.push('Username should be at least 3 characters long');
  }
  
  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Email format is invalid');
    }
  }
  
  if (!userData.fullName || typeof userData.fullName !== 'string') {
    errors.push('Full name is required and must be a string');
  }
  
  // Password validation (required unless using Google auth)
  if (!userData.password && !userData.googleId) {
    errors.push('Password is required when not using Google auth');
  } else if (userData.password && userData.password.length < 6) {
    warnings.push('Password should be at least 6 characters long');
  }
  
  // Validate optional fields if present
  if (userData.role && !['learner', 'tutor', 'admin'].includes(userData.role)) {
    errors.push('Role must be one of: learner, tutor, admin');
  }
  
  if (userData.tutorStatus && !['none', 'pending', 'approved', 'rejected'].includes(userData.tutorStatus)) {
    errors.push('Tutor status must be one of: none, pending, approved, rejected');
  }
  
  if (userData.authProvider && !['local', 'google'].includes(userData.authProvider)) {
    errors.push('Auth provider must be one of: local, google');
  }
  
  if (userData.isEmailVerified && typeof userData.isEmailVerified !== 'boolean') {
    errors.push('isEmailVerified must be a boolean');
  }
  
  if (userData.currentLevel && (typeof userData.currentLevel !== 'number' || userData.currentLevel < 1)) {
    errors.push('currentLevel must be a positive number');
  }
  
  // URL validation for avatar and coverImage
  if (userData.avatar && typeof userData.avatar !== 'string') {
    errors.push('Avatar must be a string (URL)');
  }
  
  if (userData.coverImage && typeof userData.coverImage !== 'string') {
    errors.push('Cover image must be a string (URL)');
  }
  
  // Google auth specific validation
  if (userData.authProvider === 'google' && !userData.googleId) {
    warnings.push('Google auth provider specified but no googleId provided');
  }
  
  if (userData.googleId && userData.authProvider !== 'google') {
    warnings.push('googleId provided but authProvider is not set to "google"');
  }
  
  return { errors, warnings };
};

// Main validation function
const validateUsersJson = (jsonFilePath) => {
  try {
    console.log(`Validating JSON file: ${jsonFilePath}`);
    console.log('='.repeat(50));
    
    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ Error: File '${jsonFilePath}' does not exist`);
      return false;
    }
    
    // Read and parse JSON
    let usersData;
    try {
      const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
      usersData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error(`❌ JSON Parse Error: ${parseError.message}`);
      return false;
    }
    
    // Check if it's an array
    if (!Array.isArray(usersData)) {
      console.error('❌ Error: JSON file must contain an array of user objects');
      return false;
    }
    
    if (usersData.length === 0) {
      console.error('❌ Error: JSON file contains an empty array');
      return false;
    }
    
    console.log(`📊 Found ${usersData.length} users to validate\n`);
    
    const results = {
      valid: 0,
      invalid: 0,
      warnings: 0,
      duplicates: {
        usernames: new Set(),
        emails: new Set(),
        googleIds: new Set()
      }
    };
    
    const duplicateTracker = {
      usernames: new Map(),
      emails: new Map(),
      googleIds: new Map()
    };
    
    // Validate each user
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const userIndex = i + 1;
      
      console.log(`Validating user ${userIndex}: ${userData.email || userData.username || 'Unknown'}`);
      
      const { errors, warnings } = validateUserData(userData, i);
      
      // Check for duplicates within the file
      if (userData.username) {
        const username = userData.username.toLowerCase();
        if (duplicateTracker.usernames.has(username)) {
          errors.push(`Duplicate username found (also at index ${duplicateTracker.usernames.get(username) + 1})`);
          results.duplicates.usernames.add(username);
        } else {
          duplicateTracker.usernames.set(username, i);
        }
      }
      
      if (userData.email) {
        const email = userData.email.toLowerCase();
        if (duplicateTracker.emails.has(email)) {
          errors.push(`Duplicate email found (also at index ${duplicateTracker.emails.get(email) + 1})`);
          results.duplicates.emails.add(email);
        } else {
          duplicateTracker.emails.set(email, i);
        }
      }
      
      if (userData.googleId) {
        if (duplicateTracker.googleIds.has(userData.googleId)) {
          errors.push(`Duplicate googleId found (also at index ${duplicateTracker.googleIds.get(userData.googleId) + 1})`);
          results.duplicates.googleIds.add(userData.googleId);
        } else {
          duplicateTracker.googleIds.set(userData.googleId, i);
        }
      }
      
      // Display results for this user
      if (errors.length > 0) {
        console.log(`  ❌ Errors:`);
        errors.forEach(error => console.log(`    - ${error}`));
        results.invalid++;
      } else {
        console.log(`  ✅ Valid`);
        results.valid++;
      }
      
      if (warnings.length > 0) {
        console.log(`  ⚠️  Warnings:`);
        warnings.forEach(warning => console.log(`    - ${warning}`));
        results.warnings++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Print summary
    console.log('='.repeat(50));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Valid users: ${results.valid}`);
    console.log(`❌ Invalid users: ${results.invalid}`);
    console.log(`⚠️  Users with warnings: ${results.warnings}`);
    
    if (results.duplicates.usernames.size > 0) {
      console.log(`🔄 Duplicate usernames: ${results.duplicates.usernames.size}`);
    }
    
    if (results.duplicates.emails.size > 0) {
      console.log(`🔄 Duplicate emails: ${results.duplicates.emails.size}`);
    }
    
    if (results.duplicates.googleIds.size > 0) {
      console.log(`🔄 Duplicate Google IDs: ${results.duplicates.googleIds.size}`);
    }
    
    const isValid = results.invalid === 0;
    
    if (isValid) {
      console.log('\n🎉 All users are valid! Ready for import.');
    } else {
      console.log('\n❌ Some users have validation errors. Please fix them before importing.');
    }
    
    if (results.warnings > 0) {
      console.log('⚠️  Some users have warnings. Review them before importing.');
    }
    
    return isValid;
    
  } catch (error) {
    console.error(`❌ Validation Error: ${error.message}`);
    return false;
  }
};

// Command line interface
const main = () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Usage: node validateUsersJson.js <json-file-path>

This script validates a JSON file containing user data before importing.

Example:
  node validateUsersJson.js users.json

The script will check:
- JSON file format and structure
- Required fields for each user
- Data type validation
- Enum value validation
- Duplicate detection within the file
- Basic email format validation
- Password requirements

Exit codes:
  0 - All users are valid
  1 - Validation errors found or script error
    `);
    process.exit(0);
  }
  
  const jsonFilePath = args[0];
  const isValid = validateUsersJson(jsonFilePath);
  
  process.exit(isValid ? 0 : 1);
};

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateUsersJson };
