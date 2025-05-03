import { useState, useEffect } from 'react';
import { getCacheBustedImageSrc } from '../../utils/cacheUtils';

/**
 * A component that renders an image with cache busting
 * @param {Object} props - Component props
 * @param {string} props.src - The image source URL
 * @param {string} props.alt - The image alt text
 * @param {Object} props.style - Additional style properties
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback when image fails to load
 * @returns {JSX.Element} - The rendered component
 */
const CacheBustedImage = ({ 
  src, 
  alt = '', 
  style = {}, 
  className = '', 
  onLoad, 
  onError,
  ...rest 
}) => {
  const [cacheBustedSrc, setCacheBustedSrc] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset error state when src changes
    setHasError(false);
    
    // Add cache busting parameter to the image source
    setCacheBustedSrc(getCacheBustedImageSrc(src));
  }, [src]);
  
  const handleError = (e) => {
    // If the image fails to load and we haven't retried too many times
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      // Generate a new cache-busted URL
      setCacheBustedSrc(getCacheBustedImageSrc(src));
    } else {
      // After retries, mark as error
      setHasError(true);
      if (onError) onError(e);
    }
  };
  
  const handleLoad = (e) => {
    if (onLoad) onLoad(e);
  };
  
  return (
    <img
      src={cacheBustedSrc}
      alt={alt}
      style={{
        ...style,
        display: hasError ? 'none' : 'block',
      }}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...rest}
    />
  );
};

export default CacheBustedImage;
