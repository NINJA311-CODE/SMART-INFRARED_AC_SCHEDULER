📱📡# Smart Infrared AC Scheduler

An ESP32 controller that gives an ordinary infrared air conditioner schedules, remote control and temperature-based protection, and keeps working when the internet goes down.


**Live dashboard:** https://esp32ac.lovable.app
(To connect it to your own ESP32, enter your HiveMQ broker details in the dashboard settings.)

**Demo video:** https://youtu.be/KKiCB_PlKlA

## Why I made it

So i wanted to find a solution for people going on vacations during summer months and the issue was 2 bad choices:
either leave the AC continuously running which gives a huge electricity bill
or leave it OFF to come in a oven hot room with damaged things in the room!

to solve this, i needed to make a device which could turn the AC ON automatically to cool once the room gets hot,and to be able to monitor room status ,set schedules, control the AC from another country as well with wifi

Cloud-only smart plugs and controllers don't fully fix this, because if the Wi-Fi or the cloud service drops, the automation stops with it. So here the ESP32 runs everything itself and the cloud is only used to reach it from outside.As this device once a schedule is set online or offline,it can run that schedule reliably even without internet

🏆so once i completed making this device ,i left it in my home to run for a whole month unattended and everything worked perfectly by the time i came back,AND there is almost 0 latency for a command to control the AC on the webapp‼️

## How you would use it

Set a daily window, say 08:00 to 17:00 at 22°C, and the device switches the AC on and off by itself every day. Before you fly home, add a one-time event for your arrival (for example 3 Oct 2026, 06:00, 22°C, auto-off after 3 hours) so the room is already cool when you walk in. If you want to take over, press a button or use the dashboard to override, and press Resume schedule to hand control back.

## Images

| 3D model of the full assembly | Wiring diagram (breadboard rig) |
|---|---|
| <img width="409" height="491" alt="Screenshot 2026-10-17 231416" src="https://github.com/user-attachments/assets/ff1da060-e3ca-4efd-be24-44b04bd429a4" />
 | <img width="1265" height="931" alt="image" src="https://github.com/user-attachments/assets/d69f5c9a-fdd1-4227-9b1b-c053920c69d0" />
 |

## Features

- Daily schedule with start and end time, a 17 to 30°C target, and support for overnight windows that cross midnight.
- One-time dated event with its own target temperature and an optional auto-off from 0 to 24 hours. It survives a power cut: after a reboot the firmware checks the clock and resumes if the event window is still open.
- Learns your AC's own remote at raw timing level. It stores 16 commands (power on, power off, and 17 to 30°C) in flash, so they survive reboots.
- Works offline. A DS3231 clock keeps time, six buttons and an OLED handle setup, and the ESP32 also serves a local web page.
- Remote control through a React dashboard (built with Lovable) over TLS MQTT on HiveMQ Cloud.
- Emergency cooling: if the room reaches 35°C and no manual override is active, the AC turns on at 20°C and the buzzer sounds for 2 seconds.
- Over-the-air firmware updates through a second MQTT channel.

## Quick start

1. Install Arduino IDE 2.x, the ESP32 board package and the libraries listed under Software below.
2. Fill in your MQTT details (see Configuration), plug in the board, upload, and open the Serial Monitor at 115200 baud.
3. Join the Wi-Fi setup hotspot the device creates, then choose Menu > Register new AC and press each button on your AC remote when the OLED asks.

## Hardware

![Hardware overview](https://github.com/user-attachments/assets/45c80b98-5eeb-4d98-94ca-119e2d4be252)

| Part | Used for |
|---|---|
| ESP32 30-pin NodeMCU-style board (CH340) | Control, Wi-Fi, scheduling |
| DS3231 RTC | Keeps time without internet |
| Adafruit SHT40 | Room temperature and humidity |
| 0.96" SSD1306 OLED | Local menu and status |
| VS1838B IR receiver | Learns the original remote |
| IR LED with driver stage | Sends commands to the AC |
| 6 push buttons | Up, down, left, right, OK, back |
| Buzzer | Feedback and alarms |
| Custom PCB (EasyEDA Pro, made by JLCPCB) | Rev 1 board |
| 3D-printed enclosure | Housing |

The full parts list with links and prices is in `bom.csv`.

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

The firmware never blocks on delays. The main loop polls the buttons, web server, MQTT, IR capture, sensor and display in turn, so a dead Wi-Fi connection or an 8-second IR learning window doesn't freeze anything else.

Four things can control the AC, and they are checked in this order:

1. Emergency cooling (needs a valid SHT40 reading and no manual override)
2. The one-time event
3. The daily schedule
4. Manual control, which wins until you press Resume schedule

The same rule applies whether the command came from the buttons, the local page or the cloud.

The emergency logic uses hysteresis so it doesn't flap. It triggers at 35°C, clears below 24°C, must run for at least 1 hour, and can retrigger at most once every 60 seconds. A `DEMO_FAST_TIMERS` switch shortens the timers for exhibitions. This is a thermal-response feature, not a certified safety system.

For IR learning, the VS1838B captures raw mark and space timings in an 8-second window (buffer of 400 entries). Frames that arrive within 500 ms of the ESP32's own transmission are ignored so it doesn't learn its own reflection. Codes are saved to NVS immediately, and a test-fire lets you check each one. Settings are stored field by field with version numbers, not as raw structs, so compiler padding can't corrupt them between builds.

The React dashboard doesn't copy the scheduler logic. It sends a command, the ESP32 validates and clamps it, applies it, and publishes the new state back. The ESP32 stays the source of truth.

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

Wi-Fi credentials are not in the code. WiFiManager opens a hotspot for them, and if the device can't get online it carries on in offline mode.

### MQTT topics WEBAPP HANDLES ALL OF THIS, ONLY NEEDS YOUR OWN HIVEMQ CREDENTIALS‼️

| Topic | Purpose |
|---|---|
| `home/ac/manual_cmd` | `{"power": true}`, `{"temp": 22}`, `{"resume_schedule": true}` |
| `home/ac/schedule_set` | `{"sh":8,"sm":0,"eh":17,"em":0,"tgt":22,"en":true}` (partial updates are accepted) |
| `home/ac/event_set` | `{"en":true,"y":2026,"mo":10,"d":3,"h":6,"mi":0,"t":22,"off":3}` |
| `home/ac/status` | Published every 5 s: `{"temp":28.4,"hum":52.1,"acOn":true,"setTemp":22,"mode":"schedule"}` |

Modes reported are `emergency`, `manual`, `schedule` and `schedule_off`.

### Local HTTP routes

`/` (dashboard, refreshes every 1.5 s), `/status`, `/cmd?action=on|off`, `/settemp?c=22`, `/schedule?...`, `/event?...`, `/resume`.

## Repository layout

```
CAD/        STEP file of the full assembly and source design files
PCB/        EasyEDA project, schematic, Gerbers
firmware/   Arduino sketch
images/     Screenshots and photos used in this README
bom.csv     Bill of materials with links and prices (USD)
```

## What went wrong with the PCB

![PCB](https://github.com/user-attachments/assets/12512b9c-c309-4bf5-b71e-6542b701ef97)

The Rev 1 board was designed in EasyEDA Pro and made by JLCPCB. When it arrived I found that I had set the design rules too tight and trusted the autorouter around the 2.54 mm headers, which left a path between 3.3V and GND.

I found it with the power off and a multimeter in continuity mode, checking 3.3V against GND and following the short back to the layout. That showed the firmware was fine and the board wasn't. To keep testing, I rebuilt the same circuit on a breadboard and validated everything there: the OLED, clock, sensor, buttons, IR learning and sending, schedules, one-time events, emergency logic, local web control, MQTT and flash storage.

This issue is fixed in the latest Gerber file in `PCB/`. The Rev 2 plan: minimum clearance of 0.254 mm (10 mil), 4-spoke thermal relief on ground pours, hand-routed signals near the headers, and a Gerber and 3D inspection before ordering.

## Known limitations

- MQTT uses TLS, but the firmware calls `setInsecure()`, so the broker certificate is not verified.
- The OTA message carries a GitHub access token in its payload. This is fine for a prototype and wrong for a product. Scoped short-lived tokens, signed firmware and broker ACLs are the fix.
- The power-on self-test only checks parts that can answer back (OLED, DS3231, SHT40). The IR LED, receiver wiring and buzzer need a manual check.
- Credentials must be kept out of the repository before you publish a real deployment.

## Roadmap

Fabricate and test the Rev 2 PCB, certificate validation, signed OTA, multiple schedule windows, energy metering, and support for more than one AC.

## Credits

Built with the Arduino ESP32 core, IRremote by Armin Joachimsmeyer, Adafruit libraries and the SHT4x sensor, RTClib, WiFiManager by tzapu, PubSubClient, ArduinoJson, HiveMQ Cloud, Lovable, EasyEDA Pro and JLCPCB.

AI use: Claude helped with the firmware. Gemini helped with hardware debugging, wiring tips, part upgrades and the CAD model.

Made for Hack Club's Stardance.
