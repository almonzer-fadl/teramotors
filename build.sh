#!/bin/bash

# TeraMotors Koyeb Build Script
echo "🚗 Building TeraMotors Auto Repair Shop..."

# Install root dependencies first
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
