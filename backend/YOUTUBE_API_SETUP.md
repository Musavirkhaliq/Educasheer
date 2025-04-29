# Setting Up YouTube API for EduCasheer

This guide will help you set up a YouTube API key for the EduCasheer application to automatically fetch video details from YouTube.

## Getting a YouTube API Key

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click on "Select a project" at the top of the page
   - Click on "NEW PROJECT" in the top-right corner
   - Enter a name for your project (e.g., "EduCasheer")
   - Click "CREATE"

2. **Enable the YouTube Data API**:
   - Select your newly created project
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and then click "ENABLE"

3. **Create API Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "CREATE CREDENTIALS" and select "API key"
   - Your new API key will be displayed
   - (Optional but recommended) Click "RESTRICT KEY" to limit the API key usage to only the YouTube Data API

4. **Add the API Key to Your Environment**:
   - Copy the API key
   - Open the `.env` file in the backend directory
   - Add or update the following line:
     ```
     YOUTUBE_API_KEY=your-youtube-api-key
     ```
   - Replace `your-youtube-api-key` with the actual API key you copied

## Usage Limits

The YouTube Data API has usage limits:
- By default, you get 10,000 units per day
- Each API call consumes a certain number of units
- For example, a video.list call costs 1 unit

If you need more quota:
1. Go to "APIs & Services" > "YouTube Data API v3"
2. Click "MANAGE"
3. Click "EDIT QUOTAS" to request more quota

## Troubleshooting

If you encounter issues with the YouTube API:

1. **API Key Not Working**:
   - Make sure the API key is correctly added to the `.env` file
   - Check if the YouTube Data API is enabled for your project
   - Verify that the API key has not been restricted in a way that prevents it from being used with the YouTube Data API

2. **Quota Exceeded**:
   - If you see errors about quota being exceeded, you may need to wait until the next day or request more quota
   - The application will fall back to using placeholder data if the API key is invalid or the quota is exceeded

3. **API Response Issues**:
   - Check the server logs for detailed error messages
   - Verify that the YouTube video IDs being used are valid

## Note

The application is designed to work even without a valid YouTube API key by using placeholder data. However, for the best experience with accurate video details, it's recommended to set up a proper API key.
