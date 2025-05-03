import { useState } from 'react';
import { clearCache } from '../../utils/cacheUtils';

/**
 * A button component that clears the browser cache
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.buttonText - Text to display on the button
 * @param {Function} props.onCacheCleared - Callback when cache is cleared
 * @returns {JSX.Element} - The rendered component
 */
const ClearCacheButton = ({ 
  className = '', 
  buttonText = 'Clear Cache & Refresh', 
  onCacheCleared,
  ...rest 
}) => {
  const [isClearing, setIsClearing] = useState(false);
  
  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      const result = await clearCache();
      if (onCacheCleared) onCacheCleared(result);
      // The page will reload automatically if cache clearing was successful
    } catch (error) {
      console.error('Error clearing cache:', error);
      setIsClearing(false);
      // Force reload as fallback
      window.location.reload(true);
    }
  };
  
  return (
    <button
      className={`clear-cache-button ${className}`}
      onClick={handleClearCache}
      disabled={isClearing}
      {...rest}
    >
      {isClearing ? 'Clearing...' : buttonText}
    </button>
  );
};

export default ClearCacheButton;
