/**
 * Retro CRT Pure CLI Terminal Controller
 * Pure Interactive UNIX Shell Experience with Full Click-and-Type Parity
 */

import { PORTFOLIO_DATA } from './data.js';
import { audio } from './audio.js';
import { crt } from './crt.js';
import { matrix } from './matrix.js';
import { asciiFire } from './ascii-fire.js';
import type { CommandDefinition, Project } from './types.js';

export interface VirtualDir {
  files: Record<string, string>;
  dirs: Record<string, VirtualDir>;
}

export class Terminal {
  private outputBuffer: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private promptLine: HTMLElement | null = null;
  private promptPathEl: HTMLElement | null = null;
  private textBeforeEl: HTMLElement | null = null;
  private cursorEl: HTMLElement | null = null;
  private textAfterEl: HTMLElement | null = null;
  private ghostHintEl: HTMLElement | null = null;
  private statusClockEl: HTMLElement | null = null;
  private statusCwdEl: HTMLElement | null = null;

  private readonly promptUser: string = "guest";
  private readonly promptHost: string = PORTFOLIO_DATA.profile.host;

  private history: string[] = [];
  private historyIndex: number = -1;
  private currentGhostSuggestion: string = '';
  private currentPath: string[] = [];

  public get currentDirDisplay(): string {
    return this.currentPath.length === 0 ? '~' : '~/' + this.currentPath.join('/');
  }

  private readonly virtualFs: VirtualDir = {
    dirs: {
      projects: {
        dirs: {},
        files: {
          '01_mesh.txt': `PROJECT: MESH // Decentralized Real-Time Collaborative Canvas\nCategory: Distributed Systems / WebSockets / CRDT (2026)\nTags    : SvelteKit (Svelte 5 Runes), Cloudflare Workers, Durable Objects, D1, WebSockets, LWW CRDT\nLive App: https://mesh.asy.web.id/\nGitHub  : https://github.com/VUXXE/Mesh\n\nHigh-performance real-time collaborative whiteboard canvas.\n- Microsecond multi-cursor tracking and distributed state synchronization.\n- In-memory WebSocket broadcast tree with D1 transactional persistence.\n- Last-Write-Wins (LWW) conflict-resolution heuristics.`,
          '02_whatsapp_tauri.txt': `PROJECT: WHATSAPP-TAURI // Native WhatsApp Desktop Client\nCategory: Desktop / Systems / Rust (2026)\nTags    : Rust, Tauri v2, Webview, Linux/Windows/macOS\nGitHub  : https://github.com/VUXXE/whatsapp-tauri\nReleases: https://github.com/VUXXE/whatsapp-tauri/releases\n\nUltra-lightweight native WhatsApp desktop application built with Tauri v2 and Rust.\n- 30x smaller binary footprint (~5.7MB vs Electron ~180MB).\n- ~120MB baseline RAM usage with 0% idle background CPU load.\n- Native OS daemon notifications (libnotify on Linux, Windows Toast, macOS NSUserNotificationCenter).`,
          '03_rakamin_evermos.txt': `PROJECT: RAKAMIN-EVERMOS // Clean Architecture E-Commerce API\nCategory: Backend / Microservices / Go (2026)\nTags    : Go (1.25+), Fiber v2, MySQL 8.0, GORM, Docker, JWT\nGitHub  : https://github.com/VUXXE/Rakamim-Evermost\n\nProduction-ready scalable e-commerce RESTful API in Go adhering to Clean Architecture.\n- Strict multi-tenant domain boundaries and dependency inversion.\n- Pessimistic row-locking (SELECT FOR UPDATE) checkout transactions eliminating race conditions.\n- JWT auth, RBAC middleware, and regional administrative lookup caching with 100% test coverage.`,
          '04_perpustakaan_freedom.txt': `PROJECT: PERPUSTAKAAN-FREEDOM // Desktop Library Management System\nCategory: Desktop / Java / Systems (2026)\nTags    : Java 21, Java Swing, FlatLaf, MySQL 8.0, HikariCP, JasperReports, BCrypt\nGitHub  : https://github.com/VUXXE/PerpustakaanFreedomFix\n\nModern desktop library management system (UNINDRA Group Project).\n- Automated circulation, tiered fine calculation, and BCrypt security.\n- HikariCP high-performance connection pooling, JasperReports PDF generation, and JFreeChart analytics.\n- Offline-ready Maven build with local repository dependencies.`,
          '05_baswara.txt': `PROJECT: BASWARA // Digital Invitation Platform (Cloudflare Edition)\nCategory: Full-Stack / Cloudflare / React (2026)\nTags    : TypeScript, TanStack Start (React 19), Cloudflare Workers, D1, R2, Drizzle ORM, Better Auth\nLive App: https://baswara.bdrrhmnhnn.workers.dev\nGitHub  : https://github.com/VUXXE/baswara-cloudflare\n\nDigital invitation platform built 100% on Cloudflare Workers edge architecture.\n- Visual layout builder, RSVP tracking, and QR guest check-in.\n- Better Auth sessions in D1, R2 asset storage, and dynamic OG image generation.`,
          '06_whatsapp_bridge.txt': `PROJECT: WHATSAPP-BRIDGE-CUSTOM // Baileys Group Management API\nCategory: API / Gateway / Bot (2026)\nTags    : Node.js 20+, Baileys v6, REST, WhatsApp Web Protocol\nGitHub  : https://github.com/VUXXE/whatsapp-bridge-custom\n\nExtended Baileys WhatsApp automation bridge with hardened REST endpoints.\n- Custom group management: invite links, create group, add members, promote, update descriptions.\n- Hardened media/poll/location/edit endpoints with allowlist-based access control.`
        }
      },
      skills: {
        dirs: {},
        files: {
          'languages.txt': `PROGRAMMING LANGUAGES:\n- Go          [CORE]   3+ yrs  : Microservices, REST APIs, high-throughput workers, Clean Architecture\n- Rust        [CORE]   2+ yrs  : Desktop apps (Tauri v2), systems tooling, low-level concurrency\n- TypeScript  [CORE]   3+ yrs  : TanStack Start, React 19, Cloudflare Workers, full-stack SPAs\n- JavaScript  [CORE]   4+ yrs  : Modern ES2024+, Node.js runtime, Baileys API integration\n- Java        [SYSTEM] 2+ yrs  : Desktop Swing (FlatLaf), OOP architecture, Maven, HikariCP\n- Python      [TOOLING]2+ yrs  : Automation scripts, CLI tooling, data extraction\n- SQL         [DATA]   3+ yrs  : MySQL 8.0, PostgreSQL, SQLite, Cloudflare D1\n- HTML5 / CSS [UI]     4+ yrs  : Retro CRT graphics, responsive UI, CSS custom properties`,
          'frameworks.txt': `FRAMEWORKS & RUNTIMES:\n- React 19 / TanStack Start : Modern edge SSR, Server Functions, high-reactivity UIs\n- Next.js (App Router)      : Full-stack applications, API routes, Server Components\n- SvelteKit (Svelte 5 Runes): Local-first apps, reactive canvas, WebSocket sync\n- Go Fiber v2               : Low-latency REST microservices, middleware pipelines\n- GORM & Drizzle ORM        : Type-safe database queries, schema migrations\n- Tauri v2                  : Ultra-lightweight native cross-platform desktop shells\n- FlatLaf (Java Swing)      : Modern desktop enterprise interfaces`,
          'databases.txt': `DATABASES & STORAGE:\n- Cloudflare D1             : Globally distributed SQLite at the edge\n- Cloudflare R2             : S3-compatible zero-egress blob storage\n- MySQL 8.0                 : ACID relational database, pessimistic locking, index optimization\n- PostgreSQL                : Enterprise relational storage, JSONB indexing, triggers\n- HikariCP                  : High-performance JDBC connection pooling`,
          'cloud_infra.txt': `CLOUD & INFRASTRUCTURE:\n- Cloudflare Workers        : V8 isolate serverless edge computing\n- Cloudflare Durable Objects: Stateful real-time WebSocket coordination\n- Docker & Docker Compose   : Containerized service orchestration\n- Linux (Arch / CachyOS)    : Kernel optimization, shell scripting, POSIX system administration\n- Git & GitHub Actions      : CI/CD automation pipelines, releases, semantic versioning\n- Oracle Cloud (OCI)        : Cloud compute instances, networking, security rules`,
          'concepts.txt': `SYSTEM CONCEPTS & ARCHITECTURE:\n- Clean Architecture        : Strict domain boundaries, dependency inversion, use-case decoupling\n- Local-First & CRDT        : Last-Write-Wins (LWW) real-time state synchronization\n- Real-Time WebSockets      : Bi-directional event streams, heartbeat, backpressure\n- Edge Computing            : Sub-millisecond TTFB via globally distributed serverless isolates\n- Authentication & Security : Better Auth, JWT tokens, RBAC middleware, BCrypt hashing`
        }
      },
      education: {
        dirs: {},
        files: {
          'unindra.txt': `INSTITUTION: Universitas Indraprasta PGRI (UNINDRA)\nLocation   : Jakarta, Indonesia\nDegree     : Bachelor of Science in Informatics Engineering (Teknik Informatika)\nGPA        : 3.49 / 4.00\nPeriod     : 2023 - Present (Expected Graduation: 2027)`,
          'coursework.txt': `FORMAL ACADEMIC COURSEWORK:\n* Data Structures & Algorithms\n* Database Systems & Design\n* Operating Systems Architecture\n* Computer Networks & Protocols\n* Computer Architecture & Organization\n* Compiler Design & Automata\n* Object-Oriented Programming & Design Patterns`
        }
      }
    },
    files: {
      'bio.txt': `${PORTFOLIO_DATA.profile.name}\n${PORTFOLIO_DATA.profile.title}\nLocation: ${PORTFOLIO_DATA.profile.location}\nPhone: ${PORTFOLIO_DATA.profile.phone}\nEmail: hanan7taqiyya@gmail.com\nStatus: ${PORTFOLIO_DATA.profile.status}\n\n` + PORTFOLIO_DATA.profile.bio.join('\n\n'),
      'education.txt': PORTFOLIO_DATA.education.map(e =>
        `Institution: ${e.institution} (${e.location})\nDegree     : ${e.degree}\nGPA        : ${e.gpa}\nPeriod     : ${e.period}\nCoursework : ${e.coursework.join(', ')}`
      ).join('\n\n'),
      'skills.txt': PORTFOLIO_DATA.skills.map(s => 
        `[ ${s.category} ]\n` + s.items.map(i => `  * ${i.name.padEnd(25)} [${i.tier}] ${i.exp.padEnd(7)} : ${i.focus}`).join('\n')
      ).join('\n\n'),
      'projects.txt': PORTFOLIO_DATA.projects.map(p =>
        `[${p.num}] ${p.title} (${p.year}) - ${p.category}\n    ${p.description}\n    Tags: ${p.tags.join(', ')}\n    URL: ${p.links.github}`
      ).join('\n\n'),
      'experience.txt': PORTFOLIO_DATA.experience.map(e =>
        `[ ${e.period} ] ${e.role} @ ${e.company}\n  ${e.description}`
      ).join('\n\n'),
      'contact.txt': PORTFOLIO_DATA.socials.map(s => 
        `${s.name.padEnd(16)} : ${s.handle} (${s.url})`
      ).join('\n'),
      'github.txt': `GITHUB PROFILES & REPOSITORIES:\nDeveloper Profile : https://github.com/VUXXE (@VUXXE)\nPortfolio Source  : https://github.com/VUXXE/asydev-os\n\nFEATURED REPOSITORIES:\n* VUXXE/mesh-core-v2         - P2P sync canvas desktop & web app (Rust, Tauri v2, Svelte 5)\n* VUXXE/baswara-cloudflare   - Digital invitation platform on Cloudflare Workers, D1 & R2\n* VUXXE/whatsapp-bridge-custom - Baileys automation REST API bridge\n* VUXXE/PerpustakaanFreedomFix - Java 21 desktop enterprise library management system\n* VUXXE/cachy-dotfiles       - CachyOS/Arch Linux dotfiles and tiling window manager configs\n* VUXXE/asydev-os            - Retro CRT Model 84 Terminal Portfolio (TypeScript, Vite)\n\nType "github" for interactive list or open directly in your browser.`,
      'resume.txt': `${PORTFOLIO_DATA.profile.name.toUpperCase()}\n${PORTFOLIO_DATA.profile.title}\nLocation: ${PORTFOLIO_DATA.profile.location}\nPhone: ${PORTFOLIO_DATA.profile.phone}\nEmail: hanan7taqiyya@gmail.com\n\nType "resume" for full interactive layout or download official PDF via /cv.pdf.`,
      'logo.svg': PORTFOLIO_DATA.vectorLogo || '',
      'flag.txt': 'CTF{cRt_b4rr3l_d1st0rt10n_1984} // You found the secret terminal flag!'
    }
  };

  private readonly commands: CommandDefinition[] = [
    { cmd: 'help', aliases: ['?'], desc: 'Display all available terminal commands' },
    { cmd: 'bio', aliases: ['about'], desc: 'Developer background, bio and status' },
    { cmd: 'education', aliases: ['edu', 'academic'], desc: 'Formal academic background and coursework' },
    { cmd: 'skills', aliases: ['stack'], desc: 'Technical proficiencies and skill matrix' },
    { cmd: 'projects', aliases: ['work', 'portfolio'], desc: 'Showcase of selected works and systems' },
    { cmd: 'project', args: '<id|num>', desc: 'View detailed specs of a specific project' },
    { cmd: 'experience', aliases: ['exp', 'career'], desc: 'Professional career history and milestones' },
    { cmd: 'github', aliases: ['gh', 'repo'], desc: 'Open GitHub profile and featured repositories' },
    { cmd: 'contact', aliases: ['socials', 'email'], desc: 'Communication channels and links' },
    { cmd: 'resume', aliases: ['cv'], desc: 'Curriculum Vitae overview and download' },
    { cmd: 'ls', aliases: ['dir'], desc: 'List files and directories in current folder' },
    { cmd: 'cd', args: '[dir]', desc: 'Change directory (e.g. cd projects, cd ..)' },
    { cmd: 'pwd', desc: 'Print current working directory path' },
    { cmd: 'tree', desc: 'Display visual tree diagram of virtual filesystem' },
    { cmd: 'cat', args: '<file>', desc: 'Read a virtual file (e.g. cat bio.txt)' },
    { cmd: 'history', aliases: ['hist'], desc: 'Display shell execution history buffer' },
    { cmd: 'theme', args: '[color]', desc: 'Set phosphor color [green|amber|white|cyber]' },
    { cmd: 'font', args: '[mode]', desc: 'Toggle font [pixel|clean]' },
    { cmd: 'scale', aliases: ['zoom'], args: '[100|150|200|250]', desc: 'Adjust terminal magnification scale (default: 200%)' },
    { cmd: 'barrel', args: '[mode]', desc: 'Set CRT barrel distortion [flat|subtle|authentic|heavy]' },
    { cmd: 'scanlines', args: '[on|off]', desc: 'Toggle CRT scanlines' },
    { cmd: 'degauss', desc: 'Trigger CRT magnetic degauss coil pulse' },
    { cmd: 'audio', args: '[on|off]', desc: 'Toggle mechanical keyboard sound synth' },
    { cmd: 'power', aliases: ['exit', 'shutdown'], desc: 'Toggle CRT monitor power off/on' },
    { cmd: 'matrix', desc: 'Launch Matrix digital rain screensaver' },
    { cmd: 'fire', desc: 'Launch 1990s demoscene Doom fire demo' },
    { cmd: 'clear', aliases: ['cls'], desc: 'Clear the terminal output buffer' },
    { cmd: 'banner', aliases: ['motd'], desc: 'Print system login banner' },
    { cmd: 'logo', desc: 'Display brand ASCII logo' },
    { cmd: 'whoami', desc: 'Print current user identity' },
    { cmd: 'date', desc: 'Print current UTC timestamp' },
    { cmd: 'echo', args: '<text>', desc: 'Echo back text to the console' },
    { cmd: 'sudo', desc: 'Execute superuser privilege' }
  ];

  constructor() {}

  public init(): void {
    this.outputBuffer = document.getElementById('cli-output-buffer');
    this.inputElement = document.getElementById('cli-input') as HTMLInputElement;
    this.promptLine = document.getElementById('cli-prompt-line');
    this.promptPathEl = document.getElementById('prompt-path');
    this.textBeforeEl = document.getElementById('cli-text-before');
    this.cursorEl = document.getElementById('cli-block-cursor');
    this.textAfterEl = document.getElementById('cli-text-after');
    this.ghostHintEl = document.getElementById('cli-ghost-hint');
    this.statusClockEl = document.getElementById('sb-clock');
    this.statusCwdEl = document.getElementById('sb-cwd');

    if (!this.outputBuffer || !this.inputElement) return;

    this.bindEvents();
    this.updatePromptPath();
    this.updateDisplayLine();
    this.updateClock();
    window.setInterval(() => this.updateClock(), 1000);
    this.printBootBanner();
    this.focusInput();
  }

  private updateClock(): void {
    if (this.statusClockEl) {
      const now = new Date();
      this.statusClockEl.textContent = now.toISOString().slice(11, 19) + ' UTC';
    }
  }

  public updatePromptPath(): void {
    const display = this.currentDirDisplay;
    if (this.promptPathEl) {
      this.promptPathEl.textContent = display;
    }
    if (this.statusCwdEl) {
      this.statusCwdEl.textContent = display;
    }
  }

  public getCurrentDir(): VirtualDir {
    let curr = this.virtualFs;
    for (const segment of this.currentPath) {
      if (!curr.dirs[segment]) return this.virtualFs;
      curr = curr.dirs[segment];
    }
    return curr;
  }

  private getDirByPath(path: string[]): VirtualDir | null {
    let curr = this.virtualFs;
    for (const segment of path) {
      if (!curr.dirs[segment]) return null;
      curr = curr.dirs[segment];
    }
    return curr;
  }

  public resolveFile(filePath: string): string | null {
    const trimmed = filePath.trim();
    if (!trimmed) return null;

    const current = this.getCurrentDir();
    if (current.files[trimmed.toLowerCase()] !== undefined) {
      return current.files[trimmed.toLowerCase()];
    }

    const parts = trimmed.split('/').filter(Boolean);
    if (trimmed.startsWith('~') || trimmed.startsWith('/')) {
      const rootParts = trimmed.startsWith('~') ? parts.slice(1) : (parts[0] === 'home' && parts[1] === 'guest' ? parts.slice(2) : parts);
      const filename = rootParts.pop();
      if (!filename) return null;
      const targetDir = this.getDirByPath(rootParts);
      if (targetDir && targetDir.files[filename.toLowerCase()] !== undefined) {
        return targetDir.files[filename.toLowerCase()];
      }
    } else if (parts.length > 1) {
      const targetParts = [...this.currentPath];
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i];
        if (seg === '..') {
          targetParts.pop();
        } else if (seg !== '.') {
          targetParts.push(seg);
        }
      }
      const filename = parts[parts.length - 1];
      const targetDir = this.getDirByPath(targetParts);
      if (targetDir && targetDir.files[filename.toLowerCase()] !== undefined) {
        return targetDir.files[filename.toLowerCase()];
      }
    }

    if (this.virtualFs.files[trimmed.toLowerCase()] !== undefined) {
      return this.virtualFs.files[trimmed.toLowerCase()];
    }

    return null;
  }

  private focusInput(): void {
    if (this.inputElement) {
      this.inputElement.focus();
    }
  }

  private bindEvents(): void {
    // Keep input focused when clicking screen background
    const screen = document.getElementById('crt-screen');
    if (screen) {
      screen.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a') && !target.closest('input')) {
          this.focusInput();
        }
      });
    }

    // Input keyboard handling
    if (this.inputElement) {
      this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
      this.inputElement.addEventListener('input', () => {
        audio.playKeyClick();
        this.updateDisplayLine();
      });
      this.inputElement.addEventListener('click', () => this.updateDisplayLine());
      this.inputElement.addEventListener('keyup', (e) => {
        if (e.key !== 'Enter') this.updateDisplayLine();
      });
    }

    // Delegation for in-buffer clickable commands, dirs, and files
    const shell = document.getElementById('cli-shell') || this.outputBuffer;
    if (shell) {
      shell.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const cmdBtn = target.closest('[data-cmd]') as HTMLElement | null;
        if (cmdBtn) {
          const cmd = cmdBtn.getAttribute('data-cmd');
          if (cmd) {
            this.clearScreenOnly();
            this.executeCommand(cmd);
            if (this.outputBuffer) {
              this.outputBuffer.scrollTop = 0;
            }
            this.focusInput();
          }
          return;
        }

        const dirBtn = target.closest('[data-dir]') as HTMLElement | null;
        if (dirBtn) {
          const dir = dirBtn.getAttribute('data-dir');
          if (dir) {
            this.executeCommand(`cd ${dir}`);
            if (this.outputBuffer) {
              this.outputBuffer.scrollTop = this.outputBuffer.scrollHeight;
            }
            this.focusInput();
          }
          return;
        }

        const fileBtn = target.closest('[data-file]') as HTMLElement | null;
        if (fileBtn) {
          const file = fileBtn.getAttribute('data-file');
          if (file) {
            this.clearScreenOnly();
            this.executeCommand(`cat ${file}`);
            if (this.outputBuffer) {
              this.outputBuffer.scrollTop = 0;
            }
            this.focusInput();
          }
          return;
        }
      });
    }
  }

  public updateDisplayLine(): void {
    if (!this.inputElement) return;
    const val = this.inputElement.value;
    const pos = this.inputElement.selectionStart ?? val.length;

    const before = val.slice(0, pos);
    const at = val.slice(pos, pos + 1);
    const after = val.slice(pos + 1);

    if (this.textBeforeEl) this.textBeforeEl.textContent = before;
    if (this.cursorEl) {
      if (at) {
        this.cursorEl.textContent = at;
        this.cursorEl.classList.add('is-character');
      } else {
        this.cursorEl.textContent = ' ';
        this.cursorEl.classList.remove('is-character');
      }
    }
    if (this.textAfterEl) this.textAfterEl.textContent = after;

    if (this.ghostHintEl) {
      if (pos === val.length && val.trim().length > 0) {
        const suggestion = this.getGhostSuggestion(val);
        if (suggestion && suggestion.toLowerCase().startsWith(val.toLowerCase()) && suggestion.length > val.length) {
          this.currentGhostSuggestion = suggestion;
          this.ghostHintEl.textContent = suggestion.slice(val.length);
        } else {
          this.currentGhostSuggestion = '';
          this.ghostHintEl.textContent = '';
        }
      } else {
        this.currentGhostSuggestion = '';
        this.ghostHintEl.textContent = '';
      }
    }
  }

  private getGhostSuggestion(inputVal: string): string {
    const val = inputVal.trimStart();
    if (!val) return '';

    if (val.includes(' ')) {
      const parts = val.split(' ');
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ').toLowerCase();

      if (cmd === 'cd') {
        const curr = this.getCurrentDir();
        const dirs = Object.keys(curr.dirs);
        if (this.currentPath.length > 0) dirs.push('..');
        const match = dirs.find(d => d.toLowerCase().startsWith(arg));
        if (match) return `cd ${match}`;
      } else if (cmd === 'cat') {
        const curr = this.getCurrentDir();
        const files = Object.keys(curr.files);
        const match = files.find(f => f.toLowerCase().startsWith(arg));
        if (match) return `cat ${match}`;
      } else if (cmd === 'project') {
        const ids = PORTFOLIO_DATA.projects.map(p => p.id);
        const match = ids.find(id => id.toLowerCase().startsWith(arg));
        if (match) return `project ${match}`;
      }
      return '';
    }

    const allCmds = this.commands.map(c => c.cmd);
    const match = allCmds.find(c => c.startsWith(val.toLowerCase()));
    return match || '';
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rawCmd = this.inputElement ? this.inputElement.value.trim() : '';
      if (this.inputElement) {
        this.inputElement.value = '';
      }
      this.currentGhostSuggestion = '';
      this.updateDisplayLine();
      this.executeCommand(rawCmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.history.length > 0) {
        if (this.historyIndex === -1) {
          this.historyIndex = this.history.length - 1;
        } else if (this.historyIndex > 0) {
          this.historyIndex--;
        }
        if (this.inputElement) {
          this.inputElement.value = this.history[this.historyIndex] || '';
          this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
        }
        this.updateDisplayLine();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex !== -1) {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          if (this.inputElement) {
            this.inputElement.value = this.history[this.historyIndex] || '';
            this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
          }
        } else {
          this.historyIndex = -1;
          if (this.inputElement) {
            this.inputElement.value = '';
          }
        }
        this.updateDisplayLine();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (this.currentGhostSuggestion && this.inputElement) {
        this.inputElement.value = this.currentGhostSuggestion + ' ';
        this.currentGhostSuggestion = '';
        this.updateDisplayLine();
        audio.playKeyClick(200);
      } else {
        this.handleTabCompletion();
      }
    } else if (e.key === 'ArrowRight') {
      if (this.inputElement && this.currentGhostSuggestion) {
        const pos = this.inputElement.selectionStart ?? 0;
        if (pos === this.inputElement.value.length) {
          e.preventDefault();
          this.inputElement.value = this.currentGhostSuggestion + ' ';
          this.currentGhostSuggestion = '';
          this.updateDisplayLine();
          audio.playKeyClick(200);
          return;
        }
      }
      setTimeout(() => this.updateDisplayLine(), 0);
    } else if (e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      setTimeout(() => this.updateDisplayLine(), 0);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (this.inputElement) {
        const line = this.inputElement.value;
        this.inputElement.value = '';
        this.currentGhostSuggestion = '';
        this.updateDisplayLine();
        this.appendOutput(`<div class="cli-row cli-prompt-echo"><span class="cli-prompt">${this.promptUser}@${this.promptHost}:${this.currentDirDisplay}$</span> ${this.escapeHtml(line)}^C</div>`);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.clearScreen();
    } else if (e.key === 'a' && e.ctrlKey) {
      e.preventDefault();
      if (this.inputElement) {
        this.inputElement.setSelectionRange(0, 0);
        this.updateDisplayLine();
      }
    } else if (e.key === 'e' && e.ctrlKey) {
      e.preventDefault();
      if (this.inputElement) {
        const len = this.inputElement.value.length;
        this.inputElement.setSelectionRange(len, len);
        this.updateDisplayLine();
      }
    } else if (e.key === 'u' && e.ctrlKey) {
      e.preventDefault();
      if (this.inputElement) {
        const pos = this.inputElement.selectionStart ?? 0;
        const rest = this.inputElement.value.slice(pos);
        this.inputElement.value = rest;
        this.inputElement.setSelectionRange(0, 0);
        this.updateDisplayLine();
      }
    } else if (e.key === 'k' && e.ctrlKey) {
      e.preventDefault();
      if (this.inputElement) {
        const pos = this.inputElement.selectionStart ?? 0;
        this.inputElement.value = this.inputElement.value.slice(0, pos);
        this.updateDisplayLine();
      }
    } else if (e.key === 'w' && e.ctrlKey) {
      e.preventDefault();
      if (this.inputElement) {
        const pos = this.inputElement.selectionStart ?? 0;
        const before = this.inputElement.value.slice(0, pos);
        const after = this.inputElement.value.slice(pos);
        const trimmed = before.replace(/\s*\S+\s*$/, '');
        this.inputElement.value = trimmed + after;
        this.inputElement.setSelectionRange(trimmed.length, trimmed.length);
        this.updateDisplayLine();
      }
    }
  }

  private handleTabCompletion(): void {
    if (!this.inputElement) return;
    const current = this.inputElement.value.trimStart();
    if (!current) return;

    const parts = current.split(' ');
    if (parts.length === 1) {
      const prefix = parts[0].toLowerCase();
      const allCmds = this.commands.map(c => c.cmd);
      const matches = allCmds.filter(c => c.startsWith(prefix));
      if (matches.length === 1) {
        this.inputElement.value = matches[0] + ' ';
        this.updateDisplayLine();
        audio.playKeyClick(200);
      } else if (matches.length > 1) {
        this.appendOutput(`<div class="cli-suggest-row">${matches.map(m => `<button type="button" class="cli-chip" data-cmd="${m}">${m}</button>`).join(' ')}</div>`);
        audio.playKeyClick(100);
      } else {
        audio.playBell();
      }
    } else if (parts.length === 2 && parts[0].toLowerCase() === 'cd') {
      const prefix = parts[1].toLowerCase();
      const curr = this.getCurrentDir();
      const dirs = Object.keys(curr.dirs);
      if (this.currentPath.length > 0) dirs.push('..');
      const matches = dirs.filter(d => d.toLowerCase().startsWith(prefix));
      if (matches.length === 1) {
        this.inputElement.value = `cd ${matches[0]}`;
        this.updateDisplayLine();
        audio.playKeyClick(200);
      } else if (matches.length > 1) {
        this.appendOutput(`<div class="cli-suggest-row">${matches.map(m => `<button type="button" class="cli-dir-chip" data-dir="${m}">${m}/</button>`).join(' ')}</div>`);
        audio.playKeyClick(100);
      } else {
        audio.playBell();
      }
    } else if (parts.length === 2 && parts[0].toLowerCase() === 'cat') {
      const prefix = parts[1].toLowerCase();
      const curr = this.getCurrentDir();
      const files = Object.keys(curr.files);
      const matches = files.filter(f => f.toLowerCase().startsWith(prefix));
      if (matches.length === 1) {
        this.inputElement.value = `cat ${matches[0]}`;
        this.updateDisplayLine();
        audio.playKeyClick(200);
      } else if (matches.length > 1) {
        this.appendOutput(`<div class="cli-suggest-row">${matches.map(m => `<button type="button" class="cli-file-chip" data-file="${m}">${m}</button>`).join(' ')}</div>`);
        audio.playKeyClick(100);
      } else {
        audio.playBell();
      }
    }
  }

  public executeCommand(rawCommand: string): void {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      this.appendOutput(`<div class="cli-row cli-prompt-echo"><span class="cli-prompt">${this.promptUser}@${this.promptHost}:${this.currentDirDisplay}$</span></div>`);
      return;
    }

    // Save in command history
    if (this.history[this.history.length - 1] !== trimmed) {
      this.history.push(trimmed);
    }
    this.historyIndex = -1;

    // Echo executed command line
    this.appendOutput(`<div class="cli-row cli-prompt-echo"><span class="cli-prompt">${this.promptUser}@${this.promptHost}:${this.currentDirDisplay}$</span> <strong>${this.escapeHtml(trimmed)}</strong></div>`);

    // Parse command and arguments
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ').trim();

    audio.playKeyClick(400);

    // Command dispatch
    switch (cmd) {
      case 'help':
      case '?':
        this.cmdHelp();
        break;

      case 'bio':
      case 'about':
        this.cmdBio();
        break;

      case 'education':
      case 'edu':
      case 'academic':
        this.cmdEducation();
        break;

      case 'skills':
      case 'stack':
        this.cmdSkills();
        break;

      case 'projects':
      case 'work':
      case 'portfolio':
        this.cmdProjects();
        break;

      case 'project':
        this.cmdProject(args);
        break;

      case 'experience':
      case 'exp':
      case 'career':
        this.cmdExperience();
        break;

      case 'github':
      case 'gh':
      case 'repo':
        this.cmdGithub();
        break;

      case 'history':
      case 'hist':
        this.cmdHistory();
        break;

      case 'cd':
        this.cmdCd(args);
        break;

      case 'pwd':
        this.cmdPwd();
        break;

      case 'tree':
        this.cmdTree();
        break;

      case 'contact':
      case 'socials':
      case 'email':
        this.cmdContact();
        break;

      case 'resume':
      case 'cv':
        this.cmdResume();
        break;

      case 'ls':
      case 'dir':
        this.cmdLs();
        break;

      case 'cat':
        this.cmdCat(args);
        break;

      case 'clear':
      case 'cls':
        this.clearScreen();
        break;

      case 'banner':
      case 'motd':
        this.printBootBanner();
        break;

      case 'logo':
        this.cmdLogo();
        break;

      case 'theme':
        this.cmdTheme(args);
        break;

      case 'font':
        this.cmdFont(args);
        break;

      case 'scale':
      case 'zoom':
        this.cmdScale(args);
        break;

      case 'barrel':
        this.cmdBarrel(args);
        break;

      case 'scanlines':
        this.cmdScanlines(args);
        break;

      case 'degauss':
        crt.degauss();
        this.appendOutput(`<div class="cli-row cli-info">[SYS]: Magnetic degauss coil pulsed. Shadow mask depolarized.</div>`);
        break;

      case 'audio':
        this.cmdAudio(args);
        break;

      case 'power':
      case 'exit':
      case 'shutdown':
        crt.togglePower();
        this.appendOutput(`<div class="cli-row cli-info">[SYS]: Terminal monitor powered off. Click screen or press any key to power on.</div>`);
        break;

      case 'matrix':
        matrix.start();
        this.appendOutput(`<div class="cli-row cli-info">[SYS]: Matrix digital rain initiated. Click screen or press ESC to return.</div>`);
        break;

      case 'fire':
        asciiFire.start();
        this.appendOutput(`<div class="cli-row cli-info">[SYS]: Doom fire demo running. Click screen or press ESC to return.</div>`);
        break;

      case 'whoami':
        this.appendOutput(`<div class="cli-row">guest (uid=1000 gid=1000 groups=1000(guest),4(adm),24(cdrom),27(sudo))</div>`);
        break;

      case 'date':
        this.appendOutput(`<div class="cli-row">${new Date().toUTCString()}</div>`);
        break;

      case 'echo':
        this.appendOutput(`<div class="cli-row">${this.escapeHtml(args)}</div>`);
        break;

      case 'sudo':
        audio.playBell();
        this.appendOutput(`<div class="cli-row cli-warn">[SECURITY ALERT]: ${this.promptUser} is not in the sudoers file. This incident will be reported.</div>`);
        break;

      default:
        audio.playBell();
        this.appendOutput(`
          <div class="cli-row cli-error">
            bash: command not found: <strong>${this.escapeHtml(cmd)}</strong>.
            Type <button type="button" class="cli-chip" data-cmd="help">help</button> for available commands.
          </div>
        `);
        break;
    }

    this.scrollToBottom();
  }

  private appendOutput(html: string): void {
    if (!this.outputBuffer) return;
    const div = document.createElement('div');
    div.className = 'cli-output-entry';
    div.innerHTML = html;
    if (this.promptLine && this.promptLine.parentElement === this.outputBuffer) {
      this.outputBuffer.insertBefore(div, this.promptLine);
    } else {
      this.outputBuffer.appendChild(div);
    }
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.outputBuffer) {
      this.outputBuffer.scrollTop = this.outputBuffer.scrollHeight;
    }
  }

  public clearScreenOnly(): void {
    if (this.outputBuffer) {
      const entries = this.outputBuffer.querySelectorAll('.cli-output-entry');
      entries.forEach(e => e.remove());
    }
  }

  public clearScreen(): void {
    this.clearScreenOnly();
    this.printPromptHeader();
  }

  private printPromptHeader(): void {
    this.appendOutput(`
      <div class="cli-row cli-dim">
        ASYDEV-OS Terminal Buffer Cleared. Click any command below or type <button type="button" class="cli-chip" data-cmd="help">help</button>.
      </div>
      <div class="cli-quick-links">
        MENU:
        <button type="button" class="cli-chip" data-cmd="bio">bio</button>
        <button type="button" class="cli-chip" data-cmd="education">education</button>
        <button type="button" class="cli-chip" data-cmd="skills">skills</button>
        <button type="button" class="cli-chip" data-cmd="projects">projects</button>
        <button type="button" class="cli-chip" data-cmd="experience">experience</button>
        <button type="button" class="cli-chip" data-cmd="github">github</button>
        <button type="button" class="cli-chip" data-cmd="contact">contact</button>
        <button type="button" class="cli-chip" data-cmd="resume">resume</button>
        <button type="button" class="cli-chip" data-cmd="tree">tree</button>
        <button type="button" class="cli-chip" data-cmd="ls">ls</button>
        <button type="button" class="cli-chip" data-cmd="help">help</button>
        <button type="button" class="cli-chip" data-cmd="clear">clear</button>
      </div>
    `);
  }

  private printBootBanner(): void {
    this.appendOutput(`
      <div class="cli-banner-container">
        <div class="cli-brand-banner">
          ${PORTFOLIO_DATA.vectorLogo || `<pre class="cli-ascii-logo">${PORTFOLIO_DATA.asciiLogo.trim()}</pre>`}
        </div>
        <div class="cli-divider">================================================================================</div>
        <div class="cli-sys-info">
          <strong>ASYDEV-OS</strong> (Full-Stack & Systems Terminal // Model 84-CRT)<br>
          Connected as <strong>${this.promptUser}@${this.promptHost}</strong> (tty0) on ${new Date().toUTCString()}.<br>
          GitHub: <a href="https://github.com/VUXXE" target="_blank" rel="noopener noreferrer" class="cli-link">github.com/VUXXE ↗</a> | Source: <a href="https://github.com/VUXXE/asydev-os" target="_blank" rel="noopener noreferrer" class="cli-link">github.com/VUXXE/asydev-os ↗</a><br>
          Click any command below or type <button type="button" class="cli-chip" data-cmd="help">help</button> to explore.
        </div>
        <div class="cli-quick-links">
          QUICK COMMANDS:
          <button type="button" class="cli-chip" data-cmd="bio">bio</button>
          <button type="button" class="cli-chip" data-cmd="education">education</button>
          <button type="button" class="cli-chip" data-cmd="skills">skills</button>
          <button type="button" class="cli-chip" data-cmd="projects">projects</button>
          <button type="button" class="cli-chip" data-cmd="experience">experience</button>
          <button type="button" class="cli-chip" data-cmd="github">github</button>
          <button type="button" class="cli-chip" data-cmd="contact">contact</button>
          <button type="button" class="cli-chip" data-cmd="resume">resume</button>
          <button type="button" class="cli-chip" data-cmd="tree">tree</button>
          <button type="button" class="cli-chip" data-cmd="scale">scale (200%)</button>
          <button type="button" class="cli-chip" data-cmd="ls">ls</button>
          <button type="button" class="cli-chip" data-cmd="help">help</button>
          <button type="button" class="cli-chip" data-cmd="clear">clear</button>
        </div>
        <div class="cli-divider">================================================================================</div>
      </div>
    `);
  }

  private cmdLogo(): void {
    this.appendOutput(`
      <div class="cli-banner-container">
        <div class="cli-brand-banner">
          ${PORTFOLIO_DATA.vectorLogo || `<pre class="cli-ascii-logo">${PORTFOLIO_DATA.asciiLogo.trim()}</pre>`}
        </div>
      </div>
    `);
  }

  private cmdHelp(): void {
    const rows = this.commands.map(c => {
      const syntax = c.args ? `${c.cmd} ${c.args}` : c.cmd;
      return `
        <tr class="cli-help-tr">
          <td class="cli-help-td-cmd">
            <button type="button" class="cli-chip" data-cmd="${c.cmd}">${syntax}</button>
          </td>
          <td class="cli-help-td-desc">${c.desc}</td>
        </tr>
      `;
    }).join('');

    this.appendOutput(`
      <div class="cli-help-box">
        <div class="cli-box-header">┌── [ ASYDEV-OS COMMAND REFERENCE ] ────────────────────────────────────────┐</div>
        <table class="cli-help-table">
          <thead>
            <tr>
              <th class="cli-help-td-cmd" style="text-align: left; padding-bottom: 4px;">COMMAND</th>
              <th class="cli-help-td-desc" style="text-align: left; padding-bottom: 4px;">DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="cli-box-footer">└── [ CLICK ANY BUTTON ABOVE OR TYPE DIRECTLY INTO SHELL ] ───────────────┘</div>
      </div>
    `);
  }

  private cmdBio(): void {
    const p = PORTFOLIO_DATA.profile;
    const edu = PORTFOLIO_DATA.education[0];
    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ OPERATOR IDENTITY: ${p.handle.toUpperCase()} ] ───────────────────────────────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line"><strong>NAME</strong>     : <span class="cli-highlight">${p.name}</span></div>
          <div class="cli-line"><strong>ROLE</strong>     : ${p.title}</div>
          <div class="cli-line"><strong>LOCATION</strong> : ${p.location}</div>
          <div class="cli-line"><strong>CONTACT</strong>  : ${p.phone} // hanan7taqiyya@gmail.com</div>
          <div class="cli-line"><strong>ACADEMIC</strong> : ${edu.degree} @ ${edu.institution} (GPA: ${edu.gpa})</div>
          <div class="cli-line"><strong>STATUS</strong>   : <span class="cli-highlight">${p.status}</span></div>
          <div class="cli-line"><strong>SYSTEM</strong>   : ${p.systemName} (${p.version})</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-bio-text">
            ${p.bio.map(para => `<p>${para}</p>`).join('')}
          </div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE: 
            <button type="button" class="cli-chip" data-cmd="education">education</button>
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="history">history</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="resume">resume</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└──────────────────────────────────────────────────────────────────────────┘</div>
      </div>
    `);
  }

  private cmdEducation(): void {
    const items = PORTFOLIO_DATA.education.map(e => `
      <div class="cli-edu-item">
        <div class="cli-line"><strong>INSTITUTION</strong> : <span class="cli-highlight">${e.institution}</span> (${e.location})</div>
        <div class="cli-line"><strong>DEGREE</strong>      : ${e.degree}</div>
        <div class="cli-line"><strong>GPA</strong>         : <span class="cli-highlight">${e.gpa}</span></div>
        <div class="cli-line"><strong>PERIOD</strong>      : ${e.period}</div>
        <div class="cli-divider">----------------------------------------------------------------------------</div>
        <div class="cli-line"><strong>RELEVANT COURSEWORK:</strong></div>
        <div class="cli-dim">${e.coursework.join(' // ')}</div>
      </div>
    `).join('<div class="cli-divider">----------------------------------------------------------------------------</div>');

    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ FORMAL EDUCATION & ACADEMICS ] ───────────────────────────────────────┐</div>
        <div class="cli-card-body">
          ${items}
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="resume">resume</button>
            <button type="button" class="cli-chip" data-cmd="bio">bio</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└── [ TYPE "resume" FOR CURRICULUM VITAE OVERVIEW ] ────────────────────────┘</div>
      </div>
    `);
  }

  private cmdSkills(): void {
    const cats = PORTFOLIO_DATA.skills.map(cat => {
      const items = cat.items.map(item => {
        const bar = item.tier === 'PRIMARY' ? '[████████░░]' : '[██████░░░░]';
        return `
          <div class="cli-skill-item">
            <span class="cli-skill-name">${item.name.padEnd(24)}</span>
            <span class="cli-skill-tier cli-highlight">${bar} ${item.tier.padEnd(8)}</span>
            <span class="cli-skill-exp cli-dim">${item.exp.padEnd(8)}</span>
            <span class="cli-skill-focus">${item.focus}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="cli-skill-category">
          <div class="cli-cat-title">:: ${cat.category} ::</div>
          <div class="cli-cat-items">${items}</div>
        </div>
      `;
    }).join('');

    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ TECHNICAL PROFICIENCY MATRIX ] ────────────────────────────────────────┐</div>
        <div class="cli-card-body">
          ${cats}
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="education">education</button>
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="bio">bio</button>
            <button type="button" class="cli-chip" data-cmd="history">history</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="resume">resume</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└── [ TYPE "projects" TO SEE SYSTEMS IMPLEMENTED WITH THIS STACK ] ─────────┘</div>
      </div>
    `);
  }

  private cmdProjects(): void {
    const cards = PORTFOLIO_DATA.projects.map((p, idx) => `
      <div class="cli-project-row">
        <div class="cli-proj-header">
          <strong>[${p.num}] ${p.title}</strong> (${p.year}) // <span class="cli-dim">${p.category}</span>
        </div>
        <div class="cli-proj-desc">${p.description}</div>
        <div class="cli-proj-meta">
          <span class="cli-dim">TAGS: ${p.tags.join(', ')}</span>
        </div>
        <div class="cli-proj-actions">
          <button type="button" class="cli-chip" data-cmd="project ${idx + 1}">Inspect [project ${idx + 1}]</button>
          <a href="${p.links.github}" target="_blank" rel="noopener noreferrer" class="cli-link">[ Source Code ]</a>
          <a href="${p.links.demo}" target="_blank" rel="noopener noreferrer" class="cli-link">[ View Demo ]</a>
        </div>
      </div>
    `).join('<div class="cli-divider">----------------------------------------------------------------------------</div>');

    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ SELECTED WORKS & SYSTEMS DECK ] ──────────────────────────────────────┐</div>
        <div class="cli-card-body">
          ${cards}
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="education">education</button>
            <button type="button" class="cli-chip" data-cmd="bio">bio</button>
            <button type="button" class="cli-chip" data-cmd="history">history</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="resume">resume</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└── [ TYPE "project <1-${PORTFOLIO_DATA.projects.length}>" FOR DEEP ARCHITECTURE SPECS ] ───────────────────┘</div>
      </div>
    `);
  }

  private cmdProject(args: string): void {
    if (!args) {
      this.appendOutput(`<div class="cli-row cli-warn">Usage: project &lt;1-${PORTFOLIO_DATA.projects.length}|id&gt; (e.g. <button type="button" class="cli-chip" data-cmd="project 1">project 1</button> or <button type="button" class="cli-chip" data-cmd="project mesh">project mesh</button>)</div>`);
      return;
    }

    let target: Project | undefined;
    const num = parseInt(args, 10);
    if (!isNaN(num) && num >= 1 && num <= PORTFOLIO_DATA.projects.length) {
      target = PORTFOLIO_DATA.projects[num - 1];
    } else {
      target = PORTFOLIO_DATA.projects.find(p => p.id.toLowerCase() === args.toLowerCase());
    }

    if (!target) {
      this.appendOutput(`<div class="cli-row cli-error">Project not found: "${this.escapeHtml(args)}". Run <button type="button" class="cli-chip" data-cmd="projects">projects</button> for full catalog.</div>`);
      return;
    }

    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ PROJECT SPEC: ${target.title} ] ────────────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line"><strong>INDEX</strong>    : ${target.num} // ${target.id}</div>
          <div class="cli-line"><strong>YEAR</strong>     : ${target.year}</div>
          <div class="cli-line"><strong>CATEGORY</strong> : ${target.category}</div>
          <div class="cli-line"><strong>STACK</strong>    : ${target.tags.join(' // ')}</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-line"><strong>OVERVIEW</strong>:</div>
          <div class="cli-bio-text"><p>${target.description}</p></div>
          <div class="cli-line"><strong>KEY ENGINEERING HIGHLIGHTS</strong>:</div>
          <ul class="cli-highlights-list">
            ${target.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            <button type="button" class="cli-chip" data-cmd="projects">&laquo; all projects</button>
            <a href="${target.links.github}" target="_blank" rel="noopener noreferrer" class="cli-btn-primary">[ ↗ OPEN SOURCE REPOSITORY ]</a>
            <a href="${target.links.demo}" target="_blank" rel="noopener noreferrer" class="cli-btn-secondary">[ ↗ LAUNCH LIVE DEMO ]</a>
          </div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="education">education</button>
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└── [ TYPE "projects" TO RETURN TO PROJECT CATALOG ] ───────────────────────┘</div>
      </div>
    `);
  }

  private cmdExperience(): void {
    const items = PORTFOLIO_DATA.experience.map(exp => `
      <div class="cli-timeline-item">
        <div class="cli-tl-period"><strong>[ ${exp.period} ]</strong></div>
        <div class="cli-tl-title"><span class="cli-highlight">${exp.role}</span> @ ${exp.company}</div>
        <div class="cli-tl-desc">${exp.description}</div>
      </div>
    `).join('<div class="cli-divider">----------------------------------------------------------------------------</div>');

    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ CAREER HISTORY & TIMELINE ] ──────────────────────────────────────────┐</div>
        <div class="cli-card-body">
          ${items}
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="resume">resume</button>
            <button type="button" class="cli-chip" data-cmd="education">education</button>
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└── [ TYPE "resume" FOR CURRICULUM VITAE OVERVIEW ] ────────────────────────┘</div>
      </div>
    `);
  }

  private cmdHistory(): void {
    if (this.history.length === 0) {
      this.appendOutput(`<div class="cli-row cli-dim">No commands in session history buffer.</div>`);
      return;
    }
    const rows = this.history.map((h, i) =>
      `<div class="cli-row"><span class="cli-dim">${String(i + 1).padStart(4, ' ')}</span>  ${this.escapeHtml(h)}</div>`
    ).join('');
    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ SHELL EXECUTION HISTORY ] ───────────────────────────────────────────┐</div>
        <div class="cli-card-body">
          ${rows}
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-dim">Tip: Use ArrowUp / ArrowDown keys to cycle through history. Type "exp" to view professional work experience.</div>
        </div>
      </div>
    `);
  }

  private cmdCd(targetPath: string): void {
    const target = targetPath.trim();
    if (!target || target === '~' || target === '/' || target === '/home/guest') {
      this.currentPath = [];
      this.updatePromptPath();
      return;
    }

    if (target === '..') {
      if (this.currentPath.length > 0) {
        this.currentPath.pop();
      }
      this.updatePromptPath();
      return;
    }

    if (target === '.') {
      return;
    }

    const parts = target.split('/').filter(Boolean);
    const newPath = target.startsWith('~') || target.startsWith('/') ? [] : [...this.currentPath];

    for (const part of parts) {
      if (part === '~' || (part === 'home' && newPath.length === 0) || (part === 'guest' && newPath.length === 1 && newPath[0] === 'home')) {
        continue;
      }
      if (part === '..') {
        if (newPath.length > 0) newPath.pop();
      } else if (part !== '.') {
        const testDir = this.getDirByPath(newPath);
        if (testDir && testDir.dirs[part.toLowerCase()]) {
          newPath.push(part.toLowerCase());
        } else {
          audio.playBell();
          this.appendOutput(`<div class="cli-row cli-error">bash: cd: ${this.escapeHtml(target)}: No such file or directory</div>`);
          return;
        }
      }
    }

    this.currentPath = newPath;
    this.updatePromptPath();
  }

  private cmdPwd(): void {
    const full = '/home/guest' + (this.currentPath.length ? '/' + this.currentPath.join('/') : '');
    this.appendOutput(`<div class="cli-row">${full}</div>`);
  }

  private cmdTree(): void {
    let totalDirs = 0;
    let totalFiles = 0;

    const renderTree = (dir: VirtualDir, prefix: string): string[] => {
      const lines: string[] = [];
      const dirKeys = Object.keys(dir.dirs).sort();
      const fileKeys = Object.keys(dir.files).sort();
      const totalItems = dirKeys.length + fileKeys.length;
      let count = 0;

      for (const d of dirKeys) {
        count++;
        totalDirs++;
        const isLast = count === totalItems;
        const pointer = isLast ? '└── ' : '├── ';
        lines.push(`${prefix}${pointer}<button type="button" class="cli-dir-chip" data-dir="${d}">${d}/</button>`);
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        lines.push(...renderTree(dir.dirs[d], nextPrefix));
      }

      for (const f of fileKeys) {
        count++;
        totalFiles++;
        const isLast = count === totalItems;
        const pointer = isLast ? '└── ' : '├── ';
        lines.push(`${prefix}${pointer}<button type="button" class="cli-file-chip" data-file="${f}">${f}</button>`);
      }

      return lines;
    };

    const treeLines = renderTree(this.virtualFs, '');
    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ VIRTUAL FILESYSTEM TREE: /home/guest ] ─────────────────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line"><strong>/home/guest</strong></div>
          <div class="cli-line" style="line-height: 1.6;">${treeLines.join('<br>')}</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-dim">${totalDirs} directories, ${totalFiles} files. Click any directory or file to navigate.</div>
        </div>
      </div>
    `);
  }

  private cmdGithub(): void {
    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ GITHUB: @VUXXE // DEVELOPER PROFILE & REPOSITORIES ] ────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line">Developer Profile : <a href="https://github.com/VUXXE" target="_blank" rel="noopener noreferrer" class="cli-link">https://github.com/VUXXE ↗</a> (@VUXXE)</div>
          <div class="cli-line">Portfolio Source  : <a href="https://github.com/VUXXE/asydev-os" target="_blank" rel="noopener noreferrer" class="cli-link">https://github.com/VUXXE/asydev-os ↗</a></div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-line"><strong>FEATURED OPEN-SOURCE REPOSITORIES:</strong></div>
          <table class="cli-contact-table">
            <tbody>
              <tr class="cli-contact-tr">
                <td class="cli-contact-name"><strong>VUXXE/mesh-core-v2</strong></td>
                <td class="cli-contact-handle">Tauri v2, Rust, Svelte 5, Local-First Canvas</td>
                <td class="cli-contact-link"><a href="https://github.com/VUXXE/mesh-core-v2" target="_blank" rel="noopener noreferrer" class="cli-link">[ Repo ↗ ]</a></td>
              </tr>
              <tr class="cli-contact-tr">
                <td class="cli-contact-name"><strong>VUXXE/baswara-cloudflare</strong></td>
                <td class="cli-contact-handle">TanStack Start, Cloudflare Workers, D1, R2</td>
                <td class="cli-contact-link"><a href="https://github.com/VUXXE/baswara-cloudflare" target="_blank" rel="noopener noreferrer" class="cli-link">[ Repo ↗ ]</a></td>
              </tr>
              <tr class="cli-contact-tr">
                <td class="cli-contact-name"><strong>VUXXE/whatsapp-bridge-custom</strong></td>
                <td class="cli-contact-handle">Node.js, Baileys v6, REST API Gateway</td>
                <td class="cli-contact-link"><a href="https://github.com/VUXXE/whatsapp-bridge-custom" target="_blank" rel="noopener noreferrer" class="cli-link">[ Repo ↗ ]</a></td>
              </tr>
              <tr class="cli-contact-tr">
                <td class="cli-contact-name"><strong>VUXXE/PerpustakaanFreedomFix</strong></td>
                <td class="cli-contact-handle">Java 21, Swing FlatLaf, MySQL, HikariCP</td>
                <td class="cli-contact-link"><a href="https://github.com/VUXXE/PerpustakaanFreedomFix" target="_blank" rel="noopener noreferrer" class="cli-link">[ Repo ↗ ]</a></td>
              </tr>
              <tr class="cli-contact-tr">
                <td class="cli-contact-name"><strong>VUXXE/cachy-dotfiles</strong></td>
                <td class="cli-contact-handle">Arch Linux / CachyOS, Hyprland & Waybar</td>
                <td class="cli-contact-link"><a href="https://github.com/VUXXE/cachy-dotfiles" target="_blank" rel="noopener noreferrer" class="cli-link">[ Repo ↗ ]</a></td>
              </tr>
              <tr class="cli-contact-tr">
                <td class="cli-contact-name"><strong>VUXXE/asydev-os</strong></td>
                <td class="cli-contact-handle">Retro CRT Terminal Portfolio (ASYDEV-OS)</td>
                <td class="cli-contact-link"><a href="https://github.com/VUXXE/asydev-os" target="_blank" rel="noopener noreferrer" class="cli-link">[ Repo ↗ ]</a></td>
              </tr>
            </tbody>
          </table>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            <a href="https://github.com/VUXXE" target="_blank" rel="noopener noreferrer" class="cli-btn-primary">[ 🌐 OPEN GITHUB PROFILE ↗ ]</a>
            <a href="https://github.com/VUXXE/asydev-os" target="_blank" rel="noopener noreferrer" class="cli-btn-secondary">[ ⭐ STAR THIS REPO ↗ ]</a>
          </div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="experience">experience</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="resume">resume</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└── [ TYPE "projects" TO VIEW DETAILED SYSTEM SPECS ] ──────────────────────┘</div>
      </div>
    `);
  }

  private cmdContact(): void {
    const rows = PORTFOLIO_DATA.socials.map(s => `
      <tr class="cli-contact-tr">
        <td class="cli-contact-name"><strong>${s.name.padEnd(14)}</strong></td>
        <td class="cli-contact-handle">${s.handle}</td>
        <td class="cli-contact-link">
          <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="cli-link">[ Open ↗ ]</a>
        </td>
      </tr>
    `).join('');

    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ COMMUNICATION & DIRECT SOCIAL CHANNELS ] ─────────────────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line">Direct inquiries, contracts, and collaborations welcome.</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <table class="cli-contact-table">
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="education">education</button>
            <button type="button" class="cli-chip" data-cmd="bio">bio</button>
            <button type="button" class="cli-chip" data-cmd="resume">resume</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└──────────────────────────────────────────────────────────────────────────┘</div>
      </div>
    `);
  }

  private cmdResume(): void {
    const p = PORTFOLIO_DATA.profile;
    const edu = PORTFOLIO_DATA.education[0];
    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ CURRICULUM VITAE: ${p.name.toUpperCase()} ] ─────────────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line"><strong>${p.name}</strong> // <span class="cli-highlight">${p.title}</span></div>
          <div class="cli-line">Contact : ${p.phone} // hanan7taqiyya@gmail.com // github.com/VUXXE // ${p.location}</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-line"><strong>SUMMARY:</strong></div>
          <div class="cli-bio-text"><p>${p.bio.join(' ')}</p></div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-line"><strong>EDUCATION:</strong></div>
          <div class="cli-line"><strong>${edu.institution}</strong> (${edu.location})</div>
          <div class="cli-line">${edu.degree} | GPA: <span class="cli-highlight">${edu.gpa}</span> | ${edu.period}</div>
          <div class="cli-dim">Coursework: ${edu.coursework.join(', ')}</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-line"><strong>TECHNICAL SKILLS:</strong></div>
          <div class="cli-line">Languages  : Go, Rust, TypeScript, JavaScript, Java, Python, SQL, HTML5/CSS3</div>
          <div class="cli-line">Frameworks : React 19, Next.js, TanStack Start, SvelteKit (Svelte 5 Runes), Go Fiber v2, GORM, Tauri v2, FlatLaf</div>
          <div class="cli-line">Databases  : Cloudflare D1/SQLite, MySQL 8.0, PostgreSQL, Cloudflare R2, Drizzle ORM, HikariCP</div>
          <div class="cli-line">Cloud/Infra: Cloudflare Workers, Durable Objects, Docker, Linux (Arch/CachyOS), Git/GitHub Actions, OCI</div>
          <div class="cli-line">Concepts   : Clean Architecture, Better Auth, Real-Time State Sync (LWW), Baileys APIs, RESTful APIs</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            <a href="/cv.pdf" download="Asy-Syahid_Abdurrahman_Hanan_Taqiyya_CV.pdf" class="cli-btn-primary">[ 📥 DOWNLOAD OFFICIAL PDF ]</a>
            <button type="button" class="cli-btn-secondary" onclick="window.print()">[ 🖨 PRINT VIEW ]</button>
            <a href="mailto:hanan7taqiyya@gmail.com" class="cli-btn-secondary">[ ✉ EMAIL ]</a>
            <a href="https://wa.me/6285157839155" target="_blank" rel="noopener noreferrer" class="cli-btn-secondary">[ 💬 WHATSAPP ]</a>
          </div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            NAVIGATE:
            <button type="button" class="cli-chip" data-cmd="education">education</button>
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="experience">experience</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
            <button type="button" class="cli-chip" data-cmd="clear">clear</button>
          </div>
        </div>
        <div class="cli-box-footer">└──────────────────────────────────────────────────────────────────────────┘</div>
      </div>
    `);
  }

  private cmdLs(): void {
    const curr = this.getCurrentDir();
    const dirEntries = Object.keys(curr.dirs).map(d => 
      `<button type="button" class="cli-dir-chip" data-dir="${d}">${d}/</button>`
    );
    const fileEntries = Object.keys(curr.files).map(f => 
      `<button type="button" class="cli-file-chip" data-file="${f}">${f}</button>`
    );

    const all = [...dirEntries, ...fileEntries];
    if (all.length === 0) {
      this.appendOutput(`<div class="cli-row cli-dim">total 0</div>`);
      return;
    }

    this.appendOutput(`
      <div class="cli-row">
        ${all.join('    ')}
      </div>
      <div class="cli-row cli-dim" style="margin-top: 4px;">Click any directory (blue) or file (green) to navigate.</div>
    `);
  }

  private cmdCat(filename: string): void {
    if (!filename) {
      this.appendOutput(`<div class="cli-row cli-warn">Usage: cat &lt;filename&gt; (e.g. <button type="button" class="cli-file-chip" data-file="bio.txt">cat bio.txt</button>)</div>`);
      return;
    }

    const content = this.resolveFile(filename);
    if (content !== null) {
      if (filename.toLowerCase().endsWith('.svg')) {
        this.appendOutput(`
          <div class="cli-file-display">
            <div class="cli-file-header">::: ${filename} (VECTOR GRAPHIC) :::</div>
            <div class="cli-brand-banner">
              ${content}
            </div>
          </div>
        `);
        return;
      }
      this.appendOutput(`
        <div class="cli-file-display">
          <div class="cli-file-header">::: ${filename} :::</div>
          <pre class="cli-file-content">${this.escapeHtml(content)}</pre>
        </div>
      `);
    } else {
      audio.playBell();
      this.appendOutput(`<div class="cli-row cli-error">cat: ${this.escapeHtml(filename)}: No such file or directory. Type <button type="button" class="cli-chip" data-cmd="ls">ls</button> to view files.</div>`);
    }
  }

  private cmdTheme(arg: string): void {
    if (!arg) {
      const next = crt.cycleTheme();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Phosphor color switched to: <strong>${next.toUpperCase()}</strong></div>`);
      return;
    }
    const success = crt.setTheme(arg);
    if (success) {
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Phosphor color set to: <strong>${arg.toUpperCase()}</strong></div>`);
    } else {
      this.appendOutput(`<div class="cli-row cli-error">Unknown theme "${this.escapeHtml(arg)}". Valid themes: green, amber, white, cyber.</div>`);
    }
  }

  private cmdFont(arg: string): void {
    if (!arg) {
      const next = crt.cycleFont();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Font mode switched to: <strong>${next === 'pixel' ? 'PIXEL 80s (DEC VT220)' : 'CLEAN MONOSPACE'}</strong></div>`);
      return;
    }
    const success = crt.setFont(arg);
    if (success) {
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Font mode set to: <strong>${arg.toUpperCase()}</strong></div>`);
    } else {
      this.appendOutput(`<div class="cli-row cli-error">Unknown font "${this.escapeHtml(arg)}". Valid fonts: pixel, clean.</div>`);
    }
  }

  private cmdBarrel(arg: string): void {
    if (!arg) {
      const next = crt.cycleCurvature();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: CRT Barrel curvature preset: <strong>${next.label}</strong></div>`);
      return;
    }
    const success = crt.setCurvatureByName(arg);
    if (success) {
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: CRT Barrel curvature set to: <strong>${arg.toUpperCase()}</strong></div>`);
    } else {
      this.appendOutput(`<div class="cli-row cli-error">Unknown curvature "${this.escapeHtml(arg)}". Valid presets: flat, subtle, authentic, heavy.</div>`);
    }
  }

  private cmdScanlines(arg: string): void {
    if (!arg) {
      const active = crt.toggleScanlines();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Scanlines: <strong>${active ? 'ON' : 'OFF'}</strong></div>`);
      return;
    }
    if (arg === 'on') {
      crt.scanlinesEnabled = false; // toggleScanlines flips it
      crt.toggleScanlines();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Scanlines enabled.</div>`);
    } else if (arg === 'off') {
      crt.scanlinesEnabled = true;
      crt.toggleScanlines();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Scanlines disabled.</div>`);
    } else {
      this.appendOutput(`<div class="cli-row cli-error">Usage: scanlines &lt;on|off&gt;</div>`);
    }
  }

  private cmdScale(arg: string): void {
    if (!arg) {
      const currentPct = Math.round(crt.getScale() * 100);
      this.appendOutput(`
        <div class="cli-row cli-info">
          [SYS]: Current terminal scale: <strong>${currentPct}%</strong> (${crt.getScale()}x).
        </div>
        <div class="cli-suggest-row">
          PRESETS:
          <button type="button" class="cli-chip" data-cmd="scale 100">100% (Compact)</button>
          <button type="button" class="cli-chip" data-cmd="scale 150">150% (Medium)</button>
          <button type="button" class="cli-chip" data-cmd="scale 200">200% (Retro 24-Line CRT)</button>
          <button type="button" class="cli-chip" data-cmd="scale 250">250% (Ultra)</button>
        </div>
        <div class="cli-row cli-dim">Type "scale &lt;percent&gt;" to set custom magnification.</div>
      `);
      return;
    }

    let val = parseFloat(arg.replace('%', ''));
    if (val >= 50 && val <= 400) {
      val = val / 100;
    } else if (val >= 0.5 && val <= 4.0) {
      // already a ratio
    } else {
      this.appendOutput(`<div class="cli-row cli-error">Invalid scale "${this.escapeHtml(arg)}". Supported range: 75% to 300% (e.g. scale 200).</div>`);
      return;
    }

    crt.applyScale(val);
    const newPct = Math.round(crt.getScale() * 100);
    this.appendOutput(`<div class="cli-row cli-info">[SYS]: Terminal scale set to <strong>${newPct}%</strong> (${crt.getScale()}x).</div>`);
  }

  private cmdAudio(arg: string): void {
    if (!arg) {
      const muted = audio.toggleMute();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Audio synthesizer: <strong>${muted ? 'MUTED' : 'ENABLED'}</strong></div>`);
      return;
    }
    if (arg === 'on') {
      if (audio.isMuted()) audio.toggleMute();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Audio synthesizer enabled.</div>`);
    } else if (arg === 'off') {
      if (!audio.isMuted()) audio.toggleMute();
      this.appendOutput(`<div class="cli-row cli-info">[SYS]: Audio synthesizer muted.</div>`);
    } else {
      this.appendOutput(`<div class="cli-row cli-error">Usage: audio &lt;on|off&gt;</div>`);
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const terminal = new Terminal();
