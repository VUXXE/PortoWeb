/**
 * Authentic Matrix Digital Rain Screensaver
 * Renders Japanese Katakana, hex, and Latin glyphs on the curved CRT canvas.
 */

export class MatrixScreensaver {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.isActive = false;
    this.characters = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF@#$%&*+-=";
    this.fontSize = 16;
    this.columns = 0;
    this.drops = [];
  }

  init() {
    this.canvas = document.getElementById('matrix-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => {
      if (this.isActive) this.resize();
    });

    // Exit on click or keypress
    this.canvas.addEventListener('click', () => this.stop());
    window.addEventListener('keydown', (e) => {
      if (this.isActive && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) {
        this.stop();
      }
    });
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -50);
    }
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.resize();
    this.canvas.classList.add('is-active');

    // Phosphor color detection
    const computedColor = getComputedStyle(document.body).getPropertyValue('--crt-color').trim() || '#33ff33';

    let lastTime = 0;
    const fps = 30;
    const frameInterval = 1000 / fps;

    const render = (time) => {
      if (!this.isActive) return;

      const delta = time - lastTime;
      if (delta > frameInterval) {
        lastTime = time - (delta % frameInterval);

        // Translucent black fade for phosphor trail
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.fontSize}px 'VT323', monospace`;

        for (let i = 0; i < this.drops.length; i++) {
          const char = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
          const x = i * this.fontSize;
          const y = this.drops[i] * this.fontSize;

          // Leading bright glyph (white/bright phosphor head)
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillText(char, x, y);

          // Second pass with phosphor color behind
          if (this.drops[i] > 1) {
            this.ctx.fillStyle = computedColor;
            const prevChar = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
            this.ctx.fillText(prevChar, x, y - this.fontSize);
          }

          if (y > this.canvas.height && Math.random() > 0.975) {
            this.drops[i] = 0;
          }
          this.drops[i]++;
        }
      }

      this.animId = requestAnimationFrame(render);
    };

    this.animId = requestAnimationFrame(render);
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    cancelAnimationFrame(this.animId);
    if (this.canvas) {
      this.canvas.classList.remove('is-active');
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
    return this.isActive;
  }
}

export const matrix = new MatrixScreensaver();
