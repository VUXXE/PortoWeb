# 📺 PORTO-OS // Retro CRT Terminal Portfolio

An authentic vintage CRT computer terminal portfolio featuring optical **barrel distortion**, curved convex glass, scanlines, phosphor glow bloom, mechanical sound synthesis, and an interactive hybrid command-line interface.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Launch development server with hot-reload
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Preview production build
npm run preview
```

---

## 🖥️ Key Features & Retro Engineering

### 1. Optical Barrel Distortion & Screen Curvature
* **Authentic Convex Tube Physics**: Real-time SVG `<feDisplacementMap>` shader dynamically renders spherical lens distortion across live DOM elements.
* **Curvature Presets**: Toggle between `AUTHENTIC` (vintage 80s bulge), `HEAVY` (fisheye cathode tube), `SUBTLE` (slight edge curve), and `FLAT` (crisp flat-panel CRT) via the bezel button or the `curvature` CLI command.
* **Curved Glass Vignette & Specular Glare**: Inset dark edge falloff combined with an overhead glass glare gradient simulating fluorescent light bouncing off convex glass.
* **Scanlines & Aperture Grille**: Razor-sharp alternating raster scanlines and microscopic vertical RGB subpixel aperture lines.

### 2. Modern Floating Glass Terminal Window
* **Clean Windowed Presentation**: Sleek floating dark glass window with subtle specular highlights, replacing bulky plastic bezels.
* **Window Control Dots**: Functional traffic-light controls (Red: Power/Standby, Yellow: Degauss, Green: Curvature cycle).
* **Titlebar Quick Action Toolbar**:
  - **`PHOSPHOR`**: Cycles between 4 authentic monochrome phosphor colorways:
    - **P1 Green** (`#33ff33` classic terminal glow)
    - **P3 Amber** (`#ffb000` warm DEC VT220 orange)
    - **P4 White** (`#d8f0f8` cold monochrome paper-white)
    - **Cyberpunk** (`#00ffcc` cyan with magenta neon highlights)
  - **`CURVATURE`**: Cycles optical barrel distortion intensity (Authentic, Heavy, Subtle, Flat).
  - **`SOUND FX`**: Toggles real-time mechanical audio feedback.
  - **`DEGAUSS`**: Discharges the CRT coil with chromatic screen shake and acoustic thump.
  - **`POWER`**: Standby toggle with classic CRT horizontal line and dot collapse animation.

### 3. Synthesized Web Audio Engine
* **100% Zero External Audio Files**: Everything is synthesized in real time via the Web Audio API.
* **Tactile Mechanical Keystrokes**: Realistic switch bottom-out clacks with random pitch variation on every keypress.
* **Electromagnetic Degauss Coil**: Heavy 60Hz magnetic surge with decaying metallic coil ping and relay snap.
* **Flyback Transformer**: Subtle high-voltage capacitor charge sound on power-up.
* **Vintage Terminal Bell**: 880Hz crystal piezo alert.

### 4. Hybrid CLI & Clickable Navigation
* **Visitors don't have to type**: 9 quick-access button chips allow instant 1-click navigation.
* **Power-user Terminal**:
  - Blinking block cursor `█`.
  - Up/Down arrow keys for command history.
  - <kbd>TAB</kbd> auto-completion for commands.
  - Commands: `help`, `about`, `skills`, `projects`, `project <id>`, `experience`, `contact`, `resume`, `theme`, `curvature`, `degauss`, `matrix`, `fire`, `ls`, `cat`, `date`, `whoami`, `sudo`, `clear`.
* **Easter Eggs**:
  - `matrix`: Full-screen Katakana digital rain screensaver.
  - `fire`: 1993 demoscene Doom fire algorithm rendered in real-time ASCII.

---

## 🛠️ Customizing Your Content

All portfolio content is centralized in **[`src/data.js`](file:///home/exu/PortoWeb/src/data.js)**:

1. **Profile & Bio**:
   Edit `handle`, `title`, `location`, `status`, and `bio` paragraphs.
2. **Skills Matrix**:
   Add or update skill items, percentage bars (`level: 0-100`), and years of experience.
3. **Projects Showcase**:
   Add project entries with titles, tags, descriptions, bullet highlights, and live/GitHub URLs.
4. **Career Timeline**:
   Update roles, companies, and date ranges in `experience`.
5. **Social Links**:
   Update your GitHub, LinkedIn, Twitter/X, and Email addresses.

---

## 🚀 Deployment

The project builds to standard static HTML, CSS, and JS in `dist/`. You can deploy it to:
- **GitHub Pages**: Set build output to `dist` or use the GitHub Actions static workflow.
- **Vercel / Netlify / Cloudflare Pages**: Framework Preset: `Vite`, Build Command: `npm run build`, Output Directory: `dist`.
