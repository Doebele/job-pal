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

// POST /api/applications — Apply for a job
router.post('/', async (c) => {
  const applicantId = (c as any).user.id;
  if ((c as any).user.role !== 'student') {
    return c.json({ error: 'Only students can apply to jobs' }, 403);
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

  const query = c.req.query();

  const whereClauses: any[] = [];
  if (role === 'employer') {
    whereClauses.push(eq(jobs.employerId, userId));
    if (query.jobId) {
      const jobId = z.string().uuid().safeParse(query.jobId);
      if (!jobId.success) {
        return c.json({ error: 'Invalid jobId' }, 400);
      }
      whereClauses.push(eq(applications.jobId, jobId.data));
    }
  } else {
    whereClauses.push(eq(applications.applicantId, userId));
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
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(...whereClauses))
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

  const [existing] = await db
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(eq(applications.id, appId), eq(jobs.employerId, userId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Application not found' }, 404);
  }

  const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
  if (!validStatuses.includes(body.status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  const [application] = await db
    .update(applications)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(applications.id, appId))
    .returning();

  return c.json({ application });
});

export default router;
