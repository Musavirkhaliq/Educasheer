import dotenv from "dotenv";
import { google } from 'googleapis';
import axios from 'axios';
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { User } from "../models/user.model.js";

// Load environment variables
dotenv.config();

// Initialize the YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected, DB Host: ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error("MongoDB Connection Failed", error);
    process.exit(1);
  }
};

// Get admin user
const getAdminUser = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("No admin user found. Please create an admin user first.");
      process.exit(1);
    }
    return admin;
  } catch (error) {
    console.error("Error finding admin user:", error);
    process.exit(1);
  }
};

// Generate JWT token for admin
const generateAdminToken = async (admin) => {
  try {
    // Create a JWT token for the admin user
    const response = await axios.post('http://localhost:5000/api/v1/users/login', {
      email: admin.email,
      password: 'educasheer@musa123' // This is the password set in seedAdmin.js
    });

    return response.data.data.accessToken;
  } catch (error) {
    console.error("Error generating admin token:", error);
    console.error("Error details:", error.response?.data || error.message);
    process.exit(1);
  }
};

// Extract playlist ID from URL
const extractPlaylistId = (url) => {
  const regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2]) ? match[2] : null;
};

// Fetch videos from YouTube playlist
const fetchPlaylistVideos = async (playlistId) => {
  try {
    let nextPageToken = '';
    let allItems = [];

    do {
      const response = await youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken
      });

      allItems = [...allItems, ...response.data.items];
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return allItems;
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    process.exit(1);
  }
};

// Add video to database
const addVideoToDatabase = async (videoItem, token) => {
  try {
    const videoId = videoItem.contentDetails.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Add video to database
    const response = await axios.post('http://localhost:5000/api/v1/videos',
      {
        videoUrl: videoUrl,
        // Let the backend fetch the details from YouTube
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log(`Added video: ${videoItem.snippet.title}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.data?.message?.includes('Video already exists')) {
      console.log(`Video already exists: ${videoItem.snippet.title}`);
      return null;
    }
    console.error(`Error adding video ${videoItem.snippet.title}:`);
    console.error('Error details:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return null;
  }
};

// Main function to import videos from playlist
const importPlaylistVideos = async (playlistUrl) => {
  try {
    // Connect to database
    await connectDB();

    // Get admin user
    const admin = await getAdminUser();
    console.log(`Using admin user: ${admin.email}`);

    // Generate admin token
    const token = await generateAdminToken(admin);
    console.log("Admin token generated successfully");

    // Extract playlist ID
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      console.error("Invalid YouTube playlist URL");
      process.exit(1);
    }
    console.log(`Importing videos from playlist: ${playlistId}`);

    // Fetch playlist videos
    const playlistItems = await fetchPlaylistVideos(playlistId);
    console.log(`Found ${playlistItems.length} videos in playlist`);

    // Add videos to database
    let addedCount = 0;
    for (const item of playlistItems) {
      const result = await addVideoToDatabase(item, token);
      if (result) addedCount++;
    }

    console.log(`Successfully added ${addedCount} videos from playlist`);
    console.log(`${playlistItems.length - addedCount} videos were already in the database or failed to add`);

    // Disconnect from database
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error importing playlist videos:", error);
    process.exit(1);
  }
};

// Check if playlist URL is provided
if (process.argv.length < 3) {
  console.error("Please provide a YouTube playlist URL");
  console.error("Usage: node importPlaylistVideos.js <playlist_url>");
  process.exit(1);
}

// Run the script
const playlistUrl = process.argv[2];
importPlaylistVideos(playlistUrl);
