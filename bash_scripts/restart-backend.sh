#!/bin/bash

echo "🔄 Restarting backend to fix import issues..."

# Stop the backend process
pm2 stop educasheer-backend

# Clear PM2 logs
pm2 flush

# Start the backend again
pm2 start educasheer-backend

# Show status
pm2 status

echo "✅ Backend restarted successfully"
echo "📋 Check logs with: pm2 logs educasheer-backend"