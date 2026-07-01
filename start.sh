#!/bin/bash

echo "Starting EarlyGuard Application..."

echo "Installing backend dependencies..."
cd backend
npm install
echo "Starting Backend Server..."
gnome-terminal -- bash -c "npm start; exec bash" &

echo "Installing frontend dependencies..."
cd ../frontend
npm install
echo "Starting Frontend Server..."
gnome-terminal -- bash -c "npm start; exec bash" &

cd ..
echo "EarlyGuard servers are starting. Please wait a moment for the applications to load." 