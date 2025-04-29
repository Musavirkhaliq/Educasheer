import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY // Make sure to add this to your .env file
});

/**
 * Fetch video details from YouTube API
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video details including title, description, thumbnail, and duration
 */
export const getYouTubeVideoDetails = async (videoId) => {
  try {
    // Get video details
    const videoResponse = await youtube.videos.list({
      part: 'snippet,contentDetails',
      id: videoId
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const videoData = videoResponse.data.items[0];
    const snippet = videoData.snippet;
    const contentDetails = videoData.contentDetails;

    // Format duration from ISO 8601 format
    const duration = formatDuration(contentDetails.duration);

    return {
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails.maxres?.url || 
                snippet.thumbnails.high?.url || 
                snippet.thumbnails.medium?.url || 
                snippet.thumbnails.default?.url,
      duration: duration,
      publishedAt: snippet.publishedAt,
      channelTitle: snippet.channelTitle
    };
  } catch (error) {
    console.error('Error fetching YouTube video details:', error);
    
    // If API key is missing or invalid, return placeholder data
    if (!process.env.YOUTUBE_API_KEY || error.code === 403) {
      console.warn('Using placeholder data due to missing or invalid YouTube API key');
      return getPlaceholderVideoData(videoId);
    }
    
    throw error;
  }
};

/**
 * Format ISO 8601 duration to human-readable format
 * @param {string} isoDuration - Duration in ISO 8601 format (e.g., PT1H30M15S)
 * @returns {string} - Formatted duration (e.g., 1:30:15)
 */
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

/**
 * Get placeholder video data when API key is missing or invalid
 * @param {string} videoId - YouTube video ID
 * @returns {Object} - Placeholder video data
 */
const getPlaceholderVideoData = (videoId) => {
  return {
    title: `YouTube Video (ID: ${videoId})`,
    description: 'This is a placeholder description. To get actual video details, please configure a valid YouTube API key.',
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: '0:00',
    publishedAt: new Date().toISOString(),
    channelTitle: 'Unknown Channel'
  };
};
