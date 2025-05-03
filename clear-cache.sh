#!/bin/bash

# Script to clear various caches for the Educasheer website

echo "Clearing Educasheer caches..."

# Clear Nginx cache if using proxy_cache
if [ -d "/var/cache/nginx" ]; then
  echo "Clearing Nginx cache..."
  sudo rm -rf /var/cache/nginx/*
fi

# Restart Nginx to apply configuration changes
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Clear browser caches by incrementing a version in the service worker
echo "Updating service worker version..."
TIMESTAMP=$(date +%s)
sed -i "s/educasheer-cache-v[0-9]*/educasheer-cache-v$TIMESTAMP/" client/public/service-worker.js

# Rebuild the client if needed
if [ "$1" == "--rebuild" ]; then
  echo "Rebuilding client..."
  cd client
  npm run build
  cd ..
  
  # Copy the new build files
  echo "Copying new build files..."
  sudo rm -rf /var/www/educasheer/client/*
  sudo cp -r client/dist/* /var/www/educasheer/client/
fi

echo "Cache clearing complete!"
echo "Note: Users may need to hard-refresh their browsers (Ctrl+F5 or Cmd+Shift+R)"
