#!/bin/bash

# Building Approvals - Deployment Script for Hostinger VPS
# This script automates the deployment process

echo "🚀 Starting deployment..."

# Pull latest code
echo "📦 Pulling latest code from repository..."
git pull origin master

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Restart PM2 process
echo "♻️  Restarting application..."
pm2 restart building-approvals

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at http://localhost:3000"

# Show PM2 status
pm2 status
