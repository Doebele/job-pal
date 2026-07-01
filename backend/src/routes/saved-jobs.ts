// ==============================================================================
// Saved Jobs Routes — bookmarking jobs with status tracking
// ==============================================================================

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { savedJobs, jobs } from '../models/schema';
import { eq, and, like } from 'drizzle-orm';

const router = new Hono();

const jobIdSchema = z.object({
  jobId: z.string().uuid(),
});

const validStatuses = ['saved', 'contacted', 'application_sent', 'rejected', 'invited'];

const withJob = (savedJob: typeof savedJobs.$inferSelect, job: typeof jobs.$inferSelect) => ({
  ...savedJob,
  job: {
    title: job.title,
    category: job.category,
    location: job.location,
    canton: job.canton,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    isPublished: job.isPublished,
    createdAt: job.createdAt,
  },
});

// POST /api/saved-jobs — Save/bookmark a job (idempotent)
router.post('/', async (c) => {
  const userId = (c as any).user.id;
  const body = await c.req.json();
  const parsed = jobIdSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Verify job exists and is published
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, parsed.data.jobId), eq(jobs.isPublished, true)))
    .limit(1);

  if (!job) {
    return c.json({ error: 'Job nicht gefunden oder nicht veröffentlicht' }, 404);
  }

  // Upsert: if row exists for this user+job, return it (idempotent)
  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, parsed.data.jobId)))
    .limit(1);

  if (existing) {
    return c.json({ savedJob: withJob(existing, job) }, 200);
  }

  const [savedJob] = await db
    .insert(savedJobs)
    .values({ userId, jobId: parsed.data.jobId })
    .returning();

  return c.json({ savedJob: withJob(savedJob, job) }, 201);
});

// GET /api/saved-jobs — List saved jobs
router.get('/', async (c) => {
  const userId = (c as any).user.id;
  const query = c.req.query();

  const whereClauses = [eq(savedJobs.userId, userId)];

  if (query.status) {
    whereClauses.push(eq(savedJobs.status, query.status as string));
  }

  const savedJobsList = await db
    .select({
      id: savedJobs.id,
      jobId: savedJobs.jobId,
      status: savedJobs.status,
      note: savedJobs.note,
      createdAt: savedJobs.createdAt,
      updatedAt: savedJobs.updatedAt,
      job: {
        title: jobs.title,
        category: jobs.category,
        location: jobs.location,
        canton: jobs.canton,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        isPublished: jobs.isPublished,
        createdAt: jobs.createdAt,
      },
    })
    .from(savedJobs)
    .leftJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(savedJobs.updatedAt);

  return c.json({ savedJobs: savedJobsList });
});

// PUT /api/saved-jobs/:id/status — Update status
router.put('/:id/status', async (c) => {
  const userId = (c as any).user.id;
  const savedJobId = c.req.param('id');
  const body = await c.req.json();

  if (!validStatuses.includes(body.status)) {
    return c.json({ error: 'Ungültiger Status' }, 400);
  }

  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.id, savedJobId), eq(savedJobs.userId, userId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Gespeicherter Job nicht gefunden' }, 404);
  }

  const [updated] = await db
    .update(savedJobs)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(savedJobs.id, savedJobId))
    .returning();

  return c.json({ savedJob: updated });
});

// PUT /api/saved-jobs/:id/note — Update note
router.put('/:id/note', async (c) => {
  const userId = (c as any).user.id;
  const savedJobId = c.req.param('id');
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.id, savedJobId), eq(savedJobs.userId, userId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Gespeicherter Job nicht gefunden' }, 404);
  }

  const [updated] = await db
    .update(savedJobs)
    .set({ note: body.note ?? null, updatedAt: new Date() })
    .where(eq(savedJobs.id, savedJobId))
    .returning();

  return c.json({ savedJob: updated });
});

// DELETE /api/saved-jobs/:id — Remove saved job
router.delete('/:id', async (c) => {
  const userId = (c as any).user.id;
  const savedJobId = c.req.param('id');

  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.id, savedJobId), eq(savedJobs.userId, userId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Gespeicherter Job nicht gefunden' }, 404);
  }

  await db.delete(savedJobs).where(eq(savedJobs.id, savedJobId));
  return c.json({ success: true });
});

export default router;
