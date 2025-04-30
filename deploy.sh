#!/bin/bash

# Exit on error
set -e

echo "Starting deployment of Educasheer..."

# Update the repository
echo "Pulling latest changes..."
# git pull

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Build and deploy frontend
echo "Building frontend..."
cd client
npm install
npm run build
cd ..

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

echo "Deployment completed successfully!"
