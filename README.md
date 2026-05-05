# Job-Pal

Job-Matching Plattform für den Schweizer Arbeitsmarkt (Fokus Auszubildende).

## Tech-Stack

- **Backend:** Hono.js (Node.js), Drizzle ORM, PostgreSQL
- **Frontend:** React, Vite, TailwindCSS, Zustand, React Query
- **Infrastruktur:** Docker Compose

## Setup

```bash
cp .env.example .env
docker compose up -d
```

Bei lokalen Port-Konflikten kannst du in `.env` nur die externen Ports anpassen (z. B. `FRONTEND_PORT=5174` oder `DB_EXTERNAL_PORT=5436`).

## Ports

| Service      | Port |
|-------------|------|
| Backend     | 3000 |
| Frontend    | 5173 |
| PostgreSQL  | 5435 |

## API

Base URL: `http://localhost:3000`

- `GET /health` — Health check
- `POST /api/auth/register` — Registration
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

## Development

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## Deployment

### Synology NAS

```bash
docker compose up -d
```

Tipp: Reverse Proxy in DSM einrichten für `https://jobpal.local` + Let's Encrypt.

### Strato (statisch)

```bash
cd frontend && npm run build
# Upload dist/ via FTP/sFTP
```

---

# Deployment & Infrastruktur-Handbuch

## Projektstruktur

```
job-pal/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf          # SPA Routing + Security Headers
│   ├── package.json
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── start.sh            # Migrations + Server Start
│   ├── package.json
│   ├── src/
│   └── .env                # ⚠️ Geheimnisse! Nicht committen
├── docker-compose.yml
├── .env.example
└── shared/
    ├── types.ts
    └── constants.ts
```

## Docker-Setup

### `frontend/Dockerfile` (bereits vorhanden)

Multi-stage build: `node:20-alpine` → `nginx:alpine`. Kopiert SPA-Build nach `/usr/share/nginx/html`.

### `frontend/nginx.conf` (bereits vorhanden)

- SPA Routing: `try_files $uri $uri/ /index.html`
- API Proxy zu `job-pal-backend:3000`
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Gzip Kompression
- Static asset caching (30d, immutable)

### `backend/Dockerfile` (bereits vorhanden)

Multi-stage build: `node:20-alpine` → `node:20-alpine-slim`. Enthält `start.sh` für Drizzle-Migrationen vor dem Server-Start.

### `docker-compose.yml` (bereits vorhanden)

3 Services: `job-pal-db` (PostgreSQL 16), `job-pal-backend` (Hono), `job-pal-frontend` (nginx). Mit Health Checks und Bridge-Network.

### `.env.example` (bereits vorhanden)

Alle Umgebungsvariablen mit Defaults und Kommentaren. Kopieren nach `.env` und anpassen.

## Deployment-Anleitungen

### Synology NAS (Container Manager)

1. **Container Manager aktivieren:** DSM → Paketzentrum → Container Manager installieren
2. **Projektordner erstellen:** `/docker/job-pal`
3. **Dateien hochladen:** `docker-compose.yml`, `.env`, `frontend/`, `backend/`
4. **Terminal öffnen:** `ssh <user>@<nas-ip>`
5. **Deploy:**
   ```bash
   cd /docker/job-pal
   docker compose up -d
   ```
6. **Zugriff:** `http://<nas-ip>:8080`
7. **HTTPS:** Reverse Proxy in DSM einrichten mit Let's Encrypt

### Strato VPS (Docker-fähig)

```bash
ssh root@<strato-ip>
# docker-compose.yml, .env, frontend/, backend/ hochladen
cd /opt/job-pal
docker compose up -d
```

Firewall: Port 80/443 öffnen, SSH auf nicht-Standardport legen.

### Strato Webhosting (traditionell, kein Docker)

1. `cd frontend && npm run build` → `dist/` generieren
2. Backend als PM2-Prozess hosten (`npm i -g pm2`)
3. `dist/` via FTP/SFTP in `public_html/` hochladen
4. Datenbank: Strato MySQL nutzen oder externe DB (ElephantSQL / Neon)

## Security & DSGVO-Checkliste

| Bereich | Massnahme | Status |
|---------|-----------|--------|
| Auth | JWT mit `exp`-Claim, bcrypt für Passwörter | ☐ |
| CORS | `CORS_ORIGIN` explizit auf Domain beschränken (`*` verbieten) | ☐ |
| Uploads | `MAX_FILE_SIZE=10mb`, MIME-Type-Check, PDF/JPG nur | ☐ |
| DB | PostgreSQL mit SSL, regelmässige Backups (`pg_dump`) | ☐ |
| DSGVO | Datenschutzerklärung, Cookie-Consent, Löschfunktion für Profile, Datenminimierung | ☐ |
| Secrets | `.env` nie committen, in NAS/Strato sicher speichern | ☐ |
| Rate Limit | Backend-Middleware: 100 req/min/IP | ☐ |
| Dependencies | `npm audit fix`, `docker scan` für Images | ☐ |

## Nächste Schritte

### Stellenmarkt-APIs (Schweiz)

| Anbieter | Kosten | Notes |
|----------|--------|-------|
| Adzuna | Kostenlos bis 10k req/Monat | Gute Coverage, einfache Auth |
| Indeed Publisher | Kostenlos / Umsatzbasiert | Hohe Reichweite, strikte Richtlinien |
| jobs.ch Partner | Auf Anfrage / B2B | Schweizer Marktführer |

### KI & PDF-Features

- **CV-Parsing:** `pdf-parse` + `mammoth.js` (DOCX) + Tesseract OCR für Scans
- **Motivationsschreiben:** OpenAI/Claude API mit Prompt-Template
- **Matching:** Cosine Similarity oder TF-IDF zwischen Profil-Tags & Stellen-Tags

## Ready-to-Run Checklist

- [ ] `.env` mit echten Secrets befüllen
- [ ] `docker compose config` ausführen (Syntax-Check)
- [ ] `docker compose up -d` starten
- [ ] `http://localhost:8080` → Frontend lädt
- [ ] `http://localhost:3000/health` → Backend antwortet
- [ ] Docker-Logs prüfen: `docker compose logs -f`
- [ ] HTTPS aktivieren (NAS: DSM Reverse Proxy / Strato: Let's Encrypt)

## Secrets generieren

```bash
openssl rand -hex 32
```
