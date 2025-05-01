import crypto from 'crypto';

/**
 * Generate a random token
 * @param {number} bytes - Number of bytes for the token
 * @returns {string} - Random token in hex format
 */
export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a verification token with expiry
 * @param {number} expiryHours - Hours until token expires
 * @returns {Object} - Token and expiry date
 */
export const generateVerificationToken = (expiryHours = 24) => {
  const token = generateRandomToken();
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + expiryHours);
  
  return {
    token,
    expiryDate
  };
};
