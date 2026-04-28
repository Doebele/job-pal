// ==============================================================================
// Profile Routes — CRUD for user profiles
// ==============================================================================

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { profiles } from '../models/schema';
import { eq } from 'drizzle-orm';

const router = new Hono();

const profileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  canton: z.string().max(50).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  skills: z.array(
    z.object({
      name: z.string().min(1),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    })
  ).default([]),
  languages: z.array(
    z.object({
      language: z.string().min(1),
      level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native']).optional(),
    })
  ).default([]),
  education: z.array(
    z.object({
      institution: z.string().min(1),
      field: z.string().min(1),
      degree: z.string().min(1),
      startYear: z.number(),
      endYear: z.number().nullable().optional(),
      current: z.boolean().optional(),
    })
  ).default([]),
  // Berufsanfänger fields
  schoolType: z.string().max(30).optional().nullable(),
  schoolName: z.string().max(255).optional().nullable(),
  graduationYear: z.number().optional().nullable(),
  targetRoles: z.array(z.any()).default([]),
  preferredCantons: z.array(z.string()).default([]),
  internships: z.array(z.any()).default([]),
  softSkills: z.array(z.any()).default([]),
  motivationStatement: z.string().max(5000).optional().nullable(),
  availableFrom: z.string().max(7).optional().nullable(),
  wantsTraining: z.boolean().default(false),
  cvParsed: z.boolean().default(false),
  cvParsedAt: z.string().optional().nullable(),
});

// GET /api/profile
router.get('/', async (c) => {
  const userId = (c as any).user.id;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!profile) {
    return c.json({ message: 'No profile found' }, 404);
  }

  return c.json({ profile });
});

// POST /api/profile — Create
router.post('/', async (c) => {
  const userId = (c as any).user.id;
  const body = await c.req.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Check if profile already exists
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: 'Profile already exists. Use PUT to update.' }, 409);
  }

  const { cvParsedAt: cvParsedAtStr, ...profileData } = parsed.data;
  const [profile] = await db
    .insert(profiles)
    .values({
      userId,
      ...profileData,
      ...(cvParsedAtStr != null ? { cvParsedAt: new Date(cvParsedAtStr) } : {}),
    })
    .returning();

  return c.json({ profile }, 201);
});

// PUT /api/profile — Update
router.put('/', async (c) => {
  const userId = (c as any).user.id;
  const body = await c.req.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Profile not found. Use POST to create.' }, 404);
  }

  const { cvParsedAt: cvParsedAtStr, ...profileData } = parsed.data;
  const [profile] = await db
    .update(profiles)
    .set({
      ...profileData,
      updatedAt: new Date(),
      ...(cvParsedAtStr != null ? { cvParsedAt: new Date(cvParsedAtStr) } : {}),
    })
    .where(eq(profiles.userId, userId))
    .returning();

  return c.json({ profile });
});

// DELETE /api/profile
router.delete('/', async (c) => {
  const userId = (c as any).user.id;

  const [deleted] = await db
    .delete(profiles)
    .where(eq(profiles.userId, userId))
    .returning();

  if (!deleted) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json({ message: 'Profile deleted' });
});

export default router;
