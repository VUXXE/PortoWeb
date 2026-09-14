# 📺 ASYDEV-OS // Retro CRT Terminal Portfolio

[![Live Demo](https://img.shields.io/badge/Live%20Demo-asy.web.id-0284c7?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://asy.web.id/)
[![Preview URL](https://img.shields.io/badge/Preview-portoweb--c7k.pages.dev-10b981?style=for-the-badge&logo=cloudflare&logoColor=white)](https://portoweb-c7k.pages.dev)
[![GitHub Repo](https://img.shields.io/badge/GitHub-VUXXE%2Fasydev--os-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VUXXE/asydev-os)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%207.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

An authentic vintage DEC VT220 / Model 84-CRT computer terminal portfolio for **Asy-Syahid Abdurrahman Hanan Taqiyya** (`guest@asy.web.id`) accessible at **[https://asy.web.id](https://asy.web.id/)**. Features real-time CRT convex barrel distortion, raster scanlines, phosphor glow bloom, pure Web Audio mechanical keyboard synthesis, an interactive POSIX virtual filesystem, fish-style ghost autocompletions, and a Tmux statusline.

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or bun

### Setup & Development

```bash
# 1. Clone repository
git clone https://github.com/VUXXE/asydev-os.git
cd asydev-os

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build optimized production bundle
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 🖥️ Core Features

### 1. Terminal Emulation & POSIX Filesystem
- **Interactive Block Cursor (`█`)**: Solid blinking DEC VT220 cursor with inverted character rendering underneath.
- **Hierarchical Virtual Filesystem**:
  - `cd <dir>`: Navigate folders (`cd projects`, `cd skills`, `cd education`, `cd ..`, `cd ~`).
  - `pwd`: Print full working directory path (`/home/guest/projects`).
  - `tree`: Visual directory tree structure diagram.
  - `ls` / `dir`: List directories and files with clickable chips.
  - `cat <file>`: Read virtual text files (`cat bio.txt`, `cat flag.txt`).
- **Fish / Zsh Ghost Suggestions**: Inline grey ghost text predicts command completions as you type. Press <kbd>Tab</kbd> or <kbd>→</kbd> to accept.
- **POSIX Shell Shortcuts**:
  - <kbd>Ctrl</kbd> + <kbd>A</kbd>: Jump to beginning of line
  - <kbd>Ctrl</kbd> + <kbd>E</kbd>: Jump to end of line
  - <kbd>Ctrl</kbd> + <kbd>U</kbd>: Clear line from cursor to beginning
  - <kbd>Ctrl</kbd> + <kbd>K</kbd>: Clear line from cursor to end
  - <kbd>Ctrl</kbd> + <kbd>W</kbd>: Delete previous word
  - <kbd>↑</kbd> / <kbd>↓</kbd>: Browse shell command history
- **Tmux / VT220 Status Bar**: Bottom statusline displaying active user, session tty, real-time current working directory (CWD), terminal profile, and a live ticking UTC clock.

### 2. CRT Display Optics & Aesthetics
- **CSS 3D Barrel Distortion**: Convex spherical tube curvature presets (`flat`, `subtle`, `authentic`, `heavy`).
- **Phosphor Color Profiles**:
  - **P1 Green** (`#33ff33`): Classic 80s phosphor green.
  - **P3 Amber** (`#ffb000`): Warm DEC VT220 amber orange.
  - **P4 White** (`#d8f0f8`): High-contrast paper white monochrome.
  - **Cyberpunk** (`#00ffcc`): Vibrant cyan with neon accent tones.
- **Microscopic Details**: Alternating scanline raster lines, glass glare gradients, vignetting falloff, and subtle chromatic glow.
- **Typography**: Switch between vintage bitmap pixel font (`font pixel`) and clean modern mono (`font clean`).
- **Terminal Scale**: Adjust magnification via `scale [100|150|200|250]` (default: 200%).

### 3. Pure Web Audio Sound Engine
- **Zero External Audio Assets**: All sounds synthesized programmatically via the Web Audio API.
- **Mechanical Keystrokes**: Realistic tactile click clacks with random pitch variation on every keydown.
- **Electromagnetic Degauss Coil**: 60Hz magnetic surge thump with metallic decaying oscillation.
- **Piezo Bell**: 880Hz crystal terminal alert tone on errors.

### 4. Interactive Command Reference

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `help` / `?` | | Display list of all commands |
| `bio` / `about` | | Developer background, education, and current focus |
| `education` / `edu` | | Academic degrees, coursework, and institution |
| `skills` / `stack` | | Programming languages, frameworks, and architecture |
| `projects` / `work` | | Selected open-source software and production systems |
| `project` | `<id\|num>` | Inspect detailed system architecture of a specific project |
| `experience` / `exp` | | Work history and career timeline |
| `contact` / `socials` | | Communication channels and verified profiles |
| `resume` / `cv` | | Formatted CV overview and PDF download link |
| `ls` / `dir` | | List files and directories in current working folder |
| `cd` | `[dir]` | Change directory (`cd projects`, `cd ..`, `cd ~`) |
| `pwd` | | Print current working directory |
| `tree` | | Visual tree map of the virtual filesystem |
| `cat` | `<file>` | Read content of a virtual file |
| `history` / `hist` | | View shell execution history buffer |
| `scale` | `[100-250]` | Adjust viewport magnification scale |
| `theme` | `[color]` | Switch phosphor palette (`green`, `amber`, `white`, `cyber`) |
| `font` | `[mode]` | Toggle font rendering (`pixel`, `clean`) |
| `barrel` | `[mode]` | Adjust CRT curvature (`flat`, `subtle`, `authentic`, `heavy`) |
| `scanlines` | `[on\|off]` | Toggle CRT raster scanline overlay |
| `degauss` | | Trigger high-voltage magnetic coil degauss pulse |
| `audio` | `[on\|off]` | Toggle mechanical keyboard audio feedback |
| `matrix` | | Launch full-screen digital rain screensaver |
| `fire` | | Launch 1993 demoscene Doom fire algorithm demo |
| `clear` / `cls` | | Clear active terminal output buffer |
| `whoami` | | Display current user identity |
| `date` | | Display current UTC timestamp |
| `power` | | Toggle CRT monitor standby mode |

---

## 📂 Project Architecture

```
asydev-os/
├── index.html              # Core HTML shell and CRT glass container
├── package.json            # Scripts, Vite and Wrangler toolchains
├── tsconfig.json           # TypeScript configuration
├── public/
│   ├── cv.pdf              # Downloadable Curriculum Vitae PDF
│   └── favicon.svg         # Terminal prompt icon
├── styles/
│   ├── crt.css             # CRT curvature, vignette, scanlines, phosphor glow
│   ├── main.css            # Base typography and reset rules
│   └── terminal.css        # Input line, block cursor, statusbar, chips, layout
└── src/
    ├── audio.ts            # Web Audio API mechanical keyclicks and degauss synth
    ├── crt.ts              # Bezel toolbar controls, themes, and screen power state
    ├── data.ts             # Centralized portfolio data and bio content
    ├── main.ts             # Application bootstrapper and event wiring
    ├── matrix.ts           # Matrix digital rain canvas engine
    └── terminal.ts         # Virtual filesystem, shell parser, shortcuts, commands
```

---

## 🛠️ Content Configuration

All developer bio information, project details, and technical skill matrices are centralized in **[`src/data.ts`](file:///home/exu/PortoWeb/src/data.ts)**:

- **`PORTFOLIO_DATA.profile`**: Name, title, contact information, and biography paragraphs.
- **`PORTFOLIO_DATA.education`**: Universities, GPA, graduation timelines, and coursework.
- **`PORTFOLIO_DATA.skills`**: Languages, frameworks, databases, and architectural concepts.
- **`PORTFOLIO_DATA.projects`**: Project metadata, tech tags, GitHub links, and live URLs.
- **`PORTFOLIO_DATA.experience`**: Career history and milestones.
- **`PORTFOLIO_DATA.socials`**: Handles, emails, and external links.

---

## 🚀 Cloudflare Pages Deployment

This project includes direct deployment integration with **Cloudflare Pages** via Wrangler:

```bash
# Authenticate with Cloudflare (first time only)
npx wrangler login

# Build and deploy to Cloudflare Pages
npm run deploy
```

The live application is hosted at:
- **Primary Domain**: **[https://asy.web.id](https://asy.web.id/)**
- **Cloudflare Pages Direct**: **[https://portoweb-c7k.pages.dev](https://portoweb-c7k.pages.dev)**

---

## 📄 License

MIT License. Feel free to use this project as inspiration or a template for your own terminal portfolio.
