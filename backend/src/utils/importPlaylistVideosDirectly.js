import dotenv from "dotenv";
import { google } from 'googleapis';
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

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

// Extract playlist ID from URL
const extractPlaylistId = (url) => {
  const regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2]) ? match[2] : null;
};

// Format ISO 8601 duration to human-readable format
const formatDuration = (isoDuration) => {
  // Remove PT from the beginning
  let duration = isoDuration.replace('PT', '');
  
  // Extract hours, minutes, and seconds
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  
  // Extract hours
  if (duration.includes('H')) {
    const hoursPart = duration.split('H')[0];
    hours = parseInt(hoursPart, 10);
    duration = duration.split('H')[1];
  }
  
  // Extract minutes
  if (duration.includes('M')) {
    const minutesPart = duration.split('M')[0];
    minutes = parseInt(minutesPart, 10);
    duration = duration.split('M')[1];
  }
  
  // Extract seconds
  if (duration.includes('S')) {
    const secondsPart = duration.split('S')[0];
    seconds = parseInt(secondsPart, 10);
  }
  
  // Format the duration
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
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

// Get video details from YouTube
const getVideoDetails = async (videoId) => {
  try {
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails',
      id: videoId
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error(`Video not found: ${videoId}`);
    }

    const videoData = response.data.items[0];
    const snippet = videoData.snippet;
    const contentDetails = videoData.contentDetails;

    return {
      title: snippet.title,
      description: snippet.description || 'No description available',
      thumbnail: snippet.thumbnails.maxres?.url || 
                snippet.thumbnails.high?.url || 
                snippet.thumbnails.medium?.url || 
                snippet.thumbnails.default?.url,
      duration: formatDuration(contentDetails.duration),
      publishedAt: snippet.publishedAt,
      channelTitle: snippet.channelTitle
    };
  } catch (error) {
    console.error(`Error fetching video details for ${videoId}:`, error);
    return null;
  }
};

// Add video to database directly
const addVideoToDatabase = async (videoItem, adminUser) => {
  try {
    const videoId = videoItem.contentDetails.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Check if video already exists
    const existingVideo = await Video.findOne({ videoId });
    if (existingVideo) {
      console.log(`Video already exists: ${videoItem.snippet.title}`);
      return null;
    }

    // Get detailed video information from YouTube
    const videoDetails = await getVideoDetails(videoId);
    if (!videoDetails) {
      console.error(`Failed to get details for video: ${videoItem.snippet.title}`);
      return null;
    }

    // Create video document
    const video = await Video.create({
      videoUrl,
      videoId,
      title: videoDetails.title,
      description: videoDetails.description,
      thumbnail: videoDetails.thumbnail,
      duration: videoDetails.duration,
      owner: adminUser._id,
      category: "Programming",
      tags: ["python", "programming", "tutorial"],
      isPublished: true,
      views: 0
    });

    console.log(`Added video: ${videoDetails.title}`);
    return video;
  } catch (error) {
    console.error(`Error adding video ${videoItem.snippet.title}:`, error);
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
      const result = await addVideoToDatabase(item, admin);
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
  console.error("Usage: node importPlaylistVideosDirectly.js <playlist_url>");
  process.exit(1);
}

// Run the script
const playlistUrl = process.argv[2];
importPlaylistVideos(playlistUrl);
