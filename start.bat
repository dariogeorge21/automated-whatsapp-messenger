@echo off
title WhatsApp Batch Opener - PyAutoGUI Backend

echo 🚀 Starting WhatsApp Batch Opener...
echo ==========================================

REM Colors for Windows (limited support)
echo 🤖 WhatsApp Batch Opener with PyAutoGUI Backend

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.7+
    echo 💡 Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python found

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip not found. Please install pip
    pause
    exit /b 1
)
echo ✅ pip found

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Start Python backend
echo 🐍 Starting Python automation backend...
start "PyAutoGUI Backend" python automation_backend.py

REM Wait a moment for the server to start
timeout /t 3 /nobreak >nul

REM Open HTML file
echo 🌐 Opening WhatsApp Batch Opener in browser...
start wa-batch.html

echo.
echo 🎉 WhatsApp Batch Opener is now running!
echo 📡 Backend API: http://localhost:5000
echo 💡 Instructions:
echo    1. Make sure WhatsApp Web is logged in
echo    2. Copy any images/content to clipboard before starting automation
echo    3. Keep browser window focused during automation
echo    4. Move mouse to top-left corner for emergency stop
echo.
echo ⚠️ Keep this window open - the backend server is running
echo 🛑 Close this window to stop the backend server
echo.
pause
