import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Sample video data
const sampleVideo = {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    title: "Sample Educational Video",
    description: "This is a sample video for testing course creation.",
    duration: "3:32",
    category: "Education",
    tags: ["sample", "education", "test"],
    isPublished: true
};

const createTestVideo = async () => {
    try {
        // Find an admin or tutor user
        const user = await User.findOne({ 
            $or: [
                { role: "admin" },
                { role: "tutor" }
            ]
        });

        if (!user) {
            console.error("No admin or tutor user found. Please create one first.");
            process.exit(1);
        }

        console.log(`Using user: ${user.username} (${user.role})`);

        // Check if video already exists
        const existingVideo = await Video.findOne({ videoId: sampleVideo.videoId });
        if (existingVideo) {
            console.log("Test video already exists:", existingVideo._id);
            process.exit(0);
        }

        // Create the video
        const video = await Video.create({
            ...sampleVideo,
            owner: user._id
        });

        console.log("Test video created successfully:", video._id);
        console.log("You can now use this video to create a course.");
    } catch (error) {
        console.error("Error creating test video:", error);
    } finally {
        mongoose.disconnect();
    }
};

createTestVideo();
