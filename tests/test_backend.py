#!/usr/bin/env python3
"""
Test script for WhatsApp Automation Backend
Tests the PyAutoGUI backend API endpoints
"""

import requests
import time
import json

BACKEND_URL = 'http://localhost:5000'

def test_health():
    """Test backend health endpoint"""
    try:
        response = requests.get(f'{BACKEND_URL}/health', timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Is automation_backend.py running?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_screen_info():
    """Test screen information endpoints"""
    try:
        # Test screen size
        response = requests.get(f'{BACKEND_URL}/screen/size', timeout=5)
        if response.status_code == 200:
            size = response.json()
            print(f"✅ Screen size: {size['width']}x{size['height']}")
        else:
            print("❌ Screen size test failed")
        
        # Test mouse position
        response = requests.get(f'{BACKEND_URL}/mouse/position', timeout=5)
        if response.status_code == 200:
            pos = response.json()
            print(f"✅ Mouse position: ({pos['x']}, {pos['y']})")
        else:
            print("❌ Mouse position test failed")
            
    except Exception as e:
        print(f"❌ Screen info test error: {e}")

def test_automation_status():
    """Test automation status endpoint"""
    try:
        response = requests.get(f'{BACKEND_URL}/automation/status', timeout=5)
        if response.status_code == 200:
            status = response.json()
            print("✅ Automation status retrieved")
            print(f"   Running: {status['is_running']}")
            print(f"   Current task: {status['current_task']}")
        else:
            print("❌ Automation status test failed")
    except Exception as e:
        print(f"❌ Automation status test error: {e}")

def main():
    print("🧪 Testing WhatsApp Automation Backend")
    print("=" * 40)
    
    # Test health first
    if not test_health():
        print("\n💡 To start the backend, run:")
        print("   python automation_backend.py")
        return
    
    print("\n📏 Testing screen information...")
    test_screen_info()
    
    print("\n🤖 Testing automation status...")
    test_automation_status()
    
    print("\n✅ All tests completed!")
    print("\n💡 Backend is ready for WhatsApp automation")
    print("   Open wa-batch.html in your browser to use the interface")

if __name__ == '__main__':
    main()
