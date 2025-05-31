/*
  Basic Smart Home Test - Arduino UNO R4 WiFi
  
  This is a simplified version to test the WebSocket connection first.
  No external sensors required - uses built-in LED and simulated data.
  
  Steps to use:
  1. Replace "YOUR_WIFI_SSID" and "YOUR_WIFI_PASSWORD" with your WiFi credentials
  2. Replace "192.168.1.100" with your computer's IP address
  3. Upload to Arduino UNO R4 WiFi
  4. Open Serial Monitor (115200 baud) to see connection status
  5. Click "Connect to Server" in the web app
  
  Hardware: Arduino UNO R4 WiFi (no additional sensors needed for testing)
*/

#include <WiFiS3.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>

// WiFi credentials - CHANGE THESE
const char* ssid = "YOUR_WIFI_SSID";        // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

// WebSocket server details - CHANGE THIS IP
const char* websocket_server = "ws://192.168.1.182:3000"; // Your computer's IP address

// Use built-in LED
#define LED_PIN LED_BUILTIN

using namespace websockets;
WebsocketsClient client;

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastWebSocketPing = 0;
const unsigned long SENSOR_INTERVAL = 5000; // Send data every 5 seconds
const unsigned long PING_INTERVAL = 30000;  // Ping every 30 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("=== Arduino UNO R4 WiFi Smart Home Test ===");
  Serial.println("Starting setup...");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Connect to WebSocket server
  connectToWebSocket();
  
  Serial.println("Setup complete. Starting data transmission...");
  Serial.println("Open the web app and click 'Connect to Server'");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Handle WebSocket events
  client.poll();
  
  // Send simulated sensor data at regular intervals
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    sendSimulatedSensorData();
    lastSensorRead = currentTime;
  }
  
  // Send periodic ping to keep connection alive
  if (currentTime - lastWebSocketPing >= PING_INTERVAL) {
    sendPing();
    lastWebSocketPing = currentTime;
  }
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    connectToWiFi();
  }
  
  // Brief delay
  delay(100);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
    
    // Blink LED while connecting
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected successfully!");
    Serial.print("📍 Arduino IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📡 Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    // Turn on LED to indicate successful connection
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println();
    Serial.println("❌ Failed to connect to WiFi. Check credentials.");
    Serial.println("Make sure SSID and password are correct.");
    digitalWrite(LED_PIN, LOW);
  }
}

void connectToWebSocket() {
  Serial.print("Connecting to WebSocket server: ");
  Serial.println(websocket_server);
  
  // Set up WebSocket event handlers
  client.onMessage(onMessageCallback);
  client.onEvent(onEventsCallback);
  
  // Connect to server
  bool connected = client.connect(websocket_server);
  
  if (connected) {
    Serial.println("✅ WebSocket connected successfully!");
    
    // Send initial connection message
    StaticJsonDocument<200> doc;
    doc["type"] = "connection";
    doc["device"] = "Arduino Sensor Array";
    doc["version"] = "1.0";
    doc["model"] = "Arduino UNO R4 WiFi";
    doc["ip"] = WiFi.localIP().toString();
    
    String message;
    serializeJson(doc, message);
    client.send(message);
    
    Serial.println("📤 Connection message sent to server");
    
  } else {
    Serial.println("❌ Failed to connect to WebSocket server.");
    Serial.println("Check if the server is running and IP address is correct.");
  }
}

void sendSimulatedSensorData() {
  if (!client.available()) {
    Serial.println("WebSocket not connected. Attempting reconnection...");
    connectToWebSocket();
    return;
  }
  
  // Generate simulated sensor readings
  float temperature = 20.0 + random(0, 100) / 10.0; // 20.0 to 30.0°C
  float humidity = 40.0 + random(0, 300) / 10.0;    // 40.0 to 70.0%
  int lightLevel = 100 + random(0, 800);             // 100 to 900 lux
  bool motionDetected = random(0, 10) > 7;           // 30% chance of motion
  
  // Create JSON payload
  StaticJsonDocument<300> doc;
  doc["type"] = "sensor_data";
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["light"] = lightLevel;
  doc["motion"] = motionDetected;
  doc["timestamp"] = millis();
  doc["device_id"] = "arduino_r4_001";
  doc["source"] = "simulated";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send data
  client.send(jsonString);
  
  Serial.println("📊 Sensor data sent:");
  Serial.print("   Temperature: "); Serial.print(temperature); Serial.println("°C");
  Serial.print("   Humidity: "); Serial.print(humidity); Serial.println("%");
  Serial.print("   Light: "); Serial.print(lightLevel); Serial.println(" lux");
  Serial.print("   Motion: "); Serial.println(motionDetected ? "Detected" : "Clear");
  
  // Blink LED briefly to show data transmission
  digitalWrite(LED_PIN, LOW);
  delay(50);
  digitalWrite(LED_PIN, HIGH);
}

void sendPing() {
  if (client.available()) {
    StaticJsonDocument<100> doc;
    doc["type"] = "ping";
    doc["timestamp"] = millis();
    doc["uptime"] = millis() / 1000;
    
    String message;
    serializeJson(doc, message);
    client.send(message);
    
    Serial.println("📡 Ping sent to server");
  }
}

void onMessageCallback(WebsocketsMessage message) {
  Serial.print("📨 Received message: ");
  Serial.println(message.data());
  
  // Parse incoming commands
  StaticJsonDocument<200> doc;
  deserializeJson(doc, message.data());
  
  String command = doc["command"];
  String device = doc["device"];
  
  if (command == "ON" && device == "LIGHT") {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("💡 LED turned ON");
    
    // Send acknowledgment
    StaticJsonDocument<100> response;
    response["type"] = "command_ack";
    response["command"] = "LIGHT_ON";
    response["status"] = "success";
    response["device"] = "Arduino UNO R4";
    
    String ack;
    serializeJson(response, ack);
    client.send(ack);
    
  } else if (command == "OFF" && device == "LIGHT") {
    digitalWrite(LED_PIN, LOW);
    Serial.println("💡 LED turned OFF");
    
    // Send acknowledgment
    StaticJsonDocument<100> response;
    response["type"] = "command_ack";
    response["command"] = "LIGHT_OFF";
    response["status"] = "success";
    response["device"] = "Arduino UNO R4";
    
    String ack;
    serializeJson(response, ack);
    client.send(ack);
  }
}

void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("🔗 WebSocket connection opened");
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("🔌 WebSocket connection closed");
  } else if (event == WebsocketsEvent::GotPing) {
    Serial.println("🏓 WebSocket ping received");
  } else if (event == WebsocketsEvent::GotPong) {
    Serial.println("🏓 WebSocket pong received");
  }
}

// Function to get computer IP address instructions
void printSetupInstructions() {
  Serial.println("\n=== SETUP INSTRUCTIONS ===");
  Serial.println("1. Find your computer's IP address:");
  Serial.println("   Windows: Open cmd and type 'ipconfig'");
  Serial.println("   Look for 'IPv4 Address' (usually 192.168.x.x)");
  Serial.println("2. Update the websocket_server variable with your IP");
  Serial.println("3. Update WiFi credentials (ssid and password)");
  Serial.println("4. Make sure WebSocket server is running on your computer");
  Serial.println("5. Upload this code to Arduino UNO R4 WiFi");
  Serial.println("===============================\n");
}
