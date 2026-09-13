/**
 * Authentic Matrix Digital Rain Screensaver
 * Renders Japanese Katakana, hex, and Latin glyphs on the curved CRT canvas.
 */

export class MatrixScreensaver {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  public isActive: boolean = false;
  private readonly characters: string = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF@#$%&*+-=";
  private readonly fontSize: number = 16;
  private columns: number = 0;
  private drops: number[] = [];

  constructor() {}

  public init(): void {
    this.canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => {
      if (this.isActive) this.resize();
    });

    // Exit on click or keypress
    this.canvas.addEventListener('click', () => this.stop());
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.isActive && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) {
        this.stop();
      }
    });
  }

  public resize(): void {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -50);
    }
  }

  public start(): void {
    if (this.isActive || !this.canvas || !this.ctx) return;
    this.isActive = true;
    this.resize();
    this.canvas.classList.add('is-active');

    // Phosphor color detection
    const computedColor = getComputedStyle(document.body).getPropertyValue('--crt-color').trim() || '#33ff33';

    let lastTime = 0;
    const fps = 30;
    const frameInterval = 1000 / fps;

    const render = (time: number) => {
      if (!this.isActive || !this.ctx || !this.canvas) return;

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

  public stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.canvas) {
      this.canvas.classList.remove('is-active');
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }
}

export const matrix = new MatrixScreensaver();
