# Job-Pal -- Implementierungsplan

## Context

Das Projekt `job-pal` ist eine Job-Matching Plattform für den Schweizer Arbeitsmarkt (Fokus Auszubildende). Der Plan folgt 4 Phasen.

---

## Phase 1: Projekt-Scaffolding & Basisstruktur

### Root-Dateien
- `docker-compose.yml` -- 3 Services: `job-pal-db` (PostgreSQL), `job-pal-backend` (Hono), `job-pal-frontend` (nginx)
- `.env.example` -- Alle env vars mit Defaults und Kommentaren
- `.gitignore` -- Node modules, .env, .DS_Store, dist, logs
- `README.md` -- Projektbeschreibung, Setup, Tech-Stack
- `shared/types.ts` -- UserType, UserRole, UserProfile, Job, Application, Document
- `shared/constants.ts` -- Schweizer Kantone, Branchen, Sprachen

### Backend (`backend/`)
- `package.json` -- hono, drizzle-orm, pg, zod, bcrypt, jsonwebtoken, multer, cors, compression, typescript, tsx, drizzle-kit
- `tsconfig.json` -- Strict, ESM
- `vite.config.ts` -- Für drizzle-kit oder build
- `Dockerfile` -- Multi-stage: node:20-alpine builder -> node:20-alpine-slim runtime
- `start.sh` -- Migrationen + Server Start
- `.env` -- (gitignored)

**Source files:**
- `src/index.ts` -- Hono App, Middleware, Route Mounting, Server Start
- `src/config.ts` -- Typesafe env loading mit Zod
- `src/db.ts` -- PostgreSQL Connection Pool (pg)
- `src/middleware/auth.ts` -- JWT Verify Middleware
- `src/middleware/rate-limit.ts` -- In-Memory Rate Limiter
- `src/routes/auth.ts` -- POST /register, POST /login, POST /logout, GET /me
- `src/routes/profile.ts` -- GET/POST/PUT/DELETE /profile
- `src/routes/documents.ts` -- POST /upload, GET /list, GET /:id/download, DELETE /:id
- `src/routes/jobs.ts` -- GET/POST/PUT /jobs, GET /categories
- `src/routes/matching.ts` -- POST /match, GET /recommendations
- `src/routes/applications.ts` -- POST/GET/PUT /applications
- `src/models/schema.ts` -- Drizzle ORM: users, profiles, documents, jobs, applications, application_feedback, password_resets
- `src/services/auth-service.ts` -- JWT creation/validation, bcrypt
- `src/services/storage-service.ts` -- File upload abstraction (local FS Phase 1)
- `src/services/email-service.ts` -- Email verification/reset
- `src/lib/crypto.ts` -- Encryption for sensitive fields
- `drizzle/0001_init.sql` -- Initial schema migration
- `drizzle/drizzle.config.ts` -- Drizzle config

### Frontend (`frontend/`)
- `package.json` -- react, react-dom, vite, @vitejs/plugin-react, typescript, tailwindcss, postcss, autoprefixer, react-router-dom, @tanstack/react-query, axios, zod, zustand, lucide-react, class-variance-authority, clsx, tailwind-merge
- `tsconfig.json` / `tsconfig.node.json`
- `vite.config.ts` -- React plugin, @ alias, dev proxy to backend:3000, build output
- `tailwind.config.ts` -- Custom theme, dark mode support, custom colors
- `postcss.config.js` -- tailwind + autoprefixer
- `index.html` -- HTML shell, PWA meta
- `Dockerfile` -- Multi-stage: node builder -> nginx serve
- `nginx.conf` -- API proxy to backend, SPA fallback, security headers, gzip
- `public/manifest.json`, `public/favicon.svg`
- `.env` / `.env.example`

**Source files:**
- `src/main.tsx` -- QueryClient + BrowserRouter + App
- `src/App.tsx` -- Routes (public + protected), ProtectedRoute wrapper, lazy-loaded pages
- `src/index.css` -- Tailwind base + custom fonts + base styles
- `src/lib/api.ts` -- Axios instance, base URL, auth interceptors
- `src/lib/auth-context.tsx` -- Auth context provider
- `src/lib/utils.ts` -- classMerge, CHF formatter, date formatter

**Stores:**
- `src/stores/auth-store.ts` -- Zustand: user, token, login/logout
- `src/stores/profile-store.ts` -- Zustand: draft profile for wizard
- `src/stores/matching-store.ts` -- Zustand: cached matches

**Types:**
- `src/types/index.ts` -- Re-export shared
- `src/types/auth.ts` -- LoginReq, RegisterReq, AuthResponse
- `src/types/profile.ts` -- ProfileForm, Skill, Language, Education

**Layout components:**
- `src/components/layout/Sidebar.tsx` -- Nav links, role-aware
- `src/components/layout/Header.tsx` -- User menu, search
- `src/components/layout/Layout.tsx` -- Wrapper (sidebar + header + main)
- `src/components/layout/ProtectedRoute.tsx` -- Auth guard

**UI components:**
- `src/components/ui/Button.tsx` -- Variants: primary, secondary, ghost, danger
- `src/components/ui/Input.tsx` -- Label, error, helper
- `src/components/ui/Select.tsx` -- Styled select
- `src/components/ui/Card.tsx` -- Header/body/footer slots
- `src/components/ui/Badge.tsx` -- Status badges
- `src/components/ui/Avatar.tsx` -- User avatar
- `src/components/ui/Modal.tsx` -- Accessible dialog
- `src/components/ui/Tabs.tsx` -- Tab navigation
- `src/components/ui/FileUpload.tsx` -- Drag-and-drop upload with progress
- `src/components/ui/Toast.tsx` -- Notifications
- `src/components/ui/Skeleton.tsx` -- Loading placeholders

**Feature components:**
- `src/components/profile/ProfileForm.tsx` -- Multi-field form
- `src/components/profile/SkillSelector.tsx` -- Skill picker with levels
- `src/components/profile/DocumentUploader.tsx` -- Upload management
- `src/components/profile/ProfilePreview.tsx` -- Profile preview
- `src/components/matching/JobCard.tsx` -- Job listing card
- `src/components/matching/JobFilterBar.tsx` -- Filter bar
- `src/components/matching/MatchScoreBadge.tsx` -- Match percentage
- `src/components/dashboard/DashboardOverview.tsx` -- Stats + quick actions
- `src/components/dashboard/QuickStats.tsx` -- Stats cards

**Pages:**
- `src/pages/Landing.tsx` -- Public landing with value prop + CTA
- `src/pages/Login.tsx` -- Login form
- `src/pages/Register.tsx` -- Registration with role selection
- `src/pages/Dashboard.tsx` -- Dashboard overview
- `src/pages/ProfileSetup.tsx` -- Step wizard (5 steps)
- `src/pages/ProfileView.tsx` -- View/edit profile
- `src/pages/JobList.tsx` -- Job listing + filters
- `src/pages/JobDetail.tsx` -- Job detail + apply
- `src/pages/Applications.tsx` -- Application tracker
- `src/pages/Settings.tsx` -- Account settings

**Hooks:**
- `src/hooks/useAuth.ts`
- `src/hooks/useProfile.ts`
- `src/hooks/useDocuments.ts`

---

## Phase 2: Datenbank & Backend Core

- PostgreSQL 16 Alpine Container
- Drizzle ORM Schema (alle Tabellen: users, profiles, documents, jobs, applications, application_feedback, password_resets)
- Initial Migration SQL
- Auth Service (JWT, bcrypt)
- Email Service (Resend/SMTP)
- Storage Service (local FS, S3-ready)
- Matching Service (skill-based scoring algorithm)

---

## Phase 3: Frontend Pages & Features (Phase 1 Scope)

- Landing, Login, Register Pages
- Dashboard mit QuickStats
- ProfileSetup Wizard (5 Steps: Personal Info -> Education -> Skills -> Documents -> Preview)
- ProfileView (edit)
- JobList mit FilterBar
- JobDetail mit Apply-Button
- Applications Tracker

---

## Phase 4: Docker & Deployment

- `docker-compose.yml` mit health checks
- Synology NAS Deployment (docker-compose direkt)
- Strato Deployment (statische Build-Dateien via FTP/sFTP)
- Environment Variables & Security Checklist

---

## Design-System Integration (FinTools / Budget-Pal Design System)

### Core Tokens (CSS Custom Properties)

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

### Budget-Pal Extensions

- `--bg-elevated` `#20212c` — Hover rows, tooltips
- `--border-bp` `rgba(255,255,255,0.13)` — Default BP border
- `--border-bp-subtle` `rgba(255,255,255,0.07)` — Subtle
- `--border-bp-strong` `rgba(255,255,255,0.22)` — Strong
- `--fg-disabled` `#535e6b` — Disabled text
- Radii: `--r-sm: 2px`, `--r-base: 4px`, `--r-md: 6px`, `--r-lg: 8px`, `--r-full: 9999px`
- `--shadow-card` `0 4px 24px rgba(0,0,0,0.4)` — BP card shadow
- 3 gradients: `.bp-gradient-card`, `.bp-gradient-accent`, `.bp-gradient-gain`
- Component recipes: `.bp-card`, `.bp-btn-primary`, `.bp-btn-secondary`, `.bp-btn-ghost`, `.bp-input`, `.bp-badge`, `.bp-skeleton`

### Fonts

| Font | Verwendung | Quelle |
|------|-----------|--------|
| DM Serif Display | Brand/logos only | Google Fonts CDN |
| Syne | All UI text | Google Fonts CDN |
| JetBrains Mono | Numbers with tabular-nums | Google Fonts CDN |

### Typografie-Skala

| Klasse | Grösse | Gewicht | Verwendung |
|--------|--------|---------|-----------|
| `t-h1` | 18px | 700 | Section titles |
| `t-h2` | 15px | 700 | Sub-sections |
| `t-h3` | 13px | 700 | Small headers |
| `t-body` | 13px | 400 | Body text |
| `t-body-sm` | 12px | 400 | Small body |
| `t-caption` | 11px | 400 | Captions |
| `t-micro` | 10px | 400 | Micro labels |
| `t-label` | 10px | 700 | Micro-caps eyebrow |
| `t-num-xl` | 22px | 700 | Hero numbers |
| `t-num-lg` | 16px | 700 | KPI numbers |
| `t-num` | 12px | 600 | Table numbers |
| `t-num-sm` | 10px | 600 | Micro numbers |

### Implementierung in Tailwind

- Tailwind config erweitert mit FinTools Farben als custom colors
- CSS custom properties als Design-Tokens in `index.css`
- `@layer components` für `.bp-card`, `.bp-btn-*`, `.bp-input` etc.
- Font families als Tailwind font-family utilities
- Micro-caps eyebrow als Tailwind utility class
- Alle Zahlen: `font-variant-numeric: tabular-nums` + JetBrains Mono

### UI Patterns

- **Buttons:** Title Case
- **Eyebrow labels:** ALL CAPS, 10px, 700, `letter-spacing: 0.08em`, `--fg-3`
- **Dashed accent border** = empty-state/CTA actions
- **Solid accent fill** = primary action
- **No gradients** except `.bp-gradient-accent` for hero CTAs
- **Icons:** lucide-react, 2px stroke
- **Spacing:** dense (4/6/8/10/12/14px dominant gaps)
- **Radii:** L4=2px (badges), L3=4px (inputs/buttons), L2=6px (sub-cards), L1=8px (main cards), full (pills)

---

## Verification

1. `docker compose up` startet alle 3 Services ohne Fehler
2. `curl localhost:<frontend-port>` zeigt Landing Page
3. `curl localhost:<backend-port>/health` returns 200
4. Registration + Login Flow funktioniert
5. Profile Setup Wizard: alle 5 Steps + save
6. Document Upload: file uploaded and downloadable
7. Docker auf Synology: `docker compose up -d` funktioniert
