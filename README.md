# TimeTab ⏱️

A clean, responsive, and customizable browser clock tab. Zero dependencies, blazing-fast performance, and fully functional offline.

![TimeTab Preview](https://img.shields.io/badge/TimeTab-Clock-blue?style=flat-square)

---

## ✨ Features

- **Giant Dynamic Clock Display**:
  - Automatically scales to fit any screen resolution with responsive typography.
  - Formatted with tabular figures so digits never jitter or shift.
  - Supports 12-hour and 24-hour modes.
  - Optional seconds counter and AM/PM indicator.
  - Optional leading zero toggle (`07:00` vs `7:00`).
  - Optional flashing colon separator (`:`).
  - Date display with current day, month, date, and year.

- **Full Timezone Support**:
  - Set your timezone to **Local (Device)**, **UTC**, or any of **400+ IANA world timezones**.
  - **Quick-select chips** for popular global cities (New York, Chicago, Los Angeles, London, Paris, Tokyo, Sydney, etc.).
  - **Live search filter**: type any city, country, or region name to instantly filter the timezone list.
  - Live UTC offset badge next to each timezone (e.g. `UTC-4`, `UTC+1`, `UTC+9`).

- **Custom Colors & Theme Presets**:
  - **Background Color Picker**: Interactive color wheel + Hex code input (supports 3-digit and 6-digit hex).
  - **Clock Text Color Picker**: Interactive color wheel + Hex code input.
  - **12 Curated Themes**:
    - *TimeTab Classic* (OLED Black & White)
    - *Clean White* (Slate & Charcoal)
    - *OLED Emerald* (Deep Black & Matrix Green)
    - *Retro Amber* (Vintage Terminal CRT)
    - *Cyber Cyan* (Cyberpunk Electric Blue)
    - *Neon Pink* (Synthwave Hot Pink)
    - *Midnight Navy* (Dark Navy & Sky Blue)
    - *Nord Frost* (Nordic Ice)
    - *Forest Zen* (Deep Pine & Soft Mint)
    - *Sunset Glow* (Twilight Violet & Peach)
    - *Solarized Dark* (Deep Teal & Green)
    - *Warm Paper* (Warm Cream & Dark Ink)
  - Adaptive contrast: toolbar and settings panel automatically adjust their backdrop for light or dark backgrounds.
  - Optional **Neon Text Glow** effect.

- **Typography & Fonts**:
  - *Inter / Modern Sans*
  - *Orbitron / Digital*
  - *Chakra / Tech Display*
  - *JetBrains Mono / Monospace*
  - *Impact / Bold Grotesk*
  - *Georgia / Classic Serif*

- **Browser Tab & Favicon Integration**:
  - **Live Tab Title**: Displays the current time in the browser tab title in real-time (e.g. `07:24:15 PM - TimeTab`).
  - **Dynamic Favicon**: Canvas-generated mini clock icon, rendered natively at 16×16, 32×32, 48×48 and 64×64 so the browser never has to rescale it. Updates every minute and follows your theme colors, automatically switching to black or white digits when a theme's contrast is too low to read at icon size.

- **Kiosk & Fullscreen Mode**:
  - **Auto-hide Controls**: Toolbar and mouse cursor smoothly fade away after 3 seconds of inactivity, reappearing instantly upon mouse movement.
  - **Fullscreen Toggle**: Native browser fullscreen mode with one click or keypress.

- **Settings Persistence**:
  - All your settings (colors, timezone, font, formats) are automatically saved to `localStorage` and restored on page refresh.
  - One-click **Reset to Defaults** button.

---

## 🚀 How to Run

Because TimeTab is built with pure HTML, CSS, and modern JavaScript, there is no build step required.

### Option 1: Direct File Open
Simply double-click [`index.html`](index.html) or right-click and choose **Open With -> Google Chrome / Microsoft Edge / Firefox**.

### Option 2: Local Web Server (Python)
In PowerShell or Command Prompt, run:
```powershell
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| <kbd>S</kbd> or <kbd>O</kbd> | Open / Close Settings Drawer |
| <kbd>F</kbd> | Toggle Fullscreen Mode |
| <kbd>Esc</kbd> | Close Settings Drawer |

---

## 📂 Project Structure

```
timetab/
├── index.html       # Semantic HTML5 layout and accessibility markup
├── style.css        # Responsive CSS, theme variables, glassmorphic UI, animations
├── app.js           # Clock engine, timezone calculation, dynamic favicon & settings manager
├── .gitignore       # Git ignore rules for OS and IDE artifacts
└── README.md        # Documentation and usage guide
```

---

## ⚖️ Disclaimer

TimeTab is an independent open-source project inspired by browser clock tabs and is not affiliated with, endorsed by, or sponsored by ClockTab or clocktab.com.
