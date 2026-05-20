# Job-Pal

Swiss job-matching platform for Berufsanfänger (new graduates & apprentices) and employers.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Hono.js (Node.js 20), Drizzle ORM, PostgreSQL 16 |
| Frontend | React 19, Vite 6, TailwindCSS, Zustand, TanStack Query |
| Infrastructure | Docker Compose, nginx (SPA + reverse proxy) |

## Quick Start

```bash
cp .env.example backend/.env   # fill in DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
docker compose up -d
```

**App:** http://localhost:8543 · **API:** http://localhost:3310 · **DB:** localhost:15435

> Port conflicts? Override in the root `.env` — see [Port Configuration](#port-configuration).

## Features

### For Students (Berufsanfänger)
- **Profile Wizard** — 7-step guided setup: personal info, school type, target roles, soft skills, internships, CV upload, summary
- **CV Parsing** — upload PDF/DOCX, auto-fill profile fields
- **Job Matching** — scoring algorithm (skills 50 pts · language 25 pts · education 15 pts · location 10 pts)
- **Job Aggregation** — search across Job-Pal DB + Adzuna API (optional); deep-links to Glassdoor, LinkedIn, jobs.ch, JobScout24, berufsberatung.ch
- **Saved Jobs** — bookmark with status tracking (saved → contacted → application sent → invited)

### For Employers
- **Job Posting** — create and manage listings with salary, location, deadline
- **Applications** — view applicants, update status, leave feedback (1–5 stars)

### Platform
- JWT auth, bcrypt passwords, email verification, password reset
- Rate limiting (in-memory, keyed by IP+route)
- Swiss-specific: all 26 cantons, Branchen, Schulsystem (Sek1/Lehre/BMS/Matura/FMS)

## API Endpoints

Base URL: `http://localhost:3310`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Current user |
| GET/POST/PUT | `/api/profile` | ✓ | Profile CRUD |
| GET | `/api/jobs/search` | — | Aggregated search (`?q=&canton=&sources=`) |
| GET | `/api/jobs/sources` | — | Available source status |
| GET | `/api/jobs` | — | Local DB jobs (filter: `?q=&canton=&category=`) |
| POST/PUT | `/api/jobs/:id` | ✓ employer | Job CRUD |
| POST/GET | `/api/applications` | ✓ | Apply / list applications |
| GET/POST/DELETE | `/api/saved-jobs` | ✓ | Bookmark jobs |
| POST | `/api/documents` | ✓ | Upload CV/documents |
| GET | `/api/match` | ✓ | Skill-based job matching |

## Job Aggregation

Job-Pal aggregates results from multiple sources with source attribution:

| Source | Type | Setup |
|---|---|---|
| Job-Pal DB | Internal | Always available |
| Adzuna | API | Free key at [developer.adzuna.com](https://developer.adzuna.com) → set `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` in `backend/.env` |
| Glassdoor, LinkedIn, jobs.ch, JobScout24, berufsberatung.ch | Deep-link | No API needed — opens pre-filled search in new tab |

Users can enable/disable sources per-session in **Settings → Job-Quellen**. Custom RSS feeds can be added there too.

## Port Configuration

Default ports (override in root `.env`):

| Variable | Default | Service |
|---|---|---|
| `BACKEND_PORT` | `3310` | API server (external → internal :3000) |
| `FRONTEND_PORT` | `8543` | Web app (external → internal :80) |
| `DB_EXTERNAL_PORT` | `15435` | PostgreSQL (external → internal :5432) |

```bash
# Example root .env — avoids conflicts with other local projects
BACKEND_PORT=3310
FRONTEND_PORT=8543
DB_EXTERNAL_PORT=15435
```

The backend's *internal* DB connection always uses `job-pal-db:5432` (Docker network), regardless of the external port mapping.

## Local Development

```bash
# Start DB only via Docker, run services locally
docker compose up -d job-pal-db

# Backend (port 3000)
cd backend && cp .env.example .env  # set DB_HOST=localhost, DB_PORT=15435
npm install && npm run dev

# Frontend (port 5173, proxies /api → :3000)
cd frontend && npm install && npm run dev
```

### Environment Variables (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DB_USER` | ✓ | PostgreSQL user |
| `DB_PASSWORD` | ✓ | PostgreSQL password |
| `DB_NAME` | ✓ | Database name |
| `DB_HOST` | ✓ | `job-pal-db` (Docker) or `localhost` (local dev) |
| `JWT_SECRET` | ✓ min 32 chars | Token signing key (`openssl rand -hex 32`) |
| `RESEND_API_KEY` | optional | Email via Resend (falls back to SMTP) |
| `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` | optional | Job aggregation via Adzuna |
| `CORS_ORIGIN` | optional | Restrict to production domain in prod |

## Database

Drizzle ORM migrations run automatically on container start (`start.sh`).

```bash
cd backend
npm run db:generate   # generate migration from schema changes
npm run db:migrate    # apply pending migrations
npm run db:studio     # open Drizzle Studio (browser UI)
```

**Schema:** `users` · `profiles` · `documents` · `jobs` · `applications` · `application_feedback` · `password_resets` · `saved_jobs`

## Deployment

### Synology NAS (Container Manager)

```bash
# On NAS via SSH
cd /docker/job-pal
cp .env.example backend/.env   # fill in secrets
docker compose up -d
```

Enable HTTPS: DSM → Application Portal → Reverse Proxy → add `jobpal.local` → Let's Encrypt.

### VPS (Strato / Hetzner)

```bash
ssh root@<server-ip>
git clone https://github.com/Doebele/job-pal.git /opt/job-pal
cd /opt/job-pal && cp .env.example backend/.env
docker compose up -d
```

### Static Frontend Only (Strato Webhosting)

```bash
cd frontend && npm run build
# Upload dist/ via FTP to public_html/
```

Backend requires a Docker-capable host or external service (Railway, Render, Fly.io).

## Security Checklist

- [ ] `JWT_SECRET` min. 32 chars random (`openssl rand -hex 32`)
- [ ] `CORS_ORIGIN` set to production domain (not `*`)
- [ ] `.env` in `.gitignore` (never commit secrets)
- [ ] HTTPS via reverse proxy (nginx / DSM / Caddy)
- [ ] Regular `pg_dump` backups
- [ ] `npm audit` before each deploy

## Contributing

```bash
git checkout -b feature/my-feature
# make changes, then:
npm run build   # verify both frontend and backend compile
git commit -m "feat: ..."
git push origin feature/my-feature
```
