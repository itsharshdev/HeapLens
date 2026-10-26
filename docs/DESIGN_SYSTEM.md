# HeapLens Design System & Brand Specification

## 1. Visual Identity & Brand Direction

**Brand Concept:** *Computational Precision Instrument.*  
HeapLens translates abstract dynamic memory algorithms into a tangible, observable physical-digital reality. It avoids generic SaaS dashboard tropes (no pastel gradient soup, no decorative card spam, no emoji icons) in favor of high-contrast engineering clarity inspired by logic analyzers, oscilloscopes, and memory profilers.

### Logo & Brand Mark
- **Geometry:** An isometric memory block unit bounded by an optical lens hexagon.
- **Symbolism:** Represents both a contiguous block of memory and an optical lens peering into the heap internals.
- **Colors:** Glowing Emerald (`#10B981`) and Precision Cyan (`#06B6D4`).

---

## 2. Token Architecture (Three-Layer Hierarchy)

### Layer 1: Primitive Tokens (Raw Values)
```css
/* Primitives */
--primitive-black: #05070B;
--primitive-slate-950: #070A11;
--primitive-slate-900: #0B1120;
--primitive-slate-800: #151F32;
--primitive-slate-700: #1E293B;
--primitive-slate-600: #334155;
--primitive-slate-400: #94A3B8;
--primitive-slate-200: #E2E8F0;
--primitive-white: #FFFFFF;

--primitive-emerald-500: #10B981;
--primitive-emerald-400: #34D399;
--primitive-cyan-500: #06B6D4;
--primitive-cyan-400: #38BDF8;
--primitive-amber-500: #F59E0B;
--primitive-rose-500: #F43F5E;
```

### Layer 2: Semantic Tokens (Purpose Aliases)
```css
/* Semantic Roles */
--bg-canvas: var(--primitive-slate-950);
--bg-surface: var(--primitive-slate-900);
--bg-surface-elevated: var(--primitive-slate-800);
--border-subtle: var(--primitive-slate-800);
--border-medium: var(--primitive-slate-700);
--border-accent: var(--primitive-emerald-500);

--text-primary: #F8FAFC;
--text-secondary: #94A3B8;
--text-muted: #64748B;

--mem-free: #06B6D4;
--mem-free-bg: rgba(6, 182, 212, 0.12);
--mem-allocated: #10B981;
--mem-allocated-bg: rgba(16, 185, 129, 0.14);
--mem-fragmented: #F59E0B;
--mem-error: #F43F5E;
```

### Layer 3: Component Tokens
```css
--navbar-height: 4.25rem;
--card-radius: 0.75rem;
--badge-radius: 9999px;
--block-stroke: 1.5px;
--glow-primary: 0 0 24px rgba(16, 185, 129, 0.25);
--glow-cyan: 0 0 20px rgba(6, 182, 212, 0.25);
```

---

## 3. Themes: The Three Required Modes

### 1. Dark Mode (`theme-dark`, Default)
- **Mood:** Deep obsidian engineering environment.
- **Canvas:** `#070A11`
- **Surface:** `#0F172A`
- **Borders:** `#1E293B`
- **Text:** Primary `#F8FAFC`, Secondary `#94A3B8`
- **Visualizer:** Luminescent cyan free blocks, neon emerald allocated blocks.

### 2. Light Mode (`theme-light`)
- **Mood:** Crisp, modern laboratory precision.
- **Canvas:** `#F8FAFC`
- **Surface:** `#FFFFFF`
- **Borders:** `#E2E8F0`
- **Text:** Primary `#0F172A`, Secondary `#475569` (4.5:1+ WCAG AA compliant)
- **Visualizer:** Deep cobalt `#0284C7` for free blocks, rich forest emerald `#059669` for allocated blocks.

### 3. HeapLens Lab (`theme-lab`)
- **Mood:** High-contrast phosphor instrument & cathode terminal.
- **Canvas:** `#040806` (deep phosphor black)
- **Surface:** `#0A150D` (matrix instrument panel)
- **Borders:** `#132E1F`
- **Text:** Primary `#34D399` (glowing terminal phosphor), Secondary `#059669`
- **Visualizer:** Monochromatic phosphor emerald with amber hardware-warning meters for fragmentation.

---

## 4. Typography Scale

- **Display Font:** Inter / IBM Plex Sans (weights 400, 500, 600, 700)
- **Monospace Font:** JetBrains Mono (weights 400, 500, 700) for memory addresses, hex codes, statistics, and traces.

| Scale Token | Size | Line Height | Usage |
|:---|:---|:---|:---|
| `text-display` | 3.5rem (56px) | 1.1 | Hero main title |
| `text-h1` | 2.5rem (40px) | 1.2 | Page section headers |
| `text-h2` | 1.75rem (28px) | 1.3 | Panel & feature headers |
| `text-h3` | 1.25rem (20px) | 1.4 | Card titles |
| `text-body` | 1.0rem (16px) | 1.5 | Standard copy |
| `text-mono-sm` | 0.875rem (14px)| 1.4 | Offsets, sizes, IDs, and HUD values |
| `text-mono-xs` | 0.75rem (12px) | 1.3 | Memory address markers `0x00`..`0x64` |

---

## 5. Spacing & Grid System
- 4px baseline grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- Max content width: `1280px` centered with responsive horizontal padding (`1rem` on mobile, `2rem` on desktop).

---

## 6. Motion & Accessibility Principles
- **Transitions:** Quick and purposeful (`150ms` for micro-interactions, `300ms` for state changes).
- **Reduced Motion:** If `prefers-reduced-motion` is active, 3D scenes stop rotation, transforms are disabled, and instant state switches are used.
- **Keyboard Navigation:** Every interactive button and input has an explicit, high-contrast focus ring (`outline: 2px solid var(--border-accent)` with `outline-offset: 2px`).
- **No Emojis as Icons:** All UI icons are clean SVG vectors powered by Lucide.
