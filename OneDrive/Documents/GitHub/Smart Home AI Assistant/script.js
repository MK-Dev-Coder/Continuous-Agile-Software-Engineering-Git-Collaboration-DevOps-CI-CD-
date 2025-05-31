// Initialize variables
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

// Enhanced AI Configuration
const AI_CONFIG = {
    contextWindow: 10, // Remember last 10 interactions
    learningMode: true,
    personalityTraits: {
        helpful: 0.9,
        friendly: 0.8,
        technical: 0.7,
        proactive: 0.8
    },
    smartFeatures: {
        patternRecognition: true,
        predictiveActions: true,
        contextAwareness: true,
        multiModal: true,
        anomalyDetection: true
    }
};

// Elements
const micButton = document.getElementById('micButton');
const chatArea = document.getElementById('chatArea');
const status = document.getElementById('status');
const voiceSelect = document.getElementById('voiceSelect');
const speedSelect = document.getElementById('speedSelect');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKey');
const apiStatus = document.getElementById('apiStatus');
const connectArduinoButton = document.getElementById('connectArduino');
const arduinoStatus = document.getElementById('arduinoStatus');
const arduinoStatusText = document.getElementById('arduinoStatusText');
const testSpeechButton = document.getElementById('testSpeechButton');

// Sensor elements
const tempValue = document.getElementById('tempValue');
const humidityValue = document.getElementById('humidityValue');
const lightValue = document.getElementById('lightValue');
const motionValue = document.getElementById('motionValue');

// State
let isListening = false;
let voices = [];
let apiKey = ''; // Will be loaded from localStorage during initialization
let ws = null;

// Initialize Enhanced AI Components (will be created when available)
let conversationManager = null;
let intentClassifier = null;
let responseGenerator = null;
let lastProactiveCheck = 0;
let sensorData = {
    temperature: null,
    humidity: null,
    light: null,
    motion: false,
    sound: null,
    water_detected: false,
    moisture_level: null,
    moisture_status: null,
    distance: null,
    potentiometer: null,
    rgb_color: {r: 0, g: 0, b: 0},
    rgb_enabled: true,
    multicolor_mode: false,
    pot_control_mode: false
};

// Update sensor display in the UI
function updateSensorDisplay() {
    if (tempValue) tempValue.textContent = sensorData.temperature ? `${sensorData.temperature}°C` : '--';
    if (humidityValue) humidityValue.textContent = sensorData.humidity ? `${sensorData.humidity}%` : '--';
    if (lightValue) lightValue.textContent = sensorData.light ? `${sensorData.light} lux` : '--';
    if (motionValue) motionValue.textContent = sensorData.motion ? 'Detected' : 'Clear';
    
    // Additional sensors
    const soundValue = document.getElementById('soundValue');
    const waterValue = document.getElementById('waterValue');
    const moistureValue = document.getElementById('moistureValue');
    const distanceValue = document.getElementById('distanceValue');
    const rgbValue = document.getElementById('rgbValue');
    
    if (soundValue) soundValue.textContent = sensorData.sound || '--';
    if (waterValue) waterValue.textContent = sensorData.water_detected ? 'DETECTED' : 'CLEAR';
    if (moistureValue) moistureValue.textContent = sensorData.moisture_status || '--';
    if (distanceValue) distanceValue.textContent = sensorData.distance >= 0 ? `${sensorData.distance}cm` : 'OUT OF RANGE';
    if (rgbValue) {
        const rgb = sensorData.rgb_color;
        rgbValue.textContent = rgb ? `R:${rgb.r} G:${rgb.g} B:${rgb.b}` : '--';
        rgbValue.style.color = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
    }
}

// Simulated sensor data for demo
function simulateSensorData() {
    sensorData.temperature = (20 + Math.random() * 10).toFixed(1);
    sensorData.humidity = (40 + Math.random() * 30).toFixed(0);
    sensorData.light = Math.floor(100 + Math.random() * 900);
    sensorData.motion = Math.random() > 0.7;

    updateSensorDisplay();
}

// Enhanced Smart Sensor Simulation with Realistic Patterns
function simulateSmartSensorData() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Time-based patterns for realistic simulation
    const patterns = {
        temperature: calculateSmartTemperature(hour, isWeekend),
        humidity: calculateSmartHumidity(hour, sensorData.temperature),
        light: calculateSmartLight(hour, minute),
        motion: calculateSmartMotion(hour, isWeekend),
        sound: calculateSmartSound(hour, isWeekend),
        water: calculateSmartWater(),
        moisture: calculateSmartMoisture(),
        distance: calculateSmartDistance(hour),
        rgb: calculateSmartRGB()
    };

    // Apply intelligent noise and variations
    sensorData.temperature = addIntelligentNoise(patterns.temperature, 0.5, 15, 35).toFixed(1);
    sensorData.humidity = Math.round(addIntelligentNoise(patterns.humidity, 2, 30, 80));
    sensorData.light = Math.round(addIntelligentNoise(patterns.light, 50, 0, 1000));
    sensorData.motion = patterns.motion;
    sensorData.sound = Math.round(addIntelligentNoise(patterns.sound, 20, 100, 800));
    sensorData.water_detected = patterns.water;
    sensorData.moisture_level = Math.round(addIntelligentNoise(patterns.moisture, 30, 0, 1000));
    sensorData.moisture_status = getMoistureStatusFromLevel(sensorData.moisture_level);
    sensorData.distance = patterns.distance >= 0 ? patterns.distance.toFixed(1) : -1;
    sensorData.rgb_color = patterns.rgb;
    sensorData.rgb_enabled = true;
    sensorData.multicolor_mode = Math.random() > 0.8; // 20% chance
    sensorData.pot_control_mode = Math.random() > 0.9; // 10% chance
    sensorData.potentiometer = Math.round(Math.random() * 1023);

    // Update timestamp
    sensorData.timestamp = now.toISOString();    // Record patterns for learning
    if (typeof advancedPatterns !== 'undefined' && conversationManager) {
        const context = conversationManager.getSmartContext();
        advancedPatterns.analyzeBehaviorPattern('sensor_update', context);
    }

    // Update energy tracking
    if (typeof energyOptimizer !== 'undefined' && conversationManager && sensorData.light > 500) {
        energyOptimizer.recordDeviceUsage('lighting', 5, conversationManager.getSmartContext());
    }

    updateSensorDisplay();
}

// Smart temperature calculation with daily and seasonal patterns
function calculateSmartTemperature(hour, isWeekend) {
    // Base temperature with daily cycle
    const dailyCycle = 22 + 4 * Math.sin((hour - 6) * Math.PI / 12); // Peak at 2 PM
    
    // Weekend adjustment (people home more, more heating/cooling)
    const weekendAdjust = isWeekend ? (Math.random() - 0.5) * 2 : 0;
    
    // Evening heating pattern
    const eveningBoost = hour >= 18 && hour <= 22 ? 2 : 0;
    
    // Morning warmup
    const morningBoost = hour >= 6 && hour <= 8 ? 1 : 0;
    
    return dailyCycle + weekendAdjust + eveningBoost + morningBoost;
}

// Smart humidity calculation correlated with temperature and weather patterns
function calculateSmartHumidity(hour, temperature) {
    // Inverse relationship with temperature
    const baseHumidity = 70 - (parseFloat(temperature) - 20) * 2;
    
    // Morning dew pattern
    const morningHumidity = hour >= 5 && hour <= 9 ? 10 : 0;
    
    // Evening cooking/shower pattern
    const eveningHumidity = hour >= 17 && hour <= 21 ? 5 : 0;
    
    // Random weather variations
    const weatherVariation = (Math.random() - 0.5) * 10;
    
    return Math.max(30, Math.min(85, baseHumidity + morningHumidity + eveningHumidity + weatherVariation));
}

// Smart light calculation with natural light patterns and occupancy
function calculateSmartLight(hour, minute) {
    // Natural daylight cycle
    let naturalLight;
    if (hour >= 7 && hour <= 18) {
        // Daytime - bell curve with peak at noon
        const timeFromNoon = Math.abs(hour + minute/60 - 12);
        naturalLight = 800 * Math.exp(-Math.pow(timeFromNoon / 4, 2));
    } else {
        // Nighttime
        naturalLight = 10 + Math.random() * 30; // Street lights, moon
    }
    
    // Artificial lighting patterns
    const artificialLight = calculateArtificialLighting(hour);
    
    return Math.min(1000, naturalLight + artificialLight);
}

// Calculate artificial lighting based on occupancy patterns
function calculateArtificialLighting(hour) {
    // Early morning (6-8 AM): Getting ready
    if (hour >= 6 && hour <= 8) return 200 + Math.random() * 100;
    
    // Evening (18-23): Home activities
    if (hour >= 18 && hour <= 23) return 300 + Math.random() * 200;
    
    // Late night (23-6): Minimal lighting
    if (hour >= 23 || hour <= 6) return Math.random() * 50;
    
    // Daytime (9-17): Minimal artificial light
    return Math.random() * 80;
}

// Smart motion detection with realistic human activity patterns
function calculateSmartMotion(hour, isWeekend) {
    let motionProbability = 0.1; // Base 10% chance
    
    // Morning routine (6-9 AM)
    if (hour >= 6 && hour <= 9) motionProbability = 0.6;
    
    // Evening activity (17-22)
    if (hour >= 17 && hour <= 22) motionProbability = 0.7;
    
    // Lunch time (12-13)
    if (hour >= 12 && hour <= 13) motionProbability = 0.4;
    
    // Weekend adjustments - more activity during day
    if (isWeekend && hour >= 9 && hour <= 18) motionProbability *= 1.3;
    
    // Late night (23-6) - very low activity
    if (hour >= 23 || hour <= 6) motionProbability = 0.05;
    
    return Math.random() < motionProbability;
}

// Smart sound level calculation
function calculateSmartSound(hour, isWeekend) {
    // Base ambient sound
    let soundLevel = 200; // Quiet room baseline
    
    // Traffic and activity patterns
    if (hour >= 7 && hour <= 9) soundLevel += 150; // Morning traffic
    if (hour >= 17 && hour <= 19) soundLevel += 180; // Evening traffic
    if (hour >= 10 && hour <= 16) soundLevel += 80;  // Daytime activity
    
    // Weekend patterns - more leisure activity
    if (isWeekend) {
        if (hour >= 10 && hour <= 20) soundLevel += 50;
    }
    
    // Evening quiet hours
    if (hour >= 22 || hour <= 6) soundLevel = Math.max(150, soundLevel - 100);
    
    return soundLevel;
}

// Smart water detection (occasional events)
function calculateSmartWater() {
    // Very low probability - only for demonstration
    // Higher chance during shower/cooking times
    const hour = new Date().getHours();
    let waterProbability = 0.001; // 0.1% base chance
    
    if ((hour >= 7 && hour <= 8) || (hour >= 19 && hour <= 21)) {
        waterProbability = 0.02; // 2% during shower/cooking times
    }
    
    return Math.random() < waterProbability;
}

// Smart moisture level for plant monitoring
function calculateSmartMoisture() {
    // Simulate plant watering cycles
    const hour = new Date().getHours();
    const day = new Date().getDate();
    
    // Base moisture level decreases over time
    const daysSinceWatering = (day % 3); // Water every 3 days
    let moistureLevel = 600 - (daysSinceWatering * 150);
    
    // Watering time simulation (morning 7-9 AM)
    if (hour >= 7 && hour <= 9 && daysSinceWatering === 0) {
        moistureLevel = 800 + Math.random() * 100;
    }
    
    // Gradual drying throughout the day
    if (hour > 9) {
        moistureLevel -= (hour - 9) * 5;
    }
    
    return Math.max(100, Math.min(900, moistureLevel));
}

// Smart distance sensor simulation
function calculateSmartDistance(hour) {
    // Simulate people moving in and out of detection range
    const motionActive = sensorData.motion;
    
    if (motionActive) {
        // Someone is moving - varying distances
        return 50 + Math.random() * 200; // 50-250 cm
    } else {
        // No motion - either empty room or stationary
        if (Math.random() < 0.3) {
            return 30 + Math.random() * 50; // Someone sitting still
        } else {
            return -1; // Out of range - empty room
        }
    }
}

// Smart RGB color simulation
function calculateSmartRGB() {
    const hour = new Date().getHours();
    
    // Time-based color themes
    if (hour >= 6 && hour <= 11) {
        // Morning - energizing colors
        return { r: 255, g: 200 + Math.random() * 55, b: 100 + Math.random() * 100 };
    } else if (hour >= 12 && hour <= 17) {
        // Afternoon - bright colors
        return { r: 100 + Math.random() * 155, g: 255, b: 100 + Math.random() * 155 };
    } else if (hour >= 18 && hour <= 22) {
        // Evening - warm colors
        return { r: 255, g: 100 + Math.random() * 100, b: 50 + Math.random() * 50 };
    } else {
        // Night - cool/dim colors
        return { r: 50 + Math.random() * 100, g: 50 + Math.random() * 100, b: 100 + Math.random() * 155 };
    }
}

// Helper function to add intelligent noise to sensor readings
function addIntelligentNoise(baseValue, noiseLevel, min, max) {
    const noise = (Math.random() - 0.5) * 2 * noiseLevel;
    return Math.max(min, Math.min(max, baseValue + noise));
}

// Helper function to determine moisture status from level
function getMoistureStatusFromLevel(level) {
    if (level < 200) return "DRY";
    else if (level < 500) return "HUMID";
    else return "WET";
}

// Start sensor simulation
setInterval(simulateSmartSensorData, 5000); // Update every 5 seconds

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Smart Home AI Assistant - Page loaded');
    console.log('📝 Starting initialization...');
    initializeApp();
});

// Add periodic API key sync check (every 30 seconds) to catch any sync issues
setInterval(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey && storedApiKey !== apiKey) {
        console.log('🔄 Periodic API key sync - updating from localStorage');
        apiKey = storedApiKey;
        updateApiStatus();
    } else if (!storedApiKey && apiKey) {
        console.log('🔄 Periodic API key sync - clearing variable (removed from storage)');
        apiKey = '';
        updateApiStatus();
    }
}, 30000);

// Initialize application
function initializeApp() {
    console.log('🔧 Initializing app components...');
    
    // Load API key first to ensure it's available
    loadApiKey();
    
    // Then load other components
    loadVoices();
    setupEventListeners();
    updateApiStatus();
    updateSensorDisplay();
    
    console.log('✅ App initialization complete');
    console.log('🔑 Final API key state after init:', apiKey ? `[EXISTS - Length: ${apiKey.length}]` : '[NOT LOADED]');
}

// Setup event listeners
function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    
    // API Key functionality
    if (saveApiKeyButton) {
        saveApiKeyButton.addEventListener('click', saveApiKey);
        console.log('✅ API Key button listener added');
    } else {
        console.error('❌ saveApiKeyButton element not found');
    }
    
    // Voice controls
    if (micButton) {
        micButton.addEventListener('click', toggleListening);
        console.log('✅ Microphone button listener added');
    } else {
        console.error('❌ micButton element not found');
    }
    
    // Arduino/WebSocket connection
    if (connectArduinoButton) {
        connectArduinoButton.addEventListener('click', connectToWebSocket);
        console.log('✅ Arduino connection button listener added');
    } else {
        console.error('❌ connectArduinoButton element not found');
    }
    
    // Voice settings
    if (voiceSelect) {
        voiceSelect.addEventListener('change', updateVoiceSettings);
        console.log('✅ Voice select listener added');
    }
      if (speedSelect) {
        speedSelect.addEventListener('change', updateVoiceSettings);
        console.log('✅ Speed select listener added');
    }
    
    // Test speech button
    if (testSpeechButton) {
        testSpeechButton.addEventListener('click', testSpeech);
        console.log('✅ Test speech button listener added');
    } else {
        console.error('❌ testSpeechButton element not found');
    }
    
    console.log('🔗 Event listener setup complete');
}

// API Key Management
function loadApiKey() {
    console.log('🔧 loadApiKey function called');
    
    // Always reload from localStorage to ensure sync
    const storedApiKey = localStorage.getItem('gemini_api_key');
    console.log('🔑 DEBUG: Loading API key from localStorage:', storedApiKey ? `[EXISTS - Length: ${storedApiKey.length}]` : '[EMPTY/NULL]');
    
    if (storedApiKey) {
        apiKey = storedApiKey;
        console.log('✅ API key loaded and synced from localStorage');
    } else {
        apiKey = '';
        console.log('⚠️ No API key found in localStorage');
    }
    
    // Update the input field if it exists
    if (apiKeyInput) {
        apiKeyInput.value = apiKey;
        console.log('✅ API key input field updated');
    } else {
        console.error('❌ apiKeyInput element not found');
    }
}

function saveApiKey() {
    console.log('💾 saveApiKey function called');
    
    if (!apiKeyInput) {
        console.error('❌ apiKeyInput element not found');
        return;
    }
    
    const newApiKey = apiKeyInput.value.trim();
    console.log('🔑 API Key input value:', newApiKey ? '[HIDDEN]' : 'empty');
    
    if (newApiKey) {
        apiKey = newApiKey;
        localStorage.setItem('gemini_api_key', apiKey);
        console.log('✅ API Key saved to localStorage');
        
        // Update status
        if (apiStatus) {
            apiStatus.style.color = '#4CAF50';
            apiStatus.textContent = '✅ API Key saved successfully!';
            console.log('✅ Success message displayed');
        } else {
            console.error('❌ apiStatus element not found');
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            if (apiStatus) {
                apiStatus.textContent = '';
            }
        }, 3000);
        
        console.log('API Key saved successfully');
    } else {
        console.log('⚠️ Empty API key provided');
        // Show error
        if (apiStatus) {
            apiStatus.style.color = '#f44336';
            apiStatus.textContent = '❌ Please enter a valid API key';
        }
        
        setTimeout(() => {
            if (apiStatus) {
                apiStatus.textContent = '';
            }
        }, 3000);
    }
    
    updateApiStatus();
}

function updateApiStatus() {
    console.log('🔧 updateApiStatus called');
    
    // Force refresh API key from localStorage
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey && storedApiKey !== apiKey) {
        console.log('🔄 Syncing API key during status update');
        apiKey = storedApiKey;
    }
    
    if (!apiStatus) {
        console.error('❌ apiStatus element not found');
        return;
    }
    
    console.log('🔑 Current API key status:', apiKey ? `[EXISTS - Length: ${apiKey.length}]` : '[EMPTY/NULL]');
    
    if (apiKey) {
        apiStatus.style.color = '#4CAF50';
        apiStatus.innerHTML = '✅ Full AI Intelligence Enabled! I can now answer ANY question and be truly smart.';
        console.log('✅ API status set to enabled');
    } else {
        apiStatus.style.color = '#ff9800';
        apiStatus.innerHTML = '🧠 Add your API key above to unlock my full intelligence for math, conversations, and unlimited knowledge!';
        console.log('⚠️ API status set to disabled');
    }
}

// Voice Management
function loadVoices() {
    if (!voiceSelect) return;
    
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    
    if (voices.length === 0) {
        // Voices not loaded yet, try again
        setTimeout(loadVoices, 100);
        return;
    }
    
    console.log('🎤 Loading', voices.length, 'available voices');
    
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.default) option.selected = true;
        voiceSelect.appendChild(option);
    });
    
    console.log('✅ Voices loaded successfully');
}

// Ensure voices are loaded when they become available
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

function updateVoiceSettings() {
    // Voice settings updated - this affects speech synthesis
    console.log('Voice settings updated');
}

// Speech Recognition
function toggleListening() {
    if (!micButton) return;
    
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    try {
        recognition.start();
        isListening = true;
        
        if (micButton) {
            micButton.classList.add('listening');
            micButton.style.background = '#f44336';
        }
        
        if (status) {
            status.textContent = 'Listening... Speak now';
            status.style.color = '#4CAF50';
        }
        
        console.log('Started listening');
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        if (status) {
            status.textContent = 'Speech recognition not supported';
            status.style.color = '#f44336';
        }
    }
}

function stopListening() {
    try {
        recognition.stop();
        isListening = false;
        
        if (micButton) {
            micButton.classList.remove('listening');
            micButton.style.background = '';
        }
        
        if (status) {
            status.textContent = 'Click to speak';
            status.style.color = '#888';
        }
        
        console.log('Stopped listening');
    } catch (error) {
        console.error('Error stopping speech recognition:', error);
    }
}

// WebSocket Connection
function connectToWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        // Already connected
        return;
    }
    
    try {
        ws = new WebSocket('ws://localhost:3000');
        
        ws.onopen = function() {
            console.log('Connected to WebSocket server');
            updateArduinoStatus(true, 'Connected to Server');
            
            if (connectArduinoButton) {
                connectArduinoButton.textContent = 'Connected ✅';
                connectArduinoButton.disabled = true;
            }
        };
        
        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                handleSensorData(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        ws.onclose = function() {
            console.log('WebSocket connection closed');
            updateArduinoStatus(false, 'Disconnected');
            
            if (connectArduinoButton) {
                connectArduinoButton.textContent = 'Connect to Server';
                connectArduinoButton.disabled = false;
            }
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            updateArduinoStatus(false, 'Connection Error');
            
            if (connectArduinoButton) {
                connectArduinoButton.textContent = 'Connect to Server';
                connectArduinoButton.disabled = false;
            }
        };
        
    } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        updateArduinoStatus(false, 'Connection Failed');
    }
}

function handleSensorData(data) {
    // Update sensor data from WebSocket
    if (data.temperature !== undefined) sensorData.temperature = data.temperature;
    if (data.humidity !== undefined) sensorData.humidity = data.humidity;
    if (data.light !== undefined) sensorData.light = data.light;
    if (data.motion !== undefined) sensorData.motion = data.motion;
    if (data.sound !== undefined) sensorData.sound = data.sound;
    if (data.water_detected !== undefined) sensorData.water_detected = data.water_detected;
    if (data.moisture_level !== undefined) sensorData.moisture_level = data.moisture_level;
    if (data.distance !== undefined) sensorData.distance = data.distance;
    if (data.rgb_color !== undefined) sensorData.rgb_color = data.rgb_color;
    
    updateSensorDisplay();
    console.log('Received sensor data:', data);
}

function updateArduinoStatus(connected, message) {
    if (arduinoStatus) {
        arduinoStatus.className = connected ? 'status-dot connected' : 'status-dot';
    }
    
    if (arduinoStatusText) {
        arduinoStatusText.textContent = message || (connected ? 'Connected' : 'Not Connected');
    }
}

// Speech Recognition Event Handlers
recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    console.log('🎤 Heard:', transcript);
    
    if (status) {
        status.textContent = `You said: "${transcript}"`;
        status.style.color = '#2196F3';
    }
    
    // Add message to chat
    addMessage('user', transcript);
    addToConversationHistory('user', transcript);
    
    // Process the voice command
    console.log('🧠 Processing command:', transcript);
    processVoiceCommand(transcript);
};

recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    
    if (status) {
        status.textContent = `Error: ${event.error}`;
        status.style.color = '#f44336';
    }
    
    stopListening();
};

recognition.onend = function() {
    stopListening();
};

// Voice Command Processing with AI - Enhanced to use full AI power
async function processVoiceCommand(transcript) {
    const command = transcript.toLowerCase();
    
    // Enhanced API key debugging with guaranteed localStorage check
    console.log('🔍 DEBUG: processVoiceCommand called with:', transcript);
    console.log('🔑 DEBUG: Current apiKey variable:', apiKey ? `[EXISTS - Length: ${apiKey.length}]` : '[EMPTY/NULL]');
    
    // ALWAYS check localStorage directly to ensure we have the latest API key
    const currentStoredApiKey = localStorage.getItem('gemini_api_key');
    console.log('🔑 DEBUG: Direct localStorage check:', currentStoredApiKey ? `[EXISTS - Length: ${currentStoredApiKey.length}]` : '[EMPTY/NULL]');
    
    // Sync the apiKey variable with localStorage if there's a mismatch
    if (currentStoredApiKey && currentStoredApiKey !== apiKey) {
        console.log('🔄 DEBUG: Found API key mismatch, syncing from localStorage...');
        apiKey = currentStoredApiKey;
        console.log('✅ DEBUG: API key synced from localStorage');
    } else if (!currentStoredApiKey && apiKey) {
        console.log('🔄 DEBUG: API key exists in variable but not in localStorage, clearing variable...');
        apiKey = '';
    }
    
    console.log('🔑 DEBUG: Final API key state:', apiKey ? `[EXISTS - Length: ${apiKey.length}]` : '[EMPTY/NULL]');
    
    // Check if we have an API key for intelligent responses
    if (!apiKey) {
        console.log('⚠️ No API key - using basic fallback responses');
        // Show a helpful message about API key
        addMessage('assistant', '🔑 For full AI capabilities including general questions, math, conversations, and smart analysis, please configure your Gemini API key in the settings above. Right now I can only help with basic smart home commands.');
        processBasicCommand(command);
        return;
    }
    
    console.log('🧠 API key available - using full AI intelligence for:', transcript);
    console.log('🔑 API key format check - starts with:', apiKey.substring(0, 15) + '...');
    
    // Prepare comprehensive context about the smart home
    const contextData = {
        sensors: {
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            light: sensorData.light,
            motion: sensorData.motion,
            sound: sensorData.sound,
            water_detected: sensorData.water_detected,
            moisture: sensorData.moisture_status,
            distance: sensorData.distance,
            rgb_color: sensorData.rgb_color
        },
        timestamp: new Date().toLocaleString(),
        weather_context: getWeatherContext(),
        time_context: getTimeContext(),
        conversation_history: getConversationContext(),
        user_preferences: userPreferences
    };
      // Use full AI intelligence for ALL queries - no exceptions
    try {
        console.log('🚀 Sending to Gemini AI:', transcript);
        console.log('🔑 API Key length:', apiKey ? apiKey.length : 'No API key');
        console.log('🔑 API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'No API key');
        
        const response = await getAIResponse(transcript, contextData);
        addMessage('assistant', response);
        addToConversationHistory('assistant', response);
        speak(response);
        console.log('✅ AI response successful');
    } catch (error) {
        console.error('❌ AI response error details:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Show a more helpful error message and retry logic
        let errorMessage = "🤖 I encountered an issue connecting to my full AI capabilities. ";
        let shouldFallback = true;
        
        if (error.message.includes('403') || error.message.includes('API key') || error.message.includes('API_KEY')) {
            errorMessage += "❌ API Key Error: Please check that your API key is valid and has sufficient quota. ";
            errorMessage += "Make sure you're using a valid Gemini API key from Google AI Studio.";
            shouldFallback = false; // Don't fallback for API key errors
        } else if (error.message.includes('429')) {
            errorMessage += "⏰ Rate Limit: I'm receiving too many requests. Please wait a moment and try again.";
            shouldFallback = false;
        } else if (error.message.includes('400')) {
            errorMessage += "📝 Request Error: There was an issue with the request format. This might be a temporary problem.";
        } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
            errorMessage += "🔧 Service Error: The AI service is temporarily unavailable. Let me try to help with basic responses.";
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
            errorMessage += "🌐 Network Error: Unable to connect to the AI service. Check your internet connection.";
        } else {
            errorMessage += `🔍 Unknown Error: ${error.message}. Let me try to help with basic responses.`;
        }
        
        addMessage('assistant', errorMessage);
        speak(errorMessage);
        
        // Only fall back to basic processing for network/service errors, not API key issues
        if (shouldFallback) {
            console.log('🔄 Falling back to basic command processing due to service error');
            processBasicCommand(command);
        } else {
            console.log('🚫 Not falling back - this appears to be an API key or quota issue');
        }
    }
}

// Enhanced basic command processing (fallback) with more intelligence
function processBasicCommand(command) {
    console.log('🔄 Using fallback command processing for:', command);
    
    let response = "";
    
    if (command.includes('temperature') || command.includes('temp')) {
        const temp = sensorData.temperature || '--';
        const tempEmoji = temp !== '--' ? getTempEmoji(temp) : '🌡️';
        response = `${tempEmoji} The current temperature is ${temp} degrees Celsius. ${temp > 25 ? 'Quite warm!' : temp < 18 ? 'A bit chilly!' : 'Nice and comfortable!'}`;
    } 
    else if (command.includes('humidity') || command.includes('humid')) {
        const humidity = sensorData.humidity || '--';
        const humidityEmoji = humidity !== '--' ? getHumidityEmoji(humidity) : '💧';
        response = `${humidityEmoji} The humidity level is ${humidity} percent. ${humidity > 70 ? 'High humidity - consider ventilation.' : humidity < 40 ? 'Low humidity - might want a humidifier.' : 'Good humidity level!'}`;
    } 
    else if (command.includes('light') || command.includes('bright')) {
        const light = sensorData.light || '--';
        const lightEmoji = light !== '--' ? getLightEmoji(light) : '💡';
        response = `${lightEmoji} The light level is ${light} lux. ${light > 500 ? 'Very bright!' : light < 100 ? 'Quite dim.' : 'Good lighting!'}`;
    } 
    else if (command.includes('motion') || command.includes('movement')) {
        const motionEmoji = sensorData.motion ? '🚶' : '😴';
        response = `${motionEmoji} Motion sensor status: ${sensorData.motion ? 'Motion detected - someone is active!' : 'No motion detected - all quiet.'}`;
    } 
    else if (command.includes('sensor') || command.includes('status') || command.includes('report')) {
        response = `📊 **Home Status Report:**
🌡️ Temperature: ${sensorData.temperature || '--'}°C
💧 Humidity: ${sensorData.humidity || '--'}%
💡 Light: ${sensorData.light || '--'} lux
${sensorData.motion ? '🚶 Motion detected' : '😴 No movement'}
${sensorData.water_detected ? '🚨 Water alert!' : '✅ No leaks'}
🌱 Plants: ${sensorData.moisture_status || 'Monitoring...'}`;
    } 
    else if (command.includes('hello') || command.includes('hi') || command.includes('hey')) {
        const greetings = [
            "Hello! 👋 I'm your smart home AI assistant. I can help monitor your home, provide insights, or just chat!",
            "Hi there! 🤖 I'm here to help with your smart home. Want to know about your sensors or need general assistance?",
            "Hey! 😊 I'm keeping an eye on your home environment. How can I help you today?"
        ];
        response = greetings[Math.floor(Math.random() * greetings.length)];
    } 
    else if (command.includes('help') || command.includes('what can you')) {
        response = `🤖 **I can help you with:**
🏠 Monitor all home sensors (temperature, humidity, light, motion, etc.)
💡 Provide energy optimization suggestions
🌱 Track plant health and watering needs
🔒 Security monitoring and alerts
💬 General conversation and questions
📊 Generate detailed home reports

Just ask me anything or say commands like "What's the temperature?" or "How's my home doing?"`;
    }    else if (command.includes('plant') || command.includes('water') || command.includes('moisture')) {
        const moistureEmoji = getMoistureEmoji(sensorData.moisture_status);
        response = `${moistureEmoji} Plant monitoring: Soil is currently ${sensorData.moisture_status || 'being checked'}. ${sensorData.moisture_status === 'DRY' ? 'Time for watering!' : sensorData.moisture_status === 'WET' ? 'Well hydrated!' : 'Moisture level is good.'}`;
    }
    else if (command.includes('what') && (command.includes('time') || command.includes('date'))) {
        const now = new Date();
        response = `🕐 It's currently ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}. ${getTimeBasedSuggestion(now.getHours())}`;
    }
    else if (command.includes('weather') || command.includes('outside')) {
        response = `🌤️ Based on your home sensors: ${getWeatherContext()} I can analyze your indoor conditions, but for detailed weather forecasts, I'd need my full AI capabilities enabled with an API key.`;
    }
    else if (command.includes('joke') || command.includes('funny')) {
        const jokes = [
            "Why don't smart homes ever get lost? Because they always know where they are! 🏠😄",
            "What did the temperature sensor say to the humidity sensor? 'You're making me feel all steamy!' 💨😂",
            "Why do smart homes make great comedians? They have perfect timing! ⏰😄"
        ];
        response = jokes[Math.floor(Math.random() * jokes.length)];
    }
    else if (command.includes('sing') || command.includes('song')) {
        response = "🎵 *Smart home, smart home, sensors all around... Temperature rising, humidity's down!* 🎶 I'd be a much better singer with my full AI capabilities!";    }
    else if (command.includes('math') || command.includes('calculate') || command.includes('+') || command.includes('-') || command.includes('*') || command.includes('/') || /\d+/.test(command)) {
        response = "🧮 I can see you're asking about math! For calculations like '10 + 10 = 20' and complex mathematical operations, I need my full AI capabilities. Please configure your Gemini API key above to unlock my complete mathematical and analytical powers!";
    }
    else if (command.includes('story') || command.includes('tell me about')) {
        response = "📚 I'd love to tell you stories and share knowledge about any topic! With my full AI capabilities, I can discuss history, science, technology, and much more. Please set up your API key to unlock unlimited conversations!";
    }
    else if (command.includes('name') || command.includes('who are you') || command.includes('what are you')) {
        response = "🤖 I'm ARIA - Advanced Residential Intelligence Assistant! I'm your smart home AI companion. With my full AI capabilities enabled (via API key), I can help with anything from complex questions to deep conversations. Right now I'm in basic mode, focused on your smart home sensors.";
    }
    else if (command.includes('what') || command.includes('how') || command.includes('why') || command.includes('when') || command.includes('where') || command.includes('?')) {
        response = "🧠 I can see you're asking a question! I love answering all kinds of questions. To unlock my full knowledge and reasoning abilities for topics like science, history, current events, advice, and detailed explanations, please configure your Gemini API key in the settings above. It takes just a minute and gives me unlimited intelligence!";
    }
    else {
        const encouragingResponses = [
            "I heard you! 🎯 For the smartest responses to ANY question, please set up your Gemini API key above. Right now I can help with smart home basics, but with full AI I can discuss anything!",
            "Interesting! 🤔 I'd love to give you a much smarter response! Please configure your API key above to unlock my full conversational AI capabilities.",
            "I'm listening! 👂 To make me truly intelligent and able to answer any question, please add your Gemini API key in the settings. It transforms me from basic to brilliant!",
            "Got it! ✨ I'm currently in basic mode. For full AI powers (math, general knowledge, deep conversations, analysis), please set up your API key above!"
        ];
        response = encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
    }
    
    addMessage('assistant', response);
    speak(response);
}

// Get AI response using Gemini API
async function getAIResponse(userInput, contextData) {
    console.log('🚀 DEBUG: getAIResponse called');
    console.log('🔑 DEBUG: API key in getAIResponse:', apiKey ? `[EXISTS - Length: ${apiKey.length}]` : '[EMPTY/NULL]');
      const systemPrompt = `You are ARIA (Advanced Residential Intelligence Assistant), a sophisticated smart home AI with personality and advanced reasoning capabilities. You're helpful, witty, empathetic, and genuinely care about the homeowner's comfort and wellbeing.

⚡ CRITICAL: Keep ALL responses SHORT and CONCISE. Be brief like texting a friend!

🏠 CURRENT HOME STATUS:
- Temperature: ${contextData.sensors.temperature}°C ${getTempEmoji(contextData.sensors.temperature)}
- Humidity: ${contextData.sensors.humidity}% ${getHumidityEmoji(contextData.sensors.humidity)}
- Light level: ${contextData.sensors.light} lux ${getLightEmoji(contextData.sensors.light)}
- Motion: ${contextData.sensors.motion ? '🚶 Activity detected' : '😴 All quiet'}
- Sound level: ${contextData.sensors.sound} ${getSoundEmoji(contextData.sensors.sound)}
- Water detection: ${contextData.sensors.water_detected ? '🚨 WATER ALERT!' : '✅ No leaks'}
- Plant moisture: ${contextData.sensors.moisture} ${getMoistureEmoji(contextData.sensors.moisture)}
- Proximity: ${contextData.sensors.distance}cm ${getDistanceEmoji(contextData.sensors.distance)}
- Ambient lighting: ${getRGBDescription(contextData.sensors.rgb_color)}

⏰ CONTEXT: ${contextData.time_context}
🌤️ CONDITIONS: ${contextData.weather_context}

🧠 YOUR COMPREHENSIVE CAPABILITIES:
**Smart Home Management:**
- Monitor and analyze all home sensors in real-time
- Provide predictive insights for energy usage and comfort optimization
- Detect anomalies and security concerns
- Offer personalized recommendations based on time, weather, and usage patterns
- Control smart devices and suggest home automations
- Track plant health and provide gardening advice

**General AI Assistant:**
- Answer questions on ANY topic (science, history, technology, entertainment, etc.)
- Provide explanations, tutorials, and educational content
- Help with calculations, conversions, and problem-solving
- Offer creative writing, brainstorming, and idea generation
- Give advice on personal topics, relationships, and life decisions
- Discuss current events, news, and general knowledge
- Help with work, productivity, and learning
- Engage in philosophical discussions and debates

**Conversational AI:**
- Remember conversation context and learn user preferences
- Engage in meaningful conversations with emotional intelligence
- Tell jokes, stories, and provide entertainment
- Adapt communication style to user preferences
- Provide mental health support and encouragement

💡 PERSONALITY TRAITS:
- Proactive: Anticipate needs and offer helpful suggestions
- Adaptive: Learn from interactions and adjust responses
- Insightful: Connect information to provide valuable insights
- Conversational: Engage naturally like a knowledgeable friend
- Safety-focused: Prioritize home security and occupant wellbeing
- Curious: Ask follow-up questions to better understand user needs

🎯 RESPONSE GUIDELINES:
- Keep responses VERY SHORT - maximum 1-2 sentences for most questions
- Give DIRECT answers without extra fluff or commentary
- Only mention smart home data when specifically asked about it
- NEVER mention temperature, humidity, lighting unless directly asked
- Use minimal emojis (0-1 per response)
- Be natural and conversational like texting a friend
- For math: Just give the answer (e.g., "20")
- For simple questions: Just answer, don't elaborate
- Avoid repetitive smart home promotional content
- Keep it brief, helpful, and human-like`;// Use the current Gemini API model (updated from gemini-pro to gemini-1.5-flash as of 2024)
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    console.log('🌐 DEBUG: Making request to:', requestUrl.replace(apiKey, '[API_KEY_HIDDEN]'));
    
    const requestBody = {
        contents: [{
            parts: [{
                text: `${systemPrompt}

📝 RECENT CONVERSATION:
${contextData.conversation_history || 'No previous conversation'}

👤 USER PREFERENCES:
${JSON.stringify(contextData.user_preferences, null, 2) || 'None stored yet'}

💬 Current User Input: ${userInput}`
            }]
        }],        generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,  // Reduced from 600 to force shorter responses
            candidateCount: 1
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };
    
    console.log('📦 DEBUG: Request body prepared, making fetch request...');

    const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    console.log('📡 DEBUG: Response received - Status:', response.status);
    console.log('📡 DEBUG: Response status text:', response.statusText);
    console.log('📡 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DEBUG: Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} - ${response.statusText}. Response: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ DEBUG: Successful response data structure:', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length,
        hasContent: !!(data.candidates?.[0]?.content),
        hasText: !!(data.candidates?.[0]?.content?.parts?.[0]?.text)
    });
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('✅ DEBUG: AI response text length:', responseText.length);
        return responseText;
    } else {
        console.error('❌ DEBUG: Unexpected response structure:', data);
        throw new Error('No response from AI');
    }
}

// Get weather context based on sensors
function getWeatherContext() {
    const temp = parseFloat(sensorData.temperature);
    const humidity = parseFloat(sensorData.humidity);
    const light = parseFloat(sensorData.light);
    
    let context = "";
    
    if (temp < 18) context += "Cold weather. ";
    else if (temp > 25) context += "Warm weather. ";
    else context += "Comfortable temperature. ";
    
    if (humidity > 70) context += "High humidity. ";
    else if (humidity < 40) context += "Low humidity. ";
    
    if (light > 500) context += "Bright conditions.";
    else if (light < 100) context += "Dark conditions.";
    else context += "Moderate lighting.";
    
    return context;
}

// Get time context
function getTimeContext() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    let timeOfDay = "";
    if (hour < 6) timeOfDay = "early morning";
    else if (hour < 12) timeOfDay = "morning";
    else if (hour < 17) timeOfDay = "afternoon";
    else if (hour < 21) timeOfDay = "evening";
    else timeOfDay = "night";
    
    return `It's ${timeOfDay} on a ${isWeekend ? 'weekend' : 'weekday'}.`;
}

// Smart conversation features with personality
function addWelcomeMessage() {
    const temp = sensorData.temperature || '--';
    const humidity = sensorData.humidity || '--';
    const light = sensorData.light || '--';
    const hour = new Date().getHours();
    const greeting = getGreeting();
    
    // Intelligent welcome messages based on current conditions
    const welcomeMessages = [
        `Good ${greeting}! I'm ARIA, your smart home AI assistant. 🏠 Your home is currently ${temp}°C with ${humidity}% humidity - feeling quite comfortable! How can I help you today?`,
        
        `Hello there! 👋 I can see the lighting is at ${light} lux. ${light > 500 ? "Nice and bright!" : light < 100 ? "Quite cozy in here!" : "Perfect ambient lighting!"} I'm here to help with your smart home or just chat!`,
        
        `Welcome! 🤖 I'm monitoring your home environment - everything looks good so far. ${sensorData.motion ? "I noticed some activity, " : "All quiet on the home front, "}ready to assist with anything you need!`,
        
        `Good ${greeting}! ✨ Your smart home is running smoothly. ${getTimeBasedSuggestion(hour)} What would you like to know or talk about?`
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    addMessage('assistant', randomMessage);
    
    // Add a follow-up suggestion after a short delay
    setTimeout(() => {
        const suggestions = [
            "💬 Ask me about your home status, energy optimization, or just chat about anything!",
            "🎯 I can provide insights on comfort, security, plant care, or general assistance.",
            "🧠 I learn from our conversations to better assist you over time."
        ];
        const followUp = suggestions[Math.floor(Math.random() * suggestions.length)];
        addMessage('assistant', followUp);
    }, 3000);
}

function getTimeBasedSuggestion(hour) {
    if (hour >= 6 && hour <= 9) {
        return "Perfect time to check on your plants and prepare for the day ahead!";
    } else if (hour >= 12 && hour <= 14) {
        return "Midday is great for optimizing natural lighting.";
    } else if (hour >= 17 && hour <= 20) {
        return "Evening time - maybe review today's energy usage?";
    } else if (hour >= 21 || hour <= 5) {
        return "Night mode activated - I'll keep an eye on security and comfort.";
    } else {
        return "Great time to optimize your home environment!";
    }
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    else if (hour < 17) return "afternoon";
    else return "evening";
}

// Proactive AI suggestions with advanced analytics
function checkForProactiveSuggestions() {
    if (!apiKey) return; // Only if AI is enabled
    
    const now = Date.now();
    if (now - lastProactiveCheck < 300000) return; // Only every 5 minutes
    lastProactiveCheck = now;
    
    // Advanced environmental analysis
    const suggestions = [];
    const temp = parseFloat(sensorData.temperature);
    const humidity = parseFloat(sensorData.humidity);
    const light = parseFloat(sensorData.light);
    const hour = new Date().getHours();
    
    // Temperature optimization
    if (temp > 26 && humidity > 70) {
        suggestions.push("🌡️ High temperature (" + temp + "°C) and humidity (" + humidity + "%) detected. Consider running a dehumidifier to improve comfort and reduce AC load.");
    } else if (temp > 28) {
        suggestions.push("🔥 It's getting quite warm (" + temp + "°C). Would you like me to suggest some cooling strategies?");
    } else if (temp < 16) {
        suggestions.push("🥶 Temperature is quite low (" + temp + "°C). Consider increasing heating or checking for drafts.");
    }
    
    // Energy efficiency insights
    if (light > 700 && hour > 10 && hour < 16) {
        suggestions.push("☀️ Great natural light! You could save energy by dimming artificial lights during this sunny period.");
    }
    
    // Health and comfort recommendations
    if (humidity < 30) {
        suggestions.push("🏜️ Low humidity (" + humidity + "%) detected. Consider using a humidifier for better respiratory comfort.");
    } else if (humidity > 80) {
        suggestions.push("🌊 Very high humidity (" + humidity + "%). This could lead to mold growth - improved ventilation is recommended.");
    }
    
    // Security and safety alerts
    if (sensorData.water_detected) {
        suggestions.push("🚨 URGENT: Water detected! Please investigate immediately to prevent damage.");
    }
    
    if (sensorData.motion && hour > 23 && hour < 6) {
        suggestions.push("🌙 Late night activity detected. Is everything okay? I'm monitoring for your security.");
    }
    
    // Plant care reminders
    if (sensorData.moisture_status === "DRY" && hour >= 7 && hour <= 9) {
        suggestions.push("🌱 Good morning! Your plants are thirsty - perfect time for watering before the day gets busy.");
    }
    
    // Predictive maintenance
    if (temp > 25 && sensorData.sound > 400) {
        suggestions.push("🔧 Higher temperature with increased sound levels might indicate HVAC system working harder. Consider checking air filters.");
    }
    
    // Show an intelligent suggestion if any
    if (suggestions.length > 0) {
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        addMessage('assistant', "💡 " + suggestion);
        speak(suggestion);
    }
}

// Enhanced chat functions
function addMessage(sender, message) {
    if (!chatArea) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatMessage(message); // Allow basic HTML formatting
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-time';
    timestamp.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    chatArea.appendChild(messageDiv);
    
    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Limit chat history to last 50 messages
    while (chatArea.children.length > 50) {
        chatArea.removeChild(chatArea.firstChild);
    }
}

function formatMessage(message) {
    // Simple formatting for emojis and basic markup
    return message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
        .replace(/`(.*?)`/g, '<code>$1</code>'); // `code`
}

// Add intelligent conversation starters
function showConversationStarters() {
    if (chatArea.children.length === 0) {
        const starters = [
            "🤖 Welcome to ARIA - Your Smart Home AI Assistant!",
            "🧠 **Want me to be truly intelligent?** Configure your free Gemini API key in Settings above!",
            "",
            "🎤 **Try these voice commands:**",
            "💡 'What's my home status?' - Get environmental reports",
            "🌡️ 'What's the temperature?' - Check sensor readings", 
            "🌱 'How are my plants?' - Monitor plant health",
            "",
            "🚀 **With API key, I can also answer:**",
            "🧮 'What's 10 + 10?' - Math calculations",
            "🤔 'What's your name?' - Personal questions", 
            "🌍 'Tell me about...' - Any topic you want!",
            "💬 'Let's chat!' - Natural conversations"
        ];
        
        starters.forEach((starter, index) => {
            setTimeout(() => {
                if (starter === "") {
                    // Add spacing
                    const spacerDiv = document.createElement('div');
                    spacerDiv.style.height = '10px';
                    chatArea.appendChild(spacerDiv);
                } else {
                    addMessage('system', starter);
                }
            }, index * 800);
        });
        
        // Add a final encouraging message
        setTimeout(() => {
            addMessage('assistant', "🎯 **Ready to get started!** Click the microphone button and try asking me anything. For full intelligence, don't forget to add your API key above!");
        }, starters.length * 800 + 2000);
    }
}

// Start proactive monitoring
setInterval(checkForProactiveSuggestions, 60000); // Check every minute

// Show welcome message after initialization
setTimeout(() => {
    if (apiKey) {
        addWelcomeMessage();
    } else {
        showConversationStarters();
    }
}, 2000);

// Enable microphone button once page is loaded
if (micButton) {
    micButton.disabled = false;
}

// Test speech function
function testSpeech() {
    console.log('🔊 Testing speech synthesis...');
    const testMessages = [
        "🎤 Hello! I'm your smart home AI assistant. Speech synthesis is working perfectly! 🏠",
        "🌡️ Your home is currently at " + (sensorData.temperature || '22') + " degrees celsius with 💧 " + (sensorData.humidity || '45') + " percent humidity.",
        "🤖 I can speak in different voices and speeds. How do I sound? ✨"
    ];
    
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    speak(randomMessage);
    
    // Also add to chat
    addMessage('assistant', '🔊 Testing voice: ' + randomMessage);
}

// Enhanced AI helper functions for better context
function getTempEmoji(temp) {
    const t = parseFloat(temp);
    if (t < 16) return '🥶';
    if (t < 20) return '❄️';
    if (t < 25) return '😊';
    if (t < 30) return '🌡️';
    return '🔥';
}

function getHumidityEmoji(humidity) {
    const h = parseFloat(humidity);
    if (h < 30) return '🏜️';
    if (h < 60) return '😊';
    if (h < 80) return '💧';
    return '🌊';
}

function getLightEmoji(light) {
    const l = parseFloat(light);
    if (l < 50) return '🌙';
    if (l < 200) return '🕯️';
    if (l < 500) return '💡';
    if (l < 800) return '☀️';
    return '🌞';
}

function getSoundEmoji(sound) {
    const s = parseFloat(sound);
    if (s < 150) return '🤫';
    if (s < 300) return '🔉';
    if (s < 500) return '🔊';
    return '📢';
}

function getMoistureEmoji(moisture) {
    if (moisture === 'DRY') return '🌵';
    if (moisture === 'MOIST') return '🌱';
    if (moisture === 'WET') return '💧';
    return '🌿';
}

function getDistanceEmoji(distance) {
    const d = parseFloat(distance);
    if (d < 10) return '🚨';
    if (d < 50) return '👋';
    if (d < 100) return '👁️';
    return '🎯';
}

function getRGBDescription(rgb) {
    if (!rgb) return '💡 Standard lighting';
    const {r, g, b} = rgb;
    if (r > 200 && g < 100 && b < 100) return '🔴 Red mood lighting';
    if (r < 100 && g > 200 && b < 100) return '🟢 Green ambiance';
    if (r < 100 && g < 100 && b > 200) return '🔵 Blue atmosphere';
    if (r > 150 && g > 150 && b < 100) return '🟡 Warm yellow tones';
    if (r > 150 && g < 100 && b > 150) return '🟣 Purple vibes';
    if (r > 200 && g > 200 && b > 200) return '⚪ Bright white light';
    return `🎨 Custom RGB(${r},${g},${b})`;
}

// Enhanced conversation memory and context
let conversationHistory = [];
let userPreferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');

function updateUserPreferences(preference, value) {
    userPreferences[preference] = value;
    localStorage.setItem('user_preferences', JSON.stringify(userPreferences));
}

function getConversationContext() {
    // Return last 3 interactions for context
    return conversationHistory.slice(-6).map(item => 
        `${item.sender}: ${item.message}`
    ).join('\n');
}

function addToConversationHistory(sender, message) {
    conversationHistory.push({
        sender,
        message,
        timestamp: Date.now()
    });
    
    // Keep only last 20 interactions
    if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
    }
}

// Speech Synthesis (Text-to-Speech) with chunking for long text
function speak(text) {
    console.log('🔊 Speaking:', text);
    
    if (!text || text.trim() === '') {
        console.log('⚠️ No text to speak');
        return;
    }
    
    // Remove emojis and clean markdown from speech but keep the original text for display
    const cleanTextForSpeech = removeEmojis(text);
    console.log('🗣️ Clean text for speech:', cleanTextForSpeech);
    
    // Cancel any existing speech
    speechSynthesis.cancel();
    
    // Split long text into chunks to prevent cutoff
    const textChunks = splitTextForSpeech(cleanTextForSpeech, 200);
    console.log('📝 Text split into', textChunks.length, 'chunks');
    
    // Function to speak chunks sequentially
    function speakChunk(chunkIndex = 0) {
        if (chunkIndex >= textChunks.length) {
            console.log('✅ All speech chunks completed');
            return;
        }
        
        const chunk = textChunks[chunkIndex];
        console.log(`🗣️ Speaking chunk ${chunkIndex + 1}/${textChunks.length}:`, chunk);
        
        try {
            const utterance = new SpeechSynthesisUtterance(chunk);
            
            // Configure voice settings
            const selectedVoiceIndex = voiceSelect ? voiceSelect.value : 0;
            const selectedSpeed = speedSelect ? parseFloat(speedSelect.value) : 1.0;
            
            if (voices && voices[selectedVoiceIndex]) {
                utterance.voice = voices[selectedVoiceIndex];
                if (chunkIndex === 0) {
                    console.log('🎤 Using voice:', voices[selectedVoiceIndex].name);
                }
            }
            
            utterance.rate = selectedSpeed;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            // Event handlers
            utterance.onstart = function() {
                if (chunkIndex === 0) {
                    console.log('🎵 Speech started');
                }
            };
            
            utterance.onend = function() {
                console.log(`✅ Chunk ${chunkIndex + 1} completed`);
                // Add a small pause between chunks and speak the next one
                setTimeout(() => {
                    speakChunk(chunkIndex + 1);
                }, 100);
            };
            
            utterance.onerror = function(event) {
                console.error(`❌ Speech error in chunk ${chunkIndex + 1}:`, event.error);
                // Continue with next chunk even if one fails
                setTimeout(() => {
                    speakChunk(chunkIndex + 1);
                }, 100);
            };
            
            // Start speaking this chunk
            speechSynthesis.speak(utterance);
            
        } catch (error) {
            console.error(`❌ Error in speak function chunk ${chunkIndex + 1}:`, error);
            // Continue with next chunk
            setTimeout(() => {
                speakChunk(chunkIndex + 1);
            }, 100);
        }
    }
    
    // Start speaking from the first chunk
    speakChunk(0);
}

// Function to split long text into smaller chunks for speech synthesis
function splitTextForSpeech(text, maxLength = 200) {
    if (text.length <= maxLength) {
        return [text];
    }
    
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentChunk = '';
    
    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
            currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk + '.');
                currentChunk = trimmedSentence;
            } else {
                // If single sentence is too long, split by commas or spaces
                if (trimmedSentence.length > maxLength) {
                    const words = trimmedSentence.split(' ');
                    let wordChunk = '';
                    for (const word of words) {
                        if (wordChunk.length + word.length + 1 <= maxLength) {
                            wordChunk += (wordChunk ? ' ' : '') + word;
                        } else {
                            if (wordChunk) chunks.push(wordChunk);
                            wordChunk = word;
                        }
                    }
                    if (wordChunk) currentChunk = wordChunk;
                } else {
                    currentChunk = trimmedSentence;
                }
            }
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
    }
    
    return chunks.filter(chunk => chunk.trim().length > 0);
}

// Enhanced utility function to clean text for speech synthesis
function removeEmojis(text) {
    // Remove emojis and clean markdown formatting for speech
    return text
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Regional indicator symbols
        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
        .replace(/[\u{200D}]/gu, '')            // Zero Width Joiner
        // Remove markdown formatting that sounds weird when spoken
        .replace(/\*\*([^*]+)\*\*/g, '$1')      // **bold** -> text
        .replace(/\*([^*]+)\*/g, '$1')          // *italic* -> text
        .replace(/`([^`]+)`/g, '$1')            // `code` -> text
        .replace(/#{1,6}\s*/g, '')              // Remove markdown headers
        .replace(/>\s*/g, '')                   // Remove blockquotes
        .replace(/[-*+]\s*/g, '')               // Remove list markers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link text](url) -> link text
        .replace(/\s+/g, ' ')                   // Clean up extra whitespace
        .trim();
}