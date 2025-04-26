import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

// Load environment variables
dotenv.config();

// Define the User schema (simplified version of your actual schema)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  fullName: String,
  avatar: String,
  coverImage: String,
  refreshToken: String,
  role: {
    type: String,
    enum: ["user", "admin", "guest"],
    default: "user"
  }
}, { timestamps: true });

// Create the User model
const User = mongoose.model('User', userSchema);

// Function to reset a user's password
const resetUserPassword = async (email, newPassword) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGO_URL || 'mongodb://localhost:27017'}/${DB_NAME}`);
    console.log("Connected to MongoDB");

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }
    
    console.log(`Found user: ${user.fullName} (${user.email})`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
    console.log(`Password updated successfully for user: ${user.email}`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Email of the user whose password you want to reset
const userEmail = "musavir119s@gmail.com";

// New password to set
const newPassword = "password123";

// Call the function to reset the password
resetUserPassword(userEmail, newPassword)
  .then(() => console.log("Password reset operation completed"))
  .catch(err => console.error("Password reset operation failed:", err));
