/**
 * Utility functions for managing cache in the frontend
 */

/**
 * Adds a cache-busting parameter to a URL
 * @param {string} url - The URL to add the cache-busting parameter to
 * @returns {string} - The URL with a cache-busting parameter
 */
export const addCacheBuster = (url) => {
  if (!url) return url;
  
  // Don't add cache buster to external URLs
  if (url.startsWith('http') && !url.includes(window.location.hostname)) {
    return url;
  }
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
};

/**
 * Clears the browser cache using the service worker
 * @returns {Promise<boolean>} - A promise that resolves to true if the cache was cleared
 */
export const clearCache = async () => {
  if (typeof window.clearCache === 'function') {
    return window.clearCache();
  }
  
  // Fallback if service worker is not available
  console.log('Service worker not available, reloading page');
  window.location.reload(true);
  return true;
};

/**
 * Adds a cache-busting parameter to an image source
 * @param {string} src - The image source URL
 * @returns {string} - The image source URL with a cache-busting parameter
 */
export const getCacheBustedImageSrc = (src) => {
  return addCacheBuster(src);
};

/**
 * Reloads the current page with cache busting
 */
export const reloadPageWithCacheBusting = () => {
  const currentLocation = window.location.href;
  const cacheBustedUrl = addCacheBuster(currentLocation);
  window.location.href = cacheBustedUrl;
};
