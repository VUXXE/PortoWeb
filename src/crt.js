/**
 * CRT Screen FX & Barrel Distortion Engine
 * Manages optical curvature via SVG displacement mapping, 
 * glass reflections, scanlines, degaussing, and power cycling.
 */

import { audio } from './audio.js';

export class CRTEngine {
  constructor() {
    this.screenElement = null;
    this.contentElement = null;
    this.barrelFeImage = null;
    this.barrelDisplacement = null;
    this.powerLed = null;

    // Curvature presets: [name, k-factor, svg-scale, border-radius-x, border-radius-y]
    this.curvatureLevels = [
      { id: 'flat', label: 'FLAT', k: 0, scale: 0, brX: 12, brY: 12 },
      { id: 'subtle', label: 'SUBTLE', k: 0.15, scale: 12, brX: 24, brY: 18 },
      { id: 'authentic', label: 'AUTHENTIC', k: 0.28, scale: 24, brX: 38, brY: 26 },
      { id: 'heavy', label: 'HEAVY', k: 0.42, scale: 38, brX: 52, brY: 34 }
    ];
    this.currentCurvatureIndex = 2; // Default: Authentic

    this.themes = ['green', 'amber', 'white', 'cyber'];
    this.currentThemeIndex = 0; // Default: Green Phosphor

    this.isPoweredOn = true;
    this.scanlinesEnabled = true;
    this.flickerEnabled = true;
  }

  init() {
    this.screenElement = document.getElementById('crt-screen');
    this.contentElement = document.getElementById('crt-content');
    this.barrelFeImage = document.getElementById('barrel-map-img');
    this.barrelDisplacement = document.getElementById('barrel-displacement');
    this.powerLed = document.getElementById('power-led');

    // Load saved preferences
    this.loadPreferences();

    // Generate barrel displacement map
    this.generateBarrelMap();
    this.applyCurvature();
    this.applyTheme();
    this.applyScanlines();

    // Bind controls
    this.bindHardwareControls();
  }

  loadPreferences() {
    try {
      const savedTheme = localStorage.getItem('portoweb_crt_theme');
      if (savedTheme && this.themes.includes(savedTheme)) {
        this.currentThemeIndex = this.themes.indexOf(savedTheme);
      }

      const savedCurvature = localStorage.getItem('portoweb_crt_curvature');
      if (savedCurvature !== null) {
        const idx = parseInt(savedCurvature, 10);
        if (!isNaN(idx) && idx >= 0 && idx < this.curvatureLevels.length) {
          this.currentCurvatureIndex = idx;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  savePreferences() {
    try {
      localStorage.setItem('portoweb_crt_theme', this.themes[this.currentThemeIndex]);
      localStorage.setItem('portoweb_crt_curvature', String(this.currentCurvatureIndex));
    } catch {
      // Ignore
    }
  }

  /**
   * Generates a 256x256 spherical barrel displacement map in memory.
   * Red channel = X displacement from center.
   * Green channel = Y displacement from center.
   */
  generateBarrelMap() {
    if (!this.barrelFeImage) return;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    const cx = size / 2;
    const cy = size / 2;
    const k = this.curvatureLevels[this.currentCurvatureIndex].k;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = (x - cx) / cx;
        const v = (y - cy) / cy;
        const r2 = u * u + v * v;

        // Optical spherical barrel distortion displacement:
        // Center pushes outward to create convex bubble glass
        const dx = u * r2 * k;
        const dy = v * r2 * k;

        data[idx] = Math.min(255, Math.max(0, Math.round(128 + dx * 127)));     // R (X offset)
        data[idx + 1] = Math.min(255, Math.max(0, Math.round(128 + dy * 127))); // G (Y offset)
        data[idx + 2] = 128; // B neutral
        data[idx + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    this.barrelFeImage.setAttribute('href', dataUrl);
    this.barrelFeImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl);
  }

  /**
   * Apply current barrel curvature and convex geometry
   */
  applyCurvature() {
    const config = this.curvatureLevels[this.currentCurvatureIndex];

    if (this.barrelDisplacement) {
      this.barrelDisplacement.setAttribute('scale', String(config.scale));
    }

    if (this.screenElement) {
      // Curved CRT tube convex border radii
      this.screenElement.style.borderRadius = `${config.brX}px / ${config.brY}px`;
      
      if (config.scale > 0) {
        this.screenElement.classList.add('has-barrel');
      } else {
        this.screenElement.classList.remove('has-barrel');
      }
    }

    if (this.contentElement) {
      this.contentElement.style.filter = 'none';
      void this.contentElement.offsetWidth;
      this.contentElement.style.filter = '';
    }

    // Update UI indicator
    const curvatureLabel = document.getElementById('status-curvature');
    if (curvatureLabel) {
      curvatureLabel.textContent = config.label;
    }

    this.savePreferences();
  }

  cycleCurvature() {
    this.currentCurvatureIndex = (this.currentCurvatureIndex + 1) % this.curvatureLevels.length;
    this.generateBarrelMap();
    this.applyCurvature();
    audio.playKeyClick(300);
    return this.curvatureLevels[this.currentCurvatureIndex];
  }

  setCurvatureByName(name) {
    const idx = this.curvatureLevels.findIndex(c => c.id === name.toLowerCase());
    if (idx !== -1) {
      this.currentCurvatureIndex = idx;
      this.generateBarrelMap();
      this.applyCurvature();
      return true;
    }
    return false;
  }

  /**
   * Cycle phosphor themes: P1 Green -> P3 Amber -> P4 White -> Cyberpunk
   */
  cycleTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    this.applyTheme();
    audio.playKeyClick(400);
    return this.themes[this.currentThemeIndex];
  }

  setTheme(themeName) {
    const idx = this.themes.indexOf(themeName.toLowerCase());
    if (idx !== -1) {
      this.currentThemeIndex = idx;
      this.applyTheme();
      return true;
    }
    return false;
  }

  applyTheme() {
    const theme = this.themes[this.currentThemeIndex];
    document.body.classList.remove('theme-green', 'theme-amber', 'theme-white', 'theme-cyber');
    document.body.classList.add(`theme-${theme}`);

    const themeLabel = document.getElementById('status-theme');
    if (themeLabel) {
      themeLabel.textContent = theme.toUpperCase();
    }

    this.savePreferences();
  }

  /**
   * Toggle scanlines on/off
   */
  toggleScanlines() {
    this.scanlinesEnabled = !this.scanlinesEnabled;
    this.applyScanlines();
    audio.playKeyClick(250);
    return this.scanlinesEnabled;
  }

  applyScanlines() {
    if (!this.screenElement) return;
    if (this.scanlinesEnabled) {
      this.screenElement.classList.add('scanlines-active');
    } else {
      this.screenElement.classList.remove('scanlines-active');
    }
  }

  /**
   * Classic CRT magnetic degauss effect
   */
  degauss() {
    if (!this.isPoweredOn || !this.screenElement) return;

    audio.playDegauss();
    
    // Add violent electromagnetic coil vibration and chromatic flash
    this.screenElement.classList.remove('is-degaussing');
    void this.screenElement.offsetWidth; // Force reflow
    this.screenElement.classList.add('is-degaussing');

    setTimeout(() => {
      if (this.screenElement) {
        this.screenElement.classList.remove('is-degaussing');
      }
    }, 1200);
  }

  /**
   * Toggle CRT Power Switch with classic horizontal-line-and-dot collapse
   */
  togglePower() {
    this.isPoweredOn = !this.isPoweredOn;
    audio.playPowerSwitch();

    if (this.screenElement) {
      if (this.isPoweredOn) {
        audio.playPowerOn();
        this.screenElement.classList.remove('crt-power-off');
        this.screenElement.classList.add('crt-power-on');
        if (this.powerLed) {
          this.powerLed.classList.add('led-active');
        }
        setTimeout(() => {
          this.screenElement.classList.remove('crt-power-on');
        }, 1000);
      } else {
        this.screenElement.classList.add('crt-power-off');
        if (this.powerLed) {
          this.powerLed.classList.remove('led-active');
        }
      }
    }

    return this.isPoweredOn;
  }

  bindHardwareControls() {
    // Bezel hardware buttons
    const btnPower = document.getElementById('btn-power');
    if (btnPower) {
      btnPower.addEventListener('click', () => this.togglePower());
    }

    const btnDegauss = document.getElementById('btn-degauss');
    if (btnDegauss) {
      btnDegauss.addEventListener('click', () => this.degauss());
    }

    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => this.cycleTheme());
    }

    const btnCurvature = document.getElementById('btn-curvature');
    if (btnCurvature) {
      btnCurvature.addEventListener('click', () => this.cycleCurvature());
    }

    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const muted = audio.toggleMute();
        btnAudio.classList.toggle('control-active', !muted);
        const audioLabel = document.getElementById('status-audio');
        if (audioLabel) {
          audioLabel.textContent = muted ? 'MUTED' : 'ON';
        }
      });
      // Initial state
      btnAudio.classList.toggle('control-active', !audio.isMuted());
      const audioLabel = document.getElementById('status-audio');
      if (audioLabel) {
        audioLabel.textContent = audio.isMuted() ? 'MUTED' : 'ON';
      }
    }

    // Window control dots
    const dotClose = document.getElementById('dot-close');
    if (dotClose) {
      dotClose.addEventListener('click', () => this.togglePower());
    }

    const dotDegauss = document.getElementById('dot-degauss');
    if (dotDegauss) {
      dotDegauss.addEventListener('click', () => this.degauss());
    }

    const dotCurvature = document.getElementById('dot-curvature');
    if (dotCurvature) {
      dotCurvature.addEventListener('click', () => this.cycleCurvature());
    }
  }
}

export const crt = new CRTEngine();
