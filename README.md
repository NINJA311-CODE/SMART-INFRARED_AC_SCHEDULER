```markdown
# 🎉 SMART-INFRARED_AC_SCHEDULER

![Build](https://img.shields.io/badge/Build-ESP32%20%2B%20Arduino-informational)
![Platform](https://img.shields.io/badge/Platform-ESP32-blue)
![Cloud](https://img.shields.io/badge/Cloud-HiveMQ%20Cloud-purple)
![Tech](https://img.shields.io/badge/Tech-React%20%2B%20MQTT%20%2B%20C%2B%2B-61dafb)

> **Stardance Challenge Project** — turn a conventional IR-controlled air conditioner into a remotely manageable, schedule-aware, offline-resilient climate controller without replacing the AC indoor unit.

**Repository:** `SMART-INFRARED_AC_SCHEDULER`

---

## 📋 1. Project Overview

`SMART-INFRARED_AC_SCHEDULER` is an embedded + cloud system that adds scheduling, remote control, temperature awareness, IR command learning, persistence, and fail-safe automation to an ordinary IR air conditioner.

The design deliberately uses a **local-first control architecture**:

- The **DS3231 RTC** keeps time without internet access.
- The **ESP32** executes schedules and safety logic locally.
- Learned IR commands are stored in **NVS flash** and survive reboot/power loss.
- A **local device UI** and physical six-button interface remain usable without the cloud.
- When internet access is available, a **React dashboard built with Lovable** provides remote control through **TLS MQTT on HiveMQ Cloud**.
- A separate MQTT channel supports controlled **firmware OTA deployment**.

The project is especially useful for homes, rooms, offices, rental properties, and student accommodation where the AC is not natively "smart".

---

## ❓ 2. The Problem

A conventional split AC may have an IR remote but no native:

- internet connectivity,
- recurring schedule engine,
- vacation/arrival automation,
- remote status visibility,
- persistent configuration,
- temperature-triggered automation,
- or convenient control when the owner is away.

This creates a practical problem during **vacations and extended absences**.

Leaving the AC running continuously can waste energy, while turning it completely off means returning to a hot room. A network-only controller also creates a single point of failure: if Wi-Fi or the cloud goes down, a pure cloud automation system can stop operating.

### 💡 The Solution

This project inserts a small controller between the human and the existing AC:

```text
      EXISTING AC
          ▲
          │ 38 kHz IR
          │
  ┌───────────────────┐
  │       ESP32       │
  │                   │
  │ Scheduler         │
  │ IR Control        │
  │ Safety Logic      │
  │ NVS Persistence   │
  │ Local Web UI      │
  │ MQTT Client       │
  └───────┬───────────┘
          │
     ┌────┴─────┐
     │          │
 Local UI    Cloud UI
 Buttons     React/Lovable
     │          │
     │       TLS MQTT
     │          │
     └──────┬───┘
            │
       HiveMQ Cloud

```

---

# 🏖️ 3. Why It Matters During Vacation

> **Vacation use case:** schedule the AC to operate only when needed, remotely pre-cool the room before returning, and retain local automation even when the internet is temporarily unavailable.

### 🗓️ Example: Leaving Home for 3 Weeks

A user can configure:

```text
Daily Schedule
08:00 → 17:00
Target: 22°C
Enabled: YES

```

The device automatically manages the AC every day without requiring a phone.

Before returning home, the user can create a **one-time dated event**:

```text
03 Oct 2026
06:00
Target: 22°C
Auto-off: 3 hours

```

The controller can then switch the AC on at that exact date/time and shut it down automatically after the configured window.

### 🔌 What Happens If the Internet Disappears?

The vacation schedule does **not** depend on MQTT.

The DS3231 keeps time locally and the ESP32 continues running:

```text
Internet available      → Remote control + local automation
Internet unavailable    → Local automation continues
Wi-Fi unavailable       → Local automation continues
Power restored           → Saved schedule/event/IR codes reload
Reboot during event      → Active event can be resumed

```

This is a key architectural property of the project: **cloud connectivity is an enhancement, not the automation engine itself.**

---

# ✨ 4. Core Features

## ⏰ Intelligent Scheduling

* Daily start/end schedule.
* Target temperature from **17°C–30°C**.
* Enable/disable scheduling.
* Supports **overnight schedules** that cross midnight.
* Automatically turns the AC on at schedule start and off at schedule end.
* Applies a new scheduled setpoint while the AC is already running.

## 📅 One-Time Date/Time Events

A separate one-shot event engine supports:

* calendar date,
* hour/minute,
* target temperature,
* optional automatic shutoff,
* configurable auto-off duration from **0–24 hours**,
* arm/disarm state,
* fired-state persistence.

The event can be programmed from:

* the web interface,
* or the ESP32's physical buttons + OLED.

## 🎛️ Manual Override

Manual control is treated as a deliberate mode transition.

A manual command can:

* turn AC on,
* turn AC off,
* change target temperature,
* suspend the daily schedule.

The web dashboard exposes **Resume schedule** so control can be handed back to automation explicitly.

## 🚨 35°C Emergency Thermal Override

The SHT40 continuously provides room temperature feedback.

When:

```text
Room temperature >= 35°C

```

and the sensor is valid and there is no active manual override, the firmware:

1. activates emergency mode,
2. turns the AC on at **20°C**,
3. sounds a **2-second** alarm,
4. starts a mandatory minimum runtime,
5. allows retriggering no more frequently than once per **60 seconds** while the room remains critical.

The hysteresis / release point is:

```text
Trigger:  >= 35°C
Clear:    < 24°C
Minimum runtime: 1 hour in the real configuration

```

A fast demonstration timer is available in firmware for exhibition use.

> **Important:** this is an automation / thermal-response feature, not a certified life-safety system.

## 📡 Adaptive IR Learning

The controller can clone the real AC remote at the raw timing level.

Learned command slots:

```text
1 × Power ON
1 × Power OFF
14 × Temperature settings
   17°C ... 30°C
----------------------
16 total command slots

```

The registration wizard:

* guides the user on the OLED,
* provides paged instructions,
* listens for the remote,
* uses an asynchronous 8-second capture window,
* rejects overflow/invalid frames,
* stores successful captures immediately,
* offers **test-fire** of the newly captured command,
* supports retry/skip navigation,
* persists learned data to NVS.

Unlearned slots fall back to safe placeholder arrays, so skipping a registration step does not crash or corrupt the application.

## 🎮 Offline Remote

The physical interface remains functional without a phone.

```text
UP / DOWN   → change temperature
LEFT / RIGHT→ power ON
OK          → power OFF
BACK        → exit remote screen

```

## 💻 Local Web Dashboard

The ESP32 hosts an embedded local dashboard when Wi-Fi support is enabled.

The interface provides:

* room temperature,
* humidity,
* AC ON/OFF status,
* active setpoint,
* operating mode,
* daily schedule editing,
* one-time event editing,
* manual ON/OFF,
* preset temperature controls,
* resume schedule,
* live polling.

The local dashboard updates every **1.5 seconds**.

## 🌐 Remote React Dashboard

The cloud-facing dashboard is a separate React application built with Lovable.

It provides:

* responsive control UI,
* remote status synchronization,
* schedule management,
* one-time event management,
* partial payload merging,
* real-time state presentation,
* remote manual override,
* remote schedule resume.

The cloud UI communicates with the ESP32 through the MQTT layer rather than directly exposing the controller's local HTTP server.

## ☁️ MQTT Communication

Primary control transport:

```text
ESP32 ↔ TLS MQTT ↔ HiveMQ Cloud ↔ React/Lovable dashboard

```

Topics used by the firmware:

```text
home/ac/manual_cmd
home/ac/schedule_set
home/ac/event_set
home/ac/status

```

The ESP32 publishes status every **5 seconds** while connected.

## ⏱️ NTP + RTC Time Management

When Wi-Fi is available:

* system time is synchronized from NTP,
* the DS3231 RTC is updated.

When Wi-Fi is unavailable:

* the DS3231 continues to keep time using its backup cell,
* schedule and one-time event execution continue locally.

## 💾 Power-Loss Persistence

The firmware uses ESP32 NVS via `Preferences`.

Persisted state includes:

* daily schedule,
* one-time event configuration and fired/off-fired state,
* all learned IR command slots,
* Wi-Fi configuration request state.

The serialization format is explicitly versioned / field-based rather than dumping raw C++ structs into flash.

That design avoids compiler-padding-related corruption and makes the stored format more stable across firmware builds.

## 🔍 Power-On Self-Test

At boot, software-checkable hardware is verified:

* OLED
* DS3231
* SHT40

The firmware also provides audible boot feedback.

The code deliberately does **not** pretend it can electrically diagnose components that have no feedback path to the ESP32. IR output, IR receiver wiring, and buzzer operation still require manual confirmation.

## 🔄 Firmware OTA

The firmware contains a separate OTA deployment channel using:

```text
MQTT deployment broker
        ↓
GitHub Release Asset
        ↓
HTTPS download
        ↓
ESP32 Update.writeStream()
        ↓
Reboot

```

The OTA path supports a dry-run payload mode before actually writing flash.

---

# 🏗️️ 5. System Architecture

```text
                             INTERNET
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
        Lovable React App                HiveMQ OTA Broker
                 │                             │
         TLS MQTT Control                 TLS MQTT
                 │                             │
                 ▼                             ▼
        ┌───────────────────────────────────────────────┐
        │                  ESP32                        │
        │                                               │
        │  ┌──────────────┐   ┌──────────────────────┐  │
        │  │ State Engine │   │ MQTT / Web Services │  │
        │  │              │   │                      │  │
        │  │ Schedule     │   │ Local HTTP UI       │  │
        │  │ One-shot     │   │ Cloud MQTT          │  │
        │  │ Manual       │   │ OTA Client          │  │
        │  │ Emergency    │   │                      │  │
        │  └──────┬───────┘   └───────────┬──────────┘  │
        │         │                       │             │
        │         │                       │             │
        │  ┌──────▼───────────────────────▼──────────┐  │
        │  │                Hardware I/O              │  │
        │  │                                           │  │
        │  │ DS3231 RTC        SHT40 sensor            │  │
        │  │ SSD1306 OLED      6 buttons               │  │
        │  │ VS1838B RX        IR TX driver            │  │
        │  │ Buzzer                                    │  │
        │  └──────────────────────┬────────────────────┘  │
        └─────────────────────────┼───────────────────────┘
                                  │
                              38 kHz IR
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Existing AC     │
                         │ Indoor Unit     │
                         └─────────────────┘

```

---

# ⚙️ 6. Control-Plane Behavior

The firmware uses explicit state flags instead of blocking delay-driven scheduling.

### 🎯 Operational Priorities

```text
1. Emergency thermal logic
2. One-time dated event
3. Daily schedule
4. Manual mode as an explicit override gate

```

More precisely:

* Emergency logic only acts on a valid SHT40 reading and is skipped while `manualOverride` is active.
* When a one-time event fires, it takes control and holds it until its configured completion/auto-off.
* The daily schedule runs only when emergency mode and manual override are inactive.
* A manual command from the device or web UI sets `manualOverride = true`.
* **Resume schedule** clears that override.

This creates one consistent rule across local buttons, local web control, and cloud control:

> **Manual control wins until the user explicitly returns authority to the scheduler.**

---

# 🔌 7. Hardware Architecture

### 🧠 Main Controller

**ESP32 30-pin NodeMCU-style CH340 board**

### 🧩 Connected Hardware

| Subsystem | Device | Purpose |
| --- | --- | --- |
| MCU | ESP32 30-pin | Control, networking, scheduling |
| RTC | DS3231 | Timekeeping without internet |
| Temperature/Humidity | Adafruit SHT40 | Ambient climate sensing |
| Display | 0.96" SSD1306 OLED | Local UI/status |
| IR Receiver | VS1838B | Learns original AC remote signals |
| IR Transmitter | IR LED + driver stage | Replays AC commands |
| User Input | 6 navigation buttons | Fully local configuration |
| Audio | Buzzer | Feedback, alarms, status |
| PCB | EasyEDA Pro design | Custom electronics integration |
| Enclosure | Custom CAD / 3D print | Physical device packaging |
| PCB Fabrication | JLCPCB | Rev 1 board fabrication |

---

# 📌 8. ESP32 Pinout

| ESP32 GPIO | Connection | Function |
| --- | --- | --- |
| 21 | I2C SDA | DS3231 / SHT40 / SSD1306 |
| 22 | I2C SCL | DS3231 / SHT40 / SSD1306 |
| 4 | IR transmitter | 38 kHz IR send |
| 15 | VS1838B OUT | IR receive / learning |
| 18 | Buzzer | Audible feedback |
| 13 | UP button | Menu navigation |
| 12 | DOWN button | Menu navigation |
| 14 | LEFT button | Menu navigation |
| 27 | RIGHT button | Menu navigation |
| 26 | OK button | Select/save |
| 25 | BACK button | Back/exit |
| 32 | Red LED | Status indicator |
| 33 | Yellow LED | Status indicator |
| 19 | Green LED | Status indicator |
| 17 | Blue LED | Status indicator |
| 16 | Orange LED | Status indicator |
| 2 | White LED | Status indicator |

> The OLED, DS3231, and SHT40 share the I2C bus.

---

# 🛠️ 9. Firmware Build Configuration

The firmware exposes compile-time switches:

```cpp
// #define DECODE_MODE
#define ENABLE_WIFI
#define ENABLE_OTA

```

### 🟢 Normal Scheduler Build

```cpp
#define ENABLE_WIFI
#define ENABLE_OTA

```

### 🔌 Pure Offline Build

Comment out:

```cpp
#define ENABLE_WIFI

```

The scheduler, RTC, physical UI, sensor logic, IR learning, and safety behavior continue to work without internet access.

### 🔍 IR Diagnostic / Sniffer Mode

Uncomment:

```cpp
#define DECODE_MODE

```

This builds the firmware as a dedicated raw IR sniffer using IRremote and the VS1838B.

The sniffer prints the decoded signal and a C-array representation to Serial.

---

# 📦 10. Software Dependencies

Install the following Arduino libraries:

| Library | Role |
| --- | --- |
| **RTClib** | DS3231 RTC |
| **Adafruit GFX Library** | Graphics primitives |
| **Adafruit SSD1306** | OLED |
| **Adafruit Unified Sensor** | Sensor abstraction |
| **Adafruit SHT4x Library** | SHT40 |
| **IRremote v4.x** | Raw IR receive/transmit |
| **WiFiManager** | Wi-Fi provisioning portal |
| **PubSubClient** | MQTT |
| **ArduinoJson** | MQTT JSON encoding/decoding |

These are additionally supplied by the ESP32 Arduino environment where applicable:

```text
WiFi.h
WebServer.h
time.h
Preferences.h
WiFiClientSecure.h
HTTPClient.h
Update.h
Wire.h

```

---

# 🚀 11. Step-by-Step Installation & Flashing

## 🔧 Step 1 — Install the Toolchain

Recommended:

* Arduino IDE 2.x
* ESP32 Arduino board package
* USB driver appropriate for the CH340 board

Select an ESP32 board matching the 30-pin NodeMCU-style hardware.

## 📚 Step 2 — Install Libraries

Install every library in the dependency table above through Arduino IDE's Library Manager.

IRremote should be a **4.x** release.

## 🔑 Step 3 — Configure Project Credentials

Before publishing or flashing a production device, move broker credentials and deployment secrets out of the source code.

Configure the primary MQTT connection:

```cpp
#define MQTT_HOST        "<HIVEMQ_HOST>"
#define MQTT_PORT        8883
#define MQTT_USER        "<MQTT_USERNAME>"
#define MQTT_PASS        "<MQTT_PASSWORD>"
#define MQTT_CLIENT_ID   "esp32-ac-scheduler-01"

```

For OTA, configure the deployment broker separately:

```cpp
#define OTA_MQTT_HOST    "<OTA_HIVEMQ_HOST>"
#define OTA_MQTT_PORT    8883
#define OTA_MQTT_USER    "<OTA_USERNAME>"
#define OTA_MQTT_PASS    "<OTA_PASSWORD>"
#define OTA_MQTT_TOPIC   "fleet/firmware/update"

```

## ⚡ Step 4 — First Flash

1. Connect the ESP32 by USB.
2. Select the correct COM port.
3. Upload the firmware.
4. Open Serial Monitor at:

```text
115200 baud

```

The boot sequence performs:

```text
OLED initialization
        ↓
DS3231 validation
        ↓
SHT40 validation + real reading
        ↓
IR interfaces initialized
        ↓
Saved schedule/event/IR codes loaded
        ↓
Wi-Fi provisioning (when enabled)
        ↓
Web server + MQTT services

```

## 📶 Step 5 — Configure Wi-Fi

The firmware uses WiFiManager instead of requiring Wi-Fi credentials to be compiled into the application.

A configuration hotspot is available using the configured AP name.

Normal portal behavior is intentionally short for unattended boots; the on-device **Configure WiFi?** menu action provides a longer interactive provisioning window.

When the device cannot obtain Wi-Fi, it can continue in offline mode.

---

# 📡 12. First-Time IR Registration

After boot:

```text
MENU
 └── Register new AC

```

The registration sequence captures:

```text
1. Power ON
2. Power OFF
3. 17°C
4. 18°C
5. 19°C
...
16. 30°C

```

For each step:

```text
ESP32 → "Press OK"
       ↓
VS1838B listens
       ↓
User presses the exact AC remote button
       ↓
Raw mark/space timing captured
       ↓
Code written to NVS immediately
       ↓
Optional test-fire

```

The capture window is:

```text
8 seconds

```

The raw buffer is sized for long indoor-unit frames:

```text
RAW_BUFFER_LENGTH = 400

```

A received code is stored in compact tick-based form and reconstructed to microsecond timings before transmission.

---

# 🌐 13. Remote / MQTT Integration

## 📤 Primary Command Topics

### 🎛️ Manual Control

Topic:

```text
home/ac/manual_cmd

```

Examples:

```json
{"power": true}

```

```json
{"power": false}

```

```json
{"temp": 22}

```

Resume automatic scheduling:

```json
{"resume_schedule": true}

```

### ⏰ Daily Schedule

Topic:

```text
home/ac/schedule_set

```

Example:

```json
{
  "sh": 8,
  "sm": 0,
  "eh": 17,
  "em": 0,
  "tgt": 22,
  "en": true
}

```

The firmware accepts **partial fields** and updates only the supplied schedule attributes before persisting the resulting configuration.

### 📅 One-Time Event

Topic:

```text
home/ac/event_set

```

Example:

```json
{
  "en": true,
  "y": 2026,
  "mo": 10,
  "d": 3,
  "h": 6,
  "mi": 0,
  "t": 22,
  "off": 3
}

```

This means:

```text
03 Oct 2026
06:00
22°C
Auto-off after 3 hours
Armed

```

## 📊 Device Status

Topic:

```text
home/ac/status

```

Representative payload:

```json
{
  "temp": 28.4,
  "hum": 52.1,
  "acOn": true,
  "setTemp": 22,
  "mode": "schedule"
}

```

Possible firmware modes include:

```text
emergency
manual
schedule
schedule_off

```

The device publishes fresh status every:

```text
5 seconds

```

---

# 🔗 14. Local HTTP API

The firmware also exposes a lightweight local HTTP control surface.

| Route | Function |
| --- | --- |
| `/` | Local dashboard |
| `/status` | JSON status |
| `/cmd?action=on` | Manual ON |
| `/cmd?action=off` | Manual OFF |
| `/settemp?c=22` | Manual target temperature |
| `/schedule?...` | Save daily schedule |
| `/event?...` | Save one-time event |
| `/resume` | Return authority to scheduler |

This local path intentionally operates alongside MQTT.

That means the system has two independent control interfaces:

```text
Local network / device AP
            +
Internet / MQTT cloud

```

---

# 🔄 15. Dashboard State Model

The user-facing React/Lovable application should treat device updates as **state synchronization**, not as a replacement for the firmware state machine.

Recommended model:

```text
Cloud UI command
      ↓
MQTT topic
      ↓
ESP32 validates + clamps fields
      ↓
Local state changes
      ↓
NVS persistence when required
      ↓
MQTT status publication
      ↓
React dashboard merges new state

```

The dashboard therefore remains responsive without needing the cloud application to reproduce the embedded scheduler's timing logic.

> **The ESP32 is the source of truth for physical AC state and automation execution.**

---

# 🏖️ 16. Vacation Automation Patterns

## 🏢 A. Daily Occupancy Window

```text
08:00 → AC ON at 22°C
17:00 → AC OFF

```

Good for a recurring period when people are normally present.

## ❄️ B. Pre-Arrival Cooling

```text
Vacation
   ↓
One-time event
   ↓
Arrival day + time
   ↓
AC ON
   ↓
Configured temperature
   ↓
Auto-OFF after N hours

```

This avoids manually starting the AC after returning to a hot room.

## 🔋 C. Extended Unattended Operation

```text
DS3231
  ↓
Local daily schedule
  ↓
ESP32 scheduler
  ↓
IR transmit
  ↓
Existing AC

MQTT availability is optional.

```

A temporary cloud outage does not erase the schedule.

## 🚨 D. Hot-Room Emergency Response

If the sensor reports a critical ambient temperature:

```text
>= 35°C
   ↓
Emergency ON
   ↓
20°C target
   ↓
2-second alarm
   ↓
Minimum runtime lock

```

The lockout prevents the system from rapidly cycling when temperature fluctuates around a threshold.

---

# ⏱️ 17. Non-Blocking Firmware Architecture

A major firmware goal is to keep scheduling, UI, networking, and IR learning alive together.

The main loop conceptually runs:

```cpp
server.handleClient();    // local web
serviceMQTT();            // primary + OTA MQTT

now = rtc.now();

scanButtons();
handleButtons();

serviceIRCapture();       // asynchronous 8 s IR learning
readSensors();

checkEmergency();         // priority 1
checkOneTimeEvent(now);   // priority 2
checkSchedule(now);       // priority 3

updateDemoIndicators();
updateDisplay(now);
serviceBuzzer();

```

The IR registration window is explicitly polled rather than blocking the application for eight seconds.

Similarly, MQTT retries are timer-gated so a temporary network failure does not prevent normal embedded control from running.

### ⏲️ Timing Characteristics

```text
SHT40 sample interval:       2 s
OLED update interval:       250 ms
MQTT status interval:       5 s
Primary MQTT retry:          5 s
Wi-Fi retry:                10 s
OTA broker retry:           60 s
IR learning window:          8 s
Emergency retrigger:        60 s

```

The raw IR playback itself is delegated to IRremote at:

```text
38 kHz carrier

```

with captured mark/space timings reconstructed before transmission.

---

# 🛠️ 18. Hardware Engineering & V1 Post-Mortem

This project deliberately documents the Rev 1 failure instead of hiding it.

> **The PCB failure was not the end of the project; it became part of the engineering validation cycle.**

## ⚠️ V1 PCB

The first PCB revision was designed in **EasyEDA Pro** and fabricated through **JLCPCB**.

During physical validation, the combination of aggressive DRC clearance settings and autorouted traces produced problematic geometry around the 2.54 mm header interfaces.

Observed issues included:

* copper-pour overlap / near-overlap,
* extremely thin soldermask slivers,
* insufficient isolation between ground copper and header annular-ring areas,
* practical 3.3V-to-GND shorting paths.

The board could not be treated as a trustworthy demonstration platform in that state.

## 🔍 Debugging & Isolation

The fault was isolated systematically rather than by replacing components at random.

The validation method was:

```text
Power removed
    ↓
Multimeter continuity mode
    ↓
3.3V ↔ GND checks
    ↓
Trace / copper-pour isolation
    ↓
Identify unintended conductive path

```

This narrowed the problem to the PCB layout itself rather than the logical firmware design.

## 🧪 Functional Prototype Validation

To preserve full functional validation for the Stardance demonstration, the same control circuit was reconstructed and verified on a **breadboard prototype rig**.

This allowed the team to validate:

* ESP32 firmware,
* DS3231 timekeeping,
* SHT40 sensing,
* OLED UI,
* six-button navigation,
* IR receive/learning,
* IR transmission,
* scheduler logic,
* one-time events,
* emergency behavior,
* local web control,
* MQTT control,
* persistent storage.

This was an important engineering decision:

> **Separate firmware/system validation from PCB manufacturing readiness.**

The failed PCB therefore did not invalidate the architecture or software behavior.

## 📐 V2 Revision Plan

Rev 2 changes are explicitly targeted at manufacturability and electrical robustness.

### 1. DRC clearance

Increase minimum clearance to:

```text
≥ 0.254 mm
= 10 mil

```

This replaces the overly aggressive under-clearance assumptions used in Rev 1.

### 2. Thermal relief

Reconfigure ground pours to use **4-spoke thermal relief** connections.

Benefits:

* cleaner soldering,
* more predictable pad-to-plane isolation,
* reduced thermal sinking at hand-soldered headers.

### 3. Manual routing

Critical signals will be routed manually rather than relying on autorouter decisions around header pitch.

Routing policy:

```text
Header gap
   ↓
Keep copper away from the pin-to-pin escape area
   ↓
Maintain explicit clearance
   ↓
Prefer short, deterministic signal paths

```

### 4. Manufacturing validation gate

Before ordering Rev 2:

```text
ERC / DRC
   ↓
3D inspection
   ↓
Gerber review
   ↓
Header annular-ring inspection
   ↓
Ground-pour inspection
   ↓
3.3V/GND isolation review
   ↓
Fabrication

```

---

# 🔒 19. Security & Production Hardening

The project uses encrypted MQTT transport on port `8883` and separate broker credentials for control and OTA.

However, the current firmware intentionally uses:

```cpp
WiFiClientSecure::setInsecure()

```

Therefore:

> **MQTT traffic is transported over TLS, but the current implementation does not perform certificate-chain validation / pinning.**

For a hackathon prototype this keeps deployment simple; for production, broker certificate validation should be enabled.

## 🛡️ OTA Hardening

The OTA implementation uses a second MQTT broker and downloads firmware from a GitHub-hosted asset over HTTPS.

The current architecture also passes a GitHub access token in the OTA message payload.

For production deployment, recommended hardening is:

```text
Per-device authorization
      +
Scoped release credentials
      +
Short-lived tokens
      +
Signed firmware / signature verification
      +
Broker ACLs
      +
Certificate validation
      +
Audit logging

---

# 📝 20. Known Validation Notes

The firmware contains several deliberate engineering safeguards:

### Sensor validity gate

Emergency logic refuses to act on an invalid or stale SHT40 reading.

### Emergency hysteresis

The trigger is **35°C**, while clearing requires the room to fall below **24°C**, preventing rapid toggling.

### Emergency minimum runtime

The real configuration enforces a **1-hour minimum runtime** after an emergency start.

For exhibitions, `DEMO_FAST_TIMERS` can substitute a short demonstration interval.

### Self-echo protection

During IR learning, frames arriving within **500 ms** of an ESP32 transmission are ignored to reduce the chance of learning the controller's own reflected IR blast.

### NVS corruption resistance

Learned IR records and automation settings use explicit byte layouts and version fields rather than compiler-dependent raw struct serialization.

### Reboot recovery

If power is lost while a one-time event is active, the firmware checks the RTC after reboot and can resume cooling if the event window is still active.

---

# 🧹 21. Important Pre-Release Cleanup

Before calling this a production-ready release, perform these final checks.

| Item | Action |
| --- | --- |
| Emergency UI text | Firmware and dashboard use the **35°C** emergency threshold. |
| Credentials | Move all passwords/tokens out of source control. |
| TLS | Replace `setInsecure()` with certificate validation. |
| OTA auth | Replace payload-carried long-lived PATs with scoped/short-lived authorization. |
| V2 PCB | Run full DRC/ERC and inspect Gerbers before fabrication. |
| IR table | Complete registration for the target AC or ship the learned NVS dataset as a controlled deployment artifact. |
| Demo timer | Ensure `DEMO_FAST_TIMERS` is disabled for the real-world configuration. |

---

# 📂 22. Suggested Repository Structure

```text
SMART-INFRARED_AC_SCHEDULER/
│
├── firmware/
│   ├── SMART-IR-SCHEDULER.ino
│   ├── config.example.h
│   └── README.md
│
├── web/
│   ├── React / Lovable application
│   └── README.md
│
├── hardware/
│   ├── schematic/
│   ├── pcb/
│   ├── gerbers/
│   └── enclosure/
│
├── docs/
│   ├── architecture/
│   ├── wiring/
│   └── demo/
│
├── .gitignore
└── README.md

```

---

# 🎥 23. Demonstration

## 🌐 Live Web Dashboard

**Web Application URL:** [esp32ac.lovable.app](https://www.google.com/search?q=https://esp32ac.lovable.app)

> *Note: Connecting the web dashboard to your ESP32 requires configuring your HiveMQ MQTT broker details within the application settings.*

## 🎬 Video

**Submission Video:** `https://youtu.be/KKiCB_PlKlA`

### 📋 Demonstration Sequence

1. Power-on self-test
2. OLED dashboard status display
3. Live temperature/humidity telemetry
4. Remote IR registration wizard
5. IR signal transmission to target AC
6. Daily schedule automation execution
7. One-time pre-cooling arrival event
8. Manual override execution
9. Schedule resumption ("Resume Schedule")
10. 35°C emergency thermal response
11. Offline resiliency test (Wi-Fi disconnect)
12. NVS persistence check across reboot
13. Remote React dashboard control over TLS MQTT
14. Hardware iteration overview & Rev 1 PCB post-mortem

---

# 🧠 24. Engineering Summary

This project is intentionally not just an "ESP32 IR blaster".

It combines:

```text
Embedded firmware
        +
Real-time state management
        +
IR protocol acquisition/replay
        +
Persistent configuration
        +
RTC-backed scheduling
        +
Environmental sensing
        +
Safety-oriented automation
        +
Offline-first architecture
        +
Local HTTP control
        +
Cloud MQTT control
        +
React dashboard
        +
OTA deployment
        +
Custom PCB
        +
Custom enclosure

```

The central design principle is:

> **Keep the automation local. Use the cloud for reach, not for survival.**

That principle is what allows the same device to remain useful during an ordinary Wi-Fi outage, a cloud interruption, or an extended vacation.

---

# 🗺️️ 25. Roadmap

### Rev 2 Hardware

* Correct DRC clearance rules (`≥ 10 mil`).
* 4-spoke thermal-relief ground pours.
* Manual routing around 2.54 mm headers.
* Pre-fabrication Gerber inspection.
* Production-ready enclosure/PCB integration.

### Firmware Hardening

* Certificate validation for MQTT/TLS.
* Stronger per-device authorization.
* Signed firmware verification.
* Cleaner secret management.
* Expanded event validation.

### Product Expansion

* Multiple daily schedule windows.
* Energy metering for measured savings instead of inferred savings.
* Room occupancy sensing.
* Remote notifications.
* Multi-AC device support.
* Fleet management.
* More AC protocol templates.

---

# 26. Acknowledgments

Built using and inspired by:

* **Espressif / ESP32**
* **Arduino**
* **IRremote** by Armin Joachimsmeyer
* **Adafruit** libraries and SHT4x hardware
* **RTClib**
* **WiFiManager** by tzapu
* **PubSubClient**
* **ArduinoJson**
* **HiveMQ Cloud**
* **Lovable**
* **EasyEDA Pro**
* **JLCPCB**

---

## 📌 Final Statement

`SMART-INFRARED_AC_SCHEDULER` demonstrates how an ordinary IR-controlled AC can be upgraded into a resilient automation system without replacing the appliance itself.

The project combines real embedded constraints, cloud connectivity, physical UI, persistent state, environmental feedback, safety-oriented behavior, and iterative PCB engineering into one deployable architecture.

**A smart AC does not have to start with a smart AC.**

```

```
