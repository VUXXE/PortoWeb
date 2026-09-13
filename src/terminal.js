/**
 * Terminal Emulator Engine
 * Handles interactive CLI input, tab completion, command history,
 * typewriter effects, virtual filesystem, and formatted retro outputs.
 */

import { PORTFOLIO_DATA } from './data.js';
import { audio } from './audio.js';
import { crt } from './crt.js';
import { matrix } from './matrix.js';
import { asciiFire } from './ascii-fire.js';

export class Terminal {
  constructor() {
    this.outputContainer = null;
    this.inputElement = null;
    this.promptUser = "guest";
    this.promptHost = PORTFOLIO_DATA.profile.host;

    this.history = [];
    this.historyIndex = -1;

    this.commandList = [
      { cmd: 'help', desc: 'Display all available commands' },
      { cmd: 'about', desc: 'Developer background, bio & status' },
      { cmd: 'skills', desc: 'Technical proficiency & toolsets' },
      { cmd: 'projects', desc: 'Showcase of selected works & systems' },
      { cmd: 'experience', desc: 'Career history and milestones' },
      { cmd: 'contact', desc: 'Communication channels & social links' },
      { cmd: 'resume', desc: 'Curriculum Vitae / resume overview' },
      { cmd: 'theme', desc: 'Switch phosphor color [green|amber|white|cyber]' },
      { cmd: 'curvature', desc: 'Set CRT barrel distortion [flat|subtle|authentic|heavy]' },
      { cmd: 'degauss', desc: 'Trigger CRT magnetic degauss coil pulse' },
      { cmd: 'matrix', desc: 'Launch Matrix digital rain screensaver' },
      { cmd: 'fire', desc: 'Launch 90s demoscene ASCII Doom fire demo' },
      { cmd: 'ls', desc: 'List files in virtual directory' },
      { cmd: 'cat', desc: 'Read a virtual file (e.g. cat bio.txt)' },
      { cmd: 'clear', desc: 'Clear the terminal buffer' },
      { cmd: 'date', desc: 'Print system date and time' },
      { cmd: 'whoami', desc: 'Display current user identity' },
      { cmd: 'sudo', desc: 'Execute superuser privilege' }
    ];

    this.virtualFiles = {
      'bio.txt': PORTFOLIO_DATA.profile.bio.join('\n\n'),
      'skills.txt': 'Run "skills" for the interactive visual display.',
      'projects.txt': 'Run "projects" for full project cards and repository links.',
      'contact.txt': PORTFOLIO_DATA.socials.map(s => `${s.name.padEnd(12)} : ${s.handle} (${s.url})`).join('\n'),
      'flag.txt': 'CTF{cRt_b4rr3l_d1st0rt10n_1984} - You found the secret flag!'
    };

    this.isBooting = false;
  }

  init() {
    this.outputContainer = document.getElementById('terminal-output');
    this.inputElement = document.getElementById('cli-input');

    if (!this.inputElement || !this.outputContainer) return;

    this.bindEvents();
    this.runBootSequence();
  }

  bindEvents() {
    // Keep input focused when clicking screen
    const screen = document.getElementById('crt-screen');
    if (screen) {
      screen.addEventListener('click', (e) => {
        // Only focus if user didn't click an actual link or button
        if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
          this.inputElement.focus();
        }
      });
    }

    // Input keyboard handling
    this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Keystroke audio feedback
    this.inputElement.addEventListener('input', () => {
      audio.playKeyClick();
    });

    // Quick Command Buttons in UI
    const quickButtons = document.querySelectorAll('.quick-cmd-btn');
    quickButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          audio.playKeyClick(200);
          this.executeCommand(cmd);
        }
      });
    });
  }

  handleKeyDown(e) {
    if (this.isBooting) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const rawCmd = this.inputElement.value.trim();
      this.inputElement.value = '';
      if (rawCmd.length > 0) {
        this.history.push(rawCmd);
        this.historyIndex = this.history.length;
        this.executeCommand(rawCmd);
      } else {
        this.printPromptLine('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.history.length > 0 && this.historyIndex > 0) {
        this.historyIndex--;
        this.inputElement.value = this.history[this.historyIndex];
        audio.playKeyClick(100);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.inputElement.value = this.history[this.historyIndex];
        audio.playKeyClick(100);
      } else {
        this.historyIndex = this.history.length;
        this.inputElement.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.handleTabCompletion();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.clear();
    }
  }

  handleTabCompletion() {
    const current = this.inputElement.value.trim().toLowerCase();
    if (!current) return;

    const matches = this.commandList
      .map(c => c.cmd)
      .filter(cmd => cmd.startsWith(current));

    if (matches.length === 1) {
      this.inputElement.value = matches[0] + ' ';
      audio.playKeyClick(300);
    } else if (matches.length > 1) {
      audio.playBell();
      this.printPromptLine(current);
      this.println(`Matching: ${matches.join('   ')}`, 'cmd-info');
    } else {
      audio.playBell();
    }
  }

  printPromptLine(cmdText) {
    const line = document.createElement('div');
    line.className = 'term-line prompt-line';
    line.innerHTML = `<span class="prompt-user">${this.promptUser}@${this.promptHost}</span><span class="prompt-sep">:</span><span class="prompt-path">~</span><span class="prompt-char">$</span> <span class="prompt-input-text">${this.escapeHtml(cmdText)}</span>`;
    this.outputContainer.appendChild(line);
    this.scrollToBottom();
  }

  println(html, className = '') {
    const line = document.createElement('div');
    line.className = `term-line ${className}`;
    line.innerHTML = html;
    this.outputContainer.appendChild(line);
    this.scrollToBottom();
    return line;
  }

  scrollToBottom() {
    const wrapper = document.getElementById('crt-screen');
    if (wrapper) {
      wrapper.scrollTop = wrapper.scrollHeight;
    }
  }

  clear() {
    this.outputContainer.innerHTML = '';
    this.scrollToBottom();
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Command dispatcher
   */
  executeCommand(rawCmd) {
    this.printPromptLine(rawCmd);

    const parts = rawCmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
      case '?':
        this.cmdHelp();
        break;

      case 'about':
      case 'bio':
      case 'who':
        this.cmdAbout();
        break;

      case 'skills':
        this.cmdSkills();
        break;

      case 'projects':
      case 'proj':
        this.cmdProjects();
        break;

      case 'project':
        this.cmdProjectDetail(args[0]);
        break;

      case 'experience':
      case 'history':
      case 'work':
        this.cmdExperience();
        break;

      case 'contact':
      case 'email':
      case 'socials':
        this.cmdContact();
        break;

      case 'resume':
      case 'cv':
        this.cmdResume();
        break;

      case 'theme':
        this.cmdTheme(args[0]);
        break;

      case 'curvature':
      case 'barrel':
      case 'distortion':
        this.cmdCurvature(args[0]);
        break;

      case 'degauss':
        this.println(`[+] INITIATING ELECTROMAGNETIC DEGAUSS COIL DISCHARGE...`, 'cmd-info');
        crt.degauss();
        break;

      case 'matrix':
        this.println(`[+] ACTIVATING NEURAL CIPHER STREAM... [ESC OR CLICK TO EXIT]`, 'cmd-success');
        matrix.start();
        break;

      case 'fire':
        this.println(`[+] LAUNCHING 1993 DEMOSCENE ASCII FLAME BUFFER... [ESC TO EXIT]`, 'cmd-success');
        asciiFire.start();
        break;

      case 'scanlines':
        const state = crt.toggleScanlines();
        this.println(`Scanlines: ${state ? 'ENABLED' : 'DISABLED'}`, 'cmd-info');
        break;

      case 'audio':
      case 'sound':
        const muted = audio.toggleMute();
        this.println(`CRT Audio Synthesizer: ${muted ? 'MUTED' : 'ENABLED'}`, 'cmd-info');
        break;

      case 'ls':
      case 'dir':
        this.cmdLs();
        break;

      case 'cat':
        this.cmdCat(args[0]);
        break;

      case 'clear':
      case 'cls':
        this.clear();
        break;

      case 'date':
        this.println(`Current System Time: ${new Date().toUTCString()}`, 'cmd-info');
        break;

      case 'whoami':
        this.println(`${this.promptUser} (authorized portfolio visitor - permission level: GUEST_RO)`, 'cmd-info');
        break;

      case 'echo':
        this.println(this.escapeHtml(args.join(' ')));
        break;

      case 'sudo':
        audio.playBell();
        this.println(`sudo: user "${this.promptUser}" is not in the sudoers file. This incident will be reported.`, 'cmd-error');
        break;

      case 'exit':
      case 'quit':
        this.println(`[!] Cannot disconnect active TTY console. Power switch is on the monitor bezel.`, 'cmd-warning');
        break;

      default:
        audio.playBell();
        this.println(`command not found: "${this.escapeHtml(command)}". Type <span class="term-clickable" data-run="help">help</span> for a list of commands.`, 'cmd-error');
        break;
    }

    this.bindClickableCommands();
    this.scrollToBottom();
  }

  bindClickableCommands() {
    const clickables = this.outputContainer.querySelectorAll('.term-clickable:not(.bound)');
    clickables.forEach(el => {
      el.classList.add('bound');
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const toRun = el.getAttribute('data-run');
        if (toRun) {
          audio.playKeyClick(200);
          this.executeCommand(toRun);
        }
      });
    });
  }

  // COMMAND IMPLEMENTATIONS

  cmdHelp() {
    let out = `<div class="cmd-box">
<div class="box-title">AVAILABLE COMMANDS</div>
<table class="term-table">`;
    this.commandList.forEach(c => {
      out += `<tr>
        <td class="cmd-cell"><span class="term-clickable" data-run="${c.cmd}">${c.cmd}</span></td>
        <td class="desc-cell">${c.desc}</td>
      </tr>`;
    });
    out += `</table>
<div class="table-footer">Tip: Click any command above or press <kbd>TAB</kbd> for auto-completion.</div>
</div>`;
    this.println(out);
  }

  cmdAbout() {
    const p = PORTFOLIO_DATA.profile;
    let bioHtml = p.bio.map(b => `<p class="bio-para">${b}</p>`).join('');

    let out = `
<div class="cmd-box">
  <div class="box-header">
    <span class="box-tag">SYS-ID: ${p.systemName}</span>
    <span class="box-tag status-pill">${p.status}</span>
  </div>
  <div class="about-hero">
    <div class="about-name">${p.handle.toUpperCase()}</div>
    <div class="about-title">${p.title}</div>
    <div class="about-loc">Location: ${p.location}</div>
  </div>
  <div class="about-body">
    ${bioHtml}
  </div>
  <div class="box-actions">
    <button class="term-btn term-clickable" data-run="skills">[ VIEW SKILLS ]</button>
    <button class="term-btn term-clickable" data-run="projects">[ VIEW PROJECTS ]</button>
    <button class="term-btn term-clickable" data-run="contact">[ GET IN TOUCH ]</button>
  </div>
</div>`;
    this.println(out);
  }

  cmdSkills() {
    let out = `<div class="cmd-box"><div class="box-title">TECHNICAL PROFICIENCY MATRIX</div>`;

    PORTFOLIO_DATA.skills.forEach(group => {
      out += `<div class="skill-category">
        <div class="skill-cat-title">=== ${group.category} ===</div>
        <div class="skill-grid">`;

      group.items.forEach(skill => {
        const totalBars = 16;
        const filledBars = Math.round((skill.level / 100) * totalBars);
        const emptyBars = totalBars - filledBars;
        const barStr = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

        out += `<div class="skill-row">
          <span class="skill-name">${skill.name.padEnd(24)}</span>
          <span class="skill-meter">[${barStr}]</span>
          <span class="skill-pct">${String(skill.level).padStart(3)}%</span>
          <span class="skill-exp">${skill.exp}</span>
        </div>`;
      });

      out += `</div></div>`;
    });

    out += `</div>`;
    this.println(out);
  }

  cmdProjects() {
    let out = `<div class="cmd-box"><div class="box-title">SELECTED ARCHITECTURE & PRODUCTION WORKS</div>`;

    PORTFOLIO_DATA.projects.forEach(p => {
      const tagBadges = p.tags.map(t => `<span class="tag-badge">${t}</span>`).join(' ');
      const highlightList = p.highlights.map(h => `<li>${h}</li>`).join('');

      out += `
<div class="project-card">
  <div class="project-header">
    <span class="project-num">[${p.num}]</span>
    <span class="project-title">${p.title}</span>
    <span class="project-year">${p.year}</span>
  </div>
  <div class="project-tags">${tagBadges}</div>
  <div class="project-desc">${p.description}</div>
  <ul class="project-highlights">${highlightList}</ul>
  <div class="project-links">
    ${p.links.demo ? `<a href="${p.links.demo}" target="_blank" rel="noopener" class="term-link">&gt; RUN LIVE DEMO</a>` : ''}
    ${p.links.github ? `<a href="${p.links.github}" target="_blank" rel="noopener" class="term-link">&gt; VIEW REPO (GITHUB)</a>` : ''}
    <span class="term-clickable" data-run="project ${p.id}">&gt; INSPECT SPECS</span>
  </div>
</div>`;
    });

    out += `</div>`;
    this.println(out);
  }

  cmdProjectDetail(id) {
    if (!id) {
      this.println(`Usage: project &lt;id&gt; (e.g. <span class="term-clickable" data-run="project neural-mesh">project neural-mesh</span>)`, 'cmd-warning');
      return;
    }

    const proj = PORTFOLIO_DATA.projects.find(p => p.id === id.toLowerCase() || p.num === id);
    if (!proj) {
      audio.playBell();
      this.println(`Project "${this.escapeHtml(id)}" not found. Type <span class="term-clickable" data-run="projects">projects</span> for list.`, 'cmd-error');
      return;
    }

    let out = `
<div class="cmd-box">
  <div class="box-title">DETAILED SYSTEM SPEC // ${proj.title}</div>
  <p><strong>Category:</strong> ${proj.category} | <strong>Year:</strong> ${proj.year}</p>
  <p><strong>Overview:</strong> ${proj.description}</p>
  <div class="spec-section">
    <div class="spec-title">Key Architectural Highlights:</div>
    <ul>
      ${proj.highlights.map(h => `<li>${h}</li>`).join('')}
    </ul>
  </div>
  <p><strong>Technologies:</strong> ${proj.tags.join(', ')}</p>
  <div class="project-links">
    ${proj.links.demo ? `<a href="${proj.links.demo}" target="_blank" rel="noopener" class="term-link">&gt; OPEN LIVE DEPLOYMENT</a>` : ''}
    ${proj.links.github ? `<a href="${proj.links.github}" target="_blank" rel="noopener" class="term-link">&gt; BROWSE SOURCE CODE</a>` : ''}
  </div>
</div>`;
    this.println(out);
  }

  cmdExperience() {
    let out = `<div class="cmd-box"><div class="box-title">CAREER TIMELINE & ROLES</div><div class="timeline-tree">`;

    PORTFOLIO_DATA.experience.forEach((exp, idx) => {
      const isLast = idx === PORTFOLIO_DATA.experience.length - 1;
      const branchChar = isLast ? '└──' : '├──';
      const pipeChar = isLast ? '   ' : '│  ';

      out += `
<div class="timeline-item">
  <div class="timeline-header">${branchChar} [${exp.period}] <strong>${exp.role}</strong> @ ${exp.company}</div>
  <div class="timeline-body">${pipeChar} ${exp.description}</div>
</div>`;
    });

    out += `</div></div>`;
    this.println(out);
  }

  cmdContact() {
    let linksHtml = PORTFOLIO_DATA.socials.map(s => {
      return `<div class="contact-row">
        <span class="contact-name">${s.name.padEnd(14)}</span>
        <span class="contact-arrow">&gt;&gt;</span>
        <a href="${s.url}" target="_blank" rel="noopener" class="term-link">${s.handle}</a>
      </div>`;
    }).join('');

    let out = `
<div class="cmd-box">
  <div class="box-title">COMMUNICATION CHANNELS</div>
  <div class="contact-matrix">
    ${linksHtml}
  </div>
  <div class="contact-prompt-box">
    <p>Feel free to reach out for collaborations, architecture discussions, or contract opportunities!</p>
    <a href="mailto:contact@example.com" class="term-btn term-link">[ COMPOSE DIRECT TRANSMISSION (EMAIL) ]</a>
  </div>
</div>`;
    this.println(out);
  }

  cmdResume() {
    let out = `
<div class="cmd-box">
  <div class="box-title">CURRICULUM VITAE // RESUME</div>
  <div class="resume-summary">
    <p><strong>Candidate:</strong> ${PORTFOLIO_DATA.profile.handle} (${PORTFOLIO_DATA.profile.title})</p>
    <p><strong>Specializations:</strong> High-performance web applications, graphics pipelines, distributed systems, modern frontend architecture.</p>
    <p><strong>Experience:</strong> 6+ years professional engineering across startups and scale-ups.</p>
  </div>
  <div class="box-actions">
    <a href="#" onclick="alert('Resume PDF download can be linked here!'); return false;" class="term-btn term-link">[ DOWNLOAD RESUME (PDF) ]</a>
    <button class="term-btn term-clickable" data-run="skills">[ VIEW DETAILED SKILLS ]</button>
    <button class="term-btn term-clickable" data-run="projects">[ VIEW PORTFOLIO PROJECTS ]</button>
  </div>
</div>`;
    this.println(out);
  }

  cmdTheme(themeName) {
    if (!themeName) {
      const cur = crt.themes[crt.currentThemeIndex];
      this.println(`Current phosphor: <strong>${cur.toUpperCase()}</strong>. Available: green, amber, white, cyber. (e.g. <span class="term-clickable" data-run="theme amber">theme amber</span>)`, 'cmd-info');
      return;
    }

    if (crt.setTheme(themeName)) {
      audio.playKeyClick(400);
      this.println(`Phosphor spectrum switched to: <strong>${themeName.toUpperCase()}</strong>`, 'cmd-success');
    } else {
      audio.playBell();
      this.println(`Unknown theme "${this.escapeHtml(themeName)}". Options: green, amber, white, cyber`, 'cmd-error');
    }
  }

  cmdCurvature(mode) {
    if (!mode) {
      const cur = crt.curvatureLevels[crt.currentCurvatureIndex];
      this.println(`Current CRT Curvature: <strong>${cur.label}</strong>. Available: flat, subtle, authentic, heavy. (e.g. <span class="term-clickable" data-run="curvature authentic">curvature authentic</span>)`, 'cmd-info');
      return;
    }

    if (crt.setCurvatureByName(mode)) {
      audio.playKeyClick(300);
      this.println(`CRT Barrel Distortion curvature set to: <strong>${mode.toUpperCase()}</strong>`, 'cmd-success');
    } else {
      audio.playBell();
      this.println(`Invalid mode "${this.escapeHtml(mode)}". Options: flat, subtle, authentic, heavy`, 'cmd-error');
    }
  }

  cmdLs() {
    const files = Object.keys(this.virtualFiles);
    let out = `<div class="file-list">`;
    files.forEach(f => {
      out += `<span class="file-item term-clickable" data-run="cat ${f}">-rw-r--r-- 1 guest guest 1024 ${f}</span>\n`;
    });
    out += `</div>\n<div class="cmd-hint">Click any file or type "cat &lt;filename&gt;" to inspect.</div>`;
    this.println(out);
  }

  cmdCat(fileName) {
    if (!fileName) {
      this.println(`Usage: cat &lt;filename&gt; (e.g. <span class="term-clickable" data-run="cat bio.txt">cat bio.txt</span>)`, 'cmd-warning');
      return;
    }

    const content = this.virtualFiles[fileName.toLowerCase()];
    if (content) {
      this.println(`<pre class="file-content">${this.escapeHtml(content)}</pre>`);
    } else {
      audio.playBell();
      this.println(`cat: ${this.escapeHtml(fileName)}: No such file or directory`, 'cmd-error');
    }
  }

  /**
   * Boot sequence simulation with skip capability
   */
  runBootSequence() {
    this.isBooting = true;
    audio.playPowerOn();

    const bootMessages = [
      "PORTO-BIOS v3.20 (C) 1984-2026 RETRO SYSTEMS CORP.",
      "CPU: MOTOROLA 68000 @ 12.0 MHz // BUS WIDTH: 16-BIT",
      "CHECKING BASE RAM: 640 KB ........... OK",
      "CHECKING EXTENDED VRAM: 512 KB ...... OK",
      "PRIMARY DISPLAY: CRT CATHODE TUBE // BARREL DISTORTION ACTIVE",
      "DETECTING SERIAL TTY0 ON PORT RS-232 @ 9600 BAUD ... ESTABLISHED",
      "MOUNTING ROOT VIRTUAL FILESYSTEM (ROFS) .............. OK",
      "LOADING SYSTEM PROFILE: EXU // READY."
    ];

    let step = 0;
    const bootInterval = setInterval(() => {
      if (step < bootMessages.length) {
        this.println(bootMessages[step], 'boot-line');
        audio.playKeyClick(150);
        step++;
      } else {
        clearInterval(bootInterval);
        this.finishBoot();
      }
    }, 120);

    // Skip boot on click or key
    const skipHandler = () => {
      clearInterval(bootInterval);
      window.removeEventListener('keydown', skipHandler);
      this.outputContainer.removeEventListener('click', skipHandler);
      if (this.isBooting) {
        this.clear();
        this.finishBoot();
      }
    };

    window.addEventListener('keydown', skipHandler, { once: true });
    this.outputContainer.addEventListener('click', skipHandler, { once: true });
  }

  finishBoot() {
    this.isBooting = false;
    this.println(`<pre class="ascii-banner">${PORTFOLIO_DATA.asciiLogo}</pre>`, 'banner-line');
    this.println(`
<div class="welcome-banner">
  <div class="welcome-text">
    Welcome to <strong>${PORTFOLIO_DATA.profile.handle}'s</strong> vintage interactive CRT terminal portfolio.
  </div>
  <div class="welcome-sub">
    Use the <strong>quick buttons</strong> below or type commands directly into the terminal prompt.
  </div>
  <div class="welcome-cmd-hint">
    Type <span class="term-clickable" data-run="help">help</span> for all commands, or try <span class="term-clickable" data-run="about">about</span>, <span class="term-clickable" data-run="skills">skills</span>, <span class="term-clickable" data-run="projects">projects</span>, or <span class="term-clickable" data-run="matrix">matrix</span>.
  </div>
</div>`, 'welcome-box');

    this.bindClickableCommands();
    if (this.inputElement) {
      this.inputElement.focus();
    }
  }
}

export const terminal = new Terminal();
