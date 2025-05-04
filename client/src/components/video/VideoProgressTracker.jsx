import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrophy } from 'react-icons/fa';

const VideoProgressTracker = ({ videoId }) => {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(null);
  const progressInterval = useRef(null);
  const lastSavedProgress = useRef(0);
  const saveThreshold = 5; // Save progress when it changes by 5%
  const playerRef = useRef(null);

  // Initialize YouTube API and player reference
  useEffect(() => {
    if (!isAuthenticated || !videoId) return;

    // Function to initialize YouTube API
    const initYouTubeAPI = () => {
      // If API is already loaded
      if (window.YT && window.YT.Player) {
        setupPlayerMonitoring();
        return;
      }

      // Load YouTube API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // When API is ready
      window.onYouTubeIframeAPIReady = setupPlayerMonitoring;
    };

    // Setup monitoring for the player
    const setupPlayerMonitoring = () => {
      // Find the iframe in the document
      const iframes = document.querySelectorAll('iframe');
      const youtubeIframe = Array.from(iframes).find(iframe =>
        iframe.src && iframe.src.includes('youtube.com/embed')
      );

      if (youtubeIframe) {
        // Get the player instance
        playerRef.current = new window.YT.Player(youtubeIframe);

        // Start tracking progress
        startProgressTracking();

        // Fetch initial progress
        fetchProgress();
      }
    };

    initYouTubeAPI();

    // Cleanup
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isAuthenticated, videoId]);

  // Fetch current progress from the server
  const fetchProgress = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get(`/api/v1/video-progress/${videoId}`);
      const { progress: savedProgress, completed: isCompleted } = response.data.data;

      setProgress(savedProgress);
      setCompleted(isCompleted);
      lastSavedProgress.current = savedProgress;
    } catch (error) {
      console.error('Error fetching video progress:', error);
    }
  };

  // Start tracking video progress
  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();

          if (duration > 0) {
            const newProgress = Math.round((currentTime / duration) * 100);
            setProgress(newProgress);

            // Save progress if it has changed significantly
            if (Math.abs(newProgress - lastSavedProgress.current) >= saveThreshold) {
              saveProgress(newProgress);
              lastSavedProgress.current = newProgress;
            }
          }
        } catch (error) {
          console.error('Error tracking video progress:', error);
        }
      }
    }, 5000); // Check every 5 seconds
  };

  // Save progress to the server
  const saveProgress = async (currentProgress) => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.post(`/api/v1/video-progress/${videoId}`, {
        progress: currentProgress
      });

      const { completed: newCompleted } = response.data.data;

      // If the video was just completed, show a notification
      if (newCompleted && !completed) {
        setCompleted(true);

        // Check if points were awarded (this would be in the response)
        if (response.data.data.pointsAwarded) {
          setPointsAwarded(response.data.data.pointsAwarded);
          toast.success(
            <div className="flex items-center">
              <FaTrophy className="text-yellow-500 mr-2" />
              <span>Video completed! You earned points!</span>
            </div>,
            { autoClose: 5000 }
          );
        }
      }
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  };

  // Save final progress when component unmounts
  useEffect(() => {
    return () => {
      if (isAuthenticated && progress > 0 && progress !== lastSavedProgress.current) {
        saveProgress(progress);
      }
    };
  }, [isAuthenticated, progress, videoId]);

  // This component doesn't render anything visible
  return null;
};

export default VideoProgressTracker;
