# Job-Pal -- Projekt Scope

## Ziel

Job-Pal ist eine Job-Matching Plattform für den Schweizer Arbeitsmarkt, mit Fokus auf Auszubildende (Lehre/Ausbildung). Die Plattform verbindet Auszubildende mit Arbeitgebern durch skill-basiertes Matching.

## Zielgruppen

- **Auszubildende (Students):** Suchen Lehrbetriebe, erstellen Profile, bewerben sich auf Stellen
- **Arbeitgeber (Employers):** Veröffentlichen Stellen, durchsuchen Profile, verwalten Bewerbungen

## Tech Stack

| Schicht | Technologie |
|---------|------------|
| Backend | Hono.js (Node.js), TypeScript |
| Datenbank | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Frontend | React 19, Vite, TypeScript |
| Styling | TailwindCSS 3 (FinTools/Budget-Pal Design System) |
| State | Zustand (client), React Query (server state) |
| Routing | React Router 7 |
| HTTP Client | Axios |
| Infrastruktur | Docker Compose (3 Services) |

## Architektur

```
┌─────────────────────────────────────────────────┐
│  Frontend (React + Vite)                        │
│  - SPA mit lazy-loaded pages                    │
│  - Zustand stores (auth, profile, matching)     │
│  - React Query (server state caching)           │
│  - Axios interceptors (auth, error handling)    │
└────────────────────┬────────────────────────────┘
                     │  /api → proxy (dev) / nginx
┌────────────────────▼────────────────────────────┐
│  Backend (Hono.js)                              │
│  - Auth middleware (JWT)                        │
│  - Rate limiting                                │
│  - REST API routes                              │
│  - Service layer (auth, storage, email, match)  │
│  - Drizzle ORM                                  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│  PostgreSQL 16                                  │
│  - users, profiles, documents                   │
│  - jobs, applications, application_feedback     │
│  - password_resets                              │
└─────────────────────────────────────────────────┘
```

## Shared Code

`shared/types.ts` -- TypeScript Interfaces:
- `User`, `UserProfile`, `Skill`, `LanguageProficiency`, `Education`
- `Document`, `Job`, `Application`, `ApplicationFeedback`
- `PasswordResetToken`, `MatchResult`, `MatchRequest`

`shared/constants.ts` -- Konstanten:
- `SCHWEIZER_KANTONE` (26 Kantone)
- `BRANCHEN` (18 Branchen)
- `SPRACHEN` (5 Sprachen)
- `JOB_KATEGORIEN` (6 Kategorien)
- `CURRENCY_MAP`

## API Endpunkte

### Auth
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| POST | `/auth/register` | Registrierung |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Aktueller User |

### Profile
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/profile` | Profil abrufen |
| POST | `/profile` | Profil erstellen |
| PUT | `/profile` | Profil aktualisieren |
| DELETE | `/profile` | Profil löschen |

### Documents
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| POST | `/documents/upload` | Datei hochladen |
| GET | `/documents/list` | Dateien auflisten |
| GET | `/documents/:id/download` | Datei herunterladen |
| DELETE | `/documents/:id` | Datei löschen |

### Jobs
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/jobs` | Jobs auflisten (mit Filter) |
| GET | `/jobs/:id` | Job Detail |
| POST | `/jobs` | Job erstellen (Employer) |
| PUT | `/jobs/:id` | Job aktualisieren |
| GET | `/jobs/categories` | Kategorien |
| GET | `/jobs/kantone` | Kantone |

### Matching
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| POST | `/match` | Skill-basiertes Matching |
| GET | `/recommendations` | Job-Empfehlungen |

### Applications
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| POST | `/applications` | Bewerbung erstellen |
| GET | `/applications` | Bewerbungen auflisten |
| PUT | `/applications/:id` | Status aktualisieren |

## Design System

Siehe `docs/design.md` für vollständige Design-Spezifikation.

Kurz: Dark Theme mit CSS Custom Properties, Syne font, JetBrains Mono für Zahlen,
komponentenbasierte `.bp-*` Klassen, dense spacing, micro-caps eyebrow labels.

## Phasen

### Phase 1: Projekt-Scaffolding & Basisstruktur
- Docker Compose mit 3 Services
- Shared types & constants
- Backend: Hono app, Drizzle schema, auth routes
- Frontend: React app, layout components, UI components
- Design System Integration (Tailwind + CSS)

### Phase 2: Datenbank & Backend Core
- PostgreSQL 16 Container
- Drizzle ORM Schema (7 Tabellen)
- Auth Service (JWT, bcrypt)
- Email Service (Resend/SMTP)
- Storage Service (local FS, S3-ready)
- Matching Service (skill-based scoring)

### Phase 3: Frontend Pages & Features
- Landing, Login, Register Pages
- Dashboard mit QuickStats
- ProfileSetup Wizard (5 Steps)
- ProfileView (edit)
- JobList mit FilterBar
- JobDetail mit Apply-Button
- Applications Tracker

### Phase 4: Docker & Deployment
- Health checks in docker-compose.yml
- Synology NAS Deployment
- Strato Deployment (statische Build-Dateien)
- Environment Variables & Security Checklist
