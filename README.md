## 📱📡Smart Infrared AC Scheduler

<img width="1152" height="864" alt="image" src="https://github.com/user-attachments/assets/9fe1655c-b94f-45e5-96f0-592623fc27ec" />

An ESP32 box that adds schedules, remote control and a temperature safety net to an infrared AC and continues to run even when the internet goes down.

**Live dashboard:** https://esp32ac.lovable.app

(To connect it to your ESP32 enter your HiveMQ broker details in the dashboard settings.)

**Demo video:**
https://youtu.be/KKiCB_PlKlA?si=UUE7-kHRNs0rGYna

## Why I made it

So I wanted to find a solution for people who go on vacations during summer months. The problem was two choices: either leave the AC running all the time, which creates a huge electricity bill or leave it off so the room becomes a hot oven and damages items inside.

To solve this I needed to make a device that could turn the AC on automatically when the room becomes hot. That could let me monitor the room set schedules and control the AC from another country using Wi‑Fi.

Smart plugs and controllers do not fully solve the problem because if Wi‑Fi or the cloud service drops the automation stops. In this case the ESP32 runs everything itself. The cloud is only used to reach the device from outside. Once a schedule is set online or offline this device can run the schedule reliably without internet.

🏆 After I finished making this device I left it in my home to run for a month unattended. Everything worked perfectly when I returned and there is zero latency for a command to control the AC on the web app.

## How you would use it

Say you want the AC to run from 08:00 to 17:00 at 22 °C. Set that once. It will happen every day. Before you fly home you can add a one‑time event for your arrival (3 Oct 2026 06:00 22 °C again after 3 hours) so the room is already cool when you walk in. To take over use a button or the dashboard press Resume schedule when you are finished.

## Images

## 3D CAD MODEL

<img width="409" height="491" alt="Screenshot 2026-10-17 231416" src="https://github.com/user-attachments/assets/d6b0e568-2fd9-48e5-bd96-1dd98d8f15f1" />

## SCHEMATIC WIRING DIAGRAM (PCB VERSION HASN'T BEEN TESTED,BREADBOARD VERSION)

<img width="1223" height="925" alt="image" src="https://github.com/user-attachments/assets/f9454a69-95fe-4908-bf22-2bdcd83570ac" />

## Features

- A daily on/off schedule with a target temperature between 17 °C and 30 °C. Windows that cross midnight work well.

- A one‑time event for a specific date with its own temperature setting and an optional auto‑off timer that can last up to 24 hours. If power is lost the ESP32 checks the clock after rebooting. Resumes the event if it is still running.

- You teach this device your own AC remote by pressing each button. It stores 16 commands (on, off and temperatures from 17 °C to 30 °C) in flash memory.

- Everything works without internet. The DS3231 keeps the time the OLED display and six buttons are enough to set up the device. The ESP32 also hosts a small local web page.

- From else you use the dashboard that I built with Lovable. The dashboard talks to the board over MQTT using HiveMQ Cloud with TLS.

- If the room reaches 35 °C and nobody has taken control this device turns the AC on at 20 °C and the buzzer beeps for 2 seconds.

- Firmware updates can be sent over a second MQTT channel.

## Quick start

1. Create two clusters on HiveMQ Cloud. One cluster is for the MQTT connection (the device and the dashboard) and the other cluster is for OTA firmware updates. Create credentials, for each cluster.

2. Install Arduino IDE 2.x the ESP32 board package and the libraries listed under Software below.

3. Put both sets of HiveMQ details into the configuration file (see Configuration) upload the firmware. Open the Serial Monitor at 115200 baud.

4. Connect to the Wi‑Fi hotspot that the device creates. Then go to Menu > Register AC and press each button on your AC remote when the OLED display asks.

## Hardware

![Hardware overview](https://github.com/user-attachments/assets/45c80b98-5eeb-4d98-94ca-119e2d4be252)

| Part | Used for

|---|---|

| |

| ESP32 30‑pin NodeMCU‑style board (CH340) | Control, Wi‑Fi scheduling |

| DS3231 RTC | Keeps time without internet |

| SHT40 sensor module | Room temperature and humidity |

| 0.96" SSD1306 OLED | Local menu and status |

| VS1838B IR receiver | Learns the remote |

| IR LED with driver stage | Sends commands to the AC |

| 6 push buttons Up down left, right, OK back |

| Buzzer | Feedback and alarms |

USB to 2‑wire cable (PCB version only) | Power |

| Custom PCB (EasyEDA Pro, made by JLCPCB) | Rev 1 board |

3D‑printed enclosure | Housing |

Parts lists with links and prices in USD: `BREADBOARD‑BOM.csv` for the breadboard version and `bom_pcb.csv` for the PCB version.

## ‼️THERE IS ONE BREADBOARD AND ONE PCB VERSION OF THIS PROJECT‼️

The PCB version also needs a USB to 2‑wire cable to power it.

My prototype used a 2N2222 and an S8050 in the Darlington pair. This BOM and diagram show two SS8050s, which should handle the LED current comfortably but I haven’t tested that exact pair.

Pinout:

GPIO | Function |

|---|---|

| 21 / 22 | I2C SDA / SCL (DS3231, SHT40 OLED share the bus) |

| 4 IR transmitter |

| 15 | VS1838B output |

| 18 | Buzzer |

| 13 12 14 27 Up Down Left Right |

| 26 25 | OK, |

## How it works

Mostly it runs as a single large loop. The loop reads the buttons the web server, the MQTT client, the IR receiver, the sensor and the display one after another. The loop never pauses in a delay. That is why a lost Wi‑Fi connection or the eight‑second IR learning window will not stop the rest of the system.

The tricky part was deciding who has the say when several tasks want the AC at the same time. I chose emergency cooling but only if the SHT40 sensor gives a valid reading. Then comes the one‑time event, followed by the schedule. Manual control wins over all of them even emergency cooling and stays in control until the Resume schedule button is pressed. A button press, the local page and the cloud all follow the rules.

Emergency cooling begins when the temperature reaches 35 °C and stops when the room drops below 24 °C. It runs for least one hour and waits sixty seconds before it can start again so it does not toggle on and off near the threshold. I call this a convenience feature, not a certified safety system.

For learning a remote the VS1838B stores the timings of the signal for up to eight seconds (a buffer of 400 entries). Any code that appears within five hundred milliseconds of the ESP32 sending its signal is ignored otherwise the ESP32 would learn its own reflection. Each code is written to flash (NVS) immediately. You can test‑fire it to verify. Settings are stored one field at a time with version numbers of as raw structs so compiler padding cannot corrupt them between builds.

The dashboard has no scheduling logic of its own. It sends a command the ESP32 checks the command clamps the values applies the change and sends the state back. Therefore what you see on the dashboard is what the board is actually doing.

## Run it locally

### Software

You need Arduino IDE 2.x with the ESP32 board package and a CH340 driver. Install these libraries from the Library Manager: RTClib, Adafruit GFX Library, Adafruit SSD1306, Adafruit Unified Sensor, Adafruit SHT4x Library, IRremote (4.x, WiFiManager, PubSubClient, ArduinoJson.

### Build options

```cpp

// #define DECODE_MODE   // uncomment for an IR sniffer build

#define ENABLE_WIFI      // comment out for a fully offline build

#define ENABLE_OTA

```

An offline build keeps the scheduler, the clock, the buttons IR learning and emergency logic. `DECODE_MODE` turns the firmware into a sniffer that prints decoded signals and a C array to Serial.

### Configuration

You need two HiveMQ Cloud clusters, for this project. The `MQTT_*` values come from the cluster and the `OTA_MQTT_*` values come from the second cluster.

```cpp

#define MQTT_HOST       "<HIVEMQ_HOST>"

#define MQTT_PORT       8883

```

#define MQTT_USER       "<MQTT_USERNAME>"

#define MQTT_PASS       "<MQTT_PASSWORD>"

#define MQTT_CLIENT_ID  "esp32-ac-

#define OTA_MQTT_HOST   "<OTA_HIVEMQ_HOST>"

#define OTA_MQTT_PORT   8883

#define OTA_MQTT_USER   "<OTA_USERNAME>"

#define OTA_MQTT_PASS   "<OTA_PASSWORD>"

#define OTA_MQTT_TOPIC  "fleet/firmware/update"

```

The Wi‑Fi credentials are not stored in the code. WiFiManager creates a hotspot where you can type them in and if the device cannot connect to the internet it will simply keep working offline.

### MQTT topics

The web application handles all of this. You only need your own HiveMQ credentials‼️

Topic | Purpose |

|---|---|

| `home/ac/manual_cmd` | `{"power": true}` `{"temp": 22}` `{"resume_schedule": true}` |

| `home/ac/schedule_set` | `{"sh":8,"sm":0,"eh":17,"em":0,"tgt":22,"en":true}` (partial updates are accepted) |

| `home/ac/event_set` | `{"en":true,"y":2026,"mo":10,"d":3,"h":6,"mi":0,"t":22,"off":3}` |

| `home/ac/status` | Published every 5 s: `{"temp":28.4,"hum":52.1,"acOn":true,"setTemp":22,"mode":"schedule"}` |

The reported modes are `emergency` `manual` `schedule` and `schedule_off`.

### Local HTTP routes

`/` (the dashboard refreshes every 1.5 s) `/status` `/cmd?action=on|off` `/settemp?c=22` `/schedule?...`, `/event?...` `/resume`.

## What went wrong with the PCB

![PCB](https://github.com/user-attachments/assets/12512b9c-c309-4bf5-b71e-6542b701ef97)

I designed the Rev 1 board using EasyEDA Pro. Had JLCPCB manufacture it. The board arrived with a short between 3.3 V and GND. I had set the design rules tight and allowed the autorouter to work on the area near the 2.54 mm headers.

I discovered the short while the power was off and the multimeter was set to continuity mode. I checked 3.3 V against GND. Traced the short back to the layout. The firmware worked fine; the board did not. Therefore I rebuilt the circuit on a breadboard and tested everything there: OLED, clock, sensor, buttons IR learning and sending schedules, one‑time events, emergency cooling, local web control, MQTT and flash storage.

The recent Gerber file in the `PCB/` folder contains this fix. For Rev 2 I use a clearance of 0.254 mm (10 mil) a 4‑spoke thermal relief on the ground pours and hand‑route signals near the headers. I also review the Gerbers and the 3D view before placing an order.

## Known issues

MQTT uses TLS. The firmware calls `setInsecure()`. Consequently the broker certificate is not verified. The OTA message includes a GitHub access token in its payload. This is acceptable for a prototype but not suitable for production. The power‑on self‑test can only verify components that respond (OLED DS3231, SHT40). Therefore the IR LED, receiver wiring and buzzer must be checked manually. Keep your credentials out of the repository.

Next I plan to test the Rev 2 board add certificate verification signed OTA updates, multiple schedule windows, energy metering and support for than one AC unit.

## Credits

Built using the Arduino ESP32 core, IRremote by Armin Joachimsmeyer, Adafruit libraries, the SHT4x sensor, RTClib, WiFiManager, by tzapu, PubSubClient, ArduinoJson, HiveMQ Cloud, Lovable, EasyEDA Pro and JLCPCB.

AI assistance: Claude assisted with the firmware. Gemini provided help with hardware debugging, wiring advice and the CAD model.

Made for Hack Clubs Stardance.