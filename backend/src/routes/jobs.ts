// ==============================================================================
// Jobs Routes — CRUD, categories
// ==============================================================================

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { jobs } from '../models/schema';
import { eq, and } from 'drizzle-orm';
const SCHWEIZER_KANTONE: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen',
  AR: 'Appenzell Ausserrhoden', AI: 'Appenzell Innerrhoden', SG: 'St. Gallen',
  GR: 'Graubünden', AG: 'Aargau', TG: 'Thurgau', TI: 'Tessin', VD: 'Waadt',
  VS: 'Wallis', NE: 'Neuenburg', GE: 'Genf', JU: 'Jura',
};
const JOB_KATEGORIEN = ['Lehre / Ausbildung', 'Junior', 'Mid-Level', 'Senior', 'Praktikum', 'Nebstbeschäftigung'];

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
});

// GET /api/jobs — List with optional filters
router.get('/', async (c) => {
  const query = Object.fromEntries(new URLSearchParams(c.req.url).entries());

  const whereClauses = [];
  const params: any[] = [];

  if (query.category) {
    whereClauses.push(eq(jobs.category, query.category as string));
  }
  if (query.canton) {
    whereClauses.push(eq(jobs.canton, query.canton as string));
  }
  if (query.published !== undefined) {
    whereClauses.push(eq(jobs.isPublished, true));
  }

  const result = await db
    .select()
    .from(jobs)
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(jobs.createdAt);

  return c.json({ jobs: result });
});

// POST /api/jobs — Create
router.post('/', async (c) => {
  const employerId = (c as any).user.id;
  const body = await c.req.json();
  const parsed = jobSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [job] = await db
    .insert(jobs)
    .values({
      employerId,
      ...parsed.data,
      isPublished: false,
    })
    .returning();

  return c.json({ job }, 201);
});

// PUT /api/jobs/:id — Update
router.put('/:id', async (c) => {
  const employerId = (c as any).user.id;
  const jobId = c.req.param('id');
  const body = await c.req.json();

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
    .set({ ...body, updatedAt: new Date() })
    .where(eq(jobs.id, jobId))
    .returning();

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
