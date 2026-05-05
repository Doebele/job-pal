# Job-Pal -- Design System

## Core Tokens (CSS Custom Properties)

| Token | Value | Verwendung |
|-------|-------|-----------|
| `--bg` | `#0d0e12` | App-Hintergrund |
| `--surface` | `#13141a` | Cards, Modals |
| `--surface-2` | `#1a1b23` | Inputs, table rows |
| `--accent` | `#3b82f6` | Primary actions, selection |
| `--green` | `#4ade80` | Positive states |
| `--red` | `#f87171` | Negative states |
| `--yellow` | `#fbbf24` | Warnings |
| `--border` | `rgba(255,255,255,0.10)` | Default border |
| `--border-2` | `rgba(255,255,255,0.06)` | Subtle border |
| `--fg-1` | `#f0f1f5` | Headings, primary text |
| `--fg-2` | `#b4bfcc` | Body text |
| `--fg-3` | `#8896a8` | Labels, muted |
| `--shadow-card` | `0 2px 8px rgba(0,0,0,0.25)` | Cards in-flow |
| `--shadow-modal` | `0 32px 80px rgba(0,0,0,0.60)` | Modals |

### Budget-Pal Extensions

| Token | Value | Verwendung |
|-------|-------|-----------|
| `--bg-elevated` | `#20212c` | Hover rows, tooltips |
| `--border-bp` | `rgba(255,255,255,0.13)` | Default BP border |
| `--border-bp-subtle` | `rgba(255,255,255,0.07)` | Subtle |
| `--border-bp-strong` | `rgba(255,255,255,0.22)` | Strong |
| `--fg-disabled` | `#535e6b` | Disabled text |

### Radii

| Token | Value | Verwendung |
|-------|-------|-----------|
| `--r-sm` | `2px` | Badges |
| `--r-base` | `4px` | Inputs, buttons |
| `--r-md` | `6px` | Sub-cards |
| `--r-lg` | `8px` | Main cards |
| `--r-full` | `9999px` | Pills, avatars |

### Shadows

| Name | Value | Verwendung |
|------|-------|-----------|
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.4)` | BP card shadow |

### Gradients

| Klasse | Gradient | Verwendung |
|--------|----------|-----------|
| `.bp-gradient-card` | `linear-gradient(135deg, var(--bg-elevated), var(--surface))` | Card backgrounds |
| `.bp-gradient-accent` | `linear-gradient(135deg, #2563eb, #3b82f6)` | Hero CTAs |
| `.bp-gradient-gain` | `linear-gradient(135deg, #16a34a, #4ade80)` | Positive/gain elements |

## Fonts

| Font | Verwendung | Quelle |
|------|-----------|--------|
| **DM Serif Display** | Brand/logos only | Google Fonts CDN |
| **Syne** | All UI text | Google Fonts CDN |
| **JetBrains Mono** | Numbers (tabular-nums) | Google Fonts CDN |

## Typografie-Skala

| Klasse | Grösse | Gewicht | Verwendung |
|--------|--------|---------|-----------|
| `t-h1` | 18px | 700 | Section titles |
| `t-h2` | 15px | 700 | Sub-sections |
| `t-h3` | 13px | 700 | Small headers |
| `t-body` | 13px | 400 | Body text |
| `t-body-sm` | 12px | 400 | Small body |
| `t-caption` | 11px | 400 | Captions |
| `t-micro` | 10px | 400 | Micro labels |
| `t-label` | 10px | 700 | Micro-caps eyebrow (signature) |
| `t-num-xl` | 22px | 700 | Hero numbers |
| `t-num-lg` | 16px | 700 | KPI numbers |
| `t-num` | 12px | 600 | Table numbers |
| `t-num-sm` | 10px | 600 | Micro numbers |

## UI Patterns

### Buttons

| Klasse | Verwendung |
|--------|-----------|
| `.bp-btn-primary` | Primary action (accent fill) |
| `.bp-btn-secondary` | Secondary action (surface fill) |
| `.bp-btn-ghost` | Tertiary action (transparent) |
| `.bp-btn-danger` | Destructive action (red) |

### Component Recipes

| Klasse | Verwendung |
|--------|-----------|
| `.bp-card` | Card container (surface, border, shadow) |
| `.bp-skeleton` | Loading placeholder (animated shimmer) |
| `.bp-badge` | Status badge (small, rounded) |

### Design Rules

- **Buttons:** Title Case
- **Eyebrow labels:** ALL CAPS, 10px, 700, `letter-spacing: 0.08em`, `--fg-3`
- **Dashed accent border** = empty-state/CTA actions
- **Solid accent fill** = primary action
- **No gradients** except `.bp-gradient-accent` for hero CTAs
- **Icons:** lucide-react, 2px stroke
- **Spacing:** dense (4/6/8/10/12/14px dominant gaps)
- **All numbers:** `font-variant-numeric: tabular-nums` + JetBrains Mono

## Tailwind Integration

Tailwind config extends with:
- Custom colors: `bg`, `surface`, `accent`, `green`, `red`, `yellow`, `fg-1/2/3`, `border`, `border-2`
- Custom font sizes: `t-h1` through `t-micro`, `t-num-xl` through `t-num-sm`
- Custom radii: `sm` (2px), `base` (4px), `md` (6px), `lg` (8px), `full` (9999px)
- Custom shadows: `card`, `modal`
- Font families: `syne`, `jetbrains-mono`, `dm-serif-display`

## Component Classes (via `@layer components`)

All `.bp-*` classes are defined in `frontend/src/index.css` under `@layer components`.
