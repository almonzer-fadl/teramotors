#!/bin/bash

# TeraMotors Koyeb Build Script
echo "🚗 Building TeraMotors Auto Repair Shop..."

# Install dependencies
echo "📦 Installing dependencies..."
cd client
npm install

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
