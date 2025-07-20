import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { User } from "../models/user.model.js";
import { initializeUserGamification } from "../services/gamification.service.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL environment variable is not defined");
    }

    const connectionInstance = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected, DB Host: ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error("MongoDB Connection Failed", error);
    process.exit(1);
  }
};

// Validate user data
const validateUserData = (userData) => {
  const errors = [];
  
  if (!userData.username || typeof userData.username !== 'string') {
    errors.push('Username is required and must be a string');
  }
  
  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('Email is required and must be a string');
  }
  
  if (!userData.fullName || typeof userData.fullName !== 'string') {
    errors.push('Full name is required and must be a string');
  }
  
  // Password is optional if googleId is provided
  if (!userData.password && !userData.googleId) {
    errors.push('Password is required when not using Google auth');
  }
  
  // Validate role if provided
  if (userData.role && !['learner', 'tutor', 'admin'].includes(userData.role)) {
    errors.push('Role must be one of: learner, tutor, admin');
  }
  
  // Validate tutorStatus if provided
  if (userData.tutorStatus && !['none', 'pending', 'approved', 'rejected'].includes(userData.tutorStatus)) {
    errors.push('Tutor status must be one of: none, pending, approved, rejected');
  }
  
  // Validate authProvider if provided
  if (userData.authProvider && !['local', 'google'].includes(userData.authProvider)) {
    errors.push('Auth provider must be one of: local, google');
  }
  
  return errors;
};

// Generate default avatar URL
const generateDefaultAvatar = (fullName) => {
  const encodedName = encodeURIComponent(fullName);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff`;
};

// Process and create users
const createUsersFromJson = async (jsonFilePath, options = {}) => {
  try {
    // Connect to the database
    await connectDB();
    
    // Read and parse JSON file
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const usersData = JSON.parse(jsonData);
    
    if (!Array.isArray(usersData)) {
      throw new Error('JSON file must contain an array of user objects');
    }
    
    console.log(`Found ${usersData.length} users to process`);
    
    const results = {
      created: [],
      skipped: [],
      errors: []
    };
    
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      console.log(`\nProcessing user ${i + 1}/${usersData.length}: ${userData.email || userData.username}`);
      
      try {
        // Validate user data
        const validationErrors = validateUserData(userData);
        if (validationErrors.length > 0) {
          results.errors.push({
            index: i,
            email: userData.email,
            username: userData.username,
            errors: validationErrors
          });
          console.log(`❌ Validation failed: ${validationErrors.join(', ')}`);
          continue;
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { username: userData.username.toLowerCase() },
            { email: userData.email.toLowerCase() },
            ...(userData.googleId ? [{ googleId: userData.googleId }] : [])
          ],
        });
        
        if (existingUser) {
          results.skipped.push({
            index: i,
            email: userData.email,
            username: userData.username,
            reason: 'User already exists'
          });
          console.log(`⏭️  Skipped: User already exists`);
          continue;
        }
        
        // Prepare user data with defaults
        const userToCreate = {
          username: userData.username.toLowerCase(),
          email: userData.email.toLowerCase(),
          fullName: userData.fullName,
          avatar: userData.avatar || generateDefaultAvatar(userData.fullName),
          coverImage: userData.coverImage || "",
          role: userData.role || "learner",
          tutorStatus: userData.tutorStatus || "none",
          authProvider: userData.authProvider || "local",
          isEmailVerified: userData.isEmailVerified || false,
          currentLevel: userData.currentLevel || 1,
          ...(userData.googleId && { googleId: userData.googleId }),
          ...(userData.password && { password: userData.password }) // Will be hashed by pre-save hook
        };
        
        // Create user
        const createdUser = await User.create(userToCreate);
        
        // Initialize gamification for the user if the service exists
        try {
          if (typeof initializeUserGamification === 'function') {
            await initializeUserGamification(createdUser._id);
            console.log(`✅ User created with gamification: ${createdUser.email}`);
          } else {
            console.log(`✅ User created: ${createdUser.email}`);
          }
        } catch (gamificationError) {
          console.log(`✅ User created: ${createdUser.email} (gamification initialization failed: ${gamificationError.message})`);
        }
        
        results.created.push({
          index: i,
          id: createdUser._id,
          email: createdUser.email,
          username: createdUser.username,
          role: createdUser.role
        });
        
      } catch (error) {
        results.errors.push({
          index: i,
          email: userData.email,
          username: userData.username,
          error: error.message
        });
        console.log(`❌ Error creating user: ${error.message}`);
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('BULK USER CREATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Created: ${results.created.length} users`);
    console.log(`⏭️  Skipped: ${results.skipped.length} users`);
    console.log(`❌ Errors: ${results.errors.length} users`);
    
    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach(error => {
        console.log(`- Index ${error.index} (${error.email || error.username}): ${error.errors ? error.errors.join(', ') : error.error}`);
      });
    }
    
    if (results.skipped.length > 0) {
      console.log('\nSkipped:');
      results.skipped.forEach(skipped => {
        console.log(`- Index ${skipped.index} (${skipped.email}): ${skipped.reason}`);
      });
    }
    
    // Save results to file if requested
    if (options.saveResults) {
      const resultsFile = path.join(__dirname, `user-creation-results-${Date.now()}.json`);
      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
      console.log(`\nResults saved to: ${resultsFile}`);
    }
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log("\nDatabase connection closed");
    process.exit(0);
    
  } catch (error) {
    console.error("Error in bulk user creation:", error);
    process.exit(1);
  }
};

// Command line interface
const main = () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node createUsersFromJson.js <json-file-path> [options]

Options:
  --save-results    Save detailed results to a JSON file
  --help           Show this help message

Example:
  node createUsersFromJson.js users.json --save-results
    `);
    process.exit(1);
  }
  
  if (args.includes('--help')) {
    console.log(`
Usage: node createUsersFromJson.js <json-file-path> [options]

This script creates users in bulk from a JSON file.

JSON File Format:
The JSON file should contain an array of user objects with the following structure:

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

Required fields:
- username (string)
- email (string)
- fullName (string)
- password (string, unless googleId is provided)

Optional fields:
- role (string): "learner", "tutor", or "admin" (default: "learner")
- tutorStatus (string): "none", "pending", "approved", or "rejected" (default: "none")
- authProvider (string): "local" or "google" (default: "local")
- isEmailVerified (boolean): default false
- avatar (string): URL to avatar image (auto-generated if not provided)
- coverImage (string): URL to cover image
- currentLevel (number): default 1
- googleId (string): for Google OAuth users

Options:
  --save-results    Save detailed results to a JSON file
  --help           Show this help message
    `);
    process.exit(0);
  }
  
  const jsonFilePath = args[0];
  const options = {
    saveResults: args.includes('--save-results')
  };
  
  // Check if file exists
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: File '${jsonFilePath}' does not exist`);
    process.exit(1);
  }
  
  createUsersFromJson(jsonFilePath, options);
};

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createUsersFromJson };
