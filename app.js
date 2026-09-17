/**
 * TimeTab - Modern, customizable browser clock tab
 */

(function () {
  'use strict';

  // Default Settings
  const DEFAULT_SETTINGS = {
    timezone: 'local',
    bgColor: '#000000',
    textColor: '#ffffff',
    font: 'modern-sans',
    textGlow: false,
    is24Hour: false,
    leadingZero: true,
    showSeconds: true,
    showAmPm: true,
    showDate: true,
    showTzBadge: true,
    flashingColon: false,
    showTabTitle: true,
    autoHideControls: true,
  };

  // Curated Preset Themes
  const PRESET_THEMES = [
    { name: 'TimeTab Classic', bg: '#000000', text: '#ffffff' },
    { name: 'Clean White', bg: '#f8fafc', text: '#0f172a' },
    { name: 'OLED Emerald', bg: '#000000', text: '#00ff88' },
    { name: 'Retro Amber', bg: '#12100e', text: '#ffb000' },
    { name: 'Cyber Cyan', bg: '#050714', text: '#00f0ff' },
    { name: 'Neon Pink', bg: '#0d0714', text: '#ff007f' },
    { name: 'Midnight Navy', bg: '#0a0e1a', text: '#64b5f6' },
    { name: 'Nord Frost', bg: '#2e3440', text: '#88c0d0' },
    { name: 'Forest Zen', bg: '#0d1b17', text: '#a7f3d0' },
    { name: 'Sunset Glow', bg: '#1a0933', text: '#ff8a65' },
    { name: 'Solarized Dark', bg: '#002b36', text: '#93a1a1' },
    { name: 'Warm Paper', bg: '#f7f4ea', text: '#2d2b28' },
  ];

  // State
  let settings = { ...DEFAULT_SETTINGS };
  let idleTimer = null;
  let allTimezones = [];
  let faviconCanvas = null;
  let latestHours = '00';
  let latestMinutes = '00';

  // DOM Elements
  const el = {
    body: document.body,
    hours: document.getElementById('clock-hours'),
    colon1: document.getElementById('clock-colon-1'),
    minutes: document.getElementById('clock-minutes'),
    colon2: document.getElementById('clock-colon-2'),
    seconds: document.getElementById('clock-seconds'),
    ampm: document.getElementById('clock-ampm'),
    dateDisplay: document.getElementById('clock-date'),
    tzBadge: document.getElementById('clock-tz-badge'),
    tzCurrentInfo: document.getElementById('tz-current-info'),
    favicon: document.getElementById('favicon'),

    // Buttons
    settingsBtn: document.getElementById('settings-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    resetBtn: document.getElementById('reset-defaults-btn'),

    // Drawer & Backdrop
    settingsDrawer: document.getElementById('settings-drawer'),
    settingsBackdrop: document.getElementById('settings-backdrop'),

    // Inputs
    tzSelect: document.getElementById('timezone-select'),
    tzSearchInput: document.getElementById('tz-search-input'),
    tzChips: document.getElementById('tz-chips'),
    themePresetsGrid: document.getElementById('theme-presets-grid'),
    bgColorPicker: document.getElementById('bg-color-picker'),
    bgColorHex: document.getElementById('bg-color-hex'),
    textColorPicker: document.getElementById('text-color-picker'),
    textColorHex: document.getElementById('text-color-hex'),
    fontSelect: document.getElementById('font-select'),

    // Toggles
    toggleTextGlow: document.getElementById('toggle-text-glow'),
    toggle24Hour: document.getElementById('toggle-24hour'),
    toggleLeadingZero: document.getElementById('toggle-leading-zero'),
    toggleSeconds: document.getElementById('toggle-seconds'),
    toggleAmPm: document.getElementById('toggle-ampm'),
    toggleDate: document.getElementById('toggle-date'),
    toggleTzBadge: document.getElementById('toggle-tz-badge'),
    toggleFlashingColon: document.getElementById('toggle-flashing-colon'),
    toggleTabTitle: document.getElementById('toggle-tab-title'),
    toggleAutoHide: document.getElementById('toggle-autohide'),
  };

  /**
   * Load settings from localStorage
   */
  function loadSettings() {
    try {
      const saved = localStorage.getItem('timetab_settings') || localStorage.getItem('clocktab_settings');
      if (saved) {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage:', e);
    }
  }

  /**
   * Save settings to localStorage
   */
  function saveSettings() {
    try {
      localStorage.setItem('timetab_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }

  /**
   * Normalize 3-character or 6-character hex colors
   */
  function normalizeHex(hex) {
    if (!hex) return null;
    let clean = hex.trim().replace(/^#/, '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length === 6 && /^[0-9A-Fa-f]{6}$/.test(clean)) {
      return '#' + clean.toLowerCase();
    }
    return null;
  }

  /**
   * Determine relative luminance of hex color to decide light/dark UI mode
   */
  function isLightColor(hex) {
    const valid = normalizeHex(hex);
    if (!valid) return false;
    const cleanHex = valid.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    // Standard perceptual brightness formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 140;
  }

  /**
   * Apply visual settings to CSS variables and document classes
   */
  function applyVisualSettings() {
    document.documentElement.style.setProperty('--bg-color', settings.bgColor);
    document.documentElement.style.setProperty('--text-color', settings.textColor);

    if (isLightColor(settings.bgColor)) {
      el.body.classList.add('theme-light-ui');
    } else {
      el.body.classList.remove('theme-light-ui');
    }

    // Font family classes
    const fontClasses = [
      'font-modern-sans',
      'font-digital',
      'font-chakra',
      'font-monospace',
      'font-bold-grotesk',
      'font-classic-serif',
    ];
    fontClasses.forEach((cls) => el.body.classList.remove(cls));
    el.body.classList.add(`font-${settings.font}`);

    // Text Glow
    if (settings.textGlow) {
      document.documentElement.style.setProperty(
        '--text-shadow',
        `0 0 20px ${settings.textColor}, 0 0 45px ${settings.textColor}`
      );
    } else {
      document.documentElement.style.setProperty('--text-shadow', 'none');
    }

    // Toggle display helper classes
    el.body.classList.toggle('hide-seconds', !settings.showSeconds);
    el.body.classList.toggle('hide-ampm', !settings.showAmPm || settings.is24Hour);
    el.body.classList.toggle('hide-date', !settings.showDate);
    el.body.classList.toggle('hide-tz-badge', !settings.showTzBadge);

    // Colon flashing
    el.colon1.classList.toggle('flashing', settings.flashingColon);
    el.colon2.classList.toggle('flashing', settings.flashingColon);

    // Sync input controls with settings state
    syncControlsToState();

    // Re-render favicon with updated colors
    updateFavicon();
  }

  /**
   * Synchronize DOM input controls with state
   */
  function syncControlsToState() {
    el.bgColorPicker.value = settings.bgColor;
    el.bgColorHex.value = settings.bgColor.toUpperCase();
    el.textColorPicker.value = settings.textColor;
    el.textColorHex.value = settings.textColor.toUpperCase();

    el.fontSelect.value = settings.font;
    el.toggleTextGlow.checked = settings.textGlow;
    el.toggle24Hour.checked = settings.is24Hour;
    el.toggleLeadingZero.checked = settings.leadingZero;
    el.toggleSeconds.checked = settings.showSeconds;
    el.toggleAmPm.checked = settings.showAmPm;
    el.toggleDate.checked = settings.showDate;
    el.toggleTzBadge.checked = settings.showTzBadge;
    el.toggleFlashingColon.checked = settings.flashingColon;
    el.toggleTabTitle.checked = settings.showTabTitle;
    el.toggleAutoHide.checked = settings.autoHideControls;

    // Update active chip
    const chips = el.tzChips.querySelectorAll('.chip-btn');
    chips.forEach((chip) => {
      chip.classList.toggle('active', chip.getAttribute('data-tz') === settings.timezone);
    });

    if (el.tzSelect.value !== settings.timezone) {
      el.tzSelect.value = settings.timezone;
    }
  }

  /**
   * Get all IANA timezones supported by browser
   */
  function populateTimezoneList() {
    let zones = [];
    if (typeof Intl.supportedValuesOf === 'function') {
      try {
        zones = Intl.supportedValuesOf('timeZone');
      } catch (e) {
        console.warn('Could not get timezones via Intl.supportedValuesOf:', e);
      }
    }

    // Fallback list if needed
    if (!zones || zones.length === 0) {
      zones = [
        'UTC', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
        'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota',
        'America/Chicago', 'America/Denver', 'America/Halifax', 'America/Los_Angeles',
        'America/Mexico_City', 'America/New_York', 'America/Phoenix', 'America/Santiago',
        'America/Sao_Paulo', 'America/Toronto', 'America/Vancouver',
        'Asia/Bangkok', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Jakarta', 'Asia/Kolkata',
        'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo',
        'Atlantic/Reykjavik', 'Australia/Brisbane', 'Australia/Melbourne',
        'Australia/Perth', 'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Berlin',
        'Europe/Dublin', 'Europe/Istanbul', 'Europe/Lisbon', 'Europe/London',
        'Europe/Madrid', 'Europe/Paris', 'Europe/Rome', 'Europe/Stockholm',
        'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Honolulu'
      ];
    }

    // Store cleaned timezones
    allTimezones = Array.from(new Set(['local', 'UTC', ...zones]));
    renderTimezoneOptions('');
  }

  /**
   * Render timezone select options, optionally filtered by search text
   */
  function renderTimezoneOptions(filterText = '') {
    const currentVal = settings.timezone;
    el.tzSelect.innerHTML = '';

    const filter = filterText.toLowerCase().trim();

    // Local option always at top
    if (!filter || 'local device'.includes(filter)) {
      const localOpt = document.createElement('option');
      localOpt.value = 'local';
      const detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      localOpt.textContent = `📍 Local Time (Device: ${detectedZone})`;
      el.tzSelect.appendChild(localOpt);
    }

    allTimezones.forEach((tz) => {
      if (tz === 'local') return;

      const searchableText = tz.replace(/_/g, ' ').toLowerCase();
      if (!filter || searchableText.includes(filter) || tz.toLowerCase().includes(filter)) {
        const opt = document.createElement('option');
        opt.value = tz;

        // Friendly formatted display with offset
        try {
          const now = new Date();
          const offsetFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'shortOffset',
          });
          const parts = offsetFormatter.formatToParts(now);
          const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
          opt.textContent = `${tz.replace(/_/g, ' ')} (${offsetPart})`;
        } catch (e) {
          opt.textContent = tz.replace(/_/g, ' ');
        }

        el.tzSelect.appendChild(opt);
      }
    });

    el.tzSelect.value = currentVal;
  }

  /**
   * Render theme presets grid
   */
  function renderThemePresets() {
    el.themePresetsGrid.innerHTML = '';
    PRESET_THEMES.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-preset-btn';
      btn.innerHTML = `
        <span class="preset-preview-swatch" style="background-color: ${preset.bg}">
          <span class="preset-preview-inner" style="background-color: ${preset.text}"></span>
        </span>
        <span class="preset-name">${preset.name}</span>
      `;
      btn.addEventListener('click', () => {
        settings.bgColor = preset.bg;
        settings.textColor = preset.text;
        applyVisualSettings();
        saveSettings();
      });
      el.themePresetsGrid.appendChild(btn);
    });
  }

  /**
   * Format numbers to 2 digits
   */
  function padZero(num) {
    return String(num).padStart(2, '0');
  }

  /**
   * Get date object parts formatted for the specified timezone
   */
  function getTimeParts() {
    const now = new Date();
    const tz = settings.timezone === 'local' ? undefined : settings.timezone;

    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: !settings.is24Hour,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZoneName: 'short',
      });

      const parts = dtf.formatToParts(now);
      const partMap = {};
      parts.forEach((p) => {
        partMap[p.type] = p.value;
      });

      let hours = partMap.hour || '0';
      if (!settings.is24Hour && (hours === '0' || hours === '00')) {
        hours = '12';
      }
      if (settings.is24Hour) {
        hours = padZero(hours);
      } else {
        hours = settings.leadingZero ? padZero(hours) : String(parseInt(hours, 10));
      }

      const minutes = partMap.minute || '00';
      const seconds = partMap.second || '00';
      const dayPeriod = (partMap.dayPeriod || '').toUpperCase();
      const weekday = partMap.weekday || '';
      const month = partMap.month || '';
      const day = partMap.day || '';
      const year = partMap.year || '';
      const tzName = partMap.timeZoneName || '';

      return {
        hours,
        minutes,
        seconds,
        dayPeriod,
        dateString: `${weekday}, ${month} ${day}, ${year}`,
        tzName,
      };
    } catch (e) {
      // Fallback in case of timezone error
      console.warn('Error formatting date with timezone:', e);
      let h = now.getHours();
      let ampm = '';
      if (!settings.is24Hour) {
        ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
      }
      let formattedHours = settings.is24Hour || settings.leadingZero ? padZero(h) : String(h);

      return {
        hours: formattedHours,
        minutes: padZero(now.getMinutes()),
        seconds: padZero(now.getSeconds()),
        dayPeriod: ampm,
        dateString: now.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        tzName: 'Local',
      };
    }
  }

  /**
   * Helper to draw dynamically fitted large text in the favicon
   */
  function drawFaviconText(ctx, text, y, startSize = 38) {
    let size = startSize;
    const fontStack = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    ctx.font = `900 ${size}px ${fontStack}`;
    let width = ctx.measureText(text).width;
    // Scale down if digits exceed available width to prevent any clipping
    while (width > 58 && size > 24) {
      size -= 1;
      ctx.font = `900 ${size}px ${fontStack}`;
      width = ctx.measureText(text).width;
    }
    ctx.fillText(text, 32, y);
  }

  /**
   * Update the dynamic browser tab favicon with current time
   * Always renders bold white digits on a solid black background tile with no border
   */
  function updateFavicon(hours, minutes) {
    if (hours !== undefined) latestHours = hours;
    if (minutes !== undefined) latestMinutes = minutes;
    const h = String(hours !== undefined ? hours : latestHours);
    const m = String(minutes !== undefined ? minutes : latestMinutes);

    try {
      if (!faviconCanvas) {
        faviconCanvas = document.createElement('canvas');
        faviconCanvas.width = 64;
        faviconCanvas.height = 64;
      }
      const ctx = faviconCanvas.getContext('2d');
      ctx.clearRect(0, 0, 64, 64);

      // ALWAYS solid black background tile with no border
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 64, 64);

      // ALWAYS pure white numbers
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = '-1px';
      }

      // Large, bold, prominent digits filling the icon area
      drawFaviconText(ctx, h, 18, 38);
      drawFaviconText(ctx, m, 47, 38);

      el.favicon.type = 'image/png';
      el.favicon.href = faviconCanvas.toDataURL('image/png');
    } catch (e) {
      // Non-critical, ignore canvas errors
    }
  }

  let lastMinute = -1;

  /**
   * Main Clock Tick
   */
  function tick() {
    const time = getTimeParts();
    latestHours = time.hours;
    latestMinutes = time.minutes;

    // DOM updates
    if (el.hours.textContent !== time.hours) el.hours.textContent = time.hours;
    if (el.minutes.textContent !== time.minutes) el.minutes.textContent = time.minutes;
    if (el.seconds.textContent !== time.seconds) el.seconds.textContent = time.seconds;
    if (el.ampm.textContent !== time.dayPeriod) el.ampm.textContent = time.dayPeriod;
    if (el.dateDisplay.textContent !== time.dateString) el.dateDisplay.textContent = time.dateString;

    // Timezone badge
    const displayTzBadge = settings.timezone === 'local'
      ? `${time.tzName}`
      : `${settings.timezone.split('/').pop().replace(/_/g, ' ')} (${time.tzName})`;
    if (el.tzBadge.textContent !== displayTzBadge) {
      el.tzBadge.textContent = displayTzBadge;
    }

    // Dynamic Tab Title
    if (settings.showTabTitle) {
      const timeTitle = settings.showSeconds
        ? `${time.hours}:${time.minutes}:${time.seconds}`
        : `${time.hours}:${time.minutes}`;
      const ampmPart = (!settings.is24Hour && settings.showAmPm && time.dayPeriod) ? ` ${time.dayPeriod}` : '';
      const newTitle = `${timeTitle}${ampmPart} - TimeTab`;
      if (document.title !== newTitle) {
        document.title = newTitle;
      }
    } else {
      if (document.title !== 'TimeTab') {
        document.title = 'TimeTab';
      }
    }

    // Update Favicon once per minute
    const currentMin = parseInt(time.minutes, 10);
    if (currentMin !== lastMinute) {
      lastMinute = currentMin;
      updateFavicon(time.hours, time.minutes);
    }
  }

  /**
   * Set Timezone helper
   */
  function setTimezone(tz) {
    if (!tz) return;
    settings.timezone = tz;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    el.tzCurrentInfo.textContent = tz === 'local' ? `Current: Local Time (${detected})` : `Current: ${tz.replace(/_/g, ' ')}`;

    // If the timezone isn't visible due to an active search filter, clear it
    if (el.tzSearchInput.value && !Array.from(el.tzSelect.options).some((o) => o.value === tz)) {
      el.tzSearchInput.value = '';
      renderTimezoneOptions('');
    }

    lastMinute = -1; // Force favicon refresh for new timezone
    syncControlsToState();
    saveSettings();
    tick();
  }

  /**
   * Toggle settings drawer
   */
  function openSettings() {
    el.body.classList.add('settings-open');
    el.settingsDrawer.setAttribute('aria-hidden', 'false');
    el.settingsBackdrop.setAttribute('aria-hidden', 'false');
    resetIdleTimer();
  }

  function closeSettings() {
    el.body.classList.remove('settings-open');
    el.settingsDrawer.setAttribute('aria-hidden', 'true');
    el.settingsBackdrop.setAttribute('aria-hidden', 'true');
  }

  function toggleSettings() {
    if (el.body.classList.contains('settings-open')) {
      closeSettings();
    } else {
      openSettings();
    }
  }

  /**
   * Fullscreen handling
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  }

  /**
   * User idle detection for auto-hiding toolbar & cursor
   */
  function resetIdleTimer() {
    el.body.classList.remove('is-idle');
    clearTimeout(idleTimer);

    if (!settings.autoHideControls || el.body.classList.contains('settings-open')) {
      return;
    }

    idleTimer = setTimeout(() => {
      if (!el.body.classList.contains('settings-open')) {
        el.body.classList.add('is-idle');
      }
    }, 3200);
  }

  /**
   * Event Listeners Setup
   */
  function setupEvents() {
    // Toolbar buttons
    el.settingsBtn.addEventListener('click', openSettings);
    el.closeSettingsBtn.addEventListener('click', closeSettings);
    el.settingsBackdrop.addEventListener('click', closeSettings);
    el.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
          closeSettings();
        }
        return;
      }

      if (e.key === 's' || e.key === 'S' || e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        toggleSettings();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        closeSettings();
      }
    });

    // Idle mouse activity listeners
    ['mousemove', 'mousedown', 'touchstart', 'keydown'].forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });

    // Timezone quick chips
    el.tzChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (chip) {
        const tz = chip.getAttribute('data-tz');
        setTimezone(tz);
      }
    });

    // Timezone select dropdown
    el.tzSelect.addEventListener('change', (e) => {
      setTimezone(e.target.value);
    });
    el.tzSelect.addEventListener('click', (e) => {
      if (e.target.value) {
        setTimezone(e.target.value);
      }
    });

    // Timezone search input
    el.tzSearchInput.addEventListener('input', (e) => {
      renderTimezoneOptions(e.target.value);
    });

    // Color Pickers
    el.bgColorPicker.addEventListener('input', (e) => {
      settings.bgColor = e.target.value;
      el.bgColorHex.value = e.target.value.toUpperCase();
      applyVisualSettings();
      saveSettings();
    });

    el.bgColorHex.addEventListener('input', (e) => {
      const normalized = normalizeHex(e.target.value);
      if (normalized) {
        settings.bgColor = normalized;
        el.bgColorPicker.value = normalized;
        applyVisualSettings();
        saveSettings();
      }
    });

    el.textColorPicker.addEventListener('input', (e) => {
      settings.textColor = e.target.value;
      el.textColorHex.value = e.target.value.toUpperCase();
      applyVisualSettings();
      saveSettings();
    });

    el.textColorHex.addEventListener('input', (e) => {
      const normalized = normalizeHex(e.target.value);
      if (normalized) {
        settings.textColor = normalized;
        el.textColorPicker.value = normalized;
        applyVisualSettings();
        saveSettings();
      }
    });

    // Font select
    el.fontSelect.addEventListener('change', (e) => {
      settings.font = e.target.value;
      applyVisualSettings();
      saveSettings();
    });

    // Toggles
    el.toggleTextGlow.addEventListener('change', (e) => {
      settings.textGlow = e.target.checked;
      applyVisualSettings();
      saveSettings();
    });

    el.toggle24Hour.addEventListener('change', (e) => {
      settings.is24Hour = e.target.checked;
      applyVisualSettings();
      saveSettings();
      tick();
    });

    el.toggleLeadingZero.addEventListener('change', (e) => {
      settings.leadingZero = e.target.checked;
      applyVisualSettings();
      saveSettings();
      tick();
    });

    el.toggleSeconds.addEventListener('change', (e) => {
      settings.showSeconds = e.target.checked;
      applyVisualSettings();
      saveSettings();
      tick();
    });

    el.toggleAmPm.addEventListener('change', (e) => {
      settings.showAmPm = e.target.checked;
      applyVisualSettings();
      saveSettings();
      tick();
    });

    el.toggleDate.addEventListener('change', (e) => {
      settings.showDate = e.target.checked;
      applyVisualSettings();
      saveSettings();
    });

    el.toggleTzBadge.addEventListener('change', (e) => {
      settings.showTzBadge = e.target.checked;
      applyVisualSettings();
      saveSettings();
    });

    el.toggleFlashingColon.addEventListener('change', (e) => {
      settings.flashingColon = e.target.checked;
      applyVisualSettings();
      saveSettings();
    });

    el.toggleTabTitle.addEventListener('change', (e) => {
      settings.showTabTitle = e.target.checked;
      saveSettings();
      tick();
    });

    el.toggleAutoHide.addEventListener('change', (e) => {
      settings.autoHideControls = e.target.checked;
      saveSettings();
      resetIdleTimer();
    });

    // Reset to defaults
    el.resetBtn.addEventListener('click', () => {
      if (confirm('Reset all TimeTab settings to defaults?')) {
        settings = { ...DEFAULT_SETTINGS };
        saveSettings();
        applyVisualSettings();
        setTimezone(settings.timezone);
        tick();
      }
    });
  }

  /**
   * Initialization
   */
  function init() {
    loadSettings();
    populateTimezoneList();
    renderThemePresets();
    applyVisualSettings();
    setupEvents();

    // Initial update of info
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    el.tzCurrentInfo.textContent = settings.timezone === 'local'
      ? `Current: Local Time (${detected})`
      : `Current: ${settings.timezone.replace(/_/g, ' ')}`;

    // Immediate tick
    tick();

    // High frequency interval (every 100ms) to ensure instant second transitions without skew
    setInterval(tick, 100);

    // Initial idle reset
    resetIdleTimer();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
