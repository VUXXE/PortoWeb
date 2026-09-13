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

export class Terminal {
  private outputBuffer: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private promptLine: HTMLElement | null = null;

  private readonly promptUser: string = "guest";
  private readonly promptHost: string = PORTFOLIO_DATA.profile.host;

  private history: string[] = [];
  private historyIndex: number = -1;

  private readonly virtualFiles: Record<string, string> = {
    'bio.txt': PORTFOLIO_DATA.profile.bio.join('\n\n'),
    'skills.txt': PORTFOLIO_DATA.skills.map(s => 
      `[ ${s.category} ]\n` + s.items.map(i => `  * ${i.name.padEnd(25)} [${i.tier}] ${i.exp.padEnd(7)} : ${i.focus}`).join('\n')
    ).join('\n\n'),
    'projects.txt': PORTFOLIO_DATA.projects.map(p =>
      `[${p.num}] ${p.title} (${p.year}) - ${p.category}\n    ${p.description}\n    Tags: ${p.tags.join(', ')}\n    URL: ${p.links.github}`
    ).join('\n\n'),
    'history.txt': PORTFOLIO_DATA.experience.map(e =>
      `[ ${e.period} ] ${e.role} @ ${e.company}\n  ${e.description}`
    ).join('\n\n'),
    'contact.txt': PORTFOLIO_DATA.socials.map(s => 
      `${s.name.padEnd(12)} : ${s.handle} (${s.url})`
    ).join('\n'),
    'resume.txt': `${PORTFOLIO_DATA.profile.handle.toUpperCase()} - CURRICULUM VITAE\nTitle: ${PORTFOLIO_DATA.profile.title}\nLocation: ${PORTFOLIO_DATA.profile.location}\n\nType "resume" for full interactive layout.`,
    'flag.txt': 'CTF{cRt_b4rr3l_d1st0rt10n_1984} // You found the secret terminal flag!'
  };

  private readonly commands: CommandDefinition[] = [
    { cmd: 'help', aliases: ['?'], desc: 'Display all available terminal commands' },
    { cmd: 'bio', aliases: ['about'], desc: 'Developer background, bio and status' },
    { cmd: 'skills', aliases: ['stack'], desc: 'Technical proficiencies and skill matrix' },
    { cmd: 'projects', aliases: ['work', 'portfolio'], desc: 'Showcase of selected works and systems' },
    { cmd: 'project', args: '<1-4|id>', desc: 'View detailed specs of a specific project' },
    { cmd: 'history', aliases: ['exp', 'career'], desc: 'Career history and milestones' },
    { cmd: 'contact', aliases: ['socials', 'email'], desc: 'Communication channels and links' },
    { cmd: 'resume', aliases: ['cv'], desc: 'Curriculum Vitae overview and download' },
    { cmd: 'ls', aliases: ['dir'], desc: 'List files in virtual directory' },
    { cmd: 'cat', args: '<file>', desc: 'Read a virtual file (e.g. cat bio.txt)' },
    { cmd: 'theme', args: '[color]', desc: 'Set phosphor color [green|amber|white|cyber]' },
    { cmd: 'font', args: '[mode]', desc: 'Toggle font [pixel|clean]' },
    { cmd: 'barrel', args: '[mode]', desc: 'Set CRT barrel distortion [flat|subtle|authentic|heavy]' },
    { cmd: 'scanlines', args: '[on|off]', desc: 'Toggle CRT scanlines' },
    { cmd: 'degauss', desc: 'Trigger CRT magnetic degauss coil pulse' },
    { cmd: 'audio', args: '[on|off]', desc: 'Toggle mechanical keyboard sound synth' },
    { cmd: 'power', aliases: ['exit', 'shutdown'], desc: 'Toggle CRT monitor power off/on' },
    { cmd: 'matrix', desc: 'Launch Matrix digital rain screensaver' },
    { cmd: 'fire', desc: 'Launch 1990s demoscene Doom fire demo' },
    { cmd: 'clear', aliases: ['cls'], desc: 'Clear the terminal output buffer' },
    { cmd: 'banner', aliases: ['motd'], desc: 'Print system login banner' },
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

    if (!this.outputBuffer || !this.inputElement) return;

    this.bindEvents();
    this.printBootBanner();
    this.focusInput();
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
      this.inputElement.addEventListener('input', () => audio.playKeyClick());
    }

    // Delegation for in-buffer clickable commands and files
    if (this.outputBuffer) {
      this.outputBuffer.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const cmdBtn = target.closest('[data-cmd]') as HTMLElement | null;
        if (cmdBtn) {
          const cmd = cmdBtn.getAttribute('data-cmd');
          if (cmd) {
            this.executeCommand(cmd);
            this.focusInput();
          }
          return;
        }

        const fileBtn = target.closest('[data-file]') as HTMLElement | null;
        if (fileBtn) {
          const file = fileBtn.getAttribute('data-file');
          if (file) {
            this.executeCommand(`cat ${file}`);
            this.focusInput();
          }
        }
      });
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rawCmd = this.inputElement ? this.inputElement.value.trim() : '';
      if (this.inputElement) {
        this.inputElement.value = '';
      }
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
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.handleTabCompletion();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (this.inputElement) {
        const line = this.inputElement.value;
        this.inputElement.value = '';
        this.appendOutput(`<div class="cli-row cli-prompt-echo"><span class="cli-prompt">${this.promptUser}@${this.promptHost}:~$</span> ${line}^C</div>`);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.clearScreen();
    }
  }

  private handleTabCompletion(): void {
    if (!this.inputElement) return;
    const current = this.inputElement.value.trimStart();
    if (!current) return;

    const parts = current.split(' ');
    if (parts.length === 1) {
      // Complete command
      const prefix = parts[0].toLowerCase();
      const allCmds = this.commands.map(c => c.cmd);
      const matches = allCmds.filter(c => c.startsWith(prefix));
      if (matches.length === 1) {
        this.inputElement.value = matches[0] + ' ';
        audio.playKeyClick(200);
      } else if (matches.length > 1) {
        this.appendOutput(`<div class="cli-suggest-row">${matches.map(m => `<button type="button" class="cli-chip" data-cmd="${m}">${m}</button>`).join(' ')}</div>`);
        audio.playKeyClick(100);
      } else {
        audio.playBell();
      }
    } else if (parts.length === 2 && parts[0].toLowerCase() === 'cat') {
      // Complete filename
      const prefix = parts[1].toLowerCase();
      const allFiles = Object.keys(this.virtualFiles);
      const matches = allFiles.filter(f => f.startsWith(prefix));
      if (matches.length === 1) {
        this.inputElement.value = `cat ${matches[0]}`;
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
      this.appendOutput(`<div class="cli-row cli-prompt-echo"><span class="cli-prompt">${this.promptUser}@${this.promptHost}:~$</span></div>`);
      return;
    }

    // Save in command history
    if (this.history[this.history.length - 1] !== trimmed) {
      this.history.push(trimmed);
    }
    this.historyIndex = -1;

    // Echo executed command line
    this.appendOutput(`<div class="cli-row cli-prompt-echo"><span class="cli-prompt">${this.promptUser}@${this.promptHost}:~$</span> <strong>${this.escapeHtml(trimmed)}</strong></div>`);

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

      case 'history':
      case 'exp':
      case 'career':
        this.cmdHistory();
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

      case 'theme':
        this.cmdTheme(args);
        break;

      case 'font':
        this.cmdFont(args);
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

  public clearScreen(): void {
    if (this.outputBuffer) {
      const entries = this.outputBuffer.querySelectorAll('.cli-output-entry');
      entries.forEach(e => e.remove());
      this.printPromptHeader();
    }
  }

  private printPromptHeader(): void {
    this.appendOutput(`
      <div class="cli-row cli-dim">
        PORTO-OS Terminal Buffer Cleared // Type <button type="button" class="cli-chip" data-cmd="help">help</button> for available commands.
      </div>
    `);
  }

  private printBootBanner(): void {
    this.appendOutput(`
      <div class="cli-banner-container">
        <pre class="cli-ascii-logo">${PORTFOLIO_DATA.asciiLogo.trim()}</pre>
        <div class="cli-divider">================================================================================</div>
        <div class="cli-sys-info">
          <strong>PORTO-OS</strong> (UNIX System V Release 4 // Model 84-CRT Terminal)<br>
          Connected as <strong>${this.promptUser}@${this.promptHost}.local</strong> (tty0) on ${new Date().toUTCString()}.<br>
          Type <button type="button" class="cli-chip" data-cmd="help">help</button> to see all commands, or click any command below to explore.
        </div>
        <div class="cli-quick-links">
          QUICK COMMANDS:
          <button type="button" class="cli-chip" data-cmd="bio">bio</button>
          <button type="button" class="cli-chip" data-cmd="skills">skills</button>
          <button type="button" class="cli-chip" data-cmd="projects">projects</button>
          <button type="button" class="cli-chip" data-cmd="history">history</button>
          <button type="button" class="cli-chip" data-cmd="contact">contact</button>
          <button type="button" class="cli-chip" data-cmd="resume">resume</button>
          <button type="button" class="cli-chip" data-cmd="ls">ls</button>
          <button type="button" class="cli-chip" data-cmd="help">help</button>
          <button type="button" class="cli-chip" data-cmd="clear">clear</button>
        </div>
        <div class="cli-divider">================================================================================</div>
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
        <div class="cli-box-header">┌── [ PORTO-OS COMMAND REFERENCE ] ────────────────────────────────────────┐</div>
        <table class="cli-help-table">
          <thead>
            <tr>
              <th style="text-align: left; width: 180px; padding-bottom: 4px;">COMMAND</th>
              <th style="text-align: left; padding-bottom: 4px;">DESCRIPTION</th>
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
    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ OPERATOR IDENTITY: ${p.handle.toUpperCase()} ] ───────────────────────────────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line"><strong>ROLE</strong>     : ${p.title}</div>
          <div class="cli-line"><strong>LOCATION</strong> : ${p.location}</div>
          <div class="cli-line"><strong>STATUS</strong>   : <span class="cli-highlight">${p.status}</span></div>
          <div class="cli-line"><strong>SYSTEM</strong>   : ${p.systemName} (${p.version})</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-bio-text">
            ${p.bio.map(para => `<p>${para}</p>`).join('')}
          </div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            EXPLORE FURTHER: 
            <button type="button" class="cli-chip" data-cmd="skills">skills</button>
            <button type="button" class="cli-chip" data-cmd="projects">projects</button>
            <button type="button" class="cli-chip" data-cmd="contact">contact</button>
          </div>
        </div>
        <div class="cli-box-footer">└──────────────────────────────────────────────────────────────────────────┘</div>
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
        </div>
        <div class="cli-box-footer">└── [ TYPE "project <1-4>" FOR DEEP ARCHITECTURE SPECS ] ───────────────────┘</div>
      </div>
    `);
  }

  private cmdProject(args: string): void {
    if (!args) {
      this.appendOutput(`<div class="cli-row cli-warn">Usage: project &lt;1-4|id&gt; (e.g. <button type="button" class="cli-chip" data-cmd="project 1">project 1</button> or <button type="button" class="cli-chip" data-cmd="project neural-mesh">project neural-mesh</button>)</div>`);
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
            <a href="${target.links.github}" target="_blank" rel="noopener noreferrer" class="cli-btn-primary">[ ↗ OPEN SOURCE REPOSITORY ]</a>
            <a href="${target.links.demo}" target="_blank" rel="noopener noreferrer" class="cli-btn-secondary">[ ↗ LAUNCH LIVE DEMO ]</a>
          </div>
        </div>
        <div class="cli-box-footer">└── [ TYPE "projects" TO RETURN TO PROJECT CATALOG ] ───────────────────────┘</div>
      </div>
    `);
  }

  private cmdHistory(): void {
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
        </div>
        <div class="cli-box-footer">└── [ TYPE "resume" FOR CURRICULUM VITAE OVERVIEW ] ────────────────────────┘</div>
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
        </div>
        <div class="cli-box-footer">└──────────────────────────────────────────────────────────────────────────┘</div>
      </div>
    `);
  }

  private cmdResume(): void {
    this.appendOutput(`
      <div class="cli-card-box">
        <div class="cli-box-header">┌── [ CURRICULUM VITAE OVERVIEW ] ──────────────────────────────────────────┐</div>
        <div class="cli-card-body">
          <div class="cli-line"><strong>${PORTFOLIO_DATA.profile.handle.toUpperCase()}</strong> // ${PORTFOLIO_DATA.profile.title}</div>
          <div class="cli-line">Location: ${PORTFOLIO_DATA.profile.location} // Status: ${PORTFOLIO_DATA.profile.status}</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-line"><strong>CORE COMPETENCIES:</strong></div>
          <div class="cli-line">TypeScript, Rust, Python, Go, WebGL/GLSL, Linux Systems, Distributed Tooling.</div>
          <div class="cli-divider">----------------------------------------------------------------------------</div>
          <div class="cli-actions-row">
            <button type="button" class="cli-btn-primary" onclick="window.print()">[ 📥 PRINT / EXPORT CV ]</button>
            <a href="mailto:contact@example.com" class="cli-btn-secondary">[ ✉ INQUIRE BY EMAIL ]</a>
          </div>
        </div>
        <div class="cli-box-footer">└──────────────────────────────────────────────────────────────────────────┘</div>
      </div>
    `);
  }

  private cmdLs(): void {
    const files = Object.keys(this.virtualFiles).map(f => 
      `<button type="button" class="cli-file-chip" data-file="${f}">${f}</button>`
    ).join('    ');

    this.appendOutput(`
      <div class="cli-row">
        ${files}
      </div>
      <div class="cli-row cli-dim">Click any file above or type "cat &lt;filename&gt;" to read.</div>
    `);
  }

  private cmdCat(filename: string): void {
    if (!filename) {
      this.appendOutput(`<div class="cli-row cli-warn">Usage: cat &lt;filename&gt; (e.g. <button type="button" class="cli-file-chip" data-file="bio.txt">cat bio.txt</button>)</div>`);
      return;
    }

    const content = this.virtualFiles[filename.toLowerCase()];
    if (content !== undefined) {
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
