"""
WhatsApp Batch Automation Backend
Uses PyAutoGUI for reliable keyboard and mouse automation
Communicates with the frontend via a Flask REST API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pyautogui
import time
import threading
import logging
from typing import Optional, Dict, Any
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure PyAutoGUI
pyautogui.FAILSAFE = True  # Move mouse to top-left corner to abort
pyautogui.PAUSE = 0.5  # Default pause between PyAutoGUI calls

class AutomationController:
    def __init__(self):
        self.is_running = False
        self.current_task = None
        self.task_thread = None
    
    def stop_current_task(self):
        """Stop any running automation task"""
        self.is_running = False
        if self.task_thread and self.task_thread.is_alive():
            self.task_thread.join(timeout=2.0)
        logger.info("Automation task stopped")
    
    def start_automation_sequence(self, config: Dict[str, Any]) -> bool:
        """Start the automation sequence with given configuration"""
        if self.is_running:
            logger.warning("Automation already running")
            return False
        
        self.is_running = True
        self.current_task = config
        self.task_thread = threading.Thread(
            target=self._execute_automation_sequence,
            args=(config,)
        )
        self.task_thread.start()
        return True
    
    def _execute_automation_sequence(self, config: Dict[str, Any]):
        """Execute the automation sequence in a separate thread"""
        try:
            steps = config.get('steps', [])
            
            for step in steps:
                if not self.is_running:
                    break
                
                action = step.get('action')
                delay = step.get('delay', 0)
                
                # Wait for the specified delay
                if delay > 0:
                    logger.info(f"Waiting {delay} seconds before {action}")
                    time.sleep(delay)
                
                if not self.is_running:
                    break
                
                # Execute the action
                self._execute_action(action, step.get('params', {}))
            
        except Exception as e:
            logger.error(f"Automation sequence failed: {e}")
        finally:
            self.is_running = False
            self.current_task = None
    
    def _execute_action(self, action: str, params: Dict[str, Any]):
        """Execute a specific automation action"""
        logger.info(f"Executing action: {action}")
        
        try:
            if action == 'paste':
                self._paste_content()
            elif action == 'send_message':
                self._send_message()
            elif action == 'close_tab':
                self._close_tab()
            elif action == 'click_coordinates':
                x = params.get('x', 0)
                y = params.get('y', 0)
                self._click_coordinates(x, y)
            else:
                logger.warning(f"Unknown action: {action}")
        
        except Exception as e:
            logger.error(f"Failed to execute action {action}: {e}")
    
    def _paste_content(self):
        """Simulate Ctrl+V to paste content"""
        pyautogui.hotkey('ctrl', 'v')
        logger.info("Executed Ctrl+V (paste)")
    
    def _send_message(self):
        """Simulate Enter to send message"""
        pyautogui.press('enter')
        logger.info("Executed Enter (send message)")
    
    def _close_tab(self):
        """Simulate Ctrl+W to close tab"""
        pyautogui.hotkey('ctrl', 'w')
        logger.info("Executed Ctrl+W (close tab)")
    
    def _click_coordinates(self, x: int, y: int):
        """Click at specific coordinates"""
        pyautogui.click(x, y)
        logger.info(f"Clicked at coordinates ({x}, {y})")

# Global automation controller
automation = AutomationController()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'PyAutoGUI backend is running'})

@app.route('/automation/status', methods=['GET'])
def get_automation_status():
    """Get current automation status"""
    return jsonify({
        'is_running': automation.is_running,
        'current_task': automation.current_task
    })

@app.route('/automation/start', methods=['POST'])
def start_automation():
    """Start automation sequence"""
    try:
        config = request.json
        if not config:
            return jsonify({'error': 'No configuration provided'}), 400
        
        success = automation.start_automation_sequence(config)
        if success:
            return jsonify({'message': 'Automation started successfully'})
        else:
            return jsonify({'error': 'Automation already running'}), 409
    
    except Exception as e:
        logger.error(f"Failed to start automation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/automation/stop', methods=['POST'])
def stop_automation():
    """Stop automation sequence"""
    try:
        automation.stop_current_task()
        return jsonify({'message': 'Automation stopped successfully'})
    
    except Exception as e:
        logger.error(f"Failed to stop automation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/automation/action', methods=['POST'])
def execute_single_action():
    """Execute a single automation action"""
    try:
        data = request.json
        action = data.get('action')
        params = data.get('params', {})
        delay = data.get('delay', 0)
        
        if not action:
            return jsonify({'error': 'No action specified'}), 400
        
        # Apply delay if specified
        if delay > 0:
            time.sleep(delay)
        
        # Execute the action
        automation._execute_action(action, params)
        
        return jsonify({'message': f'Action {action} executed successfully'})
    
    except Exception as e:
        logger.error(f"Failed to execute action: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/automation/paste', methods=['POST'])
def paste_content():
    """Paste content using Ctrl+V"""
    try:
        data = request.json or {}
        delay = data.get('delay', 0)
        
        if delay > 0:
            time.sleep(delay)
        
        automation._paste_content()
        return jsonify({'message': 'Paste action executed'})
    
    except Exception as e:
        logger.error(f"Failed to paste: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/automation/send', methods=['POST'])
def send_message():
    """Send message using Enter key"""
    try:
        data = request.json or {}
        delay = data.get('delay', 0)
        
        if delay > 0:
            time.sleep(delay)
        
        automation._send_message()
        return jsonify({'message': 'Send action executed'})
    
    except Exception as e:
        logger.error(f"Failed to send message: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/automation/close', methods=['POST'])
def close_tab():
    """Close tab using Ctrl+W"""
    try:
        data = request.json or {}
        delay = data.get('delay', 0)
        
        if delay > 0:
            time.sleep(delay)
        
        automation._close_tab()
        return jsonify({'message': 'Close action executed'})
    
    except Exception as e:
        logger.error(f"Failed to close tab: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/mouse/position', methods=['GET'])
def get_mouse_position():
    """Get current mouse position"""
    try:
        x, y = pyautogui.position()
        return jsonify({'x': x, 'y': y})
    
    except Exception as e:
        logger.error(f"Failed to get mouse position: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/screen/size', methods=['GET'])
def get_screen_size():
    """Get screen size"""
    try:
        size = pyautogui.size()
        return jsonify({'width': size.width, 'height': size.height})
    
    except Exception as e:
        logger.error(f"Failed to get screen size: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🤖 Starting WhatsApp Automation Backend...")
    print("🔧 PyAutoGUI Backend Server")
    print("📡 Listening on http://localhost:5000")
    print("💡 Make sure to:")
    print("   1. Have WhatsApp Web open in your browser")
    print("   2. Copy any images/content to clipboard before starting automation")
    print("   3. Keep the browser window focused during automation")
    print("\n⚠️  SAFETY: Move mouse to top-left corner to emergency stop!")
    
    try:
        # Test PyAutoGUI
        screen_size = pyautogui.size()
        print(f"✅ PyAutoGUI initialized - Screen size: {screen_size.width}x{screen_size.height}")
        
        app.run(host='localhost', port=5000, debug=False, threaded=True)
    
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("💡 Make sure you have the required packages installed:")
        print("   pip install flask flask-cors pyautogui pillow")
