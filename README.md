# Smart Infrared AC Scheduler

An ESP32 controller that gives an ordinary infrared air conditioner schedules, remote control and temperature-based protection, and keeps working when the internet goes down.


**Live dashboard:** https://esp32ac.lovable.app
(To connect it to your own ESP32, enter your HiveMQ broker details in the dashboard settings.)

**Demo video:** https://youtu.be/KKiCB_PlKlA

## Why I made it

A normal split AC has a remote and nothing else. No schedule, no internet, no way to check on it from another city. That is a real problem when you leave for a few weeks: keep the AC running and you waste power, switch it off and you come back to a hot room.

Cloud-only smart plugs and controllers don't fully fix this, because if the Wi-Fi or the cloud service drops, the automation stops with it. So here the ESP32 runs everything itself and the cloud is only used to reach it from outside.

## How you would use it

Set a daily window, say 08:00 to 17:00 at 22°C, and the device switches the AC on and off by itself every day. Before you fly home, add a one-time event for your arrival (for example 3 Oct 2026, 06:00, 22°C, auto-off after 3 hours) so the room is already cool when you walk in. If you want to take over, press a button or use the dashboard to override, and press Resume schedule to hand control back.

## Images

| 3D model of the full assembly | Wiring diagram (breadboard rig) |
|---|---|
| <img width="409" height="491" alt="image" src="https://github.com/user-attachments/assets/986e5b8d-cbe4-45dc-982e-168e83e634b0" />
 | <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 840" width="1100" height="840" font-family="Arial, Helvetica, sans-serif" xmlns:c2pa="http://c2pa.org/manifest"><metadata><c2pa:manifest>AAAWgmp1bWIAAAAeanVtZGMycGEAEQAQgAAAqgA4m3EDYzJwYQAAABZcanVtYgAAAEdqdW1kYzJtYQARABCAAACqADibcQN1cm46YzJwYToxMDQxN2VmNy1kZTRmLTQ1NzctYThjMS00YTk2MjcyNTlhNzQAAAADl2p1bWIAAAApanVtZGMyYXMAEQAQgAAAqgA4m3EDYzJwYS5hc3NlcnRpb25zAAAAALxqdW1iAAAARGp1bWRjYm9yABEAEIAAAKoAOJtxE2MycGEuaW5ncmVkaWVudC52MwAAAAAYYzJzaKV0MmP9oJ7VA11zsoaINzwAAABwY2JvcqNpZGM6Zm9ybWF0bWltYWdlL3N2Zyt4bWxqaW5zdGFuY2VJRHgseG1wOmlpZDo4YzVlN2E2YS03ODg0LTQ5MzYtODFlYS1mNTgxZWRmNGVkYTdscmVsYXRpb25zaGlwaHBhcmVudE9mAAAB4mp1bWIAAABBanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5hY3Rpb25zLnYyAAAAABhjMnNo7lsPQkSjubhTfRfQ8yl5vgAAAZljYm9yomdhY3Rpb25zgqJmYWN0aW9ua2MycGEub3BlbmVkanBhcmFtZXRlcnOha2luZ3JlZGllbnRzgaJjdXJseC1zZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmluZ3JlZGllbnQudjNkaGFzaFgg0oZwp2zETY5/y3VRZc4+uMgj/2CDi0R0idSSUWvE2r6kZmFjdGlvbngdY29tLmFudGhyb3BpYy5jbGF1ZGUucHJvdmlkZWRqcGFyYW1ldGVyc6F4H2NvbS5hbnRocm9waWMub3JpZ2luLWNvbmZpZGVuY2VndW5rbm93bmtkZXNjcmlwdGlvbnhmQ2xhdWRlIHByb3ZpZGVkIHRoaXMgZmlsZSBhdCB0aGUgcmVxdWVzdCBvZiBhIHVzZXIgYW5kIG1heSBoYXZlIGNyZWF0ZWQgb3IgbW9kaWZpZWQgdGhlIGZpbGUgY29udGVudHMubXNvZnR3YXJlQWdlbnShZG5hbWVmQ2xhdWRlcmFsbEFjdGlvbnNJbmNsdWRlZPUAAADIanVtYgAAAEBqdW1kY2JvcgARABCAAACqADibcRNjMnBhLmhhc2guZGF0YQAAAAAYYzJzaED6dqpNgq11+DOP2bhRTs0AAACAY2JvcqVjYWxnZnNoYTI1NmNwYWRNAAAAAAAAAAAAAAAAAGRoYXNoWCBHRmvWg4aL8xCwl6ev088KM9dYflmVATTPn1ryWJDhzGRuYW1lbmp1bWJmIG1hbmlmZXN0amV4Y2x1c2lvbnOBomVzdGFydBjDZmxlbmd0aBkeBAAAAj5qdW1iAAAAJ2p1bWRjMmNsABEAEIAAAKoAOJtxA2MycGEuY2xhaW0udjIAAAACD2Nib3KlY2FsZ2ZzaGEyNTZpc2lnbmF0dXJleE1zZWxmI2p1bWJmPS9jMnBhL3VybjpjMnBhOjEwNDE3ZWY3LWRlNGYtNDU3Ny1hOGMxLTRhOTYyNzI1OWE3NC9jMnBhLnNpZ25hdHVyZWppbnN0YW5jZUlEeCx4bXA6aWlkOjc3OGVhNDUxLWMwOGYtNGY3NC05YTIxLTAxYTZhMDcwYTE2MHJjcmVhdGVkX2Fzc2VydGlvbnODomN1cmx4LXNlbGYjanVtYmY9YzJwYS5hc3NlcnRpb25zL2MycGEuaW5ncmVkaWVudC52M2RoYXNoWCDShnCnbMRNjn/LdVFlzj64yCP/YIOLRHSJ1JJRa8TavqJjdXJseCpzZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmFjdGlvbnMudjJkaGFzaFggXUE/NTpRd/FKwdyqUSTUpagQ01esPDJ5YEw6k4KIJCGiY3VybHgpc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5oYXNoLmRhdGFkaGFzaFgg5JtD0pDEzKZKnxy7WRZ+TOwWBgnSieoFZI0Ag38Z/3F0Y2xhaW1fZ2VuZXJhdG9yX2luZm+jZG5hbWVvQW50aHJvcGljIEZpbGVzZ3ZlcnNpb25lMS4wLjBrc3BlY1ZlcnNpb25lMi40LjAAABA4anVtYgAAAChqdW1kYzJjcwARABCAAACqADibcQNjMnBhLnNpZ25hdHVyZQAAABAIY2JvctKEWQISogEmGCFZAgowggIGMIIBjaADAgECAhRA5aAK7sI50L64g/oGQgU9Z1UTADAKBggqhkjOPQQDAzBJMRcwFQYDVQQKEw5BbnRocm9waWMsIFBCQzEuMCwGA1UEAxMlQW50aHJvcGljIENvbnRlbnQgQ3JlZGVudGlhbHMgUm9vdCBDQTAeFw0yNjA4MDcxODQzNTZaFw0yODA4MDYxOTQzNTZaMEQxFzAVBgNVBAoTDkFudGhyb3BpYywgUEJDMSkwJwYDVQQDEyBBbnRocm9waWMgQ2xhdWRlIENvbnRlbnQgU2lnbmluZzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABJh6CmvLUBgFFNU0vUKlOVtE6djd17L5SuwX0LemFisBM3dkd/3cyjxFA3Qo5S46fX0/ihY0VZ7mfb9KF703t5OjWDBWMA4GA1UdDwEB/wQEAwIHgDAVBgNVHSUEDjAMBgorBgEEAYPoXgIBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUzlHiBIFOZFsj+OPEz5o+nMHXXMIwCgYIKoZIzj0EAwMDZwAwZAIwMXMdFJ4BetLLVY7ORuE9noqbbAZOZn/aArXyTwFAZfKrPzxF2vPoJNf1+UCdg1XGAjBwX1zd9WGqYkqmL5SFqw1QySjr1zJfpJM9+1rdDwSPLMOPOjKuiXjoU/pUUeG9RwmhY3BhZFkNngAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPZYQKrAXbA9nEJaIxzU7y1DD7o+hqT9WoXRtPT1WwmJ41wVlUijQAXOgUmEDuGyttFx7WKjDF3F97RE0SwW2lKc1+E=</c2pa:manifest></metadata>
<rect width="1100" height="840" fill="#ffffff"/>
<text x="550" y="34" font-size="22" font-weight="bold" text-anchor="middle" fill="#111">Smart Infrared AC Scheduler: breadboard wiring</text>
<text x="550" y="56" font-size="13" text-anchor="middle" fill="#555">Logical wiring diagram taken from the firmware pin map. Pin positions are not to scale.</text>
<rect x="500" y="80" width="180" height="720" rx="6" fill="#e8f0fe" stroke="#1f3a7a" stroke-width="1.6"/>
<text x="590" y="106" font-size="16" text-anchor="middle" fill="#1f3a7a" font-weight='bold'>ESP32</text>
<text x="590" y="124" font-size="12" text-anchor="middle" fill="#1f3a7a">30-pin NodeMCU (CH340)</text>
<line x1="500" y1="150" x2="300" y2="150" stroke="#d32f2f" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="500" cy="150" r="4" fill="#d32f2f"/>
<text x="508" y="154" font-size="12" text-anchor="start" fill="#111">3V3</text>
<line x1="300" y1="150" x2="300" y2="628" stroke="#d32f2f" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="300" cy="150" r="4" fill="#d32f2f"/>
<line x1="500" y1="180" x2="325" y2="180" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="500" cy="180" r="4" fill="#222"/>
<text x="508" y="184" font-size="12" text-anchor="start" fill="#111">GND</text>
<line x1="325" y1="180" x2="325" y2="628" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="325" cy="180" r="4" fill="#222"/>
<line x1="500" y1="210" x2="350" y2="210" stroke="#1f64d8" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="500" cy="210" r="4" fill="#1f64d8"/>
<text x="508" y="214" font-size="12" text-anchor="start" fill="#111">GPIO21 (SDA)</text>
<line x1="350" y1="210" x2="350" y2="628" stroke="#1f64d8" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="350" cy="210" r="4" fill="#1f64d8"/>
<line x1="500" y1="240" x2="375" y2="240" stroke="#1b9a4b" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="500" cy="240" r="4" fill="#1b9a4b"/>
<text x="508" y="244" font-size="12" text-anchor="start" fill="#111">GPIO22 (SCL)</text>
<line x1="375" y1="240" x2="375" y2="628" stroke="#1b9a4b" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="375" cy="240" r="4" fill="#1b9a4b"/>
<rect x="60" y="290" width="190" height="104" rx="6" fill="#f4f6f8" stroke="#444" stroke-width="1.6"/>
<text x="70" y="308" font-size="13" text-anchor="start" fill="#111" font-weight='bold'>SSD1306 OLED 0.96in</text>
<text x="70" y="323" font-size="11" text-anchor="start" fill="#555">I2C address 0x3C</text>
<line x1="250" y1="340" x2="300" y2="340" stroke="#d32f2f" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="300" cy="340" r="4" fill="#d32f2f"/>
<circle cx="250" cy="340" r="4" fill="#d32f2f"/>
<text x="244" y="344" font-size="11" text-anchor="end" fill="#111">VCC</text>
<line x1="250" y1="356" x2="325" y2="356" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="325" cy="356" r="4" fill="#222"/>
<circle cx="250" cy="356" r="4" fill="#222"/>
<text x="244" y="360" font-size="11" text-anchor="end" fill="#111">GND</text>
<line x1="250" y1="372" x2="350" y2="372" stroke="#1f64d8" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="350" cy="372" r="4" fill="#1f64d8"/>
<circle cx="250" cy="372" r="4" fill="#1f64d8"/>
<text x="244" y="376" font-size="11" text-anchor="end" fill="#111">SDA</text>
<line x1="250" y1="388" x2="375" y2="388" stroke="#1b9a4b" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="375" cy="388" r="4" fill="#1b9a4b"/>
<circle cx="250" cy="388" r="4" fill="#1b9a4b"/>
<text x="244" y="392" font-size="11" text-anchor="end" fill="#111">SCL</text>
<rect x="60" y="410" width="190" height="104" rx="6" fill="#f4f6f8" stroke="#444" stroke-width="1.6"/>
<text x="70" y="428" font-size="13" text-anchor="start" fill="#111" font-weight='bold'>SHT40 sensor</text>
<text x="70" y="443" font-size="11" text-anchor="start" fill="#555">I2C address 0x44</text>
<line x1="250" y1="460" x2="300" y2="460" stroke="#d32f2f" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="300" cy="460" r="4" fill="#d32f2f"/>
<circle cx="250" cy="460" r="4" fill="#d32f2f"/>
<text x="244" y="464" font-size="11" text-anchor="end" fill="#111">VCC</text>
<line x1="250" y1="476" x2="325" y2="476" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="325" cy="476" r="4" fill="#222"/>
<circle cx="250" cy="476" r="4" fill="#222"/>
<text x="244" y="480" font-size="11" text-anchor="end" fill="#111">GND</text>
<line x1="250" y1="492" x2="350" y2="492" stroke="#1f64d8" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="350" cy="492" r="4" fill="#1f64d8"/>
<circle cx="250" cy="492" r="4" fill="#1f64d8"/>
<text x="244" y="496" font-size="11" text-anchor="end" fill="#111">SDA</text>
<line x1="250" y1="508" x2="375" y2="508" stroke="#1b9a4b" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="375" cy="508" r="4" fill="#1b9a4b"/>
<circle cx="250" cy="508" r="4" fill="#1b9a4b"/>
<text x="244" y="512" font-size="11" text-anchor="end" fill="#111">SCL</text>
<rect x="60" y="530" width="190" height="104" rx="6" fill="#f4f6f8" stroke="#444" stroke-width="1.6"/>
<text x="70" y="548" font-size="13" text-anchor="start" fill="#111" font-weight='bold'>DS3231 RTC</text>
<text x="70" y="563" font-size="11" text-anchor="start" fill="#555">I2C address 0x68</text>
<line x1="250" y1="580" x2="300" y2="580" stroke="#d32f2f" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="300" cy="580" r="4" fill="#d32f2f"/>
<circle cx="250" cy="580" r="4" fill="#d32f2f"/>
<text x="244" y="584" font-size="11" text-anchor="end" fill="#111">VCC</text>
<line x1="250" y1="596" x2="325" y2="596" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="325" cy="596" r="4" fill="#222"/>
<circle cx="250" cy="596" r="4" fill="#222"/>
<text x="244" y="600" font-size="11" text-anchor="end" fill="#111">GND</text>
<line x1="250" y1="612" x2="350" y2="612" stroke="#1f64d8" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="350" cy="612" r="4" fill="#1f64d8"/>
<circle cx="250" cy="612" r="4" fill="#1f64d8"/>
<text x="244" y="616" font-size="11" text-anchor="end" fill="#111">SDA</text>
<line x1="250" y1="628" x2="375" y2="628" stroke="#1b9a4b" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="375" cy="628" r="4" fill="#1b9a4b"/>
<circle cx="250" cy="628" r="4" fill="#1b9a4b"/>
<text x="244" y="632" font-size="11" text-anchor="end" fill="#111">SCL</text>
<text x="210" y="276" font-size="12" text-anchor="middle" fill="#555">I2C bus (shared)</text>
<line x1="680" y1="140" x2="720" y2="140" stroke="#e08a00" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="140" r="4" fill="#e08a00"/>
<text x="672" y="144" font-size="12" text-anchor="end" fill="#111">GPIO4 (D4)</text>
<line x1="720" y1="140" x2="720" y2="252" stroke="#e08a00" stroke-width="2.4" stroke-linecap="round"/>
<line x1="720" y1="252" x2="752" y2="252" stroke="#e08a00" stroke-width="2.4" stroke-linecap="round"/>
<line x1="788" y1="252" x2="824" y2="252" stroke="#e08a00" stroke-width="2.4" stroke-linecap="round"/>
<rect x="752" y="245" width="36" height="14" fill="#fff" stroke="#222" stroke-width="1.6"/>
<text x="770" y="238" font-size="12" text-anchor="middle" fill="#111" font-weight='bold'>220 ohm</text>
<line x1="680" y1="100" x2="980" y2="100" stroke="#c2185b" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="100" r="4" fill="#c2185b"/>
<text x="672" y="104" font-size="12" text-anchor="end" fill="#111">VIN (5V)</text>
<text x="992" y="96" font-size="12" text-anchor="start" fill="#c2185b" font-weight='bold'>5V</text>
<line x1="980" y1="100" x2="980" y2="104" stroke="#c2185b" stroke-width="2.4" stroke-linecap="round"/>
<rect x="972" y="104" width="16" height="30" fill="#fff" stroke="#222" stroke-width="1.6"/>
<text x="996" y="123" font-size="12" text-anchor="start" fill="#111" font-weight='bold'>1.8 ohm</text>
<line x1="980" y1="134" x2="980" y2="150" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<polygon points="970,150 990,150 980,172" fill="#fff" stroke="#222" stroke-width="1.8"/>
<line x1="969" y1="172" x2="991" y2="172" stroke="#222" stroke-width="2" stroke-linecap="round"/>
<line x1="980" y1="172" x2="980" y2="200" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="992" y1="152" x2="1012" y2="140" stroke="#a66d00" stroke-width="1.6" stroke-linecap="round"/>
<line x1="996" y1="164" x2="1016" y2="152" stroke="#a66d00" stroke-width="1.6" stroke-linecap="round"/>
<text x="1022" y="150" font-size="12" text-anchor="start" fill="#111" font-weight='bold'>5mm IR LED</text>
<line x1="850" y1="200" x2="980" y2="200" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="940" cy="200" r="4" fill="#222"/>
<circle cx="850" cy="200" r="4" fill="#222"/>
<circle cx="850" cy="252" r="26" fill="#fff8e1" stroke="#a66d00" stroke-width="1.6"/>
<line x1="838" y1="238" x2="838" y2="266" stroke="#222" stroke-width="2.6" stroke-linecap="round"/>
<line x1="824" y1="252" x2="838" y2="252" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="838" y1="245" x2="858" y2="232" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="858" y1="232" x2="858" y2="226" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="838" y1="259" x2="858" y2="272" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="858" y1="272" x2="858" y2="278" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<polygon points="858,272 851,269 854,263" fill="#222"/>
<text x="844" y="302" font-size="12" text-anchor="end" fill="#111" font-weight='bold'>Q1 S8050</text>
<circle cx="940" cy="252" r="26" fill="#fff8e1" stroke="#a66d00" stroke-width="1.6"/>
<line x1="928" y1="238" x2="928" y2="266" stroke="#222" stroke-width="2.6" stroke-linecap="round"/>
<line x1="914" y1="252" x2="928" y2="252" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="928" y1="245" x2="948" y2="232" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="948" y1="232" x2="948" y2="226" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="928" y1="259" x2="948" y2="272" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="948" y1="272" x2="948" y2="278" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<polygon points="948,272 941,269 944,263" fill="#222"/>
<text x="956" y="302" font-size="12" text-anchor="start" fill="#111" font-weight='bold'>Q2 S8050</text>
<line x1="858" y1="200" x2="858" y2="226" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="948" y1="200" x2="948" y2="226" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="858" y1="278" x2="858" y2="320" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="858" y1="320" x2="892" y2="320" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="892" y1="320" x2="892" y2="252" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="892" y1="252" x2="914" y2="252" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="948" y1="278" x2="948" y2="330" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="940" y1="330" x2="956" y2="330" stroke="#222" stroke-width="3" stroke-linecap="round"/>
<line x1="943" y1="336" x2="953" y2="336" stroke="#222" stroke-width="3" stroke-linecap="round"/>
<text x="1090" y="232" font-size="11" text-anchor="end" fill="#111" font-weight='bold'>Darlington pair:</text>
<text x="1090" y="246" font-size="11" text-anchor="end" fill="#555">Q1 emitter to Q2 base,</text>
<text x="1090" y="260" font-size="11" text-anchor="end" fill="#555">collectors tied together</text>
<line x1="680" y1="385" x2="800" y2="385" stroke="#e08a00" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="385" r="4" fill="#e08a00"/>
<text x="672" y="389" font-size="12" text-anchor="end" fill="#111">GPIO15</text>
<rect x="800" y="365" width="220" height="84" rx="6" fill="#fff8e1" stroke="#a66d00" stroke-width="1.6"/>
<text x="810" y="385" font-size="13" text-anchor="start" fill="#111" font-weight='bold'>VS1838B IR receiver</text>
<text x="810" y="404" font-size="11" text-anchor="start" fill="#555">OUT to GPIO15</text>
<text x="810" y="420" font-size="11" text-anchor="start" fill="#d32f2f">VCC to 3V3</text>
<text x="810" y="436" font-size="11" text-anchor="start" fill="#222">GND to GND</text>
<line x1="680" y1="500" x2="800" y2="500" stroke="#e08a00" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="500" r="4" fill="#e08a00"/>
<text x="672" y="504" font-size="12" text-anchor="end" fill="#111">GPIO18</text>
<rect x="800" y="475" width="220" height="50" rx="6" fill="#fff8e1" stroke="#a66d00" stroke-width="1.6"/>
<text x="810" y="496" font-size="13" text-anchor="start" fill="#111" font-weight='bold'>Active buzzer</text>
<text x="810" y="512" font-size="11" text-anchor="start" fill="#555">+ to GPIO18, - to GND</text>
<line x1="680" y1="565" x2="800" y2="565" stroke="#7b3fb0" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="565" r="4" fill="#7b3fb0"/>
<text x="672" y="569" font-size="12" text-anchor="end" fill="#111">GPIO13</text>
<rect x="800" y="552" width="76" height="26" rx="6" fill="#f3e9fb" stroke="#5b2c83" stroke-width="1.6"/>
<text x="838" y="570" font-size="12" text-anchor="middle" fill="#111" font-weight='bold'>UP</text>
<line x1="876" y1="565" x2="960" y2="565" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="960" cy="565" r="4" fill="#222"/>
<line x1="680" y1="603" x2="800" y2="603" stroke="#7b3fb0" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="603" r="4" fill="#7b3fb0"/>
<text x="672" y="607" font-size="12" text-anchor="end" fill="#111">GPIO12</text>
<rect x="800" y="590" width="76" height="26" rx="6" fill="#f3e9fb" stroke="#5b2c83" stroke-width="1.6"/>
<text x="838" y="608" font-size="12" text-anchor="middle" fill="#111" font-weight='bold'>DOWN</text>
<line x1="876" y1="603" x2="960" y2="603" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="960" cy="603" r="4" fill="#222"/>
<line x1="680" y1="641" x2="800" y2="641" stroke="#7b3fb0" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="641" r="4" fill="#7b3fb0"/>
<text x="672" y="645" font-size="12" text-anchor="end" fill="#111">GPIO14</text>
<rect x="800" y="628" width="76" height="26" rx="6" fill="#f3e9fb" stroke="#5b2c83" stroke-width="1.6"/>
<text x="838" y="646" font-size="12" text-anchor="middle" fill="#111" font-weight='bold'>LEFT</text>
<line x1="876" y1="641" x2="960" y2="641" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="960" cy="641" r="4" fill="#222"/>
<line x1="680" y1="679" x2="800" y2="679" stroke="#7b3fb0" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="679" r="4" fill="#7b3fb0"/>
<text x="672" y="683" font-size="12" text-anchor="end" fill="#111">GPIO27</text>
<rect x="800" y="666" width="76" height="26" rx="6" fill="#f3e9fb" stroke="#5b2c83" stroke-width="1.6"/>
<text x="838" y="684" font-size="12" text-anchor="middle" fill="#111" font-weight='bold'>RIGHT</text>
<line x1="876" y1="679" x2="960" y2="679" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="960" cy="679" r="4" fill="#222"/>
<line x1="680" y1="717" x2="800" y2="717" stroke="#7b3fb0" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="717" r="4" fill="#7b3fb0"/>
<text x="672" y="721" font-size="12" text-anchor="end" fill="#111">GPIO26</text>
<rect x="800" y="704" width="76" height="26" rx="6" fill="#f3e9fb" stroke="#5b2c83" stroke-width="1.6"/>
<text x="838" y="722" font-size="12" text-anchor="middle" fill="#111" font-weight='bold'>OK</text>
<line x1="876" y1="717" x2="960" y2="717" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="960" cy="717" r="4" fill="#222"/>
<line x1="680" y1="755" x2="800" y2="755" stroke="#7b3fb0" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="680" cy="755" r="4" fill="#7b3fb0"/>
<text x="672" y="759" font-size="12" text-anchor="end" fill="#111">GPIO25</text>
<rect x="800" y="742" width="76" height="26" rx="6" fill="#f3e9fb" stroke="#5b2c83" stroke-width="1.6"/>
<text x="838" y="760" font-size="12" text-anchor="middle" fill="#111" font-weight='bold'>BACK</text>
<line x1="876" y1="755" x2="960" y2="755" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="960" cy="755" r="4" fill="#222"/>
<line x1="960" y1="565" x2="960" y2="755" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="960" y1="755" x2="960" y2="790" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>
<line x1="944" y1="790" x2="976" y2="790" stroke="#222" stroke-width="3" stroke-linecap="round"/>
<line x1="950" y1="797" x2="970" y2="797" stroke="#222" stroke-width="3" stroke-linecap="round"/>
<line x1="955" y1="804" x2="965" y2="804" stroke="#222" stroke-width="3" stroke-linecap="round"/>
<text x="1000" y="580" font-size="12" text-anchor="start" fill="#111" font-weight='bold'>Push buttons:</text>
<text x="1000" y="596" font-size="11" text-anchor="start" fill="#555">one leg to GPIO,</text>
<text x="1000" y="610" font-size="11" text-anchor="start" fill="#555">other leg to GND</text>
<text x="1000" y="624" font-size="11" text-anchor="start" fill="#555">(internal pull-up,</text>
<text x="1000" y="638" font-size="11" text-anchor="start" fill="#555">no resistors)</text>
<line x1="60" y1="826" x2="90" y2="826" stroke="#d32f2f" stroke-width="4" stroke-linecap="round"/>
<text x="98" y="830" font-size="12" text-anchor="start" fill="#111">3V3</text>
<line x1="190" y1="826" x2="220" y2="826" stroke="#222" stroke-width="4" stroke-linecap="round"/>
<text x="228" y="830" font-size="12" text-anchor="start" fill="#111">GND</text>
<line x1="320" y1="826" x2="350" y2="826" stroke="#1f64d8" stroke-width="4" stroke-linecap="round"/>
<text x="358" y="830" font-size="12" text-anchor="start" fill="#111">I2C SDA</text>
<line x1="450" y1="826" x2="480" y2="826" stroke="#1b9a4b" stroke-width="4" stroke-linecap="round"/>
<text x="488" y="830" font-size="12" text-anchor="start" fill="#111">I2C SCL</text>
<line x1="580" y1="826" x2="610" y2="826" stroke="#c2185b" stroke-width="4" stroke-linecap="round"/>
<text x="618" y="830" font-size="12" text-anchor="start" fill="#111">5V</text>
<line x1="710" y1="826" x2="740" y2="826" stroke="#e08a00" stroke-width="4" stroke-linecap="round"/>
<text x="748" y="830" font-size="12" text-anchor="start" fill="#111">Signal</text>
<line x1="840" y1="826" x2="870" y2="826" stroke="#7b3fb0" stroke-width="4" stroke-linecap="round"/>
<text x="878" y="830" font-size="12" text-anchor="start" fill="#111">Buttons</text>
</svg> |

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

### MQTT topics

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
