/**
 * Retro CRT Curses TUI & Interactive CLI Controller
 * Strictly Non-Scrollable Full-Page Viewport with Full Click-and-Type Parity
 */

import { PORTFOLIO_DATA } from './data.js';
import { audio } from './audio.js';
import { crt } from './crt.js';
import { matrix } from './matrix.js';
import { asciiFire } from './ascii-fire.js';

export class Terminal {
  constructor() {
    this.viewportContainer = null;
    this.inputElement = null;
    this.statusLineElement = null;
    this.promptUser = "guest";
    this.promptHost = PORTFOLIO_DATA.profile.host;

    this.currentView = 'dashboard';
    this.activeProjectIndex = 0;

    this.history = [];
    this.historyIndex = -1;

    this.commandList = [
      { cmd: 'dashboard', num: '0', desc: 'System overview and quick access menu' },
      { cmd: 'about', num: '1', desc: 'Developer background, bio and status' },
      { cmd: 'skills', num: '2', desc: 'Technical proficiencies and tools' },
      { cmd: 'projects', num: '3', desc: 'Showcase of selected works and systems' },
      { cmd: 'history', num: '4', desc: 'Career history and milestones' },
      { cmd: 'contact', num: '5', desc: 'Communication channels and social links' },
      { cmd: 'resume', num: '6', desc: 'Curriculum Vitae / resume overview' },
      { cmd: 'matrix', num: '7', desc: 'Launch Matrix digital rain screensaver' },
      { cmd: 'fire', num: '8', desc: 'Launch 90s demoscene ASCII Doom fire demo' },
      { cmd: 'help', num: '9', desc: 'Display all available commands' },
      { cmd: 'project', num: '1-4', desc: 'Jump to project [1-4] or ID (e.g. project 2)' },
      { cmd: 'next', num: 'N', desc: 'Switch to next project card' },
      { cmd: 'prev', num: 'P', desc: 'Switch to previous project card' },
      { cmd: 'theme', num: 'T', desc: 'Set phosphor color [green|amber|white|cyber]' },
      { cmd: 'barrel', num: 'B', desc: 'Set CRT barrel distortion [flat|subtle|authentic|heavy]' },
      { cmd: 'scanlines', num: 'S', desc: 'Toggle CRT raster scanlines on/off' },
      { cmd: 'a11y', num: '', desc: 'Activate maximum readability mode (flat, scanlines off)' },
      { cmd: 'degauss', num: 'D', desc: 'Trigger CRT magnetic degauss coil pulse' },
      { cmd: 'audio', num: 'A', desc: 'Toggle CRT mechanical sound synthesizer' },
      { cmd: 'ls', num: '', desc: 'List files in virtual directory' },
      { cmd: 'cat', num: '', desc: 'Read a virtual file (e.g. cat bio.txt)' },
      { cmd: 'clear', num: 'C', desc: 'Refresh the active display buffer' },
      { cmd: 'date', num: '', desc: 'Print system date and time' },
      { cmd: 'whoami', num: '', desc: 'Display current user identity' },
      { cmd: 'sudo', num: '', desc: 'Execute superuser privilege' }
    ];

    this.virtualFiles = {
      'bio.txt': PORTFOLIO_DATA.profile.bio.join('\n\n'),
      'skills.txt': 'Run "skills" or click [ 2: SKILLS ] for interactive matrix.',
      'projects.txt': 'Run "projects" or click [ 3: PROJECTS ] for interactive project deck.',
      'contact.txt': PORTFOLIO_DATA.socials.map(s => `${s.name.padEnd(14)} : ${s.handle} (${s.url})`).join('\n'),
      'flag.txt': 'CTF{cRt_b4rr3l_d1st0rt10n_1984} // You found the secret terminal flag!'
    };
  }

  init() {
    this.viewportContainer = document.getElementById('term-viewport');
    this.inputElement = document.getElementById('cli-input');
    this.statusLineElement = document.getElementById('cli-status-line');

    if (!this.viewportContainer || !this.inputElement) return;

    this.bindGlobalEvents();
    this.setView('dashboard', null, false);
    this.setStatus('[SYS]: SYSTEM INITIALIZED // MODEL 84-CRT READY // SELECT VIEW [0-9] OR TYPE COMMAND');
  }

  bindGlobalEvents() {
    // Keep input focused when clicking screen canvas/background
    const screen = document.getElementById('crt-screen');
    if (screen) {
      screen.addEventListener('click', (e) => {
        if (!e.target.closest('button') && !e.target.closest('a') && !e.target.closest('input')) {
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

    // Quick Command Navigation Buttons in Top Bar
    const quickButtons = document.querySelectorAll('.quick-cmd-btn');
    quickButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          audio.playKeyClick(220);
          this.executeCommand(cmd);
        }
      });
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rawCmd = this.inputElement.value.trim();
      this.inputElement.value = '';
      if (rawCmd.length > 0) {
        this.history.push(rawCmd);
        this.historyIndex = this.history.length;
        this.executeCommand(rawCmd);
      } else {
        audio.playKeyClick(120);
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
      // Auto-complete commands if input has text
      if (!e.shiftKey && this.inputElement.value.trim().length > 0) {
        e.preventDefault();
        this.handleTabCompletion();
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.setView(this.currentView);
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
      audio.playKeyClick(280);
      this.setStatus(`[TAB]: Autocompleted to "${matches[0]}"`);
    } else if (matches.length > 1) {
      audio.playBell();
      this.setStatus(`[TAB MATCHES]: ${matches.join('   ')}`);
    } else {
      audio.playBell();
    }
  }

  setStatus(message, isError = false) {
    if (!this.statusLineElement) return;
    this.statusLineElement.textContent = message;
    if (isError) {
      this.statusLineElement.classList.add('status-error');
      setTimeout(() => {
        if (this.statusLineElement) this.statusLineElement.classList.remove('status-error');
      }, 2500);
    }
  }

  /**
   * Main View Controller
   * Switches views inside the non-scrollable viewport frame
   */
  setView(viewName, arg = null, playAudio = true) {
    const normalized = viewName.toLowerCase();
    const validViews = ['dashboard', 'about', 'skills', 'projects', 'experience', 'contact', 'resume', 'help'];

    if (!validViews.includes(normalized)) {
      return false;
    }

    if (playAudio) {
      audio.playKeyClick(240);
    }

    this.currentView = normalized;

    // Handle project index argument if switching to projects
    if (normalized === 'projects' && arg !== null) {
      this.setProjectIndex(arg, false);
    }

    // Update navigation bar tabs highlighting
    document.querySelectorAll('.quick-cmd-btn').forEach(btn => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd === normalized) {
        btn.classList.add('active-tab');
      } else {
        btn.classList.remove('active-tab');
      }
    });

    // Render HTML template for the active view
    let html = '';
    switch (normalized) {
      case 'dashboard':
        html = this.renderDashboard();
        break;
      case 'about':
        html = this.renderAbout();
        break;
      case 'skills':
        html = this.renderSkills();
        break;
      case 'projects':
        html = this.renderProjects();
        break;
      case 'experience':
        html = this.renderExperience();
        break;
      case 'contact':
        html = this.renderContact();
        break;
      case 'resume':
        html = this.renderResume();
        break;
      case 'help':
        html = this.renderHelp();
        break;
    }

    this.viewportContainer.innerHTML = html;
    this.bindViewEvents();

    if (this.inputElement) {
      this.inputElement.focus();
    }

    return true;
  }

  /**
   * Project Index Controller
   */
  setProjectIndex(indexOrId, shouldRerender = true) {
    const projects = PORTFOLIO_DATA.projects;
    let targetIdx = -1;

    if (typeof indexOrId === 'number') {
      targetIdx = Math.max(0, Math.min(projects.length - 1, indexOrId));
    } else if (typeof indexOrId === 'string') {
      const parsedNum = parseInt(indexOrId, 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= projects.length) {
        targetIdx = parsedNum - 1;
      } else {
        targetIdx = projects.findIndex(p => p.id.toLowerCase() === indexOrId.toLowerCase() || p.num === indexOrId);
      }
    }

    if (targetIdx !== -1) {
      this.activeProjectIndex = targetIdx;
      if (shouldRerender && this.currentView === 'projects') {
        this.setView('projects', null, true);
      }
      return true;
    }
    return false;
  }

  /**
   * Bind all click actions inside the newly rendered viewport
   */
  bindViewEvents() {
    // Elements with data-cmd (execute command or switch view)
    const cmdElements = this.viewportContainer.querySelectorAll('[data-cmd]');
    cmdElements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = el.getAttribute('data-cmd');
        if (cmd) {
          audio.playKeyClick(200);
          this.executeCommand(cmd);
        }
      });
    });

    // Project tabs
    const projTabs = this.viewportContainer.querySelectorAll('.project-tab-btn');
    projTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.getAttribute('data-idx'), 10);
        if (!isNaN(idx)) {
          audio.playKeyClick(250);
          this.activeProjectIndex = idx;
          this.setView('projects', null, false);
          this.setStatus(`[SYS]: DISPLAYING PROJECT [${PORTFOLIO_DATA.projects[idx].num} // ${PORTFOLIO_DATA.projects[idx].title}]`);
        }
      });
    });

    // Project Prev / Next Pagers
    const pagerButtons = this.viewportContainer.querySelectorAll('[data-nav]');
    pagerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const nav = btn.getAttribute('data-nav');
        const count = PORTFOLIO_DATA.projects.length;
        if (nav === 'next') {
          this.activeProjectIndex = (this.activeProjectIndex + 1) % count;
        } else if (nav === 'prev') {
          this.activeProjectIndex = (this.activeProjectIndex - 1 + count) % count;
        }
        audio.playKeyClick(220);
        this.setView('projects', null, false);
        this.setStatus(`[SYS]: DISPLAYING PROJECT [${PORTFOLIO_DATA.projects[this.activeProjectIndex].num} // ${PORTFOLIO_DATA.projects[this.activeProjectIndex].title}]`);
      });
    });

    // Clickable command pills in Help table
    const helpPills = this.viewportContainer.querySelectorAll('.help-cmd-pill');
    helpPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const cmd = pill.getAttribute('data-run');
        if (cmd) {
          audio.playKeyClick(200);
          this.executeCommand(cmd);
        }
      });
    });
  }

  /**
   * Master CLI Command Dispatcher
   */
  executeCommand(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 1. Shortcut numbers 0-9
    switch (command) {
      case '0':
      case 'dashboard':
      case 'home':
        this.setView('dashboard');
        this.setStatus('[SYS]: VIEW [0: DASHBOARD] ACTIVE // SELECT VIEW OR TYPE COMMAND');
        return;

      case '1':
      case 'about':
      case 'bio':
      case 'who':
        this.setView('about');
        this.setStatus('[SYS]: VIEW [1: ABOUT] ACTIVE // PROFILE DATA LOADED');
        return;

      case '2':
      case 'skills':
      case 'skill':
        this.setView('skills');
        this.setStatus('[SYS]: VIEW [2: SKILLS] ACTIVE // PRODUCTION CAPABILITIES MATRIX');
        return;

      case '3':
      case 'projects':
      case 'proj':
        if (args.length > 0) {
          this.setProjectIndex(args[0], false);
        }
        this.setView('projects');
        this.setStatus(`[SYS]: VIEW [3: PROJECTS] ACTIVE // CARD [${PORTFOLIO_DATA.projects[this.activeProjectIndex].num} OF 04] LOADED`);
        return;

      case 'project':
        if (args.length > 0) {
          if (this.setProjectIndex(args[0], true)) {
            if (this.currentView !== 'projects') {
              this.setView('projects');
            }
            this.setStatus(`[SYS]: JUMPED TO PROJECT [${PORTFOLIO_DATA.projects[this.activeProjectIndex].num} // ${PORTFOLIO_DATA.projects[this.activeProjectIndex].title}]`);
          } else {
            audio.playBell();
            this.setStatus(`[ERR]: Project "${args[0]}" not found. Valid options: 1, 2, 3, 4 or project IDs.`, true);
          }
        } else {
          this.setView('projects');
          this.setStatus('[SYS]: Usage: "project <1-4>" or use [PREV] / [NEXT] buttons.');
        }
        return;

      case 'next':
      case 'n':
        if (this.currentView === 'projects') {
          const count = PORTFOLIO_DATA.projects.length;
          this.activeProjectIndex = (this.activeProjectIndex + 1) % count;
          this.setView('projects');
          this.setStatus(`[SYS]: JUMPED TO PROJECT [${PORTFOLIO_DATA.projects[this.activeProjectIndex].num} // ${PORTFOLIO_DATA.projects[this.activeProjectIndex].title}]`);
        } else {
          this.cycleNextView();
        }
        return;

      case 'prev':
      case 'p':
        if (this.currentView === 'projects') {
          const count = PORTFOLIO_DATA.projects.length;
          this.activeProjectIndex = (this.activeProjectIndex - 1 + count) % count;
          this.setView('projects');
          this.setStatus(`[SYS]: JUMPED TO PROJECT [${PORTFOLIO_DATA.projects[this.activeProjectIndex].num} // ${PORTFOLIO_DATA.projects[this.activeProjectIndex].title}]`);
        } else {
          this.cyclePrevView();
        }
        return;

      case '4':
      case 'experience':
      case 'history':
      case 'work':
        this.setView('experience');
        this.setStatus('[SYS]: VIEW [4: HISTORY] ACTIVE // CAREER TIMELINE LOADED');
        return;

      case '5':
      case 'contact':
      case 'email':
      case 'socials':
        this.setView('contact');
        this.setStatus('[SYS]: VIEW [5: CONTACT] ACTIVE // COMMUNICATION MATRIX READY');
        return;

      case '6':
      case 'resume':
      case 'cv':
        this.setView('resume');
        this.setStatus('[SYS]: VIEW [6: RESUME] ACTIVE // QUALIFICATIONS AND CV OVERVIEW');
        return;

      case '7':
      case 'matrix':
        audio.playKeyClick(300);
        this.setStatus('[SYS]: ACTIVATING NEURAL CIPHER STREAM... [PRESS ESC TO EXIT]');
        matrix.start();
        return;

      case '8':
      case 'fire':
        audio.playKeyClick(300);
        this.setStatus('[SYS]: LAUNCHING 1993 DEMOSCENE ASCII FLAME BUFFER... [PRESS ESC TO EXIT]');
        asciiFire.start();
        return;

      case '9':
      case 'help':
      case '?':
        this.setView('help');
        this.setStatus('[SYS]: VIEW [9: HELP] ACTIVE // COMMAND DIRECTORY LOADED');
        return;

      case 'theme':
        if (args.length > 0) {
          if (crt.setTheme(args[0])) {
            audio.playKeyClick(400);
            this.setStatus(`[SYS]: Phosphor color switched to: ${args[0].toUpperCase()}`);
          } else {
            audio.playBell();
            this.setStatus(`[ERR]: Unknown theme "${args[0]}". Options: green, amber, white, cyber`, true);
          }
        } else {
          const nextTheme = crt.cycleTheme();
          this.setStatus(`[SYS]: Phosphor color cycled to: ${nextTheme.toUpperCase()}`);
        }
        return;

      case 'barrel':
      case 'curvature':
      case 'distortion':
        if (args.length > 0) {
          if (crt.setCurvatureByName(args[0])) {
            audio.playKeyClick(300);
            this.setStatus(`[SYS]: CRT Barrel Distortion curvature set to: ${args[0].toUpperCase()}`);
          } else {
            audio.playBell();
            this.setStatus(`[ERR]: Invalid mode "${args[0]}". Options: flat, subtle, authentic, heavy`, true);
          }
        } else {
          const nextCurvature = crt.cycleCurvature();
          this.setStatus(`[SYS]: CRT Barrel Distortion cycled to: ${nextCurvature.label}`);
        }
        return;

      case 'degauss':
        this.setStatus('[SYS]: INITIATING ELECTROMAGNETIC DEGAUSS COIL DISCHARGE...');
        crt.degauss();
        return;

      case 'scanlines':
      case 'scanline':
        const scanlinesState = crt.toggleScanlines();
        this.setStatus(`[SYS]: CRT Scanlines: ${scanlinesState ? 'ENABLED (SUBTLE)' : 'DISABLED (CLEAN A11Y MODE)'}`);
        return;

      case 'a11y':
      case 'clean':
        crt.setCurvatureByName('flat');
        if (crt.scanlinesEnabled) crt.toggleScanlines();
        this.setStatus('[SYS]: A11Y HIGH-LEGIBILITY MODE ACTIVE // FLAT SCREEN // SCANLINES OFF');
        return;

      case 'audio':
      case 'sound':
        const muted = audio.toggleMute();
        this.setStatus(`[SYS]: CRT Audio Synthesizer: ${muted ? 'MUTED' : 'ENABLED'}`);
        const btnAudio = document.getElementById('btn-audio');
        if (btnAudio) {
          btnAudio.classList.toggle('control-active', !muted);
          const audioLabel = document.getElementById('status-audio');
          if (audioLabel) audioLabel.textContent = muted ? 'MUTED' : 'ON';
        }
        return;

      case 'ls':
      case 'dir':
        this.setStatus(`[VFS-ROOT]: Files found: ${Object.keys(this.virtualFiles).join('   ')}  (Type "cat <file>")`);
        return;

      case 'cat':
        if (args.length > 0) {
          const file = args[0].toLowerCase();
          if (file === 'bio.txt') {
            this.setView('about');
            this.setStatus('[VFS-CAT]: bio.txt loaded -> Displayed in [ABOUT] view.');
          } else if (file === 'skills.txt') {
            this.setView('skills');
            this.setStatus('[VFS-CAT]: skills.txt loaded -> Displayed in [SKILLS] view.');
          } else if (file === 'projects.txt') {
            this.setView('projects');
            this.setStatus('[VFS-CAT]: projects.txt loaded -> Displayed in [PROJECTS] view.');
          } else if (file === 'contact.txt') {
            this.setView('contact');
            this.setStatus('[VFS-CAT]: contact.txt loaded -> Displayed in [CONTACT] view.');
          } else if (file === 'flag.txt') {
            audio.playKeyClick(400);
            this.setStatus(`[SECRET FLAG]: ${this.virtualFiles['flag.txt']}`);
          } else {
            audio.playBell();
            this.setStatus(`[ERR]: cat: ${args[0]}: No such file. Type "ls" for file index.`, true);
          }
        } else {
          this.setStatus('[SYS]: Usage: "cat <filename>" (e.g. cat bio.txt, cat flag.txt)');
        }
        return;

      case 'clear':
      case 'cls':
        this.setView(this.currentView);
        this.setStatus('[SYS]: Screen buffer refreshed.');
        return;

      case 'date':
        this.setStatus(`[SYS-TIME]: ${new Date().toUTCString()}`);
        return;

      case 'whoami':
        this.setStatus(`[SYS-AUTH]: ${this.promptUser}@${this.promptHost} // PERMISSION: GUEST_RO // STATUS: AUTHORIZED`);
        return;

      case 'sudo':
        audio.playBell();
        this.setStatus(`[SECURITY ALERT]: sudo: user "${this.promptUser}" is not in sudoers file. Incident reported.`, true);
        return;

      default:
        audio.playBell();
        this.setStatus(`[ERR]: Command "${command}" not recognized. Type "help" or select [0-9].`, true);
        return;
    }
  }

  cycleNextView() {
    const views = ['dashboard', 'about', 'skills', 'projects', 'experience', 'contact', 'resume'];
    const idx = views.indexOf(this.currentView);
    const nextIdx = (idx + 1) % views.length;
    this.setView(views[nextIdx]);
    this.setStatus(`[SYS]: JUMPED TO VIEW [${views[nextIdx].toUpperCase()}]`);
  }

  cyclePrevView() {
    const views = ['dashboard', 'about', 'skills', 'projects', 'experience', 'contact', 'resume'];
    const idx = views.indexOf(this.currentView);
    const prevIdx = (idx - 1 + views.length) % views.length;
    this.setView(views[prevIdx]);
    this.setStatus(`[SYS]: JUMPED TO VIEW [${views[prevIdx].toUpperCase()}]`);
  }

  // ==========================================
  // VIEW RENDER TEMPLATES (CURSES TUI LAYOUTS)
  // Strictly fits within viewport height
  // ==========================================

  renderDashboard() {
    const p = PORTFOLIO_DATA.profile;

    return `
<div class="viewport-frame view-dashboard">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 0: SYSTEM DASHBOARD ] ──</span>
    <span class="v-header-meta">[ PORTO-OS ${p.version} ] ──┐</span>
  </div>

  <div class="viewport-body">
    <div class="dash-top-section">
      <div class="dash-hero-box">
        <div class="dash-avatar-col">
          <div class="retro-user-badge">
            <span class="badge-role">OPERATOR</span>
            <span class="badge-name">${p.handle.toUpperCase()}</span>
          </div>
          <div class="retro-status-indicator">
            <span class="status-pulse-dot" aria-hidden="true"></span>
            <span class="status-txt">${p.status}</span>
          </div>
        </div>

        <div class="dash-profile-info">
          <h1 class="dash-title">${p.title}</h1>
          <p class="dash-loc">Location: <strong>${p.location}</strong> // System: <strong>${p.systemName}</strong></p>
          <p class="dash-bio-summary">${p.bio[0]}</p>
        </div>
      </div>
    </div>

    <div class="dash-menu-section">
      <div class="dash-menu-title">SELECT OPERATION // CLICK ANY OPTION OR TYPE SHORTCUT KEY</div>
      <div class="dash-actions-grid">
        <button type="button" class="term-btn dash-action-btn" data-cmd="about">
          <span class="action-num">[ 1 ]</span>
          <span class="action-label">ABOUT DEVELOPER</span>
          <span class="action-desc">Bio, focus &amp; specs</span>
        </button>
        <button type="button" class="term-btn dash-action-btn" data-cmd="skills">
          <span class="action-num">[ 2 ]</span>
          <span class="action-label">SKILLS MATRIX</span>
          <span class="action-desc">Languages &amp; systems</span>
        </button>
        <button type="button" class="term-btn dash-action-btn" data-cmd="projects">
          <span class="action-num">[ 3 ]</span>
          <span class="action-label">PORTFOLIO PROJECTS</span>
          <span class="action-desc">4 interactive cards</span>
        </button>
        <button type="button" class="term-btn dash-action-btn" data-cmd="experience">
          <span class="action-num">[ 4 ]</span>
          <span class="action-label">CAREER HISTORY</span>
          <span class="action-desc">Engineering timeline</span>
        </button>
        <button type="button" class="term-btn dash-action-btn" data-cmd="contact">
          <span class="action-num">[ 5 ]</span>
          <span class="action-label">CONTACT &amp; SOCIALS</span>
          <span class="action-desc">Email, GitHub &amp; links</span>
        </button>
        <button type="button" class="term-btn dash-action-btn" data-cmd="resume">
          <span class="action-num">[ 6 ]</span>
          <span class="action-label">CURRICULUM VITAE</span>
          <span class="action-desc">Resume overview</span>
        </button>
      </div>
    </div>
  </div>

  <div class="viewport-footer">
    <span>Tip: Press [0-9] or click any button above // Full page TUI mode active</span>
    <span>STATUS: OPERATIONAL</span>
  </div>
</div>`;
  }

  renderAbout() {
    const p = PORTFOLIO_DATA.profile;
    const bios = p.bio.map(b => `<li class="about-point">${b}</li>`).join('');

    return `
<div class="viewport-frame view-about">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 1: DEVELOPER BACKGROUND // ABOUT ] ──</span>
    <span class="v-header-meta">[ IDENTITY: ${p.handle.toUpperCase()} ] ──┐</span>
  </div>

  <div class="viewport-body">
    <div class="about-card-hero">
      <div class="about-handle-line">
        <span class="about-handle">${p.handle.toUpperCase()}</span>
        <span class="about-title-tag">${p.title}</span>
        <span class="about-status-pill">${p.status}</span>
      </div>
      <div class="about-meta-row">
        <span>Location: <strong>${p.location}</strong></span>
        <span>Environment: <strong>Linux / POSIX / Web Platform</strong></span>
        <span>Core Stack: <strong>TypeScript, Rust, Go, WebGL</strong></span>
      </div>
    </div>

    <div class="about-content-box">
      <div class="content-box-heading">ENGINEERING FOCUS &amp; EXPERIENCE</div>
      <ul class="about-list">
        ${bios}
      </ul>
    </div>

    <div class="view-actions-bar">
      <button type="button" class="term-btn" data-cmd="skills">[ 2: VIEW SKILLS MATRIX ]</button>
      <button type="button" class="term-btn" data-cmd="projects">[ 3: BROWSE PROJECTS ]</button>
      <button type="button" class="term-btn" data-cmd="contact">[ 5: GET IN TOUCH ]</button>
      <button type="button" class="term-btn" data-cmd="dashboard">[ 0: RETURN TO DASHBOARD ]</button>
    </div>
  </div>

  <div class="viewport-footer">
    <span>Navigation: Type "skills", "projects", or "0" // Click any button</span>
    <span>SYS-ID: ${p.systemName}</span>
  </div>
</div>`;
  }

  renderSkills() {
    let columnsHtml = '';

    PORTFOLIO_DATA.skills.forEach(group => {
      let rowsHtml = group.items.map(s => `
        <div class="skill-entry">
          <div class="skill-line-primary">
            <span class="skill-badge">[${s.tier}]</span>
            <strong class="skill-name">${s.name}</strong>
            <span class="skill-exp">${s.exp}</span>
          </div>
          <div class="skill-focus-line">${s.focus}</div>
        </div>
      `).join('');

      columnsHtml += `
        <div class="skills-col">
          <div class="skills-col-header">=== ${group.category} ===</div>
          <div class="skills-col-body">
            ${rowsHtml}
          </div>
        </div>
      `;
    });

    return `
<div class="viewport-frame view-skills">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 2: TECHNICAL PROFICIENCIES &amp; TOOLSETS ] ──</span>
    <span class="v-header-meta">[ PRODUCTION MATRIX ] ──┐</span>
  </div>

  <div class="viewport-body">
    <div class="skills-grid-container">
      ${columnsHtml}
    </div>

    <div class="view-actions-bar">
      <button type="button" class="term-btn" data-cmd="projects">[ 3: VIEW PROJECTS IN ACTION ]</button>
      <button type="button" class="term-btn" data-cmd="contact">[ 5: CONTACT DEVELOPER ]</button>
      <button type="button" class="term-btn" data-cmd="dashboard">[ 0: DASHBOARD ]</button>
    </div>
  </div>

  <div class="viewport-footer">
    <span>Proficiency Legend: [PRIMARY] = Daily driver, [ACTIVE] = Production deployed</span>
    <span>TOTAL STACKS: 13</span>
  </div>
</div>`;
  }

  renderProjects() {
    const projects = PORTFOLIO_DATA.projects;
    const current = projects[this.activeProjectIndex];

    // Build project tabs row
    let tabsHtml = projects.map((p, idx) => {
      const isActive = idx === this.activeProjectIndex;
      return `<button type="button" class="project-tab-btn ${isActive ? 'active-tab' : ''}" data-idx="${idx}">
        [ ${p.num}: ${p.id.toUpperCase()} ]
      </button>`;
    }).join(' ');

    const tagBadges = current.tags.map(t => `<span class="tag-badge">${t}</span>`).join(' ');
    const highlights = current.highlights.map(h => `<li>${h}</li>`).join('');

    return `
<div class="viewport-frame view-projects">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 3: SELECTED WORKS // PROJECT ${current.num} OF 0${projects.length} ] ──</span>
    <span class="v-header-meta">[ USE TABS OR PREV/NEXT ] ──┐</span>
  </div>

  <div class="viewport-body">
    <!-- Sub-navigation Tabs -->
    <div class="project-tabs-row" aria-label="Project Selector Tabs">
      ${tabsHtml}
    </div>

    <!-- Active Project Card -->
    <div class="project-active-display">
      <div class="project-headline">
        <div class="project-title-group">
          <span class="project-num-tag">[PROJECT ${current.num}]</span>
          <h2 class="project-title-text">${current.title}</h2>
        </div>
        <div class="project-meta-tags">
          <span class="project-category-tag">${current.category}</span>
          <span class="project-year-tag">${current.year}</span>
        </div>
      </div>

      <div class="project-tag-strip">
        <span class="tag-label">STACK:</span>
        ${tagBadges}
      </div>

      <p class="project-description-paragraph">
        ${current.description}
      </p>

      <div class="project-highlights-box">
        <div class="highlights-heading">KEY ARCHITECTURAL HIGHLIGHTS:</div>
        <ul class="highlights-bullet-list">
          ${highlights}
        </ul>
      </div>
    </div>

    <!-- Project Action Controls & Pager -->
    <div class="project-action-strip">
      <div class="project-links-left">
        <a href="${current.links.github}" target="_blank" rel="noopener" class="term-btn term-link">
          &gt; VIEW PROJECT REPOSITORY (GITHUB)
        </a>
      </div>

      <div class="project-pager-right">
        <button type="button" class="term-btn proj-nav-btn" data-nav="prev">[ &lt; PREV PROJECT ]</button>
        <span class="pager-indicator">${this.activeProjectIndex + 1} / ${projects.length}</span>
        <button type="button" class="term-btn proj-nav-btn" data-nav="next">[ NEXT PROJECT &gt; ]</button>
      </div>
    </div>
  </div>

  <div class="viewport-footer">
    <span>CLI Shortcut: Type "project 1", "project 2", "next", "prev", or click any tab above</span>
    <span>REPO: AVAILABLE</span>
  </div>
</div>`;
  }

  renderExperience() {
    let timelineHtml = PORTFOLIO_DATA.experience.map((exp, idx) => {
      const isLast = idx === PORTFOLIO_DATA.experience.length - 1;
      const branchChar = isLast ? '└──' : '├──';
      const pipeChar = isLast ? '   ' : '│  ';

      return `
        <div class="history-item">
          <div class="history-header">
            <span class="history-branch">${branchChar}</span>
            <span class="history-period">[ ${exp.period} ]</span>
            <strong class="history-role">${exp.role}</strong>
            <span class="history-company">@ ${exp.company}</span>
          </div>
          <div class="history-desc">
            <span class="history-pipe">${pipeChar}</span>
            <span class="history-text">${exp.description}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
<div class="viewport-frame view-experience">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 4: CAREER TIMELINE &amp; MILESTONES ] ──</span>
    <span class="v-header-meta">[ EXPERIENCE TREE ] ──┐</span>
  </div>

  <div class="viewport-body">
    <div class="history-container">
      <div class="history-tree">
        ${timelineHtml}
      </div>
    </div>

    <div class="view-actions-bar">
      <button type="button" class="term-btn" data-cmd="resume">[ 6: VIEW RESUME SUMMARY ]</button>
      <button type="button" class="term-btn" data-cmd="projects">[ 3: BROWSE PROJECTS ]</button>
      <button type="button" class="term-btn" data-cmd="contact">[ 5: CONTACT DEVELOPER ]</button>
      <button type="button" class="term-btn" data-cmd="dashboard">[ 0: DASHBOARD ]</button>
    </div>
  </div>

  <div class="viewport-footer">
    <span>Engineering Experience: 6+ Years across Web, Systems &amp; Real-time Networking</span>
    <span>STATUS: VERIFIED</span>
  </div>
</div>`;
  }

  renderContact() {
    let contactsHtml = PORTFOLIO_DATA.socials.map(s => {
      return `
        <div class="contact-row">
          <span class="contact-channel">${s.name.padEnd(16)}</span>
          <span class="contact-arrow">&gt;&gt;</span>
          <a href="${s.url}" target="_blank" rel="noopener" class="term-link contact-val">${s.handle}</a>
        </div>
      `;
    }).join('');

    return `
<div class="viewport-frame view-contact">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 5: COMMUNICATION CHANNELS // CONTACT ] ──</span>
    <span class="v-header-meta">[ TRANSMISSION MATRIX ] ──┐</span>
  </div>

  <div class="viewport-body">
    <div class="contact-box-grid">
      <div class="contact-channels-panel">
        <div class="contact-panel-title">ESTABLISHED EXTERNAL CHANNELS:</div>
        <div class="contact-list">
          ${contactsHtml}
        </div>
      </div>

      <div class="contact-direct-panel">
        <div class="contact-panel-title">DIRECT INQUIRIES &amp; CONTRACTS:</div>
        <p class="contact-note">
          Open for contract engagements, systems consulting, full-stack architecture roles, and creative web experiments.
        </p>
        <div class="contact-btn-wrapper">
          <a href="mailto:contact@example.com" class="term-btn term-link direct-mail-btn">
            [ COMPOSE DIRECT EMAIL TRANSMISSION ]
          </a>
        </div>
      </div>
    </div>

    <div class="view-actions-bar">
      <button type="button" class="term-btn" data-cmd="projects">[ 3: REVIEW PROJECTS ]</button>
      <button type="button" class="term-btn" data-cmd="skills">[ 2: REVIEW SKILLS ]</button>
      <button type="button" class="term-btn" data-cmd="dashboard">[ 0: DASHBOARD ]</button>
    </div>
  </div>

  <div class="viewport-footer">
    <span>Encryption: Standard TLS // Direct response turnaround: &lt; 24h</span>
    <span>TTY: READY</span>
  </div>
</div>`;
  }

  renderResume() {
    const p = PORTFOLIO_DATA.profile;

    return `
<div class="viewport-frame view-resume">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 6: CURRICULUM VITAE // RESUME ] ──</span>
    <span class="v-header-meta">[ CANDIDATE CREDENTIALS ] ──┐</span>
  </div>

  <div class="viewport-body">
    <div class="resume-hero">
      <div class="resume-candidate-name">${p.handle.toUpperCase()} // ${p.title}</div>
      <div class="resume-meta">Location: ${p.location} | Status: ${p.status}</div>
    </div>

    <div class="resume-sections-container">
      <div class="resume-section">
        <div class="resume-sec-title">=== CORE SPECIALIZATIONS ===</div>
        <p class="resume-sec-text">Full-stack web architecture, real-time networking, WebGL/Canvas graphics, systems programming in Rust &amp; Go, Linux devops.</p>
      </div>
      <div class="resume-section">
        <div class="resume-sec-title">=== SUMMARY OF EXPERIENCE ===</div>
        <p class="resume-sec-text">6+ years designing scalable client-server applications, building high-framerate browser visualizers, and implementing low-latency protocols.</p>
      </div>
    </div>

    <div class="resume-actions-group">
      <a href="mailto:contact@example.com?subject=Resume%20Request%20for%20${encodeURIComponent(p.handle)}" class="term-btn term-link">
        [ REQUEST OFFICIAL PDF RESUME VIA EMAIL ]
      </a>
      <button type="button" class="term-btn" data-cmd="skills">[ 2: VIEW SKILLS MATRIX ]</button>
      <button type="button" class="term-btn" data-cmd="projects">[ 3: VIEW PROJECTS ]</button>
      <button type="button" class="term-btn" data-cmd="dashboard">[ 0: DASHBOARD ]</button>
    </div>
  </div>

  <div class="viewport-footer">
    <span>Full verifiable resume documentation available upon direct transmission request</span>
    <span>FORMAT: ASCII/PDF</span>
  </div>
</div>`;
  }

  renderHelp() {
    let rowsHtml = this.commandList.map(c => `
      <tr class="help-row">
        <td class="help-key-cell">
          <button type="button" class="help-cmd-pill" data-run="${c.cmd}">
            ${c.cmd}
          </button>
        </td>
        <td class="help-num-cell">${c.num ? `[ ${c.num} ]` : ''}</td>
        <td class="help-desc-cell">${c.desc}</td>
      </tr>
    `).join('');

    return `
<div class="viewport-frame view-help">
  <div class="viewport-header">
    <span class="v-header-title">┌── [ VIEW 9: COMMAND REFERENCE &amp; SHORTCUTS ] ──</span>
    <span class="v-header-meta">[ CLICK COMMAND TO RUN ] ──┐</span>
  </div>

  <div class="viewport-body">
    <div class="help-table-container">
      <table class="help-table">
        <thead>
          <tr>
            <th>COMMAND</th>
            <th>KEY</th>
            <th>DESCRIPTION / ACTION</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div class="view-actions-bar">
      <button type="button" class="term-btn" data-cmd="dashboard">[ 0: RETURN TO DASHBOARD ]</button>
      <button type="button" class="term-btn" data-cmd="matrix">[ 7: MATRIX SCREENSAVER ]</button>
      <button type="button" class="term-btn" data-cmd="fire">[ 8: ASCII FIRE DEMO ]</button>
    </div>
  </div>

  <div class="viewport-footer">
    <span>Tip: You can click any command pill above, type it in the prompt, or press Tab to auto-complete</span>
    <span>HELP: COMPLETE</span>
  </div>
</div>`;
  }
}

export const terminal = new Terminal();
