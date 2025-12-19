
#include <Wire.h>
//#include <SPI.h> 
//#include <SD.h> 
#include <SoftwareSerial.h>          
#include "Adafruit_PM25AQI.h"        
#include <SparkFun_SCD4x_Arduino_Library.h>
#include <VOCGasIndexAlgorithm.h> 
#include "DHT.h"

// --- PIN DEFINITIONS ---
#define SGP40_ADDR 0x59

// PM2.5 Sensor (Plantower)
SoftwareSerial pmsSerial(2, 3); 

//const int chipSelect = 10;      // SD Card CS Pin

// CJMCU-6814 Analog Pins
#define CO_PIN  A0
#define NO2_PIN A1
#define NH3_PIN A2

// DHT22
#define DHTPIN 8     
#define DHTTYPE DHT22   

// --- OBJECTS ---
SCD4x scd4x;
VOCGasIndexAlgorithm vocAlgorithm; 
DHT dht(DHTPIN, DHTTYPE);
Adafruit_PM25AQI aqi;

// --- VARIABLES ---
bool scd41Live = false; 
bool pmsLive = false; 

// Data Storage
int val_CO2 = 0;
int32_t val_VOC = 0; // Index 0-500
float val_TempF = 0.0;
float val_Hum = 0.0;

// PM Mass (Standard)
int pm10 = 0;  // PM 1.0
int pm25 = 0;  // PM 2.5
int pm100 = 0; // PM 10.0

// CJMCU Resistance (Raw)
float Rs_CO = 0;
float Rs_NO2 = 0;
float Rs_NH3 = 0;

unsigned long lastDHTTime = 0;

// Helper function prototype
float getResistance(int raw_adc);

void setup() {
  Serial.begin(9600);
  Serial.println(F("--- ROBUST MASTER HUB ---"));

  /* --- A. INITIALIZE SD CARD (WITH RETRY LOGIC) ---
  Serial.print(F("Init SD..."));
  pinMode(10, OUTPUT);
  
  bool sdStatus = false;
  // Try 3 times to connect to SD card (Fixes power brownouts)
  for (int i = 0; i < 3; i++) {
    if (SD.begin(chipSelect)) {
      sdStatus = true;
      break;
    }
    delay(1000); // Wait 1 second for voltage to stabilize
    Serial.print(F("."));
  }

  if (!sdStatus) {
    Serial.println(F("Fail. (Plug in 9V Battery!)"));
  } else {
    Serial.println(F("OK"));
    File dataFile = SD.open("log.txt", FILE_WRITE); 
    if (dataFile) {
      if (dataFile.size() == 0) {
        dataFile.println(F("T_ms,CO2,VOC_Idx,Tmp,Hum,PM1,PM2.5,PM10,R_CO,R_NO2,R_NH3"));
      }
      dataFile.close();
    }
  }*/

  // --- B. PM2.5 SENSOR ---
  pmsSerial.begin(9600);
  delay(500);
  if (!aqi.begin_UART(&pmsSerial)) {
    Serial.println(F("PM2.5 Missing"));
    pmsLive = false;
  } else {
    Serial.println(F("PM2.5 OK"));
    pmsLive = true;
  }

  // --- C. I2C SENSORS (SCD41 & SGP40) ---
  Wire.begin(); 
  
  // SCD41 Force Reset
  Wire.beginTransmission(0x62); Wire.write(0x3F); Wire.write(0x86); Wire.endTransmission();
  delay(500);

  // Start SCD41
  if (scd4x.begin()) {
    Serial.println(F("SCD41 OK"));
    scd41Live = true;
    scd4x.startPeriodicMeasurement();
  } else {
    Serial.println(F("SCD41 Fail"));
  }

  dht.begin();
  
  // --- D. CJMCU ---
  Serial.println(F("Calibrating ADC..."));
  for (int i = 0; i < 5; i++) {
     analogRead(CO_PIN); analogRead(NO2_PIN); analogRead(NH3_PIN);
     delay(100);
  }
  Serial.println(F("System Ready. Logging Started."));
}

void loop() {
  
  // 1. READ PM2.5
  PM25_AQI_Data data;
  if (pmsLive) {
    if (aqi.read(&data)) {
      pm10  = data.pm10_standard;
      pm25  = data.pm25_standard;
      pm100 = data.pm100_standard;
    }
  }

  // 2. READ SCD41 (CO2)
  if (scd41Live) {
    if (scd4x.readMeasurement()) {
      if (scd4x.getCO2() > 0) val_CO2 = scd4x.getCO2();
    }
  }

  // 3. READ SGP40 (VOC) & PROCESS INDEX
  uint16_t srawVoc = 0;
  bool sgpSuccess = false;
  Wire.beginTransmission(SGP40_ADDR);
  Wire.write(0x26); Wire.write(0x0F); 
  Wire.write(0x80); Wire.write(0x00); Wire.write(0xA2); 
  Wire.write(0x66); Wire.write(0x66); Wire.write(0x93); 
  if (Wire.endTransmission() == 0) {
    delay(50); 
    Wire.requestFrom(SGP40_ADDR, 3);
    if (Wire.available() == 3) {
      uint8_t msb = Wire.read(); uint8_t lsb = Wire.read(); Wire.read(); 
      srawVoc = (msb << 8) | lsb;
      sgpSuccess = true;
    }
  }
  
  if (sgpSuccess) {
    val_VOC = vocAlgorithm.process(srawVoc);
  }

  // 4. READ DHT22 (Temp/Hum)
  if (millis() - lastDHTTime > 2000) {
    float h = dht.readHumidity();
    float f = dht.readTemperature(true);
    if (!isnan(h) && !isnan(f)) {
      val_Hum = h; val_TempF = f;
    }
    lastDHTTime = millis();
  }

  // 5. READ CJMCU (Raw Resistance)
  Rs_CO = getResistance(analogRead(CO_PIN));
  Rs_NO2 = getResistance(analogRead(NO2_PIN));
  Rs_NH3 = getResistance(analogRead(NH3_PIN));
  
  /* --- 6. SERIAL OUTPUT ---
 Serial.print(F("# PM2.5:")); Serial.print(pm25);
  Serial.print(F("# tCO2:")); Serial.print(val_CO2); 
  Serial.print(F("# tVOC:")); Serial.println(val_VOC); */

// --- 7. BUILD CSV LINE ---
String csvLine = "";
csvLine += String(millis()) + ",";
csvLine += String(val_CO2) + ",";
csvLine += String(val_VOC) + ",";
csvLine += String(val_TempF) + ",";
csvLine += String(val_Hum) + ",";
csvLine += String(pm10) + ",";
csvLine += String(pm25) + ",";
csvLine += String(pm100) + ",";
csvLine += String(Rs_CO) + ",";
csvLine += String(Rs_NO2) + ",";
csvLine += String(Rs_NH3);

/*/ --- 8. LOG TO SD CARD ---
File dataFile = SD.open("log.txt", FILE_WRITE);
if (dataFile) {
  dataFile.println(csvLine);
  dataFile.close();
}
*/
// --- 9. SEND TO ESP32 ---
Serial.println(csvLine);
delay(1000);


}

float getResistance(int raw_adc) {
  if (raw_adc == 0) raw_adc = 1; 
  return (1023.0 / (float)raw_adc) - 1.0;
}
