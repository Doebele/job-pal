// ==============================================================================
// Matching Routes — Skill-based job matching
// ==============================================================================

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { jobs, profiles } from '../models/schema';
import { eq, and } from 'drizzle-orm';

const router = new Hono();

const matchSchema = z.object({
  profileId: z.string(),
  category: z.string().optional(),
  canton: z.string().optional(),
  limit: z.number().default(10),
});

// POST /api/match
router.post('/', async (c) => {
  const userId = (c as any).user.id;
  const body = await c.req.json();
  const parsed = matchSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { profileId, category, canton, limit } = parsed.data;

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .limit(1);

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Fetch candidate jobs
  const whereClauses: any[] = [eq(jobs.isPublished, true)];
  if (category) whereClauses.push(eq(jobs.category, category));
  if (canton) whereClauses.push(eq(jobs.canton, canton));

  const whereCond = whereClauses.length > 1 ? and(...whereClauses) : undefined;

  const candidateJobs = await db
    .select()
    .from(jobs)
    .where(whereCond)
    .limit(limit);

  // Score each job
  const results = candidateJobs
    .map((job: any) => {
      const score = calculateMatchScore(profile, job);
      return {
        job,
        matchScore: score.score,
        matchedSkills: score.matchedSkills,
        missingSkills: score.missingSkills,
        reasons: score.reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return c.json({ matches: results });
});

// GET /api/match/recommendations
router.get('/recommendations', async (c: any) => {
  const userId = (c as any).user.id;
  const queryLimit = parseInt(new URLSearchParams(c.req.url).get('limit') || '10', 10);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!profile) {
    return c.json({ error: 'Profile not found', matches: [] }, 404);
  }

  const candidateJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.isPublished, true))
    .limit(Math.min(queryLimit, 50));

  const results = candidateJobs
    .map((job: any) => calculateMatchScore(profile, job))
    .sort((a, b) => b.score - a.score);

  return c.json({ matches: results, limit: queryLimit });
});

function calculateMatchScore(
  profile: any,
  job: any
): { score: number; matchedSkills: string[]; missingSkills: string[]; reasons: string[] } {
  const skills = (profile.skills as any[]) || [];
  const skillNames = skills.map((s: any) => s.name);
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // Normalize job text for keyword matching
  const jobText = `${job.title} ${job.description}`.toLowerCase();

  // Skill match (0-50 points)
  let skillScore = 0;
  for (const skill of skills) {
    const skillLower = skill.name.toLowerCase();
    if (jobText.includes(skillLower)) {
      skillScore += 50 / skillNames.length;
      matchedSkills.push(skill.name);
    } else {
      missingSkills.push(skill.name);
    }
  }

  // Language match (0-25 points)
  const profileLanguages = (profile.languages as any[]) || [];
  const langMap: Record<string, string> = {
    'deutsch': 'Deutsch', 'german': 'Deutsch',
    'franzosisch': 'Franzosisch', 'francais': 'Franzosisch', 'french': 'Franzosisch',
    'italienisch': 'Italienisch', 'italiano': 'Italienisch', 'italian': 'Italienisch',
    'englisch': 'Englisch', 'english': 'Englisch',
    'romanisch': 'Ratoromanisch', 'romansh': 'Ratoromanisch',
  };
  const profileLangLower = profileLanguages.map((l: any) =>
    langMap[l.language.toLowerCase()]?.toLowerCase() || l.language.toLowerCase()
  );
  const schweizerSprachen = ['deutsch', 'franzosisch', 'italienisch', 'ratoromanisch'];

  let langScore = 0;
  const hasRelevantLang = schweizerSprachen.some((spr) =>
    jobText.includes(spr) && profileLangLower.some((pl) => pl.includes(spr))
  );
  if (hasRelevantLang) {
    langScore = 25;
  } else if (profileLanguages.length > 0) {
    langScore = 10; // partial credit
  }

  // Education match (0-15 points)
  const eduMatch = (profile.education as any[]).length > 0 ? 15 : 0;

  // Location match (0-10 points)
  const canton = (profile.canton as string) || '';
  const jobCanton = (job.canton as string) || '';
  const locationMatch = canton && jobCanton && canton === jobCanton ? 10 : 0;

  const total = skillScore + langScore + eduMatch + locationMatch;
  const percentage = Math.min(Math.round((total / 100) * 100), 100);

  const reasons: string[] = [];
  if ((profile.education as any[]).length > 0) reasons.push('Education match');
  if (hasRelevantLang) reasons.push('Language requirements met');
  if (locationMatch > 0) reasons.push('Location match');
  if (skillNames.length > 0) reasons.push(`${matchedSkills.length}/${skillNames.length} skills match`);

  return {
    score: percentage,
    matchedSkills,
    missingSkills,
    reasons,
  };
}

export default router;
