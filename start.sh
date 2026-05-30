#!/bin/bash
set -e
cd "$(dirname "$0")/apps/web"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js is not installed."
  echo "Install it from https://nodejs.org/ then run this script again."
  exit 1
fi

echo "Installing dependencies..."
npm install

echo ""
echo "Starting Stilo at http://localhost:3000"
npm run dev
