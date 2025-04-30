#!/bin/bash

# Exit on error
set -e

echo "Setting up server for Educasheer deployment..."

# Update system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install MongoDB if not already installed
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    sudo apt install -y mongodb
    sudo systemctl enable mongodb
    sudo systemctl start mongodb
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi

# Create directory structure
echo "Creating directory structure..."
sudo mkdir -p /var/www/educasheer
sudo chown -R $USER:$USER /var/www/educasheer

# Copy Nginx configuration
echo "Configuring Nginx..."
sudo cp educasheer.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/educasheer.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

echo "Server setup completed successfully!"
echo "Now you can run ./deploy.sh to deploy the application."
