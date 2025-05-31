/**
 * WebSocket Server for Smart Home AI Assistant
 * 
 * This server acts as a bridge between Arduino sensors and the web application.
 * It handles real-time data communication and device control commands.
 * 
 * Features:
 * - WebSocket communication
 * - Real-time sensor data relay
 * - Device control commands
 * - Connection management
 * - Data logging
 * 
 * Usage:
 * node websocket-server.js
 * 
 * Author: Smart Home AI Assistant
 * Version: 1.0
 * Date: 2025-05-30
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3000;
const LOG_FILE = 'sensor_data.log';

// Create HTTP server for potential web interface
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle Arduino HTTP POST requests
    if (req.method === 'POST' && req.url === '/sensor-data') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const sensorData = JSON.parse(body);
                console.log('📊 Arduino HTTP data received:', sensorData);
                  // Update latest sensor data with all advanced sensors
                latestSensorData = {
                    temperature: sensorData.temperature,
                    humidity: sensorData.humidity,
                    light: sensorData.light,
                    motion: sensorData.motion,
                    sound: sensorData.sound,
                    water_detected: sensorData.water_detected,
                    moisture_level: sensorData.moisture_level,
                    moisture_status: sensorData.moisture_status,
                    distance: sensorData.distance,
                    potentiometer: sensorData.potentiometer,
                    rgb_color: sensorData.rgb_color,
                    rgb_enabled: sensorData.rgb_enabled,
                    multicolor_mode: sensorData.multicolor_mode,
                    pot_control_mode: sensorData.pot_control_mode,
                    timestamp: sensorData.timestamp,
                    device_id: sensorData.device_id || 'arduino_advanced_001'
                };
                
                // Broadcast to all WebSocket clients
                broadcastToWebClients(latestSensorData);
                
                // Log the data
                logSensorData(latestSensorData);
                
                // Send success response to Arduino
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', message: 'Data received' }));
                
            } catch (error) {
                console.error('❌ Error parsing Arduino data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
            }
        });
        
        req.on('error', (error) => {
            console.error('❌ HTTP request error:', error);
            res.writeHead(500);
            res.end();
        });
        
        return;
    }
      // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(__dirname, '..', filePath);
    
    // Check if file exists
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        
        // Set content type based on file extension
        const ext = path.extname(filePath);
        let contentType = 'text/html';
        switch (ext) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    perMessageDeflate: false 
});

// Store connected clients with metadata
const clients = new Map();
const arduinoClients = new Set();
const webClients = new Set();

// Sensor data cache
let latestSensorData = {
    temperature: null,
    humidity: null,
    light: null,
    motion: false,
    timestamp: null,
    deviceId: null
};

// Statistics
const stats = {
    startTime: new Date(),
    messagesReceived: 0,
    messagesSent: 0,
    connectionsTotal: 0,
    currentConnections: 0
};

console.log('🏠 Smart Home WebSocket Server Starting...');
console.log('📡 Server will listen on port:', PORT);

// WebSocket connection handler
wss.on('connection', function connection(ws, request) {
    const clientId = generateClientId();
    const clientInfo = {
        id: clientId,
        ip: request.socket.remoteAddress,
        userAgent: request.headers['user-agent'] || 'Unknown',
        connectedAt: new Date(),
        type: 'unknown', // Will be determined by first message
        lastPing: new Date()
    };
    
    clients.set(ws, clientInfo);
    stats.connectionsTotal++;
    stats.currentConnections++;
    
    console.log(`✅ New connection: ${clientId} from ${clientInfo.ip}`);
    console.log(`👥 Total connections: ${stats.currentConnections}`);
    
    // Send welcome message
    sendToClient(ws, {
        type: 'welcome',
        clientId: clientId,
        serverTime: new Date().toISOString(),
        latestSensorData: latestSensorData
    });
    
    // Handle incoming messages
    ws.on('message', function incoming(message) {
        stats.messagesReceived++;
        handleMessage(ws, message);
    });
    
    // Handle connection close
    ws.on('close', function close() {
        const info = clients.get(ws);
        clients.delete(ws);
        arduinoClients.delete(ws);
        webClients.delete(ws);
        stats.currentConnections--;
        
        console.log(`❌ Connection closed: ${info?.id} (${info?.type})`);
        console.log(`👥 Remaining connections: ${stats.currentConnections}`);
    });
    
    // Handle errors
    ws.on('error', function error(err) {
        console.error('❗ WebSocket error:', err);
    });
    
    // Setup ping interval for this client
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);
    
    ws.on('pong', () => {
        const info = clients.get(ws);
        if (info) {
            info.lastPing = new Date();
        }
    });
});

// Message handler
function handleMessage(ws, message) {
    try {
        const data = JSON.parse(message.toString());
        const clientInfo = clients.get(ws);
        
        console.log(`📨 Message from ${clientInfo.id}:`, data.type || 'unknown');
        
        switch (data.type) {
            case 'connection':
                handleConnectionMessage(ws, data);
                break;
                
            case 'sensor_data':
                handleSensorData(ws, data);
                break;
                
            case 'command':
                handleDeviceCommand(ws, data);
                break;
                
            case 'ping':
                handlePing(ws, data);
                break;
                
            case 'get_status':
                sendServerStatus(ws);
                break;
                
            default:
                console.log(`⚠️  Unknown message type: ${data.type}`);
                relayMessage(ws, data);
                break;
        }
        
    } catch (error) {
        console.error('❗ Error parsing message:', error);
        sendToClient(ws, {
            type: 'error',
            message: 'Invalid JSON format'
        });
    }
}

// Handle connection identification
function handleConnectionMessage(ws, data) {
    const clientInfo = clients.get(ws);
    
    if (data.device === 'Arduino Sensor Array') {
        clientInfo.type = 'arduino';
        arduinoClients.add(ws);
        console.log(`🔧 Arduino device connected: ${data.version} (IP: ${data.ip})`);
    } else {
        clientInfo.type = 'web';
        webClients.add(ws);
        console.log(`🌐 Web client connected`);
    }
    
    // Send current sensor data to new web clients
    if (clientInfo.type === 'web' && latestSensorData.timestamp) {
        sendToClient(ws, {
            type: 'sensor_data',
            ...latestSensorData
        });
    }
}

// Handle sensor data from Arduino
function handleSensorData(ws, data) {
    const clientInfo = clients.get(ws);
    
    // Update latest sensor data
    latestSensorData = {
        temperature: data.temperature,
        humidity: data.humidity,
        light: data.light,
        motion: data.motion,
        timestamp: new Date().toISOString(),
        deviceId: data.device_id || clientInfo.id
    };
    
    console.log(`📊 Sensor data: ${data.temperature}°C, ${data.humidity}%, ${data.light}lux, Motion: ${data.motion}`);
    
    // Log sensor data
    logSensorData(latestSensorData);
    
    // Relay to all web clients
    const message = {
        type: 'sensor_data',
        ...latestSensorData
    };
    
    relayToWebClients(message);
    stats.messagesSent += webClients.size;
}

// Handle device control commands
function handleDeviceCommand(ws, data) {
    console.log(`🎮 Device command: ${data.command} ${data.device}`);
    
    // Relay command to Arduino clients
    const message = {
        type: 'command',
        command: data.command,
        device: data.device,
        timestamp: new Date().toISOString()
    };
    
    relayToArduinoClients(message);
    
    // Send acknowledgment back to sender
    sendToClient(ws, {
        type: 'command_sent',
        originalCommand: data,
        sentTo: arduinoClients.size + ' devices'
    });
}

// Handle ping messages
function handlePing(ws, data) {
    sendToClient(ws, {
        type: 'pong',
        timestamp: new Date().toISOString(),
        serverUptime: Date.now() - stats.startTime.getTime()
    });
}

// Send server status
function sendServerStatus(ws) {
    const status = {
        type: 'server_status',
        uptime: Date.now() - stats.startTime.getTime(),
        stats: stats,
        connections: {
            total: stats.currentConnections,
            arduino: arduinoClients.size,
            web: webClients.size
        },
        latestSensorData: latestSensorData
    };
    
    sendToClient(ws, status);
}

// Utility functions
function sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
        return true;
    }
    return false;
}

function relayMessage(sender, data) {
    clients.forEach((clientInfo, ws) => {
        if (ws !== sender && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    });
}

function relayToWebClients(data) {
    webClients.forEach(ws => {
        sendToClient(ws, data);
    });
}

function relayToArduinoClients(data) {
    arduinoClients.forEach(ws => {
        sendToClient(ws, data);
    });
}

function generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
}

function logSensorData(data) {
    // Create comprehensive log entry with all advanced sensor data
    const logEntry = {
        timestamp: new Date().toISOString(),
        temperature: data.temperature,
        humidity: data.humidity,
        light: data.light,
        motion: data.motion,
        sound: data.sound,
        water_detected: data.water_detected,
        moisture_level: data.moisture_level,
        moisture_status: data.moisture_status,
        distance: data.distance,
        potentiometer: data.potentiometer,
        rgb_color: data.rgb_color,
        rgb_enabled: data.rgb_enabled,
        multicolor_mode: data.multicolor_mode,
        pot_control_mode: data.pot_control_mode,
        device_id: data.device_id
    };
    
    // Log as JSON for easy parsing later
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFile(LOG_FILE, logLine, (err) => {
        if (err) {
            console.error('❗ Error writing to log file:', err);
        }
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`📝 Sensor data will be logged to: ${LOG_FILE}`);
    console.log('📡 Waiting for connections...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    
    // Close all connections
    wss.clients.forEach((ws) => {
        ws.close(1000, 'Server shutting down');
    });
    
    // Close server
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('❗ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❗ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Function to broadcast sensor data to all web clients
function broadcastToWebClients(sensorData) {
    const message = {
        type: 'sensor_data',
        ...sensorData
    };
    
    webClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
                stats.messagesSent++;
            } catch (error) {
                console.error('❌ Error sending to web client:', error);
            }
        }
    });
}

// Display statistics every 5 minutes
setInterval(() => {
    console.log('\n📈 Server Statistics:');
    console.log(`   Uptime: ${Math.floor((Date.now() - stats.startTime.getTime()) / 1000 / 60)} minutes`);
    console.log(`   Messages received: ${stats.messagesReceived}`);
    console.log(`   Messages sent: ${stats.messagesSent}`);
    console.log(`   Total connections: ${stats.connectionsTotal}`);
    console.log(`   Current connections: ${stats.currentConnections} (${arduinoClients.size} Arduino, ${webClients.size} Web)`);
    console.log('');
}, 300000);

module.exports = { wss, server, stats };
