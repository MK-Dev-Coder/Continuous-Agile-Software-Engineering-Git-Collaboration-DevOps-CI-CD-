// filepath: c:\Users\mikek\OneDrive\Documents\GitHub\Smart Home AI Assistant\script.js
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

// Sensor elements
const tempValue = document.getElementById('tempValue');
const humidityValue = document.getElementById('humidityValue');
const lightValue = document.getElementById('lightValue');
const motionValue = document.getElementById('motionValue');

// State
let isListening = false;
let voices = [];
let apiKey = localStorage.getItem('gemini_api_key') || '';
let ws = null;

// Initialize Enhanced AI Components
let conversationManager = new SmartConversationManager();
let intentClassifier = new IntentClassifier();
let responseGenerator = new SmartResponseGenerator(conversationManager);
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
    sensorData.timestamp = now.toISOString();

    // Record patterns for learning
    if (typeof advancedPatterns !== 'undefined') {
        const context = conversationManager.getSmartContext();
        advancedPatterns.analyzeBehaviorPattern('sensor_update', context);
    }

    // Update energy tracking
    if (typeof energyOptimizer !== 'undefined' && sensorData.light > 500) {
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
