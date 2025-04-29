/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The slugified text
 */
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/&/g, '-and-')      // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
};

/**
 * Generate a unique slug by appending a random string if needed
 * @param {string} text - The base text for the slug
 * @param {boolean} [addRandom=true] - Whether to add a random string
 * @returns {string} - A unique slug
 */
export const generateUniqueSlug = (text, addRandom = true) => {
    const baseSlug = slugify(text);
    
    if (!addRandom) {
        return baseSlug;
    }
    
    // Add a random string to ensure uniqueness
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomString}`;
};
