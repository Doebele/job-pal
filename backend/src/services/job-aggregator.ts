// ==============================================================================
// Job Aggregator — fetches from local DB, Indeed RSS, and optional Adzuna API
// ==============================================================================

import { db } from '../db';
import { jobs } from '../models/schema';
import { eq, and, or, ilike } from 'drizzle-orm';

export interface AggregatedJob {
  id: string;
  title: string;
  description: string;
  company?: string;
  location: string;
  canton?: string;
  url: string;
  source: string;
  sourceName: string;
  publishedAt?: string;
  category?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
}

// 5-minute in-memory cache keyed by source+params
const cache = new Map<string, { data: AggregatedJob[]; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export interface SearchParams {
  q?: string;
  canton?: string;
  location?: string;
  category?: string;
  sources?: string[];
  limit?: number;
}

// ─── RSS helpers (no external deps) ─────────────────────────────────────────

function extractXml(xml: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
    'i',
  );
  return (xml.match(re)?.[1] ?? '').trim();
}

function parseRssItems(xml: string): Array<Record<string, string>> {
  return (xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []).map((item) => ({
    title: extractXml(item, 'title'),
    link: extractXml(item, 'link'),
    description: extractXml(item, 'description'),
    pubDate: extractXml(item, 'pubDate'),
    guid: extractXml(item, 'guid'),
  }));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

// ─── Source: Job-Pal local DB ────────────────────────────────────────────────

async function searchLocalJobs(params: SearchParams): Promise<AggregatedJob[]> {
  const clauses: any[] = [eq(jobs.isPublished, true)];
  if (params.category) clauses.push(eq(jobs.category, params.category));
  if (params.canton) clauses.push(eq(jobs.canton, params.canton));
  if (params.location) clauses.push(ilike(jobs.location, `%${params.location}%`));

  let where: any = and(...clauses);
  if (params.q) {
    const like = `%${params.q}%`;
    where = and(or(ilike(jobs.title, like), ilike(jobs.description, like)), where);
  }

  const rows = await db.select().from(jobs).where(where);

  return rows.map((job) => ({
    id: `job-pal:${job.id}`,
    title: job.title,
    description: job.description,
    location: job.location,
    canton: job.canton ?? undefined,
    url: `/jobs/${job.id}`,
    source: 'job-pal',
    sourceName: 'Job-Pal',
    publishedAt: (job.createdAt as Date).toISOString(),
    category: job.category,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency ?? undefined,
  }));
}

// ─── Source: Indeed Switzerland RSS ─────────────────────────────────────────

async function searchIndeed(params: SearchParams): Promise<AggregatedJob[]> {
  const location = params.location ?? params.canton;
  const cacheKey = `indeed:${params.q ?? ''}:${location ?? ''}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.data;

  const qs = new URLSearchParams({ sort: 'date' });
  if (params.q) qs.set('q', params.q);
  if (location) qs.set('l', location);

  try {
    const res = await fetch(`https://ch.indeed.com/rss?${qs}`, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Job-Pal/1.0)' },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = parseRssItems(xml).slice(0, 25);

    const result: AggregatedJob[] = items
      .filter((i) => i.title && i.link)
      .map((item, idx) => ({
        id: `indeed-ch:${item.guid || item.link || idx}`,
        title: item.title,
        description: stripHtml(item.description).slice(0, 400),
        location: location ?? 'Schweiz',
        url: item.link,
        source: 'indeed-ch',
        sourceName: 'Indeed',
        publishedAt: item.pubDate || undefined,
      }));

    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
    return result;
  } catch {
    return [];
  }
}

// ─── Source: Adzuna API (optional – needs ADZUNA_APP_ID + ADZUNA_APP_KEY) ───

async function searchAdzuna(params: SearchParams): Promise<AggregatedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const location = params.location ?? params.canton;
  const cacheKey = `adzuna:${params.q ?? ''}:${location ?? ''}:${params.category ?? ''}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.data;

  const qs = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '20',
    'content-type': 'application/json',
  });
  if (params.q) qs.set('what', params.q);
  if (location) qs.set('where', location);

  try {
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/ch/search/1?${qs}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return [];

    const data: any = await res.json();
    const result: AggregatedJob[] = (data.results ?? []).map((item: any) => ({
      id: `adzuna:${item.id}`,
      title: item.title,
      description: (item.description ?? '').slice(0, 400),
      company: item.company?.display_name,
      location: item.location?.display_name ?? 'Schweiz',
      url: item.redirect_url,
      source: 'adzuna',
      sourceName: 'Adzuna',
      publishedAt: item.created,
      category: item.category?.label,
      salaryMin: item.salary_min ?? null,
      salaryMax: item.salary_max ?? null,
      salaryCurrency: 'CHF',
    }));

    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
    return result;
  } catch {
    return [];
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function searchJobs(params: SearchParams): Promise<AggregatedJob[]> {
  const sources = params.sources ?? ['job-pal', 'indeed-ch', 'adzuna'];

  const tasks: Promise<AggregatedJob[]>[] = [];
  if (sources.includes('job-pal')) tasks.push(searchLocalJobs(params));
  if (sources.includes('indeed-ch')) tasks.push(searchIndeed(params));
  if (sources.includes('adzuna')) tasks.push(searchAdzuna(params));

  const settled = await Promise.allSettled(tasks);
  const all: AggregatedJob[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  // Sort: newest first; Job-Pal entries float to top when no date
  all.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : Number.MAX_SAFE_INTEGER;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : Number.MAX_SAFE_INTEGER;
    return tb - ta;
  });

  return all.slice(0, params.limit ?? 60);
}

export function getSourceStatus(): Array<{ id: string; configured: boolean }> {
  return [
    { id: 'job-pal', configured: true },
    { id: 'indeed-ch', configured: true },
    { id: 'adzuna', configured: !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) },
  ];
}
