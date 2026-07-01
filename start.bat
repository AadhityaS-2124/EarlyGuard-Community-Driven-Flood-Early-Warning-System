@echo off
echo Starting EarlyGuard Application (Updated Copy)...

echo Installing backend dependencies...
cd backend
call npm install
echo Starting Backend Server with port availability check...
start cmd /k "node basic-server.js"

echo Installing frontend dependencies...
cd ..\frontend
call npm install
echo Starting Frontend Server...
start cmd /k "npm start"

cd ..
echo EarlyGuard servers are starting. Please wait a moment for the applications to load.
echo Backend uses port availability checking - will find an available port if the default is in use. 