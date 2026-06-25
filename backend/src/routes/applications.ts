// ==============================================================================
// Applications Routes — CRUD for job applications
// ==============================================================================

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { applications, jobs } from '../models/schema';
import { eq, and } from 'drizzle-orm';

const router = new Hono();

const applicationSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().optional().nullable(),
});

const statusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
});

// POST /api/applications — Apply for a job
router.post('/', async (c) => {
  const applicantId = (c as any).user.id;
  const role = (c as any).user.role;

  if (role !== 'student') {
    return c.json({ error: 'Only students can apply for jobs' }, 403);
  }

  const body = await c.req.json();
  const parsed = applicationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Check if job exists and is published
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, parsed.data.jobId))
    .limit(1);

  if (!job || !job.isPublished) {
    return c.json({ error: 'Job not found or not available' }, 404);
  }

  // Check for duplicate application (same user, same job)
  const existing = await db
    .select()
    .from(applications)
    .where(and(eq(applications.applicantId, applicantId), eq(applications.jobId, parsed.data.jobId)))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: 'Already applied to this job' }, 409);
  }

  const [application] = await db
    .insert(applications)
    .values({
      applicantId,
      jobId: parsed.data.jobId,
      coverLetter: parsed.data.coverLetter,
    })
    .returning();

  return c.json({ application }, 201);
});

// GET /api/applications — List applications
router.get('/', async (c) => {
  const userId = (c as any).user.id;
  const role = (c as any).user.role;

  let whereClause: any;
  if (role === 'employer') {
    const jobId = c.req.query('jobId');
    const parsedJobId = z.string().uuid().safeParse(jobId);

    if (!parsedJobId.success) {
      return c.json({ error: 'jobId query parameter is required' }, 400);
    }

    const [job] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, parsedJobId.data), eq(jobs.employerId, userId)))
      .limit(1);

    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    whereClause = eq(applications.jobId, parsedJobId.data);
  } else {
    whereClause = eq(applications.applicantId, userId);
  }

  const appList = await db
    .select({
      id: applications.id,
      jobId: applications.jobId,
      coverLetter: applications.coverLetter,
      status: applications.status,
      appliedAt: applications.appliedAt,
      updatedAt: applications.updatedAt,
      job: {
        title: jobs.title,
        category: jobs.category,
        location: jobs.location,
      },
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(whereClause)
    .orderBy(applications.appliedAt);

  return c.json({ applications: appList });
});

// PUT /api/applications/:id/status — Update status
router.put('/:id/status', async (c) => {
  const userId = (c as any).user.id;
  const appId = c.req.param('id');
  const body = await c.req.json();

  // Only employer can update status
  if ((c as any).user.role !== 'employer') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(eq(applications.id, appId), eq(jobs.employerId, userId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Application not found' }, 404);
  }

  const [application] = await db
    .update(applications)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(applications.id, appId))
    .returning();

  return c.json({ application });
});

export default router;
