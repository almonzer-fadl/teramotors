#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Install Chrome for Puppeteer
npx puppeteer browsers install chrome

echo "Build completed successfully!"
