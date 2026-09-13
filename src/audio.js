/**
 * Synthesized Web Audio Engine for Vintage CRT Computer Terminal
 * 100% self-contained audio synthesis — zero external sound files required!
 */

class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('portoweb_audio_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    } catch {
      this.muted = false;
    }
  }

  saveState() {
    try {
      localStorage.setItem('portoweb_audio_muted', String(this.muted));
    } catch {
      // ignore
    }
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.saveState();
    if (!this.muted) {
      this.ensureContext();
      this.playKeyClick(600);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  /**
   * Mechanical keyboard tactile click with pitch variation
   */
  playKeyClick(freqOffset = 0) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      
      // 1. Noise burst for key switch friction
      const bufferSize = this.ctx.sampleRate * 0.015; // 15ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1800 + (Math.random() * 600 - 300) + freqOffset;
      noiseFilter.Q.value = 3.5;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);

      // 2. Resonant key bottom-out clack
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sine";
      const baseFreq = 420 + (Math.random() * 80 - 40);
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.03);

      oscGain.gain.setValueAtTime(0.06, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Audio error fallback
    }
  }

  /**
   * Vintage terminal alert bell (\a) - 880Hz crystal tone
   */
  playBell() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(880, t); // A5 note

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    } catch {
      // Fallback
    }
  }

  /**
   * CRT Degauss coil discharge
   * Deep 60Hz magnetic surge followed by damped resonant coil ring
   */
  playDegauss() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // Heavy 60Hz transformer magnetic surge
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(75, t);
      osc.frequency.linearRampToValueAtTime(55, t + 0.8);
      osc.frequency.linearRampToValueAtTime(40, t + 1.2);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);

      // Spring / metallic coil wobble ping
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = "sine";
      ping.frequency.setValueAtTime(320, t + 0.05);
      ping.frequency.exponentialRampToValueAtTime(110, t + 0.9);

      pingGain.gain.setValueAtTime(0.12, t + 0.05);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      ping.start(t + 0.05);
      ping.stop(t + 0.95);

      // Relay disconnect snap at end
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const snapT = this.ctx.currentTime;
        const snapOsc = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snapOsc.type = "sawtooth";
        snapOsc.frequency.setValueAtTime(1400, snapT);
        snapGain.gain.setValueAtTime(0.15, snapT);
        snapGain.gain.exponentialRampToValueAtTime(0.001, snapT + 0.025);
        snapOsc.connect(snapGain);
        snapGain.connect(this.ctx.destination);
        snapOsc.start(snapT);
        snapOsc.stop(snapT + 0.03);
      }, 950);
    } catch {
      // Fallback
    }
  }

  /**
   * CRT High Voltage Power-Up capacitor charge
   */
  playPowerOn() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      
      // Low capacitor charge surge
      const lowOsc = this.ctx.createOscillator();
      const lowGain = this.ctx.createGain();
      lowOsc.type = "sine";
      lowOsc.frequency.setValueAtTime(120, t);
      lowOsc.frequency.exponentialRampToValueAtTime(60, t + 0.4);

      lowGain.gain.setValueAtTime(0.2, t);
      lowGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      lowOsc.connect(lowGain);
      lowGain.connect(this.ctx.destination);
      lowOsc.start(t);
      lowOsc.stop(t + 0.5);

      // Subtle high-voltage flyback transformer charge sweep (very quiet & pleasant)
      const flyback = this.ctx.createOscillator();
      const flybackGain = this.ctx.createGain();
      flyback.type = "sine";
      flyback.frequency.setValueAtTime(2500, t + 0.1);
      flyback.frequency.exponentialRampToValueAtTime(12000, t + 0.7);

      flybackGain.gain.setValueAtTime(0.015, t + 0.1);
      flybackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      flyback.connect(flybackGain);
      flybackGain.connect(this.ctx.destination);
      flyback.start(t + 0.1);
      flyback.stop(t + 0.8);
    } catch {
      // Fallback
    }
  }

  /**
   * CRT Power Switch Click
   */
  playPowerSwitch() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Fallback
    }
  }
}

export const audio = new RetroAudioEngine();
