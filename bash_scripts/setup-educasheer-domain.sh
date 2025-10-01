#!/bin/bash

# Script to set up the educasheer.in domain with SSL certificates

# Exit on error
set -e

echo "Setting up educasheer.in domain..."

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Copy the Nginx configuration file for educasheer.in
echo "Configuring Nginx for educasheer.in..."
sudo cp nginx/educasheer.in.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/educasheer.in.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx to apply changes
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Obtain SSL certificates for educasheer.in
echo "Obtaining SSL certificates for educasheer.in..."
echo "This will modify the Nginx configuration to add SSL support..."
sudo certbot --nginx -d educasheer.in -d www.educasheer.in

# Restart Nginx again to ensure it picks up the new certificates
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "educasheer.in domain setup completed successfully!"
echo "The website should now be accessible at https://educasheer.in"
