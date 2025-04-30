import slugify from 'slugify';
import { nanoid } from 'nanoid';

/**
 * Generate a unique slug from a title
 * @param {string} title - The title to generate a slug from
 * @returns {string} - A unique slug
 */
export const generateUniqueSlug = (title) => {
  // Generate a base slug from the title
  const baseSlug = slugify(title, {
    lower: true,      // Convert to lowercase
    strict: true,     // Strip special characters
    trim: true        // Trim leading and trailing spaces
  });
  
  // Add a unique suffix to ensure uniqueness
  const uniqueSuffix = nanoid(6);
  
  return `${baseSlug}-${uniqueSuffix}`;
};
