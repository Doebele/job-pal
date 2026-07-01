// ==============================================================================
// Jobs Routes — CRUD, categories
// ==============================================================================

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { applications, jobs, savedJobs } from '../models/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { searchJobs, getSourceStatus } from '../services/job-aggregator';
const SCHWEIZER_KANTONE: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen',
  AR: 'Appenzell Ausserrhoden', AI: 'Appenzell Innerrhoden', SG: 'St. Gallen',
  GR: 'Graubünden', AG: 'Aargau', TG: 'Thurgau', TI: 'Tessin', VD: 'Waadt',
  VS: 'Wallis', NE: 'Neuenburg', GE: 'Genf', JU: 'Jura',
};
const JOB_KATEGORIEN = ['Lehre / Ausbildung', 'Schnupperlehre', 'Ferienjob', 'Junior', 'Mid-Level', 'Senior', 'Praktikum', 'Nebstbeschäftigung'];

const router = new Hono();

const jobSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.string(),
  location: z.string().min(1),
  canton: z.string().optional(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  salaryCurrency: z.string().default('CHF'),
  startDate: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});
const jobPatchSchema = jobSchema.partial();

// GET /api/jobs/search — Aggregated multi-source search
router.get('/search', async (c) => {
  const { q, canton, category, sources, limit } = c.req.query();

  const result = await searchJobs({
    q: q || undefined,
    canton: canton || undefined,
    category: category || undefined,
    sources: sources ? sources.split(',').map((s) => s.trim()) : undefined,
    limit: limit ? parseInt(limit, 10) : 60,
  });

  return c.json({ jobs: result, total: result.length });
});

// GET /api/jobs/sources — available sources and their configuration status
router.get('/sources', async (c) => {
  return c.json({ sources: getSourceStatus() });
});

// GET /api/jobs — List with optional filters
router.get('/', async (c) => {
  const query = c.req.query();

  const whereClauses: any[] = [eq(jobs.isPublished, true)];

  let searchClause: any = null;
  if (query.q) {
    const search = `%${query.q}%`;
    searchClause = or(
      ilike(jobs.title, search),
      ilike(jobs.description, search),
    );
  }

  if (query.category) {
    whereClauses.push(eq(jobs.category, query.category));
  }
  if (query.type) {
    whereClauses.push(eq(jobs.duration, query.type));
  }
  if (query.location) {
    whereClauses.push(ilike(jobs.location, `%${query.location}%`));
  }
  if (query.canton) {
    whereClauses.push(eq(jobs.canton, query.canton));
  }

  let whereCondition: any = undefined;
  if (whereClauses.length > 0) {
    whereCondition = and(...whereClauses);
  }
  if (searchClause) {
    if (whereCondition) {
      whereCondition = and(searchClause, whereCondition);
    } else {
      whereCondition = searchClause;
    }
  }

  const result = await db
    .select()
    .from(jobs)
    .where(whereCondition)
    .orderBy(desc(jobs.createdAt));

  return c.json({ jobs: result });
});

// POST /api/jobs — Create
router.post('/', async (c) => {
  if (!(c as any).user || (c as any).user.role !== 'employer') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const employerId = (c as any).user.id;
  const body = await c.req.json();
  const parsed = jobSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { isPublished, ...jobData } = parsed.data;
  const [job] = await db
    .insert(jobs)
    .values({
      employerId,
      ...jobData,
      isPublished: isPublished ?? false,
    })
    .returning();

  return c.json({ job }, 201);
});

// GET /api/jobs/mine — Employer own jobs
router.get('/mine', async (c) => {
  if (!(c as any).user || (c as any).user.role !== 'employer') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const employerId = (c as any).user.id;
  const result = await db
    .select()
    .from(jobs)
    .where(eq(jobs.employerId, employerId))
    .orderBy(jobs.createdAt);

  return c.json({ jobs: result });
});

// PATCH /api/jobs/:id — Update
router.patch('/:id', async (c) => {
  if (!(c as any).user || (c as any).user.role !== 'employer') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const employerId = (c as any).user.id;
  const jobId = c.req.param('id');
  const body = await c.req.json();
  const parsed = jobPatchSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!existing || existing.employerId !== employerId) {
    return c.json({ error: 'Job not found' }, 404);
  }

  const [job] = await db
    .update(jobs)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(jobs.id, jobId))
    .returning();

  return c.json({ job });
});

// DELETE /api/jobs/:id — Delete
router.delete('/:id', async (c) => {
  if (!(c as any).user || (c as any).user.role !== 'employer') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const employerId = (c as any).user.id;
  const jobId = c.req.param('id');

  const [existing] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!existing || existing.employerId !== employerId) {
    return c.json({ error: 'Job not found' }, 404);
  }

  const [existingApplication] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.jobId, jobId))
    .limit(1);

  if (existingApplication) {
    return c.json({ error: 'Job cannot be deleted while applications exist' }, 409);
  }

  await db.delete(savedJobs).where(eq(savedJobs.jobId, jobId));
  await db.delete(jobs).where(eq(jobs.id, jobId));

  return c.json({ ok: true });
});

// GET /api/jobs/:id — Single job detail
router.get('/:id', async (c) => {
  const jobId = c.req.param('id');
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.isPublished, true)))
    .limit(1);

  if (!job) {
    return c.json({ error: 'Job not found' }, 404);
  }

  return c.json({ job });
});

// GET /api/jobs/categories
router.get('/categories', async (c) => {
  return c.json({ categories: JOB_KATEGORIEN });
});

// GET /api/jobs/kantone
router.get('/kantone', async (c) => {
  return c.json({ kantone: SCHWEIZER_KANTONE });
});

export default router;
