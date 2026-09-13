/**
 * CRT Screen FX & Barrel Distortion Engine
 * Manages optical curvature via SVG displacement mapping, 
 * glass reflections, scanlines, degaussing, and power cycling.
 */

import { audio } from './audio.js';
import type { CurvaturePreset, PhosphorTheme, FontMode } from './types.js';

export class CRTEngine {
  private screenElement: HTMLElement | null = null;
  private contentElement: HTMLElement | null = null;
  private barrelFeImage: SVGElement | null = null;
  private barrelDisplacement: SVGElement | null = null;
  private powerLed: HTMLElement | null = null;

  // Curvature presets: [id, label, k-factor, svg-scale, border-radius-x, border-radius-y]
  public readonly curvatureLevels: CurvaturePreset[] = [
    { id: 'flat', label: 'FLAT', k: 0, scale: 0, brX: 10, brY: 10 },
    { id: 'subtle', label: 'SUBTLE', k: 0.25, scale: 5, brX: 20, brY: 16 },
    { id: 'authentic', label: 'AUTHENTIC', k: 0.45, scale: 8, brX: 36, brY: 26 },
    { id: 'heavy', label: 'HEAVY', k: 0.70, scale: 12, brX: 50, brY: 36 }
  ];
  public currentCurvatureIndex: number = 2; // Default: Authentic

  public readonly themes: PhosphorTheme[] = ['green', 'amber', 'white', 'cyber'];
  public currentThemeIndex: number = 0; // Default: Green Phosphor

  public readonly fonts: FontMode[] = ['pixel', 'clean'];
  public currentFontIndex: number = 0; // Default: Pixel 80s (DEC VT220 / VT323)

  public isPoweredOn: boolean = true;
  public scanlinesEnabled: boolean = false; // Disabled by default for maximum readability & a11y

  constructor() {}

  public init(): void {
    this.screenElement = document.getElementById('crt-screen');
    this.contentElement = document.getElementById('crt-content');
    this.barrelFeImage = document.getElementById('barrel-map-img') as unknown as SVGElement;
    this.barrelDisplacement = document.getElementById('barrel-displacement') as unknown as SVGElement;
    this.powerLed = document.getElementById('power-led');

    // Load saved preferences
    this.loadPreferences();

    // Generate barrel displacement map
    this.generateBarrelMap();
    this.applyCurvature();
    this.applyTheme();
    this.applyFont();
    this.applyScanlines();

    // Bind controls
    this.bindHardwareControls();
  }

  private loadPreferences(): void {
    try {
      const savedTheme = localStorage.getItem('portoweb_crt_theme') as PhosphorTheme;
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

      const savedFont = localStorage.getItem('portoweb_crt_font') as FontMode;
      if (savedFont && this.fonts.includes(savedFont)) {
        this.currentFontIndex = this.fonts.indexOf(savedFont);
      }

      const savedScanlines = localStorage.getItem('portoweb_crt_scanlines');
      if (savedScanlines !== null) {
        this.scanlinesEnabled = savedScanlines === 'true';
      }
    } catch {
      // Ignore storage errors
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('portoweb_crt_theme', this.themes[this.currentThemeIndex]);
      localStorage.setItem('portoweb_crt_curvature', String(this.currentCurvatureIndex));
      localStorage.setItem('portoweb_crt_font', this.fonts[this.currentFontIndex]);
      localStorage.setItem('portoweb_crt_scanlines', String(this.scanlinesEnabled));
    } catch {
      // Ignore
    }
  }

  /**
   * Generates a 512x512 spherical lens barrel displacement map in memory.
   * Utilizes atan damping, anamorphic 16:9 aspect correction, and a Hermite edge attenuation window
   * that smoothly drops displacement to identically 0 at all screen boundaries (u, v = ±1.0).
   * This permanently eliminates edge wrapping, bottom ghosting, and line severing.
   */
  public generateBarrelMap(): void {
    if (!this.barrelFeImage) return;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    const cx = size / 2;
    const cy = size / 2;
    const k = this.curvatureLevels[this.currentCurvatureIndex].k;
    const kMul = k * 1.5;

    // Boundary attenuation function:
    // Keeps authentic barrel curvature over the central viewing area (0 to 65%),
    // and smoothly drops displacement to identically 0 at outer edges (u, v = ±1.0)
    // using smooth Hermite interpolation. This guarantees zero out-of-bounds sampling,
    // zero edge wrapping, zero bottom ghosting, and unbroken continuous borders.
    const edgeWeight = (val: number): number => {
      const a = Math.abs(val);
      if (a <= 0.65) return 1.0;
      if (a >= 0.98) return 0.0;
      const t = (a - 0.65) / (0.98 - 0.65);
      return 1.0 - t * t * (3 - 2 * t);
    };

    for (let y = 0; y < size; y++) {
      const v = (y - cy) / cy;
      const v2 = v * v;
      const yOffset = y * size;
      const edgeY = edgeWeight(v);

      for (let x = 0; x < size; x++) {
        const idx = (yOffset + x) << 2;

        if (k === 0) {
          data[idx] = 128;
          data[idx + 1] = 128;
          data[idx + 2] = 128;
          data[idx + 3] = 255;
          continue;
        }

        const u = (x - cx) / cx;
        const edgeX = edgeWeight(u);
        const edgeFade = edgeX * edgeY;

        // Anamorphic aspect ratio scaling:
        // Screens are wider than tall (16:9). Scaling v2 and dy by 0.6 prevents
        // excessive vertical gradient, keeping horizontal borders smooth and continuous.
        const r2 = u * u + v2 * 0.6;

        // Smooth spherical lens projection with atan damping and edge fade
        const curve = (Math.atan(r2 * kMul) / (1.5 * (1 + r2 * 0.15))) * edgeFade;
        const dx = u * curve;
        const dy = v * curve * 0.6;

        data[idx] = Math.min(255, Math.max(0, (128 + dx * 127 + 0.5) | 0));     // R (X offset)
        data[idx + 1] = Math.min(255, Math.max(0, (128 + dy * 127 + 0.5) | 0)); // G (Y offset)
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
  public applyCurvature(): void {
    const config = this.curvatureLevels[this.currentCurvatureIndex];

    if (this.barrelDisplacement) {
      this.barrelDisplacement.setAttribute('scale', String(config.scale));
    }

    if (this.screenElement) {
      // Curved CRT tube convex border radii
      this.screenElement.style.borderRadius = `${config.brX}px / ${config.brY}px`;
      
      this.screenElement.classList.remove('has-barrel', 'curvature-subtle', 'curvature-authentic', 'curvature-heavy');
      if (config.scale > 0) {
        this.screenElement.classList.add('has-barrel', `curvature-${config.id}`);
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

  public cycleCurvature(): CurvaturePreset {
    this.currentCurvatureIndex = (this.currentCurvatureIndex + 1) % this.curvatureLevels.length;
    this.generateBarrelMap();
    this.applyCurvature();
    audio.playKeyClick(300);
    return this.curvatureLevels[this.currentCurvatureIndex];
  }

  public setCurvatureByName(name: string): boolean {
    const idx = this.curvatureLevels.findIndex(c => c.id === name.toLowerCase());
    if (idx !== -1) {
      this.currentCurvatureIndex = idx;
      this.generateBarrelMap();
      this.applyCurvature();
      return true;
    }
    return false;
  }

  public cycleTheme(): PhosphorTheme {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    this.applyTheme();
    audio.playKeyClick(400);
    return this.themes[this.currentThemeIndex];
  }

  public setTheme(themeName: string): boolean {
    const idx = this.themes.indexOf(themeName.toLowerCase() as PhosphorTheme);
    if (idx !== -1) {
      this.currentThemeIndex = idx;
      this.applyTheme();
      return true;
    }
    return false;
  }

  public applyTheme(): void {
    const theme = this.themes[this.currentThemeIndex];
    document.body.classList.remove('theme-green', 'theme-amber', 'theme-white', 'theme-cyber');
    document.body.classList.add(`theme-${theme}`);

    const themeLabel = document.getElementById('status-theme');
    if (themeLabel) {
      themeLabel.textContent = theme.toUpperCase();
    }

    this.savePreferences();
  }

  public cycleFont(): FontMode {
    this.currentFontIndex = (this.currentFontIndex + 1) % this.fonts.length;
    this.applyFont();
    audio.playKeyClick(350);
    return this.fonts[this.currentFontIndex];
  }

  public setFont(name: string): boolean {
    const idx = this.fonts.indexOf(name.toLowerCase() as FontMode);
    if (idx !== -1) {
      this.currentFontIndex = idx;
      this.applyFont();
      audio.playKeyClick(350);
      return true;
    }
    return false;
  }

  public applyFont(): void {
    const font = this.fonts[this.currentFontIndex];
    document.body.classList.remove('font-pixel', 'font-clean');
    document.body.classList.add(`font-${font}`);

    const fontLabel = document.getElementById('status-font');
    if (fontLabel) {
      fontLabel.textContent = font === 'pixel' ? 'PIXEL 80s' : 'CLEAN MONO';
    }

    this.savePreferences();
  }

  public toggleScanlines(): boolean {
    this.scanlinesEnabled = !this.scanlinesEnabled;
    this.applyScanlines();
    audio.playKeyClick(250);
    return this.scanlinesEnabled;
  }

  public applyScanlines(): void {
    if (!this.screenElement) return;
    if (this.scanlinesEnabled) {
      this.screenElement.classList.add('scanlines-active');
    } else {
      this.screenElement.classList.remove('scanlines-active');
    }

    const label = document.getElementById('status-scanlines');
    if (label) {
      label.textContent = this.scanlinesEnabled ? 'ON' : 'OFF';
    }

    const btn = document.getElementById('btn-scanlines');
    if (btn) {
      btn.classList.toggle('control-active', this.scanlinesEnabled);
    }

    this.savePreferences();
  }

  public degauss(): void {
    if (!this.isPoweredOn || !this.screenElement) return;

    audio.playDegauss();
    
    this.screenElement.classList.remove('is-degaussing');
    void this.screenElement.offsetWidth;
    this.screenElement.classList.add('is-degaussing');

    setTimeout(() => {
      if (this.screenElement) {
        this.screenElement.classList.remove('is-degaussing');
      }
    }, 1200);
  }

  public togglePower(): boolean {
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
          if (this.screenElement) {
            this.screenElement.classList.remove('crt-power-on');
          }
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

  private bindHardwareControls(): void {
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

    const btnFont = document.getElementById('btn-font');
    if (btnFont) {
      btnFont.addEventListener('click', () => this.cycleFont());
    }

    const btnCurvature = document.getElementById('btn-curvature');
    if (btnCurvature) {
      btnCurvature.addEventListener('click', () => this.cycleCurvature());
    }

    const btnScanlines = document.getElementById('btn-scanlines');
    if (btnScanlines) {
      btnScanlines.addEventListener('click', () => this.toggleScanlines());
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
      btnAudio.classList.toggle('control-active', !audio.isMuted());
      const audioLabel = document.getElementById('status-audio');
      if (audioLabel) {
        audioLabel.textContent = audio.isMuted() ? 'MUTED' : 'ON';
      }
    }
  }
}

export const crt = new CRTEngine();
