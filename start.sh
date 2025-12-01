#!/bin/bash

# WhatsApp Batch Opener Startup Script
# This script starts the Python backend and opens the HTML file

echo "🚀 Starting WhatsApp Batch Opener..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Python is installed
check_python() {
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}✅ Python 3 found${NC}"
        return 0
    elif command -v python &> /dev/null; then
        echo -e "${GREEN}✅ Python found${NC}"
        return 0
    else
        echo -e "${RED}❌ Python not found. Please install Python 3.7+${NC}"
        return 1
    fi
}

# Function to check if pip is installed
check_pip() {
    if command -v pip3 &> /dev/null; then
        echo -e "${GREEN}✅ pip3 found${NC}"
        return 0
    elif command -v pip &> /dev/null; then
        echo -e "${GREEN}✅ pip found${NC}"
        return 0
    else
        echo -e "${RED}❌ pip not found. Please install pip${NC}"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
    
    if command -v pip3 &> /dev/null; then
        pip3 install -r requirements.txt
    else
        pip install -r requirements.txt
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        return 1
    fi
}

# Function to start Python backend
start_backend() {
    echo -e "${BLUE}🐍 Starting Python automation backend...${NC}"
    
    if command -v python3 &> /dev/null; then
        python3 automation_backend.py &
    else
        python automation_backend.py &
    fi
    
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
    
    # Wait a moment for the server to start
    sleep 3
    
    return 0
}

# Function to open HTML file
open_html() {
    echo -e "${BLUE}🌐 Opening WhatsApp Batch Opener in browser...${NC}"
    
    # Try different methods to open the HTML file
    if command -v xdg-open &> /dev/null; then
        xdg-open wa-batch.html
    elif command -v open &> /dev/null; then
        open wa-batch.html
    elif command -v start &> /dev/null; then
        start wa-batch.html
    else
        echo -e "${YELLOW}⚠️ Could not auto-open browser. Please manually open wa-batch.html${NC}"
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}🔚 Stopping backend (PID: $BACKEND_PID)${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
echo -e "${BLUE}🤖 WhatsApp Batch Opener with PyAutoGUI Backend${NC}"
echo "=============================================="

# Check prerequisites
if ! check_python; then
    exit 1
fi

if ! check_pip; then
    exit 1
fi

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ requirements.txt not found${NC}"
    exit 1
fi

# Install dependencies
if ! install_dependencies; then
    exit 1
fi

# Start the backend
if ! start_backend; then
    echo -e "${RED}❌ Failed to start backend${NC}"
    exit 1
fi

# Open the HTML file
open_html

echo -e "\n${GREEN}🎉 WhatsApp Batch Opener is now running!${NC}"
echo -e "${BLUE}📡 Backend API: http://localhost:5000${NC}"
echo -e "${YELLOW}💡 Instructions:${NC}"
echo "   1. Make sure WhatsApp Web is logged in"
echo "   2. Copy any images/content to clipboard before starting automation"
echo "   3. Keep browser window focused during automation"
echo "   4. Move mouse to top-left corner for emergency stop"
echo -e "\n${YELLOW}Press Ctrl+C to stop the backend server${NC}"

# Keep script running
wait $BACKEND_PID
