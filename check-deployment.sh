#!/bin/bash

# Exit on error
set -e

echo "Checking deployment status of Educasheer..."

# Check if the target directory exists and has files
echo "Checking frontend files..."
if [ -d "/var/www/educasheer/client" ]; then
  file_count=$(find /var/www/educasheer/client -type f | wc -l)
  echo "Found $file_count files in /var/www/educasheer/client"
  if [ $file_count -eq 0 ]; then
    echo "ERROR: No files found in the frontend directory!"
  else
    echo "Frontend files check: OK"
  fi
else
  echo "ERROR: Frontend directory does not exist!"
fi

# Check if Nginx is running
echo "Checking Nginx status..."
if systemctl is-active --quiet nginx; then
  echo "Nginx is running: OK"
else
  echo "ERROR: Nginx is not running!"
fi

# Check if the backend is running with PM2
echo "Checking backend status with PM2..."
if pm2 list | grep -q "educasheer-backend"; then
  echo "Backend is running with PM2: OK"
else
  echo "ERROR: Backend is not running with PM2!"
fi

# Check Nginx configuration
echo "Checking Nginx configuration..."
if [ -f "/etc/nginx/sites-enabled/educasheer.conf" ]; then
  echo "Nginx configuration exists: OK"
else
  echo "ERROR: Nginx configuration not found in sites-enabled!"
fi

# Check for Nginx errors
echo "Checking Nginx error log for recent errors..."
if [ -f "/var/log/nginx/error.log" ]; then
  echo "Last 5 errors from Nginx error log:"
  tail -n 5 /var/log/nginx/error.log
else
  echo "Nginx error log not found!"
fi

# Check backend logs
echo "Checking backend logs..."
pm2 logs educasheer-backend --lines 5

echo "Deployment check completed."
