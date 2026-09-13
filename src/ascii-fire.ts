/**
 * Classic 1990s Demoscene Doom Fire in Retro ASCII
 */

export class AsciiFire {
  private container: HTMLElement | null = null;
  private intervalId: number | null = null;
  public isActive: boolean = false;
  private readonly width: number = 64;
  private readonly height: number = 24;
  private firePixels: number[] = [];
  private readonly chars: string = " .:-=+*#%@";

  constructor() {}

  public init(): void {
    this.container = document.getElementById('fire-overlay');
    if (!this.container) return;

    this.container.addEventListener('click', () => this.stop());
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.isActive && (e.key === 'Escape' || e.key === 'q')) {
        this.stop();
      }
    });
  }

  public start(): void {
    if (this.isActive || !this.container) return;
    this.isActive = true;
    this.container.classList.add('is-active');

    const total = this.width * this.height;
    this.firePixels = new Array(total).fill(0);

    // Seed bottom row with max heat
    for (let x = 0; x < this.width; x++) {
      this.firePixels[(this.height - 1) * this.width + x] = this.chars.length - 1;
    }

    this.intervalId = window.setInterval(() => this.update(), 45);
  }

  private update(): void {
    if (!this.isActive || !this.container) return;

    for (let x = 0; x < this.width; x++) {
      for (let y = 1; y < this.height; y++) {
        const srcIdx = y * this.width + x;
        const pixel = this.firePixels[srcIdx];

        if (pixel === 0) {
          this.firePixels[srcIdx - this.width] = 0;
        } else {
          const rand = Math.floor(Math.random() * 3);
          const dstIdx = (y - 1) * this.width + ((x - rand + 1 + this.width) % this.width);
          this.firePixels[dstIdx] = Math.max(0, pixel - (rand & 1));
        }
      }
    }

    // Render to text
    let output = "";
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const heat = this.firePixels[y * this.width + x];
        output += this.chars[Math.min(heat, this.chars.length - 1)];
      }
      output += "\n";
    }

    this.container.textContent = output + "\n[ FIRE DEMO RUNNING // CLICK OR ESC TO RETURN ]";
  }

  public stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.container) {
      this.container.classList.remove('is-active');
      this.container.textContent = '';
    }
  }
}

export const asciiFire = new AsciiFire();
