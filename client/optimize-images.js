// Script to optimize images for production
// This can be run before the build process

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination directories
const sourceDir = path.join(__dirname, 'public/images');
const destDir = path.join(__dirname, 'public/images/optimized');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Process images
async function optimizeImages() {
  try {
    // Get all files in the source directory
    const files = fs.readdirSync(sourceDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    console.log(`Found ${imageFiles.length} images to optimize`);
    
    // Process each image
    for (const file of imageFiles) {
      const sourcePath = path.join(sourceDir, file);
      const fileExt = path.extname(file).toLowerCase();
      const fileName = path.basename(file, fileExt);
      
      // Skip already optimized images
      if (fileName.includes('-optimized')) {
        continue;
      }
      
      // Create WebP version
      const webpPath = path.join(destDir, `${fileName}-optimized.webp`);
      await sharp(sourcePath)
        .resize(1200, null, { withoutEnlargement: true }) // Resize to max width 1200px
        .webp({ quality: 80 })
        .toFile(webpPath);
      
      // Create optimized original format
      const optimizedPath = path.join(destDir, `${fileName}-optimized${fileExt}`);
      await sharp(sourcePath)
        .resize(1200, null, { withoutEnlargement: true })
        .toFile(optimizedPath);
      
      // Create responsive versions for WebP
      const sizes = [300, 600, 900];
      for (const size of sizes) {
        const responsivePath = path.join(destDir, `${fileName}-${size}.webp`);
        await sharp(sourcePath)
          .resize(size, null, { withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(responsivePath);
      }
      
      console.log(`Optimized: ${file}`);
    }
    
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

// Run the optimization
optimizeImages();
