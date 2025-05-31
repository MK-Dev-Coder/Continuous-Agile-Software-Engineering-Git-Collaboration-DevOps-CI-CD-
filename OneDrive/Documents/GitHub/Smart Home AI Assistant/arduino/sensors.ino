/*************************************************************
  Smart Home AI Assistant - Advanced Sensor Array
  LOCAL VERSION with Water Sensor + Moisture + RGB LED + Ultrasonic Ranger
  Compatible with Arduino UNO R4 WiFi + Grove OLED Display
  
  This Arduino sketch reads data from multiple sensors and sends it via HTTP 
  to the Smart Home AI Assistant web application with Grove OLED display.
  
  Hardware Requirements:
  - Arduino UNO R4 WiFi
  - DHT22 temperature/humidity sensor (Pin 2)
  - LDR Light sensor (Pin A0 via voltage divider)
  - PIR motion sensor (Pin 3)
  - Grove Water Sensor (Pin 2 - digital)
  - Grove Moisture Sensor (Pin A1)
  - RGB LED module (Pins 9, 10, 11 - PWM)
  - Grove Ultrasonic Ranger (Pin 7)
  - Grove OLED Display (I2C: SDA=A4, SCL=A5)
  - Potentiometer for RGB control (Pin A0)
  
  RGB LED Pin Mapping (TESTED):
  - Pin 11 = RED
  - Pin 9 = GREEN  
  - Pin 10 = BLUE
  
  Author: Smart Home AI Assistant
  Version: 4.0 - Advanced Sensor Suite
  Date: 2025-05-30
*************************************************************/

#include <WiFiS3.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <U8g2lib.h>
#include <Wire.h>

// WiFi credentials
const char* ssid = "COSMOTE-162465";
const char* password = "eg5skbu6pdb4nd3g4a4c";

// Server details
const char* server_host = "192.168.1.182";
const int server_port = 3000;

// Original sensor pin definitions
#define DHT_PIN 2
#define DHT_TYPE DHT22
#define LDR_PIN A0
#define PIR_PIN 3
#define LED_PIN 13

// NEW Advanced sensor pin definitions
#define SOUND_PIN A2
#define WATER_PIN 2          // Grove Water Sensor (digital)
#define MOISTURE_PIN A1      // Grove Moisture Sensor (analog)
#define POTENTIOMETER_PIN A0 // For RGB control
#define ULTRASONIC_PIN 7     // Grove Ultrasonic Ranger

// RGB LED Pins (PWM capable) - TESTED MAPPING
#define RGB_RED_PIN   11     // RED is on pin 11
#define RGB_GREEN_PIN 9      // GREEN is on pin 9
#define RGB_BLUE_PIN  10     // BLUE is on pin 10

// RGB LED Configuration
#define COMMON_ANODE false   // Set to true if LED is common anode

// Grove Moisture Sensor Calibration (based on your testing)
#define MOISTURE_DRY 100      // Below this = DRY
#define MOISTURE_WET 500      // Above this = WET
#define MOISTURE_REVERSE false // Your sensor: lower=dry, higher=wet

// RGB Color presets
struct RGBColor {
  int r, g, b;
};

RGBColor COLOR_OFF = {0, 0, 0};
RGBColor COLOR_RED = {255, 0, 0};
RGBColor COLOR_GREEN = {0, 255, 0};
RGBColor COLOR_BLUE = {0, 0, 255};
RGBColor COLOR_YELLOW = {255, 255, 0};
RGBColor COLOR_CYAN = {0, 255, 255};
RGBColor COLOR_MAGENTA = {255, 0, 255};
RGBColor COLOR_WHITE = {255, 255, 255};
RGBColor COLOR_ORANGE = {255, 165, 0};
RGBColor COLOR_PURPLE = {128, 0, 128};

// Initialize sensors
DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient client;

// Initialize OLED display (SSD1306 128x64 I2C)
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastHTTPSend = 0;
unsigned long lastOLEDUpdate = 0;
const unsigned long SENSOR_INTERVAL = 5000;  // Read sensors every 5 seconds
const unsigned long HTTP_INTERVAL = 10000;   // Send HTTP data every 10 seconds
const unsigned long OLED_INTERVAL = 2000;    // Update OLED every 2 seconds

// Advanced sensor timing
unsigned long lastDistanceUpdate = 0;
unsigned long lastMulticolorUpdate = 0;
unsigned long lastPotUpdate = 0;

// RGB state variables
RGBColor currentRGBColor = COLOR_OFF;
bool rgbEnabled = true;
bool rgbAlertMode = false;
bool multicolorMode = false;
bool potControlMode = false;
int lastPotValue = -1;

// Ultrasonic sensor variables
float lastDistance = 0.0;
bool proximityAlert = false;
float alertDistance = 20.0;  // Alert when object closer than 20cm

// Enhanced sensor data structure
struct SensorData {
  float temperature;
  float humidity;
  int lightLevel;
  bool motionDetected;
  int soundLevel;
  bool waterDetected;
  int moistureLevel;
  float distance;
  int potentiometerValue;
  unsigned long timestamp;
};

SensorData currentData;

void setup() {
  Serial.begin(115200);
  delay(1500);
  
  // Initialize all sensor pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(WATER_PIN, INPUT);
  pinMode(ULTRASONIC_PIN, OUTPUT);
  
  // Initialize RGB LED pins
  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);
  setRGBColor(COLOR_OFF);
  
  // Initialize sensors
  dht.begin();
  
  // Initialize OLED display
  u8g2.begin();
  u8g2.enableUTF8Print();
  
  // Show startup screen
  displayStartupScreen();
  
  Serial.println("=== Smart Home Advanced Sensor Array Starting ===");
  Serial.println("Sensors: DHT22, LDR, PIR, Water, Moisture, Ultrasonic, RGB LED");
  
  // Welcome RGB sequence
  Serial.println("\n=== RGB LED TEST ===");
  Serial.println("Pin Mapping (TESTED):");
  Serial.println("- Pin 11 = RED");
  Serial.println("- Pin 9 = GREEN");
  Serial.println("- Pin 10 = BLUE");
  setRGBColor(COLOR_RED);
  delay(500);
  setRGBColor(COLOR_GREEN);
  delay(500);
  setRGBColor(COLOR_BLUE);
  delay(500);
  setRGBColor(COLOR_OFF);
  Serial.println("RGB LED initialized!");
  
  // Test ultrasonic sensor
  Serial.println("\n=== ULTRASONIC SENSOR TEST ===");
  Serial.println("Grove Ultrasonic Ranger on pin D7");
  Serial.println("Range: 2cm to 350cm");
  Serial.println("Taking 5 test readings...");
  
  for(int i = 0; i < 5; i++) {
    float testDistance = readUltrasonicDistance();
    Serial.print("Reading #");
    Serial.print(i + 1);
    Serial.print(": ");
    if (testDistance < 0) {
      Serial.println("Out of range");
    } else {
      Serial.print(testDistance);
      Serial.println(" cm");
    }
    delay(500);
  }
  Serial.println("=== END ULTRASONIC TEST ===\n");
  
  // Water sensor test
  Serial.println("\n=== WATER SENSOR TEST ===");
  for(int i = 0; i < 5; i++) {
    int reading = digitalRead(WATER_PIN);
    Serial.print("Water sensor reading: ");
    Serial.print(reading);
    Serial.println(reading == HIGH ? " (DRY)" : " (WET!)");
    delay(1000);
  }
  Serial.println("=== END WATER TEST ===\n");
  
  // Moisture calibration info
  Serial.println("\n=== MOISTURE SENSOR CALIBRATION ===");
  Serial.println("Expected ranges FOR YOUR SENSOR:");
  Serial.println("  Air (very dry): 0-100");
  Serial.println("  Dry soil: 100-300");
  Serial.println("  Moist soil: 300-500");
  Serial.println("  Wet soil/mud: 500-700");
  Serial.println("  Water: 700-1023");
  Serial.print("\nCurrent thresholds: DRY<");
  Serial.print(MOISTURE_DRY);
  Serial.print(", WET>");
  Serial.println(MOISTURE_WET);
  Serial.print("Using pin: A");
  Serial.println(MOISTURE_PIN - A0);
  Serial.println("=== END CALIBRATION ===\n");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initial sensor reading
  readSensors();
  
  Serial.println("Setup complete. Starting advanced sensor monitoring...");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors at regular intervals
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    readSensors();
    lastSensorRead = currentTime;
  }
  
  // Send data via HTTP at regular intervals
  if (currentTime - lastHTTPSend >= HTTP_INTERVAL) {
    sendSensorData();
    lastHTTPSend = currentTime;
  }
    // Update OLED display at regular intervals
  if (currentTime - lastOLEDUpdate >= OLED_INTERVAL) {
    updateAdvancedOLEDDisplay();
    lastOLEDUpdate = currentTime;
  }
  
  // Read ultrasonic distance every 200ms to avoid interference
  if (currentTime - lastDistanceUpdate > 200) {
    lastDistance = readUltrasonicDistance();
    lastDistanceUpdate = currentTime;
    
    // Check for proximity alert
    if (lastDistance > 0 && lastDistance <= alertDistance && !proximityAlert) {
      proximityAlert = true;
      // Proximity alert - flash red RGB
      if (rgbEnabled && !rgbAlertMode) {
        rgbAlertMode = true;
        for (int i = 0; i < 3; i++) {
          setRGBColor(COLOR_RED);
          delay(100);
          setRGBColor(COLOR_OFF);
          delay(100);
        }
        rgbAlertMode = false;
      }
    } else if (lastDistance > alertDistance) {
      proximityAlert = false;
    }
  }
  
  // Update RGB based on plant status if not in alert mode
  if (!rgbAlertMode && rgbEnabled) {
    if (multicolorMode) {
      updateMulticolorMode();
    } else if (potControlMode) {
      updatePotentiometerRGB();
    } else {
      updateRGBForPlantStatus(currentData.moistureLevel);
    }
  }
  
  // Water detection alert - override other RGB states
  static bool lastWaterStatus = false;
  if (currentData.waterDetected && !lastWaterStatus && rgbEnabled) {
    // Water just detected!
    rgbAlertMode = true;
    for (int i = 0; i < 5; i++) {
      setRGBColor(COLOR_RED);
      delay(200);
      setRGBColor(COLOR_BLUE);
      delay(200);
    }
    rgbAlertMode = false;
  }
  lastWaterStatus = currentData.waterDetected;
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    displayConnectionStatus("WiFi Reconnecting...", false);
    connectToWiFi();
  }
  
  // Brief delay to prevent overwhelming the system
  delay(100);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  displayConnectionStatus("Connecting WiFi...", false);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
    
    // Blink LED while connecting
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    
    // Update OLED with connection progress
    String statusMsg = "WiFi " + String(attempts) + "/20";
    displayConnectionStatus(statusMsg, false);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected successfully!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    // Turn on LED to indicate successful connection
    digitalWrite(LED_PIN, HIGH);
    
    // Show success on OLED
    displayConnectionStatus("WiFi Connected!", true);
    delay(2000); // Show success message for 2 seconds
  } else {
    Serial.println();
    Serial.println("Failed to connect to WiFi. Check credentials.");
    digitalWrite(LED_PIN, LOW);
    
    displayConnectionStatus("WiFi Failed!", false);
  }
}

void readSensors() {
  // Read temperature and humidity from DHT22
  currentData.temperature = dht.readTemperature();
  currentData.humidity = dht.readHumidity();
  
  // Read light level from LDR (convert to approximate lux)
  int rawLight = analogRead(LDR_PIN);
  currentData.lightLevel = map(rawLight, 0, 1023, 0, 1000);
  
  // Read motion sensor
  currentData.motionDetected = digitalRead(PIR_PIN);
  
  // Read sound level
  currentData.soundLevel = analogRead(SOUND_PIN);
  
  // Read water sensor (Grove Water Sensor)
  int waterValue = digitalRead(WATER_PIN);
  currentData.waterDetected = (waterValue == LOW); // LOW = water detected
  
  // Read moisture level (Grove Moisture Sensor)
  currentData.moistureLevel = analogRead(MOISTURE_PIN);
  
  // Read distance from ultrasonic sensor
  currentData.distance = lastDistance;
  
  // Read potentiometer value
  currentData.potentiometerValue = analogRead(POTENTIOMETER_PIN);
  
  // Add timestamp
  currentData.timestamp = millis();
  
  // Validate DHT readings
  if (isnan(currentData.temperature) || isnan(currentData.humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    currentData.temperature = -999;
    currentData.humidity = -999;
  }
  
  // Print comprehensive sensor readings to Serial Monitor
  Serial.println("=== ADVANCED SENSOR READINGS ===");
  Serial.print("Temperature: ");
  Serial.print(currentData.temperature);
  Serial.println("°C");
  
  Serial.print("Humidity: ");
  Serial.print(currentData.humidity);
  Serial.println("%");
  
  Serial.print("Light Level: ");
  Serial.print(currentData.lightLevel);
  Serial.println(" lux");
  
  Serial.print("Motion: ");
  Serial.println(currentData.motionDetected ? "Detected" : "Clear");
  
  Serial.print("Sound Level: ");
  Serial.print(currentData.soundLevel);
  Serial.println(" (raw)");
  
  Serial.print("Water Status: ");
  Serial.println(currentData.waterDetected ? "WET DETECTED!" : "Dry");
  
  Serial.print("Moisture: ");
  Serial.print(currentData.moistureLevel);
  Serial.print(" - ");
  Serial.print(getMoistureDescription(currentData.moistureLevel));
  Serial.print(" (");
  Serial.print(getMoistureStatus(currentData.moistureLevel));
  Serial.println(")");
  
  Serial.print("Distance: ");
  if (currentData.distance < 0) {
    Serial.println("Out of range");
  } else {
    Serial.print(currentData.distance);
    Serial.println(" cm");
  }
  
  Serial.print("Potentiometer: ");
  Serial.println(currentData.potentiometerValue);
  
  Serial.println("==============================");
}

void sendSensorData() {
  // Check if client is still connected
  if (!client.connected()) {
    Serial.println("Connecting to server...");
    
    if (client.connect(server_host, server_port)) {
      Serial.println("Connected to server");
    } else {
      Serial.println("Connection to server failed");
      return;
    }
  }
  
  // Create comprehensive JSON payload
  StaticJsonDocument<500> doc;
  doc["type"] = "sensor_data";
  doc["temperature"] = currentData.temperature;
  doc["humidity"] = currentData.humidity;
  doc["light"] = currentData.lightLevel;
  doc["motion"] = currentData.motionDetected;
  doc["sound"] = currentData.soundLevel;
  doc["water_detected"] = currentData.waterDetected;
  doc["moisture_level"] = currentData.moistureLevel;
  doc["moisture_status"] = getMoistureStatus(currentData.moistureLevel);
  doc["distance"] = currentData.distance;
  doc["potentiometer"] = currentData.potentiometerValue;
  doc["timestamp"] = currentData.timestamp;
  doc["device_id"] = "arduino_advanced_001";
  doc["rgb_color"]["r"] = currentRGBColor.r;
  doc["rgb_color"]["g"] = currentRGBColor.g;
  doc["rgb_color"]["b"] = currentRGBColor.b;
  doc["rgb_enabled"] = rgbEnabled;
  doc["multicolor_mode"] = multicolorMode;
  doc["pot_control_mode"] = potControlMode;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request with keep-alive
  client.println("POST /sensor-data HTTP/1.1");
  client.print("Host: ");
  client.print(server_host);
  client.print(":");
  client.println(server_port);
  client.println("Content-Type: application/json");
  client.println("Connection: keep-alive");
  client.print("Content-Length: ");
  client.println(jsonString.length());
  client.println();
  client.println(jsonString);
  
  // Wait for response
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 5000) {
      Serial.println(">>> Client Timeout !");
      client.stop(); // Force reconnection on timeout
      return;
    }
  }
  
  // Read response
  while (client.available()) {
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
  
  Serial.println("\nAdvanced sensor data sent successfully");
  // Don't close connection - keep it alive for next request
}

// HTTP communication doesn't need ping function
// Sensor data is sent periodically via sendSensorData()

/*
  OLED Display Functions
*/

void displayStartupScreen() {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  
  // Title
  u8g2.drawStr(15, 15, "Smart Home");
  u8g2.drawStr(10, 30, "Sensor Array");
  
  // Version
  u8g2.setFont(u8g2_font_6x10_tf);
  u8g2.drawStr(20, 45, "v3.0 - UNO R4");
  
  // Loading animation
  u8g2.drawStr(30, 60, "Starting...");
  
  u8g2.sendBuffer();
  delay(3000);
}

void displayConnectionStatus(String message, bool isConnected) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  
  // Header
  u8g2.drawStr(25, 15, "Connection");
  
  // Status message
  u8g2.setFont(u8g2_font_6x10_tf);
  int msgWidth = u8g2.getStrWidth(message.c_str());
  int xPos = (128 - msgWidth) / 2; // Center the text
  u8g2.drawStr(xPos, 35, message.c_str());
  
  // Status indicator
  if (isConnected) {
    u8g2.drawCircle(64, 50, 5);
    u8g2.drawDisc(64, 50, 3);
    u8g2.drawStr(45, 62, "ONLINE");
  } else {
    u8g2.drawCircle(64, 50, 5);
    u8g2.drawStr(42, 62, "OFFLINE");
  }
  
  u8g2.sendBuffer();
}

void updateOLEDDisplay() {
  static int displayPage = 0;
  const int totalPages = 3;
  
  u8g2.clearBuffer();
  
  switch (displayPage) {
    case 0:
      displaySensorPage1(); // Temperature & Humidity
      break;
    case 1:
      displaySensorPage2(); // Light & Motion
      break;
    case 2:
      displayStatusPage();  // Network & System Status
      break;
  }
  
  // Page indicator dots at bottom
  drawPageIndicator(displayPage, totalPages);
  
  u8g2.sendBuffer();
  
  // Cycle through pages
  displayPage = (displayPage + 1) % totalPages;
}

void displaySensorPage1() {
  // Header
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(20, 12, "Environment");
  
  // Temperature
  u8g2.setFont(u8g2_font_6x10_tf);
  u8g2.drawStr(5, 28, "Temp:");
  
  String tempStr;
  if (currentData.temperature != -999 && !isnan(currentData.temperature)) {
    tempStr = String(currentData.temperature, 1) + "°C";
  } else {
    tempStr = "Error";
  }
  u8g2.drawStr(40, 28, tempStr.c_str());
  
  // Humidity
  u8g2.drawStr(5, 42, "Humid:");
  
  String humStr;
  if (currentData.humidity != -999 && !isnan(currentData.humidity)) {
    humStr = String(currentData.humidity, 0) + "%";
  } else {
    humStr = "Error";
  }
  u8g2.drawStr(40, 42, humStr.c_str());
  
  // Visual temperature bar
  drawTemperatureBar(5, 50, 118, 8, currentData.temperature);
}

void displaySensorPage2() {
  // Header
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(30, 12, "Detection");
  
  // Light Level
  u8g2.setFont(u8g2_font_6x10_tf);
  u8g2.drawStr(5, 28, "Light:");
  String lightStr = String(currentData.lightLevel) + " lux";
  u8g2.drawStr(40, 28, lightStr.c_str());
  
  // Motion Status
  u8g2.drawStr(5, 42, "Motion:");
  if (currentData.motionDetected) {
    u8g2.drawStr(45, 42, "DETECTED");
    // Draw motion icon
    drawMotionIcon(85, 35, true);
  } else {
    u8g2.drawStr(45, 42, "Clear");
    drawMotionIcon(85, 35, false);
  }
  
  // Light level bar
  drawLightBar(5, 50, 118, 8, currentData.lightLevel);
}

void displayStatusPage() {
  // Header
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(35, 12, "System");
  
  u8g2.setFont(u8g2_font_6x10_tf);
  
  // WiFi Status
  u8g2.drawStr(5, 26, "WiFi:");
  if (WiFi.status() == WL_CONNECTED) {
    u8g2.drawStr(35, 26, "Connected");
    // Signal strength
    int rssi = WiFi.RSSI();
    String signalStr = String(rssi) + "dBm";
    u8g2.drawStr(85, 26, signalStr.c_str());
  } else {
    u8g2.drawStr(35, 26, "Disconnected");
  }
  
  // Server Status
  u8g2.drawStr(5, 38, "Server:");
  if (client.connected()) {
    u8g2.drawStr(45, 38, "Online");
  } else {
    u8g2.drawStr(45, 38, "Offline");
  }
  
  // Uptime
  u8g2.drawStr(5, 50, "Uptime:");
  unsigned long uptime = millis() / 1000;
  String uptimeStr = formatUptime(uptime);
  u8g2.drawStr(45, 50, uptimeStr.c_str());
  
  // IP Address (if connected)
  if (WiFi.status() == WL_CONNECTED) {
    u8g2.setFont(u8g2_font_4x6_tf);
    String ipStr = "IP: " + WiFi.localIP().toString();
    u8g2.drawStr(5, 62, ipStr.c_str());
  }
}

void drawPageIndicator(int currentPage, int totalPages) {
  int dotSpacing = 8;
  int startX = (128 - (totalPages * dotSpacing)) / 2;
  int y = 60;
  
  for (int i = 0; i < totalPages; i++) {
    int x = startX + (i * dotSpacing);
    if (i == currentPage) {
      u8g2.drawDisc(x, y, 2); // Filled dot for current page
    } else {
      u8g2.drawCircle(x, y, 2); // Empty dot for other pages
    }
  }
}

void drawTemperatureBar(int x, int y, int width, int height, float temperature) {
  // Draw border
  u8g2.drawFrame(x, y, width, height);
  
  // Calculate fill based on temperature (0-40°C range)
  if (temperature != -999 && !isnan(temperature)) {
    int fillWidth = map(constrain(temperature, 0, 40), 0, 40, 0, width - 2);
    if (fillWidth > 0) {
      u8g2.drawBox(x + 1, y + 1, fillWidth, height - 2);
    }
  }
}

void drawLightBar(int x, int y, int width, int height, int lightLevel) {
  // Draw border
  u8g2.drawFrame(x, y, width, height);
  
  // Calculate fill based on light level (0-1000 lux range)
  int fillWidth = map(constrain(lightLevel, 0, 1000), 0, 1000, 0, width - 2);
  if (fillWidth > 0) {
    u8g2.drawBox(x + 1, y + 1, fillWidth, height - 2);
  }
}

void drawMotionIcon(int x, int y, bool detected) {
  if (detected) {
    // Draw filled circle with radiating lines for motion detected
    u8g2.drawDisc(x, y, 3);
    u8g2.drawLine(x-6, y, x-4, y);
    u8g2.drawLine(x+4, y, x+6, y);
    u8g2.drawLine(x, y-6, x, y-4);
    u8g2.drawLine(x, y+4, x, y+6);
  } else {
    // Draw empty circle for no motion
    u8g2.drawCircle(x, y, 3);
  }
}

String formatUptime(unsigned long seconds) {
  int hours = seconds / 3600;
  int minutes = (seconds % 3600) / 60;
  int secs = seconds % 60;
  
  if (hours > 0) {
    return String(hours) + "h" + String(minutes) + "m";
  } else if (minutes > 0) {
    return String(minutes) + "m" + String(secs) + "s";
  } else {
    return String(secs) + "s";
  }
}

/*
  Advanced Sensor Functions
*/

// Moisture sensor helper functions
String getMoistureStatus(int moistureValue) {
  if (MOISTURE_REVERSE) {
    if (moistureValue > MOISTURE_DRY) return "DRY";
    else if (moistureValue > MOISTURE_WET) return "HUMID";
    else return "WET";
  } else {
    if (moistureValue < MOISTURE_DRY) return "DRY";
    else if (moistureValue < MOISTURE_WET) return "HUMID";
    else return "WET";
  }
}

String getMoistureDescription(int moistureValue) {
  if (MOISTURE_REVERSE) {
    // Original Grove sensor logic (higher = dry)
    if (moistureValue > 900) return "Very Dry (Air)";
    else if (moistureValue > 700) return "Dry";
    else if (moistureValue > 400) return "Moist";
    else if (moistureValue > 200) return "Wet Soil";
    else return "Very Wet/Water";
  } else {
    // YOUR SENSOR logic (lower = dry, higher = wet)
    if (moistureValue < 50) return "Very Dry (Air)";
    else if (moistureValue < 200) return "Dry";
    else if (moistureValue < 400) return "Moist";
    else if (moistureValue < 600) return "Wet Soil";
    else return "Very Wet/Water";
  }
}

// Ultrasonic sensor function
float readUltrasonicDistance() {
  // Grove Ultrasonic Ranger uses one pin for both trigger and echo
  pinMode(ULTRASONIC_PIN, OUTPUT);
  digitalWrite(ULTRASONIC_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_PIN, LOW);
  
  // Switch to input to read the echo
  pinMode(ULTRASONIC_PIN, INPUT);
  long duration = pulseIn(ULTRASONIC_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    return -1; // No echo received (out of range)
  }
  
  // Calculate distance in cm
  // Speed of sound = 343 m/s = 0.0343 cm/μs
  // Distance = (time * speed) / 2 (divide by 2 for round trip)
  float distance = (duration * 0.0343) / 2.0;
  
  return distance;
}

// RGB LED Functions
void setRGBColor(int r, int g, int b) {
  // Store the original values before inversion
  currentRGBColor = {r, g, b};
  
  // For common anode RGB LEDs, we need to invert the values
  // 0 = full brightness, 255 = off
  if (COMMON_ANODE) {
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
  }
  
  analogWrite(RGB_RED_PIN, r);
  analogWrite(RGB_GREEN_PIN, g);
  analogWrite(RGB_BLUE_PIN, b);
}

void setRGBColor(RGBColor color) {
  setRGBColor(color.r, color.g, color.b);
}

void fadeRGBColor(RGBColor fromColor, RGBColor toColor, int duration) {
  int steps = 50;
  int stepDelay = duration / steps;
  
  for (int i = 0; i <= steps; i++) {
    int r = fromColor.r + (toColor.r - fromColor.r) * i / steps;
    int g = fromColor.g + (toColor.g - fromColor.g) * i / steps;
    int b = fromColor.b + (toColor.b - fromColor.b) * i / steps;
    setRGBColor(r, g, b);
    delay(stepDelay);
  }
}

void pulseRGBColor(RGBColor color, int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    fadeRGBColor(COLOR_OFF, color, delayMs / 2);
    fadeRGBColor(color, COLOR_OFF, delayMs / 2);
  }
}

void rainbowCycle(int delayMs) {
  RGBColor colors[] = {COLOR_RED, COLOR_ORANGE, COLOR_YELLOW, COLOR_GREEN, COLOR_CYAN, COLOR_BLUE, COLOR_PURPLE};
  for (int i = 0; i < 7; i++) {
    setRGBColor(colors[i]);
    delay(delayMs);
  }
}

void updateRGBForPlantStatus(int moistureValue) {
  if (MOISTURE_REVERSE) {
    if (moistureValue > 900) setRGBColor(COLOR_RED);        // Very dry - red alert
    else if (moistureValue > 700) setRGBColor(COLOR_ORANGE); // Dry - orange warning
    else if (moistureValue > 400) setRGBColor(COLOR_YELLOW); // Moist - yellow caution
    else if (moistureValue > 200) setRGBColor(COLOR_GREEN);  // Perfect - green
    else setRGBColor(COLOR_BLUE);                            // Very wet - blue
  } else {
    if (moistureValue < 50) setRGBColor(COLOR_RED);          // Very dry - red alert
    else if (moistureValue < 200) setRGBColor(COLOR_ORANGE); // Dry - orange warning
    else if (moistureValue < 400) setRGBColor(COLOR_YELLOW); // Moist - yellow caution
    else if (moistureValue < 600) setRGBColor(COLOR_GREEN);  // Perfect - green
    else setRGBColor(COLOR_BLUE);                            // Very wet - blue
  }
}

void updateRGBForDistance(float distance) {
  if (distance < 0) {
    // Out of range - dim white
    setRGBColor(50, 50, 50);
    return;
  }
  
  if (distance <= 5) {
    // Very close - bright red
    setRGBColor(COLOR_RED);
  } else if (distance <= 10) {
    // Close - orange
    setRGBColor(COLOR_ORANGE);
  } else if (distance <= 20) {
    // Moderate - yellow
    setRGBColor(COLOR_YELLOW);
  } else if (distance <= 50) {
    // Far - green
    setRGBColor(COLOR_GREEN);
  } else if (distance <= 100) {
    // Very far - blue
    setRGBColor(COLOR_BLUE);
  } else {
    // Out of range - cyan
    setRGBColor(COLOR_CYAN);
  }
}

// Non-blocking multicolor mode function - Super fast rainbow
void updateMulticolorMode() {
  unsigned long currentTime = millis();
  
  // Update every 10ms for super fast smooth transitions
  if (currentTime - lastMulticolorUpdate < 10) {
    return;
  }
  lastMulticolorUpdate = currentTime;
  
  // Simple rainbow wheel using HSV to RGB conversion
  // This creates a smooth, balanced color cycle
  
  // Increment hue (0-359 degrees)
  static int hue = 0;
  hue = (hue + 20) % 360;  // Super fast color changes
  
  // Convert HSV to RGB for smooth rainbow
  float h = hue / 60.0;
  float s = 1.0;  // Full saturation
  float v = 1.0;  // Full brightness
  
  int i = floor(h);
  float f = h - i;
  float p = v * (1 - s);
  float q = v * (1 - s * f);
  float t = v * (1 - s * (1 - f));
  
  float r_f, g_f, b_f;
  
  switch (i % 6) {
    case 0: r_f = v; g_f = t; b_f = p; break;
    case 1: r_f = q; g_f = v; b_f = p; break;
    case 2: r_f = p; g_f = v; b_f = t; break;
    case 3: r_f = p; g_f = q; b_f = v; break;
    case 4: r_f = t; g_f = p; b_f = v; break;
    case 5: r_f = v; g_f = p; b_f = q; break;
  }
  
  // Convert to 0-255 range
  int r = (int)(r_f * 255);
  int g = (int)(g_f * 255);
  int b = (int)(b_f * 255);
  
  // Constrain values to valid range
  r = constrain(r, 0, 255);
  g = constrain(g, 0, 255);
  b = constrain(b, 0, 255);
  
  setRGBColor(r, g, b);
}

// Potentiometer RGB Control Function
void updatePotentiometerRGB() {
  unsigned long currentTime = millis();
  
  // Update every 50ms for smooth but not overwhelming updates
  if (currentTime - lastPotUpdate < 50) {
    return;
  }
  lastPotUpdate = currentTime;
  
  int potValue = analogRead(POTENTIOMETER_PIN);
  
  // Only update if potentiometer value changed significantly (reduce noise)
  if (abs(potValue - lastPotValue) < 10) {
    return;
  }
  lastPotValue = potValue;
  
  // Map potentiometer (0-1023) to hue (0-359 degrees)
  int hue = map(potValue, 0, 1023, 0, 359);
  
  // Convert HSV to RGB for smooth color transitions
  float h = hue / 60.0;
  float s = 1.0;  // Full saturation for vibrant colors
  float v = 1.0;  // Full brightness
  
  int i = floor(h);
  float f = h - i;
  float p = v * (1 - s);
  float q = v * (1 - s * f);
  float t = v * (1 - s * (1 - f));
  
  float r_f, g_f, b_f;
  
  switch (i % 6) {
    case 0: r_f = v; g_f = t; b_f = p; break;
    case 1: r_f = q; g_f = v; b_f = p; break;
    case 2: r_f = p; g_f = v; b_f = t; break;
    case 3: r_f = p; g_f = q; b_f = v; break;
    case 4: r_f = t; g_f = p; b_f = v; break;
    case 5: r_f = v; g_f = p; b_f = q; break;
  }
  
  // Convert to 0-255 range
  int r = (int)(r_f * 255);
  int g = (int)(g_f * 255);
  int b = (int)(b_f * 255);
  
  // Constrain values to valid range
  r = constrain(r, 0, 255);
  g = constrain(g, 0, 255);
  b = constrain(b, 0, 255);
  
  setRGBColor(r, g, b);
  
  // Optional: Print debug info every second
  static unsigned long lastDebugPot = 0;
  if (currentTime - lastDebugPot > 1000) {
    Serial.print("Pot Control Active - ");
    Serial.print("Pot: ");
    Serial.print(potValue);
    Serial.print(" → Hue: ");
    Serial.print(hue);
    Serial.print("° → RGB(");
    Serial.print(r);
    Serial.print(",");
    Serial.print(g);
    Serial.print(",");
    Serial.print(b);
    Serial.println(")");
    lastDebugPot = currentTime;
  }
}

bool isHexColor(String str) {
  for (int i = 0; i < str.length(); i++) {
    char c = str[i];
    if (!((c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f'))) {
      return false;
    }
  }
  return true;
}

/*
  Enhanced OLED Display Functions
*/

// Update the existing OLED display to show advanced sensor data
void updateAdvancedOLEDDisplay() {
  static int displayPage = 0;
  const int totalPages = 4; // Increased to 4 pages for all sensors
  
  u8g2.clearBuffer();
  
  switch (displayPage) {
    case 0:
      displayEnvironmentPage(); // Temperature, Humidity, Light
      break;
    case 1:
      displayDetectionPage();   // Motion, Sound, Water
      break;
    case 2:
      displayAnalogPage();      // Moisture, Distance, Potentiometer
      break;
    case 3:
      displayStatusPage();      // Network & System Status
      break;
  }
  
  // Page indicator dots at bottom
  drawPageIndicator(displayPage, totalPages);
  
  u8g2.sendBuffer();
  
  // Cycle through pages
  displayPage = (displayPage + 1) % totalPages;
}

void displayEnvironmentPage() {
  // Header
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(20, 12, "Environment");
  
  u8g2.setFont(u8g2_font_6x10_tf);
  
  // Temperature
  u8g2.drawStr(5, 28, "Temp:");
  String tempStr;
  if (currentData.temperature != -999 && !isnan(currentData.temperature)) {
    tempStr = String(currentData.temperature, 1) + "C";
  } else {
    tempStr = "Error";
  }
  u8g2.drawStr(40, 28, tempStr.c_str());
  
  // Humidity
  u8g2.drawStr(5, 42, "Humid:");
  String humStr;
  if (currentData.humidity != -999 && !isnan(currentData.humidity)) {
    humStr = String(currentData.humidity, 0) + "%";
  } else {
    humStr = "Error";
  }
  u8g2.drawStr(45, 42, humStr.c_str());
  
  // Light Level
  u8g2.drawStr(5, 56, "Light:");
  String lightStr = String(currentData.lightLevel) + " lux";
  u8g2.drawStr(45, 56, lightStr.c_str());
}

void displayDetectionPage() {
  // Header
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(30, 12, "Detection");
  
  u8g2.setFont(u8g2_font_6x10_tf);
  
  // Motion
  u8g2.drawStr(5, 28, "Motion:");
  u8g2.drawStr(50, 28, currentData.motionDetected ? "YES" : "No");
  
  // Sound Level
  u8g2.drawStr(5, 42, "Sound:");
  String soundStr = String(currentData.soundLevel);
  u8g2.drawStr(45, 42, soundStr.c_str());
  
  // Water Detection
  u8g2.drawStr(5, 56, "Water:");
  if (currentData.waterDetected) {
    u8g2.drawStr(45, 56, "WET!");
  } else {
    u8g2.drawStr(45, 56, "Dry");
  }
}

void displayAnalogPage() {
  // Header
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(35, 12, "Sensors");
  
  u8g2.setFont(u8g2_font_6x10_tf);
  
  // Moisture
  u8g2.drawStr(5, 28, "Soil:");
  String moistStr = getMoistureStatus(currentData.moistureLevel);
  u8g2.drawStr(35, 28, moistStr.c_str());
  String moistValStr = String(currentData.moistureLevel);
  u8g2.drawStr(80, 28, moistValStr.c_str());
  
  // Distance
  u8g2.drawStr(5, 42, "Dist:");
  if (currentData.distance < 0) {
    u8g2.drawStr(35, 42, "---");
  } else {
    String distStr = String(currentData.distance, 0) + "cm";
    u8g2.drawStr(35, 42, distStr.c_str());
  }
  
  // RGB Status
  u8g2.drawStr(5, 56, "RGB:");
  if (multicolorMode) {
    u8g2.drawStr(35, 56, "Rainbow");
  } else if (potControlMode) {
    u8g2.drawStr(35, 56, "Manual");
  } else {
    u8g2.drawStr(35, 56, "Plant");
  }
}
