/**
 * Middleware to set cache control headers for API responses
 * This helps prevent browsers from caching API responses
 */
export const noCacheMiddleware = (req, res, next) => {
  // Set headers to prevent caching
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
};

/**
 * Middleware to set cache control headers for static assets
 * This allows caching but requires revalidation
 */
export const staticAssetCacheMiddleware = (req, res, next) => {
  // For static assets, allow caching but require revalidation
  if (req.path.match(/\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$/)) {
    // Add cache busting with query parameters
    if (req.query.v || req.query.t) {
      // If version parameter is present, cache for longer
      res.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    } else {
      // Otherwise, cache but require revalidation
      res.set('Cache-Control', 'public, max-age=86400, must-revalidate'); // 1 day
    }
  }
  next();
};

/**
 * Middleware to set cache control headers for HTML content
 * This prevents caching of HTML pages
 */
export const htmlNoCacheMiddleware = (req, res, next) => {
  // For HTML content, prevent caching
  if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
};
