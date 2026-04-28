import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: '../backend/src/models/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.DB_USER ?? 'jobpal'}:${process.env.DB_PASSWORD ?? 'jobpal_secret'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME ?? 'jobpal'}`,
  },
});
