# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Job-Pal is a Swiss job-matching platform targeting Berufsanfänger (new graduates/apprentices) and employers. Monorepo with Hono.js backend, React 19 frontend, and shared TypeScript types.

## Directory Structure

- `backend/` — Hono.js API server (src/index.ts entry, src/models/schema.ts Drizzle schema)
- `frontend/` — React 19 + Vite 6 SPA with react-router-dom 7, Zustand stores, TanStack Query
- `shared/` — Shared types (types.ts) and constants (constants.ts) used by both sides
- `docs/` — Project scope, implementation plan, design system spec
- `drizzle/` — Migration SQL files (0001_init.sql, 0002_add_berufsaenger_fields.sql)

## Development Commands

### Backend
```bash
cd backend
npm run dev        # Start dev server with tsx watch (localhost:3000)
npm run build      # Compile TypeScript
npm run start      # Run production build
npm run db:generate # Generate Drizzle migration
npm run db:migrate  # Apply pending migrations
npm run db:push    # Push schema to DB (dev shortcut)
npm run db:studio  # Open Drizzle Kit Studio
```

### Frontend
```bash
cd frontend
npm run dev        # Start dev server with Vite (localhost:8080, proxies API to :3000)
npm run build      # Production build
npm run preview    # Preview production build
```

### Docker (all services)
```bash
cd /Users/clausmedvesek/Developer/projects/job-pal
docker compose up -d       # Start PostgreSQL + backend + frontend
docker compose down        # Stop all services
```

### Environment
Copy `.env.example` to `backend/.env` and fill in values. Required: `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `DB_HOST`. Optional: `RESEND_API_KEY` or SMTP config for email, `CORS_ORIGIN`.

## Architecture

### Backend
- **Entry**: `backend/src/index.ts` — Hono app with logger, compression, CORS middleware. Registers route groups under `/api/`.
- **Routes** (`backend/src/routes/`): `auth.ts` (register/login/logout/me/forgot-password/reset-password/verify-email), `profile.ts` (CRUD + Berufsanfänger fields), `documents.ts` (upload/download/cv-parse), `jobs.ts` (CRUD + filters + categories), `matching.ts` (skill-based job scoring), `applications.ts` (apply + status updates)
- **Auth**: JWT middleware (`middleware/auth.ts`) — extracts Bearer token, attaches `{userId, email, role}` to `c.user`
- **Rate limiting**: In-memory Map-based (`middleware/rate-limit.ts`), keyed by IP+path
- **DB**: Drizzle ORM + pg Pool (20 max connections). Schema in `src/models/schema.ts`
- **Storage**: Local filesystem (`services/storage-service.ts`) with `StorageAdapter` interface for future S3 migration
- **Email**: Resend API primary, nodemailer SMTP fallback

### Frontend
- **Routing**: `App.tsx` — lazy-loaded pages via React Router 7, Suspense fallback
- **State**: Zustand stores (`stores/`) — `auth-store` (persisted), `wizard-store` (persisted), `profile-store` (draft), `matching-store` (cached)
- **API**: Axios instance (`lib/api.ts`) with auth interceptor, 401 response interceptor
- **Auth context**: `lib/auth-context.tsx` — `useAuth()` hook
- **Custom hooks**: `useMe()`, `useProfile()`, `useUpdateProfile()`, `useDocuments()`, `useUploadDocument()`
- **Profile Wizard**: 7 steps (`profile/steps/`) — PersonalInfo, School, SoftSkills, CVUpload, TargetRoles, Internships, Summary
- **Design**: Dark theme with CSS custom properties, `.bp-*` component classes, TailwindCSS

### Database Schema (7 tables)
- `users` — auth accounts (uuid, email, passwordHash, role, isActive, isEmailVerified)
- `profiles` — user profiles with JSONB fields (skills, languages, education, targetRoles, preferredCantons, internships, softSkills, motivationStatement) + Berufsanfänger fields
- `documents` — uploaded files (userId, filename, originalName, mimeType, size)
- `jobs` — job postings (employerId, title, description, category, location, canton, salary, isPublished, deadline)
- `applications` — job applications (applicantId, jobId, coverLetter, status, unique constraint on applicant+job)
- `application_feedback` — employer feedback (applicationId, employerId, rating 1-5, comment)
- `password_resets` — email verification and password reset tokens (userId, token, expiresAt)

## Key Patterns & Conventions

- All routes use Zod schemas for input validation
- Error responses: `{ error: string }` with appropriate HTTP status codes
- German-language error messages used in auth routes
- Matching algorithm scoring: skills=50pts, language=25pts, education=15pts, location=10pts
- Storage service has `StorageAdapter` interface — currently local filesystem implementation
- Email uses `sendEmail()` which tries Resend first, falls back to SMTP
- No tests exist in the project yet
- No CLAUDE.md, Cursor rules, or Copilot instructions previously existed
