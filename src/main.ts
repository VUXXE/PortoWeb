/**
 * Main Application Bootstrap (TypeScript)
 */

import { crt } from './crt.js';
import { terminal } from './terminal.js';
import { matrix } from './matrix.js';
import { asciiFire } from './ascii-fire.js';
import { audio } from './audio.js';

const bootstrap = (): void => {
  try {
    // 1. Initialize CRT Screen Engine (curvature, themes, scanlines)
    crt.init();
  } catch (err) {
    console.error('Failed to init CRT engine:', err);
  }

  try {
    // 2. Initialize Screensavers (Matrix & ASCII Fire)
    matrix.init();
    asciiFire.init();
  } catch (err) {
    console.error('Failed to init screensavers:', err);
  }

  try {
    // 3. Initialize Terminal Shell
    terminal.init();
  } catch (err) {
    console.error('Failed to init terminal shell:', err);
  }

  // 4. Global audio unlock on first user click or keypress
  const unlockAudio = (): void => {
    try {
      audio.ensureContext();
    } catch {
      // Audio context might be restricted
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
