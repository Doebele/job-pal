// ==============================================================================
// Database Connection Pool
// ==============================================================================

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from './config';

export const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool);

export async function closePool() {
  await pool.end();
}
