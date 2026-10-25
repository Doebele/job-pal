// ==============================================================================
// Hono App — Entry Point
// ==============================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { config } from './config';
import { closePool } from './db';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import documentRoutes from './routes/documents';
import jobRoutes from './routes/jobs';
import matchingRoutes from './routes/matching';
import applicationRoutes from './routes/applications';
import savedJobRoutes from './routes/saved-jobs';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', compress());
app.use(
  '*',
  cors({
    origin: config.CORS_ORIGIN,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
  })
);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api/auth/me', authMiddleware);
app.route('/api/auth', authRoutes);

// Protected routes — require valid JWT
app.use('/api/profile', authMiddleware);
app.use('/api/profile/*', authMiddleware);
app.use('/api/documents', authMiddleware);
app.use('/api/documents/*', authMiddleware);
app.use('/api/match', authMiddleware);
app.use('/api/match/*', authMiddleware);
app.use('/api/applications', authMiddleware);
app.use('/api/applications/*', authMiddleware);
app.use('/api/saved-jobs', authMiddleware);
app.use('/api/saved-jobs/*', authMiddleware);
app.use('/api/jobs/mine', authMiddleware);
app.use('/api/jobs', async (c, next) => {
  if (c.req.method === 'POST') {
    return authMiddleware(c, next);
  }
  await next();
});
app.use('/api/jobs/*', async (c, next) => {
  if (c.req.method === 'PATCH' || c.req.method === 'DELETE') {
    return authMiddleware(c, next);
  }
  await next();
});

app.route('/api/profile', profileRoutes);
app.route('/api/documents', documentRoutes);
app.route('/api/jobs', jobRoutes);
app.route('/api/match', matchingRoutes);
app.route('/api/applications', applicationRoutes);
app.route('/api/saved-jobs', savedJobRoutes);

// Error handling
app.onError((err, c) => {
  console.error('[Error]', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Server start
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`Job-Pal backend running on http://localhost:${PORT}`);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  server.close();
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  server.close();
  await closePool();
  process.exit(0);
});

export default app;
