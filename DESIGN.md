# DESIGN.md // Design Direction & Craftsmanship Brief

## 1. Identity & Concept

- **Product / Context:** Personal developer and systems engineering portfolio website.
- **Audience:** Engineering leaders, technical recruiters, systems developers, and retro-computing enthusiasts.
- **Visual Language:** 1980s DEC VT100 / TeleVideo 950 CRT Video Display Terminal.
- **Personality:** Tactile, authentic, craft-focused, nostalgic yet modern in web execution.
- **Design Read:** 
  > Reading this as: Developer & Systems Portfolio for software engineers and technical recruiters, in an authentic 1980s CRT video display terminal visual language, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

---

## 2. Three Liveliness Dials (Anti-Slop Part 3)

| Dial | Level | Implementation Rationale |
|---|---|---|
| **ENERGY** | **2 (Balanced)** | Tactile physical monitor chassis with real hardware controls (Degauss, Phosphor, Curvature, Audio, Power). Expressive but focused on readable developer content. |
| **RHYTHM** | **2 (Structured Breaks)** | Terminal command-line prompt anchored by structured ASCII project cards, categorized skill tables, and career trees. |
| **MOTION** | **2 (Purposeful Transitions)** | Real-time SVG barrel distortion, physical CRT power-on expansion, dot collapse power-off, scanline raster sweep, and electromagnetic coil degauss wobble. |

---

## 3. Aesthetic Specifications

### Palette (Phosphor Colors)
1. **P1 Classic Green (Default):** `#33ff33` text with `#030804` deep inky phosphor tube black.
2. **P3 Amber (VT220):** `#ffb000` text with `#0a0501` background.
3. **P4 Monochrome White:** `#d8f0f8` cold paper-white with `#040608` background.
4. **Cyberpunk Neon:** `#00ffcc` cyan with `#ff0077` magenta accents and `#07030c` background.

### Typography
- **Primary Display / Terminal:** `VT323` (faithful digital revival of DEC VT220 terminal typeface).
- **Hardware Badges & Status:** `Share Tech Mono` (industrial precision label font).

### Intentional Architecture Decisions (Rule Overrides)
- **R-05 Terminal Layout Override:** Anti-slop rule R-05 cautions against decorative fake macOS terminal windows on generic landing pages. In this project, the entire web application is an actual, interactive, and fully functional terminal emulator (custom shell, tab completion, history buffer, virtual filesystem, and real-time SVG optical barrel distortion) built to fulfill the owner's explicit design requirement.
- **R-21 Dark Theme Rationale:** The dark CRT screen is physically authentic to monochromatic video display tubes (where uncharged phosphor is black). Four user-selectable phosphor modes are provided via hardware bezel controls.
