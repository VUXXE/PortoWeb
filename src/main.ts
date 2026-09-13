/**
 * Main Application Bootstrap (TypeScript)
 */

import { crt } from './crt.js';
import { terminal } from './terminal.js';
import { matrix } from './matrix.js';
import { asciiFire } from './ascii-fire.js';
import { audio } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize CRT Screen Engine (optical barrel distortion, curvature, themes, scanlines)
  crt.init();

  // 2. Initialize Screensavers (Matrix & ASCII Fire)
  matrix.init();
  asciiFire.init();

  // 3. Initialize Terminal Shell
  terminal.init();

  // 4. Global audio unlock on first user click or keypress
  const unlockAudio = (): void => {
    audio.ensureContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
});
