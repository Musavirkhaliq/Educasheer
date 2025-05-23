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
    enum: ["learner", "tutor", "admin"],
    default: "learner"
  },
  tutorStatus: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none"
  }
}, { timestamps: true });

// Add password hashing pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use MONGO_URL directly as it already includes the database name
    const connectionInstance = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected, DB Host: ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error("MongoDB Connection Failed", error);
    process.exit(1);
  }
};

// Seed admin user
const seedAdminUser = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Admin user data
    const adminData = {
      fullName: "Admin User",
      username: "admin",
      email: "admin@educasheer.com",
      password: "educasheer@musa123", // This will be hashed by the pre-save hook
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
      tutorStatus: "none"
    };

    // Create admin user
    const admin = await User.create(adminData);
    console.log("Admin user created successfully:", admin.email);

    // Disconnect from the database
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

// Run the seeder
seedAdminUser();
