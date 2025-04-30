#!/bin/bash

# Exit on error
set -e

echo "Starting deployment of Educasheer..."

# Update the repository
echo "Pulling latest changes..."
git pull

# Install root dependencies
echo "Installing root dependencies..."
# npm install

# Build and deploy frontend with optimizations
echo "Building frontend with optimizations..."
cd client
# Install dependencies if needed
# npm install

# Install optimization dependencies
# npm install --save-dev sharp terser vite-plugin-compression

# Run optimized production build
# npm run build:prod
cd ..

# Ensure the target directory exists
echo "Creating target directory if it doesn't exist..."
sudo mkdir -p /var/www/educasheer/client

# Clear the existing files to prevent stale content
echo "Clearing existing files..."
sudo rm -rf /var/www/educasheer/client/*

# Copy the new build files
echo "Copying new build files..."
sudo cp -r client/dist/* /var/www/educasheer/client/

# Install and configure backend
echo "Setting up backend..."
cd backend
npm install
cp .env.production .env
cd ..

# Start or restart the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration to start on system boot
echo "Saving PM2 configuration..."
pm2 save

# Configure Nginx for better performance
echo "Configuring Nginx for better performance..."
sudo cp nginx/educasheer.conf /etc/nginx/sites-available/educasheer.conf
sudo ln -sf /etc/nginx/sites-available/educasheer.conf /etc/nginx/sites-enabled/educasheer.conf

# Restart Nginx to ensure it picks up new files and configuration
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment completed successfully!"
