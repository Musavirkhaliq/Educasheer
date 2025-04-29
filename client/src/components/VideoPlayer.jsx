import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute, FaStepForward, FaStepBackward } from 'react-icons/fa';

const VideoPlayer = ({ 
  video, 
  onNext, 
  onPrevious, 
  hasNext = false, 
  hasPrevious = false,
  autoplay = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set new timeout to hide controls after 3 seconds
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const playerElement = document.getElementById('video-player-container');
    
    if (!document.fullscreenElement) {
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen();
      } else if (playerElement.webkitRequestFullscreen) {
        playerElement.webkitRequestFullscreen();
      } else if (playerElement.msRequestFullscreen) {
        playerElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      id="video-player-container" 
      className={`relative rounded-lg overflow-hidden bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* YouTube Embed */}
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={`https://www.youtube.com/embed/${video?.videoId}?autoplay=${autoplay ? 1 : 0}&mute=${isMuted ? 1 : 0}&enablejsapi=1&modestbranding=1&rel=0`}
          title={video?.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      
      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar */}
        <div className="w-full bg-gray-600 h-1 rounded-full mb-4 cursor-pointer">
          <div 
            className="bg-red-600 h-1 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button 
              className="text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
            </button>
            
            {/* Previous/Next Buttons */}
            <button 
              className={`text-white hover:text-gray-300 transition-colors ${!hasPrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={hasPrevious ? onPrevious : undefined}
              disabled={!hasPrevious}
            >
              <FaStepBackward className="w-4 h-4" />
            </button>
            
            <button 
              className={`text-white hover:text-gray-300 transition-colors ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={hasNext ? onNext : undefined}
              disabled={!hasNext}
            >
              <FaStepForward className="w-4 h-4" />
            </button>
            
            {/* Volume Button */}
            <button 
              className="text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
            </button>
            
            {/* Time Display */}
            <div className="text-white text-sm">
              <span>{currentTime}</span>
              <span className="mx-1">/</span>
              <span>{video?.duration || duration}</span>
            </div>
          </div>
          
          {/* Fullscreen Button */}
          <button 
            className="text-white hover:text-gray-300 transition-colors"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Video Title Overlay */}
      <div 
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="text-white font-medium text-lg">{video?.title}</h3>
      </div>
    </div>
  );
};

export default VideoPlayer;
