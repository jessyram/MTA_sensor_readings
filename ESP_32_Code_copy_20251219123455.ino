#include <WiFi.h>
#include <WebServer.h>


/* ========== WIFI HOTSPOT SETTINGS ========== */
const char* ssid = "ESP32-HOTSPOT";
const char* password = "esp32pass";


/* ========== SERIAL FROM ARDUINO ========== */
// RX2 = GPIO16, TX2 = GPIO17 (default)
#define RXD2 16
#define TXD2 17


/* ========== WEB SERVER ========== */
WebServer server(80);


/* ========== SENSOR DATA STORAGE ========== */
String latestCSV = "";
bool hasData = false;


/* ========== HTML PAGE ========== */
const char webpage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
 <title>ESP32 Live Sensor Data</title>
 <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
 <h2>Live Sensor Data</h2>
 <pre id="data">Waiting for data...</pre>


 <script>
   setInterval(() => {
     fetch("/data")
       .then(res => res.json())
       .then(d => {
         if (d.csv) {
           document.getElementById("data").innerText = d.csv;
         }
       });
   }, 1000);
 </script>
</body>
</html>
)rawliteral";


/* ========== HANDLERS ========== */
void handleRoot() {
 server.send_P(200, "text/html", webpage);
}


void handleData() {
 if (hasData) {
   server.send(200, "application/json",
     "{\"csv\":\"" + latestCSV + "\"}");
 } else {
   server.send(200, "application/json",
     "{\"csv\":\"No data yet\"}");
 }
}


/* ========== SETUP ========== */
void setup() {
 Serial.begin(115200);          // ESP32 debug (USB)
 Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);  // Arduino → ESP32


 // Start Wi-Fi hotspot
 WiFi.softAP(ssid, password);


 Serial.println("ESP32 Hotspot Started");
 Serial.print("IP address: ");
 Serial.println(WiFi.softAPIP());


 // Web server routes
 server.on("/", handleRoot);
 server.on("/data", handleData);
 server.begin();
}


/* ========== LOOP ========== */
void loop() {
 server.handleClient();


 // Read CSV from Arduino
 if (Serial2.available()) {
   String line = Serial2.readStringUntil('\n');
   line.trim();


   // Ignore empty lines
   if (line.length() > 5) {
     latestCSV = line;
     hasData = true;


     // Debug (USB only)
     Serial.println("Received: " + latestCSV);
   }
 }
}
