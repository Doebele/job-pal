-- ==============================================================================
-- Migration: Preserve applications when jobs are deleted
-- ==============================================================================

DO $$
DECLARE
  existing_constraint TEXT;
BEGIN
  SELECT con.conname INTO existing_constraint
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'applications'
    AND att.attname = 'job_id'
    AND con.contype = 'f'
  LIMIT 1;

  IF existing_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', existing_constraint);
  END IF;

  ALTER TABLE applications
    ADD CONSTRAINT applications_job_id_fkey
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;
END $$;

DO $$
DECLARE
  existing_constraint TEXT;
BEGIN
  SELECT con.conname INTO existing_constraint
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'saved_jobs'
    AND att.attname = 'job_id'
    AND con.contype = 'f'
  LIMIT 1;

  IF existing_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', existing_constraint);
  END IF;

  ALTER TABLE saved_jobs
    ADD CONSTRAINT saved_jobs_job_id_fkey
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
END $$;
