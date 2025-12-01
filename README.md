# WhatsApp Batch Opener with PyAutoGUI Backend

A powerful web-based tool for sending messages to multiple WhatsApp contacts with automated PyAutoGUI keyboard/mouse control for reliable automation.

## 🚀 Features

- **Batch Processing**: Send messages to multiple contacts efficiently
- **PyAutoGUI Integration**: Reliable keyboard automation using Python backend
- **Automated Actions**: 
  - Open WhatsApp Web chats
  - Paste content (images, text, files) using Ctrl+V
  - Send messages using Enter
  - Close tabs using Ctrl+W
- **Configurable Timing**: Set custom delays for each automation step
- **Real-time Status**: Live progress tracking and countdown timers
- **Emergency Stop**: Move mouse to top-left corner to stop automation
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📁 Project Structure

```
whatsapp-automata/
├── wa-batch.html           # Main web interface
├── styles.css              # UI styling
├── script.js               # Frontend JavaScript logic
├── automation_backend.py   # Python PyAutoGUI backend server
├── requirements.txt        # Python dependencies
├── start.sh               # Linux/macOS startup script
├── start.bat              # Windows startup script
└── README.md              # This file
```

## 🔧 Installation & Setup

### Prerequisites

1. **Python 3.7+** installed on your system
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. **Modern web browser** (Chrome, Firefox, Safari, Edge)

3. **WhatsApp Web** account (https://web.whatsapp.com/)

### Quick Start

#### Option 1: Automated Setup (Recommended)

**For Linux/macOS:**
```bash
./start.sh
```

**For Windows:**
```bash
start.bat
```

#### Option 2: Manual Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Python backend:**
   ```bash
   python automation_backend.py
   ```

3. **Open the web interface:**
   - Open `wa-batch.html` in your web browser

## 🎯 Usage Instructions

### 1. Initial Setup
1. Start the application using one of the startup scripts
2. Open WhatsApp Web (https://web.whatsapp.com/) and log in
3. The web interface should open automatically at `wa-batch.html`

### 2. Prepare Your Content
- **For images**: Copy the image to your clipboard (Ctrl+C)
- **For files**: You'll need to manually drag-drop them in WhatsApp
- **For text**: Enter your message in the "Message to Prefill" field

### 3. Configure Contacts
1. Enter phone numbers in the text area (one per line)
2. Supported formats:
   - `+91 98765 43210`
   - `919812345678` 
   - `9876543210`
   - `+1-555-123-4567`
3. Set country code override if needed (e.g., `91` for India)

### 4. Configure Automation
1. **Enable/disable steps** using checkboxes
2. **Set timing delays** for each step:
   - **Next Contact**: Delay before opening new chat
   - **Paste Content**: Delay before pasting (Ctrl+V)
   - **Send Message**: Delay before sending (Enter)
   - **Close Tab**: Delay before closing tab (Ctrl+W)

### 5. Start Processing
1. Click **"Start Batch Process"** to begin
2. The first chat will open automatically
3. Click **"Start Automation"** for automated processing
4. Or use **"Next Contact"** for manual control

### 6. Monitor Progress
- Watch the real-time status updates
- View progress bar showing completion percentage
- See countdown timers for each automation step

## ⚙️ API Endpoints

The Python backend provides a REST API at `http://localhost:5000`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check backend health |
| `/automation/status` | GET | Get automation status |
| `/automation/start` | POST | Start automation sequence |
| `/automation/stop` | POST | Stop automation |
| `/automation/paste` | POST | Execute Ctrl+V |
| `/automation/send` | POST | Execute Enter |
| `/automation/close` | POST | Execute Ctrl+W |
| `/mouse/position` | GET | Get mouse coordinates |
| `/screen/size` | GET | Get screen dimensions |

## 🛡️ Safety Features

1. **Emergency Stop**: Move mouse to top-left corner to immediately stop PyAutoGUI
2. **Backend Connection Check**: Frontend validates backend availability
3. **Error Handling**: Comprehensive error reporting and recovery
4. **Graceful Shutdown**: Proper cleanup of processes and resources

## 🔍 Troubleshooting

### Backend Connection Issues
```
❌ PyAutoGUI backend not available
```
**Solution**: Make sure `automation_backend.py` is running on port 5000

### Python Dependencies Issues
```
❌ Failed to install dependencies
```
**Solutions**:
- Update pip: `python -m pip install --upgrade pip`
- Install manually: `pip install flask flask-cors pyautogui pillow`

### PyAutoGUI Permission Issues (macOS)
```
❌ PyAutoGUI needs accessibility permissions
```
**Solution**: Grant accessibility permissions to your terminal/IDE in System Preferences > Security & Privacy > Accessibility

### Automation Not Working
1. Ensure WhatsApp Web is the active/focused window
2. Check that content is copied to clipboard before starting
3. Verify timing delays are appropriate for your system
4. Try increasing delay values if actions are happening too fast

### Cross-Platform Issues

**Linux (X11):**
```bash
sudo apt-get install python3-tk python3-dev
```

**Linux (Wayland):**
PyAutoGUI may have limited support. Consider using X11 session.

## 🔄 Workflow Example

1. **Copy image** to clipboard (Ctrl+C)
2. **Enter phone numbers** in the web interface
3. **Set automation delays**:
   - Next Contact: 2 seconds
   - Paste Content: 3 seconds  
   - Send Message: 2 seconds
   - Close Tab: 1 second
4. **Start batch process** - first chat opens
5. **Start automation** - system automatically:
   - Opens next contact chat
   - Pastes the image (Ctrl+V)
   - Sends the message (Enter)
   - Closes the tab (Ctrl+W)
   - Repeats for all contacts

## 📝 Configuration Options

### Automation Steps
- **Next Contact** ✅: Opens WhatsApp chat for next contact
- **Paste Content** ✅: Executes Ctrl+V to paste clipboard content
- **Send Message** ✅: Executes Enter to send the message
- **Close Tab** ✅: Executes Ctrl+W to close the current tab

### Timing Configuration
- All delays are configurable in 0.5-second increments
- Range: 0-60 seconds per step
- Recommended minimum: 1-2 seconds per action

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

This tool is for educational and legitimate business purposes only. Please:
- Respect WhatsApp's Terms of Service
- Don't spam or send unsolicited messages
- Use responsibly and ethically
- Ensure compliance with local laws and regulations

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all dependencies are properly installed
3. Verify WhatsApp Web is accessible and logged in
4. Check console logs for error messages

---

**Made with ❤️ by Dario George for simple WhatsApp communication**
