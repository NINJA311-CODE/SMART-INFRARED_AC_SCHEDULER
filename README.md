## 📱📡Smart Infrared AC Scheduler

<img width="1152" height="864" alt="image" src="https://github.com/user-attachments/assets/9fe1655c-b94f-45e5-96f0-592623fc27ec" />


An ESP32 box that adds schedules, remote control and a temperature safety net to a normal infrared AC, and keeps running even when the internet goes down.


**Live dashboard:** https://esp32ac.lovable.app
(To connect it to your own ESP32, enter your HiveMQ broker details in the dashboard settings.)

**Demo video:** https://youtu.be/KKiCB_PlKlA

## Why I made it

So i wanted to find a solution for people going on vacations during summer months and the issue was 2 bad choices:
either leave the AC continuously running which gives a huge electricity bill
or leave it OFF to come in a oven hot room with damaged things in the room!

to solve this, i needed to make a device which could turn the AC ON automatically to cool once the room gets hot,and to be able to monitor room status ,set schedules, control the AC from another country as well with wifi

Cloud-only smart plugs and controllers don't fully fix this, because if the Wi-Fi or the cloud service drops, the automation stops with it. So here the ESP32 runs everything itself and the cloud is only used to reach it from outside. As this device once a schedule is set online or offline,it can run that schedule reliably even without internet

🏆so once i completed making this device ,i left it in my home to run for a whole month unattended and everything worked perfectly by the time i came back,AND there is almost 0 latency for a command to control the AC on the webapp‼️

## How you would use it

Say you want the AC on from 08:00 to 17:00 at 22°C. Set that once and it happens every day. Before flying home you can add a one-time event for your arrival (3 Oct 2026, 06:00, 22°C, off again after 3 hours) so the room is already cool when you walk in. To take over, use a button or the dashboard, then press Resume schedule when you're done.

## Images

## 3D CAD MODEL
<img width="409" height="491" alt="Screenshot 2026-10-17 231416" src="https://github.com/user-attachments/assets/d6b0e568-2fd9-48e5-bd96-1dd98d8f15f1" />

## SCHEMATIC WIRING DIAGRAM (PCB VERSION HASN'T BEEN TESTED,BREADBOARD VERSION)
<img width="1223" height="925" alt="image" src="https://github.com/user-attachments/assets/f9454a69-95fe-4908-bf22-2bdcd83570ac" />



## Features

- Daily on/off schedule with a 17 to 30°C target. Windows that cross midnight work too.
- A one-time event for a specific date, with its own temperature and an optional auto-off timer of up to 24 hours. If the power cuts out, the ESP32 checks the clock after rebooting and picks the event back up if it's still running.
- You teach it your own AC remote by pressing each button once. It saves 16 commands (on, off, and 17 to 30°C) in flash.
- Everything works with no internet. The DS3231 keeps the time, the OLED and six buttons are enough to set it up, and the ESP32 also hosts a small local web page.
- From anywhere else you use the dashboard I built with Lovable, which talks to the board over MQTT (HiveMQ Cloud, TLS).
- If the room reaches 35°C and nobody has taken manual control, it turns the AC on at 20°C and the buzzer beeps for 2 seconds.
- Firmware updates can be pushed over a second MQTT channel.

## Quick start

1. Create 2 clusters on HiveMQ Cloud. One is for the normal MQTT connection (the device and the dashboard) and the other is for OTA firmware updates. Make credentials for each.
2. Install Arduino IDE 2.x, the ESP32 board package and the libraries listed under Software below.
3. Put both sets of HiveMQ details in the config (see Configuration), upload, and open the Serial Monitor at 115200 baud.
4. Connect to the Wi-Fi hotspot the device creates, then go to Menu > Register new AC and press each button on your AC remote when the OLED asks.

## Hardware

![Hardware overview](https://github.com/user-attachments/assets/45c80b98-5eeb-4d98-94ca-119e2d4be252)

| Part | Used for |
|---|---|
| ESP32 30-pin NodeMCU-style board (CH340) | Control, Wi-Fi, scheduling |
| DS3231 RTC | Keeps time without internet |
| SHT40 sensor module | Room temperature and humidity |
| 0.96" SSD1306 OLED | Local menu and status |
| VS1838B IR receiver | Learns the original remote |
| IR LED with driver stage | Sends commands to the AC |
| 6 push buttons | Up, down, left, right, OK, back |
| Buzzer | Feedback and alarms |
| USB to 2-wire cable (PCB version only) | Power |
| Custom PCB (EasyEDA Pro, made by JLCPCB) | Rev 1 board |
| 3D-printed enclosure | Housing |

Parts lists with links and prices in USD: `BREADBOARD-BOM.csv` for the breadboard version and `bom_pcb.csv` for the PCB version.

## ‼️THERE IS ONE BREADBOARD AND ONE PCB VERSION OF THIS PROJECT‼️

The PCB version also needs a USB to 2-wire cable to power it.

My prototype used a 2N2222 and an S8050 in the Darlington pair. This BOM and diagram show two SS8050s, which should handle the LED current more comfortably, but I haven’t tested that exact pair.

Pinout:

| GPIO | Function |
|---|---|
| 21 / 22 | I2C SDA / SCL (DS3231, SHT40, OLED share the bus) |
| 4 | IR transmitter |
| 15 | VS1838B output |
| 18 | Buzzer |
| 13, 12, 14, 27 | Up, Down, Left, Right |
| 26, 25 | OK, Back |

## How it works

Mostly it's one big loop. It checks the buttons, the web server, MQTT, the IR receiver, the sensor and the display one after another and never sits in a delay, which is why a dead wifi connection or the 8 second IR learning window doesn't freeze the rest.

The tricky part was deciding who's in charge when several things want the AC at the same time. I settled on emergency cooling first (only if the SHT40 gives a valid reading), then the one-time event, then the daily schedule. Manual control beats all of them, emergency cooling included, and stays in charge until you press Resume schedule. A button press, the local page and the cloud all go through the same rules.

Emergency cooling starts at 35°C and only stops once the room is under 24°C. It runs at least an hour and waits 60 seconds before it can trigger again, so it doesn't bounce on and off around the threshold. I'd call it a convenience feature, not a certified safety system.

For learning a remote, the VS1838B records the raw timings of the signal for up to 8 seconds (a buffer of 400 entries). Anything that shows up within 500 ms of the ESP32 sending its own signal gets ignored, otherwise it would learn its own reflection. Each code is saved to flash (NVS) right away and you can test-fire it to check. Settings are saved one field at a time with version numbers instead of as raw structs, so compiler padding can't corrupt them between builds.

The dashboard has no scheduling logic of its own. It sends a command, the ESP32 checks it, clamps the values, applies it and sends the new state back, so what you see is what the board is really doing.

## Run it locally

### Software

You need Arduino IDE 2.x with the ESP32 board package and a CH340 driver. Install these libraries from the Library Manager:

RTClib, Adafruit GFX Library, Adafruit SSD1306, Adafruit Unified Sensor, Adafruit SHT4x Library, IRremote (4.x only), WiFiManager, PubSubClient, ArduinoJson.

### Build options

```cpp
// #define DECODE_MODE   // uncomment for a raw IR sniffer build
#define ENABLE_WIFI      // comment out for a fully offline build
#define ENABLE_OTA
```

An offline build keeps the scheduler, clock, buttons, IR learning and emergency logic. `DECODE_MODE` turns the firmware into a sniffer that prints decoded signals and a C array to Serial.

### Configuration

You need 2 HiveMQ Cloud clusters for this. The `MQTT_*` values come from the first one and the `OTA_MQTT_*` values from the second.

```cpp
#define MQTT_HOST       "<HIVEMQ_HOST>"
#define MQTT_PORT       8883
#define MQTT_USER       "<MQTT_USERNAME>"
#define MQTT_PASS       "<MQTT_PASSWORD>"
#define MQTT_CLIENT_ID  "esp32-ac-scheduler-01"

#define OTA_MQTT_HOST   "<OTA_HIVEMQ_HOST>"
#define OTA_MQTT_PORT   8883
#define OTA_MQTT_USER   "<OTA_USERNAME>"
#define OTA_MQTT_PASS   "<OTA_PASSWORD>"
#define OTA_MQTT_TOPIC  "fleet/firmware/update"
```

Wi-Fi credentials aren't in the code. WiFiManager opens a hotspot where you enter them, and if the device can't get online it just carries on in offline mode.

### MQTT topics WEBAPP HANDLES ALL OF THIS, ONLY NEEDS YOUR OWN HIVEMQ CREDENTIALS‼️

| Topic | Purpose |
|---|---|
| `home/ac/manual_cmd` | `{"power": true}`, `{"temp": 22}`, `{"resume_schedule": true}` |
| `home/ac/schedule_set` | `{"sh":8,"sm":0,"eh":17,"em":0,"tgt":22,"en":true}` (partial updates are accepted) |
| `home/ac/event_set` | `{"en":true,"y":2026,"mo":10,"d":3,"h":6,"mi":0,"t":22,"off":3}` |
| `home/ac/status` | Published every 5 s: `{"temp":28.4,"hum":52.1,"acOn":true,"setTemp":22,"mode":"schedule"}` |

The reported modes are `emergency`, `manual`, `schedule` and `schedule_off`.

### Local HTTP routes

`/` (the dashboard, refreshes every 1.5 s), `/status`, `/cmd?action=on|off`, `/settemp?c=22`, `/schedule?...`, `/event?...`, `/resume`.



## What went wrong with the PCB

![PCB](https://github.com/user-attachments/assets/12512b9c-c309-4bf5-b71e-6542b701ef97)

I designed the Rev 1 board in EasyEDA Pro and had JLCPCB make it. It arrived with a short between 3.3V and GND. I'd set the design rules too tight and let the autorouter handle the area around the 2.54 mm headers.

I found it with the power off and the multimeter in continuity mode, checking 3.3V against GND and tracing the short back to the layout. The firmware was fine, the board wasn't, so I rebuilt the same circuit on a breadboard and tested everything there: OLED, clock, sensor, buttons, IR learning and sending, schedules, one-time events, emergency cooling, local web control, MQTT and flash storage.

The latest Gerber file in `PCB/` has this fixed. For Rev 2 I'm using a minimum clearance of 0.254 mm (10 mil), 4-spoke thermal relief on the ground pours and hand-routed signals near the headers, and I check the Gerbers and the 3D view before ordering.

## Known issues

MQTT uses TLS, but the firmware calls `setInsecure()`, so the broker certificate isn't checked. The OTA message carries a GitHub access token in its payload, which is okay for a prototype and not something to ship. The power-on self-test can only check parts that answer back (OLED, DS3231, SHT40), so the IR LED, receiver wiring and buzzer need a manual check. Also keep your credentials out of the repository.

Next I want to test the Rev 2 PCB, add certificate checking, signed OTA, multiple schedule windows, energy metering and support for more than one AC.

## Credits

Built with the Arduino ESP32 core, IRremote by Armin Joachimsmeyer, Adafruit libraries and the SHT4x sensor, RTClib, WiFiManager by tzapu, PubSubClient, ArduinoJson, HiveMQ Cloud, Lovable, EasyEDA Pro and JLCPCB.

AI use: Claude helped with the firmware. Gemini helped with hardware debugging, wiring tips, part upgrades and the CAD model.

Made for Hack Club's Stardance.
