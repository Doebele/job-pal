// ==============================================================================
// In-Memory Rate Limiter Middleware
// ==============================================================================

import { MiddlewareHandler, Next } from 'hono';
import { config } from '../config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const key = `${ip}:${c.req.path}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.RATE_LIMIT_WINDOW_MS,
    });
    await next();
    return;
  }

  if (entry.count >= config.RATE_LIMIT_MAX_REQUESTS) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  entry.count++;
  await next();
};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
