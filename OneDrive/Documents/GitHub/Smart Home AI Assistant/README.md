# Smart Home AI Assistant

A voice-controlled IoT dashboard that integrates with smart home devices and provides an AI assistant powered by Google's Gemini API.

## Features

- 🎤 **Voice Control** - Talk to your smart home using natural language
- 🏠 **IoT Dashboard** - Real-time monitoring of temperature, humidity, light, and motion sensors
- 🤖 **AI Assistant** - Powered by Google Gemini API for intelligent responses
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔌 **Arduino Integration** - WebSocket connection for real-time sensor data
- 🎨 **Modern UI** - Beautiful dark theme with animated background

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-home-ai-assistant.git
   cd smart-home-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for use in the application

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:8080`
   - Enter your Gemini API key in the settings panel
   - Start talking to your smart home!

## Project Structure

```
smart-home-ai-assistant/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styles and animations
├── script.js           # JavaScript functionality
├── package.json        # Project configuration
├── README.md           # This file
├── arduino/            # Arduino code examples
│   └── sensors.ino     # Example Arduino sketch
└── server/             # WebSocket server for Arduino
    └── websocket-server.js
```

## Setup Instructions

### 1. HTML Structure (`index.html`)
The main HTML file contains three main sections:
- **IoT Dashboard** (left panel) - Displays sensor readings
- **Chat Interface** (center panel) - Voice interaction with AI
- **Settings Panel** (right panel) - API configuration and voice settings

### 2. Styling (`styles.css`)
Features a modern dark theme with:
- CSS custom properties for easy color customization
- Animated background with floating orbs
- Responsive grid layout
- Smooth transitions and hover effects
- Custom scrollbars and form elements

### 3. JavaScript Functionality (`script.js`)
Core features include:
- **Speech Recognition** - Web Speech API for voice input
- **Text-to-Speech** - Browser's speech synthesis
- **Gemini AI Integration** - Natural language processing
- **WebSocket Communication** - Real-time Arduino data
- **IoT Command Processing** - Local sensor queries
- **Local Storage** - API key persistence

## API Configuration

### Gemini API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in the Settings panel of the application

### Voice Commands
The assistant responds to natural language queries like:
- "What's the temperature?"
- "How humid is it?"
- "Check the light level"
- "Is there any motion?"
- "Turn on the lights"
- "Give me a status update"

## Arduino Integration

### Hardware Setup
Connect sensors to your Arduino:
- **DHT22** - Temperature and humidity sensor
- **LDR** - Light sensor
- **PIR** - Motion sensor
- **WiFi Module** - For network connectivity

### Arduino Code Example
```cpp
#include <WiFiS3.h>
#include <ArduinoWebsockets.h>
#include <DHT.h>

const char* ssid = "your-wifi-ssid";
const char* password = "your-wifi-password";
const char* websocket_server = "ws://your-computer-ip:3000";

DHT dht(2, DHT22);
using namespace websockets;
WebsocketsClient client;

void setup() {
    Serial.begin(115200);
    dht.begin();
    
    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    
    // Connect to WebSocket
    client.connect(websocket_server);
}

void loop() {
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    int light = analogRead(A0);
    bool motion = digitalRead(3);
    
    String json = "{\"temperature\":" + String(temp) + 
                  ",\"humidity\":" + String(humidity) + 
                  ",\"light\":" + String(light) + 
                  ",\"motion\":" + String(motion) + "}";
    
    client.send(json);
    delay(5000);
}
```

### WebSocket Server
Create a simple WebSocket server to bridge Arduino and web app:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    
    ws.on('message', function incoming(message) {
        console.log('Received:', message);
        // Broadcast to all clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});
```

## Customization

### Adding New Sensors
1. Update the HTML structure in `index.html`
2. Add CSS styles in `styles.css`
3. Modify the sensor data object in `script.js`
4. Update the IoT command processing function

### Changing Colors
Modify the CSS custom properties in `:root`:
```css
:root {
    --primary: #your-color;
    --secondary: #your-color;
    --accent: #your-color;
}
```

### Adding Voice Commands
Extend the `processIoTCommand` function in `script.js`:
```javascript
if (lowerText.includes('your-command')) {
    return "Your response";
}
```

## Browser Compatibility

- **Chrome/Edge** - Full support
- **Firefox** - Full support
- **Safari** - Limited Web Speech API support
- **Mobile** - Touch interface for voice activation

## Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Ensure HTTPS or localhost
   - Try different browsers

2. **API key invalid**
   - Verify the key is correct
   - Check API quotas in Google Cloud Console
   - Ensure Gemini API is enabled

3. **Arduino not connecting**
   - Check WebSocket server is running
   - Verify network connectivity
   - Check firewall settings

4. **Voice synthesis not working**
   - Try different voices in settings
   - Check browser compatibility
   - Ensure audio is not muted

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review browser console for errors

## Future Enhancements

- [ ] Multiple language support
- [ ] Custom wake word detection
- [ ] Home automation integration (Philips Hue, etc.)
- [ ] Machine learning for predictive responses
- [ ] Mobile app companion
- [ ] Cloud data storage and analytics
