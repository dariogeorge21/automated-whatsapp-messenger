function digitsOnly(s){
  return s.replace(/\D/g,'');
}

function normalize(n, defaultCC){
  let d = digitsOnly(n);
  if(!d) return null;
  // if begins with country code (assume length>10) or has leading 0? simple heuristic:
  if(defaultCC && d.length <= 10) d = defaultCC + d;
  return d;
}

function waLink(number, text){
  return `https://web.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(text)}`;
}

let list = [], idx = 0;
let automationActive = false;
let automationTimeout = null;
let countdownInterval = null;
const info = document.getElementById('info');
const progressFill = document.getElementById('progressFill');
const automationStatus = document.getElementById('automationStatus');
const currentStep = document.getElementById('currentStep');
const countdown = document.getElementById('countdown');

// Timer management for simultaneous execution
let activeTimers = {
  nextContact: { timeLeft: 0, active: false, element: null },
  paste: { timeLeft: 0, active: false, element: null },
  send: { timeLeft: 0, active: false, element: null },
  close: { timeLeft: 0, active: false, element: null }
};

// PyAutoGUI Backend Configuration
const BACKEND_URL = 'http://localhost:5000';
let backendConnected = false;

// Backend Communication Functions
async function checkBackendConnection() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      backendConnected = true;
      console.log('✅ PyAutoGUI backend connected');
      return true;
    } else {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
  } catch (error) {
    backendConnected = false;
    console.warn('⚠️ PyAutoGUI backend not available:', error.message);
    return false;
  }
}

async function sendBackendRequest(endpoint, data = {}) {
  if (!backendConnected) {
    console.warn('Backend not connected, attempting to reconnect...');
    await checkBackendConnection();
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `Request failed with status ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Backend request failed for ${endpoint}:`, error);
    throw error;
  }
}

function updateStatus(message, iconClass = 'fas fa-info-circle') {
  const statusIcon = document.querySelector('.status-icon');
  const statusText = info.querySelector('span');
  
  statusIcon.className = `status-icon ${iconClass}`;
  statusText.textContent = message;
}

function updateProgress() {
  if (list.length === 0) {
    progressFill.style.width = '0%';
    return;
  }
  const progress = (idx / list.length) * 100;
  progressFill.style.width = `${progress}%`;
}

function validateInputs() {
  const numbers = document.getElementById('numbers').value.trim();
  const openBtn = document.getElementById('openBtn');
  const startAutomationBtn = document.getElementById('startAutomationBtn');
  
  if (numbers.length === 0) {
    openBtn.style.opacity = '0.6';
    openBtn.style.cursor = 'not-allowed';
    startAutomationBtn.disabled = true;
    return false;
  } else {
    openBtn.style.opacity = '1';
    openBtn.style.cursor = 'pointer';
    if (list.length > 0 && !automationActive) {
      startAutomationBtn.disabled = false;
    }
    return true;
  }
}

function updateAutomationStatus(step) {
  if (!automationActive) {
    automationStatus.classList.remove('active');
    resetAllTimerDisplays();
    return;
  }
  
  automationStatus.classList.add('active');
  
  const contactInfo = `Contact ${idx + 1} of ${list.length}`;
  currentStep.textContent = `${contactInfo} - ${step}`;
}

function initializeTimerElements() {
  activeTimers.nextContact.element = document.getElementById('timerNextContact');
  activeTimers.paste.element = document.getElementById('timerPaste');
  activeTimers.send.element = document.getElementById('timerSend');
  activeTimers.close.element = document.getElementById('timerClose');
}

function resetAllTimerDisplays() {
  Object.values(activeTimers).forEach(timer => {
    if (timer.element) {
      timer.element.textContent = '--';
      timer.element.className = 'timer-countdown';
    }
  });
}

function updateTimerDisplay(timerName, timeLeft, isActive, isCompleted = false, isDisabled = false) {
  const timer = activeTimers[timerName];
  if (!timer.element) return;
  
  if (isDisabled) {
    timer.element.textContent = 'Disabled';
    timer.element.className = 'timer-countdown disabled';
  } else if (isCompleted) {
    timer.element.textContent = 'Done ✓';
    timer.element.className = 'timer-countdown completed';
  } else if (isActive) {
    timer.element.textContent = `${timeLeft.toFixed(1)}s`;
    timer.element.className = 'timer-countdown active';
  } else {
    timer.element.textContent = `${timeLeft.toFixed(1)}s`;
    timer.element.className = 'timer-countdown';
  }
}

function startSimultaneousTimers(timerConfigs, callbacks) {
  if (!automationActive) return;
  
  // Initialize all timers
  Object.keys(timerConfigs).forEach(timerName => {
    const config = timerConfigs[timerName];
    if (config.enabled) {
      activeTimers[timerName].timeLeft = config.delay;
      activeTimers[timerName].active = true;
      updateTimerDisplay(timerName, config.delay, true);
    } else {
      updateTimerDisplay(timerName, 0, false, false, true);
    }
  });
  
  // Start the countdown interval
  countdownInterval = setInterval(() => {
    if (!automationActive) {
      clearInterval(countdownInterval);
      return;
    }
    
    let anyTimerActive = false;
    
    // Update each active timer
    Object.keys(activeTimers).forEach(timerName => {
      const timer = activeTimers[timerName];
      const config = timerConfigs[timerName];
      
      if (timer.active && config && config.enabled) {
        timer.timeLeft -= 0.1;
        
        if (timer.timeLeft <= 0) {
          // Timer completed - execute callback
          timer.active = false;
          updateTimerDisplay(timerName, 0, false, true);
          
          if (callbacks[timerName]) {
            callbacks[timerName]();
          }
        } else {
          // Timer still running
          updateTimerDisplay(timerName, timer.timeLeft, true);
          anyTimerActive = true;
        }
      }
    });
    
    // Stop interval when all timers are done
    if (!anyTimerActive) {
      clearInterval(countdownInterval);
      
      // After all timers complete, handle next contact logic
      setTimeout(() => {
        if (automationActive) {
          // If Next Contact was not enabled, manually move to next contact
          const enableNextContact = document.getElementById('enableNextContact').checked;
          if (!enableNextContact) {
            idx++;
            updateProgress();
            console.log(`🔄 Manually moved to contact ${idx + 1} (Next Contact was disabled)`);
          }
          
          if (idx >= list.length) {
            updateStatus('🎉 Automation completed! All messages sent successfully.', 'fas fa-trophy');
            stopAutomation();
          } else {
            // Continue with next contact
            console.log(`🔄 Starting automation for contact ${idx + 1} of ${list.length}`);
            executeAutomationStep();
          }
        }
      }, 1000);
    }
  }, 100);
}

async function executeAutomationAction(action, delay = 0) {
  try {
    let endpoint;
    let actionName;
    
    switch(action) {
      case 'paste':
        endpoint = '/automation/paste';
        actionName = 'Ctrl+V (Paste)';
        break;
      case 'send':
        endpoint = '/automation/send';
        actionName = 'Enter (Send Message)';
        break;
      case 'close':
        endpoint = '/automation/close';
        actionName = 'Ctrl+W (Close Tab)';
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    updateAutomationStatus(`Sending ${actionName}`);
    console.log(`Executing ${actionName} via PyAutoGUI backend`);
    
    const result = await sendBackendRequest(endpoint, { delay: delay });
    console.log(`✅ ${actionName} executed successfully`);
    
    return result;
  } catch (error) {
    console.error(`❌ Failed to execute ${action}:`, error);
    updateStatus(`❌ Automation failed: ${error.message}`, 'fas fa-exclamation-triangle');
    throw error;
  }
}

function executeAutomationStep() {
  if (!automationActive || idx >= list.length) {
    stopAutomation();
    return;
  }
  
  updateAutomationStatus('Starting automation timers');
  console.log(`🎯 Starting automation for contact ${idx + 1} of ${list.length}`);
  
  // Get current settings
  const enableNextContact = document.getElementById('enableNextContact').checked;
  const enablePaste = document.getElementById('enablePaste').checked;
  const enableSend = document.getElementById('enableSend').checked;
  const enableClose = document.getElementById('enableClose').checked;
  
  const delayNextContact = parseFloat(document.getElementById('delayNextContact').value) || 0;
  const delayPaste = parseFloat(document.getElementById('delayPaste').value) || 0;
  const delaySend = parseFloat(document.getElementById('delaySend').value) || 0;
  const delayClose = parseFloat(document.getElementById('delayClose').value) || 0;
  
  // Configure timers
  const timerConfigs = {
    nextContact: { enabled: enableNextContact, delay: delayNextContact },
    paste: { enabled: enablePaste, delay: delayPaste },
    send: { enabled: enableSend, delay: delaySend },
    close: { enabled: enableClose, delay: delayClose }
  };
  
  // Configure callbacks for when each timer completes
  const callbacks = {
    nextContact: () => {
      if (automationActive) {
        // Move to NEXT contact and open it
        idx++;
        updateProgress();
        
        if (idx < list.length) {
          const msg = document.getElementById('message').value || '';
          window.open(waLink(list[idx], msg), "_blank", "noopener,noreferrer");
          updateStatus(`Automation: Opened chat ${idx + 1} of ${list.length}`, 'fas fa-robot');
          console.log(`✅ Moved to and opened contact ${idx + 1}`);
        } else {
          console.log('✅ Reached end of contact list');
        }
      }
    },
    paste: async () => {
      if (automationActive) {
        try {
          await executeAutomationAction('paste');
          console.log('✅ Paste action completed');
        } catch (error) {
          console.error('❌ Paste action failed:', error);
          stopAutomation();
        }
      }
    },
    send: async () => {
      if (automationActive) {
        try {
          await executeAutomationAction('send');
          console.log('✅ Send action completed');
        } catch (error) {
          console.error('❌ Send action failed:', error);
          stopAutomation();
        }
      }
    },
    close: async () => {
      if (automationActive) {
        try {
          await executeAutomationAction('close');
          console.log('✅ Close action completed');
        } catch (error) {
          console.error('❌ Close action failed:', error);
          stopAutomation();
        }
      }
    }
  };
  
  // Start all timers simultaneously
  startSimultaneousTimers(timerConfigs, callbacks);
}

async function startAutomation() {
  if (list.length === 0) {
    updateStatus('Please start batch process first.', 'fas fa-exclamation-triangle');
    return;
  }
  
  // Check backend connection before starting
  updateStatus('🔌 Connecting to PyAutoGUI backend...', 'fas fa-spinner fa-spin');
  
  const connected = await checkBackendConnection();
  if (!connected) {
    updateStatus('❌ PyAutoGUI backend not available. Please start automation_backend.py first.', 'fas fa-exclamation-triangle');
    return;
  }
  
  automationActive = true;
  document.getElementById('startAutomationBtn').disabled = true;
  document.getElementById('stopAutomationBtn').disabled = false;
  document.getElementById('nextBtn').disabled = true;
  
  updateStatus('🤖 PyAutoGUI automation started! Keep WhatsApp Web focused.', 'fas fa-robot');
  
  // Start automation from current index
  executeAutomationStep();
}

function stopAutomation() {
  automationActive = false;
  
  if (automationTimeout) {
    clearTimeout(automationTimeout);
    automationTimeout = null;
  }
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  // Stop all active timers
  Object.keys(activeTimers).forEach(timerName => {
    activeTimers[timerName].active = false;
    activeTimers[timerName].timeLeft = 0;
  });
  
  document.getElementById('startAutomationBtn').disabled = list.length === 0;
  document.getElementById('stopAutomationBtn').disabled = true;
  document.getElementById('nextBtn').disabled = false;
  
  automationStatus.classList.remove('active');
  resetAllTimerDisplays();
  
  if (idx >= list.length) {
    updateStatus('🎉 All messages sent successfully! Process completed.', 'fas fa-trophy');
    document.getElementById('nextBtn').disabled = true;
  } else {
    updateStatus(`Automation stopped. Currently at contact ${idx + 1} of ${list.length}.`, 'fas fa-pause-circle');
  }
}

// Event handlers for buttons
function handleOpenBtn() {
  if (!validateInputs()) {
    updateStatus('Please enter at least one phone number.', 'fas fa-exclamation-triangle');
    return;
  }

  const raw = document.getElementById('numbers').value.trim().split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const cc = document.getElementById('cc').value.trim();
  const msg = document.getElementById('message').value || '';
  
  updateStatus('Processing phone numbers...', 'fas fa-spinner fa-spin');
  
  // Small delay to show processing state
  setTimeout(() => {
    list = raw.map(r => normalize(r, cc)).filter(Boolean);
    
    if(list.length === 0){ 
      updateStatus('No valid phone numbers found. Please check your input format.', 'fas fa-exclamation-triangle');
      return; 
    }
    
    idx = 0;
    window.open(waLink(list[idx], msg), "_blank", "noopener,noreferrer");
    updateStatus(`Opened chat ${idx+1} of ${list.length}. Use manual controls or start automation.`, 'fas fa-check-circle');
    updateProgress();
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('startAutomationBtn').disabled = false;
  }, 500);
}

function handleNextBtn() {
  const msg = document.getElementById('message').value || '';
  idx++;
  
  if(idx >= list.length){
    updateStatus('🎉 All messages sent successfully! Process completed.', 'fas fa-trophy');
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('startAutomationBtn').disabled = true;
    updateProgress();
    return;
  }
  
  window.open(waLink(list[idx], msg), "_blank", "noopener,noreferrer");
  updateStatus(`Opened chat ${idx+1} of ${list.length}. Send your message, then click "Next Contact".`, 'fas fa-check-circle');
  updateProgress();
}

function handleResetBtn() {
  if (confirm('Are you sure you want to reset? This will stop automation and clear all progress.')) {
    stopAutomation();
    list = []; 
    idx = 0;
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('startAutomationBtn').disabled = true;
    document.getElementById('numbers').value = '';
    document.getElementById('message').value = 'Hi, here\'s the info you requested.';
    document.getElementById('cc').value = '';
    updateStatus('Reset completed. Ready to start a new batch process.', 'fas fa-info-circle');
    updateProgress();
    validateInputs();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Check backend connection on startup
  console.log('🚀 Initializing WhatsApp Batch Opener...');
  await checkBackendConnection();
  
  if (backendConnected) {
    console.log('✅ PyAutoGUI backend ready');
  } else {
    console.log('⚠️ PyAutoGUI backend not available - automation features will be limited');
  }
  
  // Initialize timer elements
  initializeTimerElements();
  
  // Real-time validation
  document.getElementById('numbers').addEventListener('input', validateInputs);
  document.getElementById('cc').addEventListener('input', function(e) {
    // Only allow numbers
    this.value = this.value.replace(/\D/g, '');
  });

  // Automation step toggles
  ['enableNextContact', 'enablePaste', 'enableSend', 'enableClose'].forEach(id => {
    document.getElementById(id).addEventListener('change', function() {
      const stepDiv = this.closest('.automation-step');
      if (this.checked) {
        stepDiv.style.opacity = '1';
      } else {
        stepDiv.style.opacity = '0.6';
      }
    });
  });

  // Button event handlers
  document.getElementById('openBtn').addEventListener('click', handleOpenBtn);
  document.getElementById('nextBtn').addEventListener('click', handleNextBtn);
  document.getElementById('startAutomationBtn').addEventListener('click', startAutomation);
  document.getElementById('stopAutomationBtn').addEventListener('click', stopAutomation);
  document.getElementById('resetBtn').addEventListener('click', handleResetBtn);

  // Initialize validation state
  validateInputs();
});
