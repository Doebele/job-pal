-- ==============================================================================
-- Migration: Harden auth token purpose and job relationship integrity
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(32) NOT NULL DEFAULT 'email_verification';

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att
    ON att.attrelid = con.conrelid
   AND att.attnum = ANY (con.conkey)
  WHERE con.conrelid = 'applications'::regclass
    AND con.contype = 'f'
    AND att.attname = 'job_id'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  IF to_regclass('saved_jobs') IS NULL THEN
    RETURN;
  END IF;

  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att
    ON att.attrelid = con.conrelid
   AND att.attnum = ANY (con.conkey)
  WHERE con.conrelid = 'saved_jobs'::regclass
    AND con.contype = 'f'
    AND att.attname = 'job_id'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
