-- ==============================================================================
-- Migration: Preserve applications and cascade saved job bookmarks on job deletion
-- ==============================================================================

DO $$
DECLARE
  fk_name text;
BEGIN
  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
    WHERE con.conrelid = 'applications'::regclass
      AND con.contype = 'f'
      AND att.attname = 'job_id'
  LOOP
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', fk_name);
  END LOOP;
END $$;

ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

DO $$
DECLARE
  fk_name text;
BEGIN
  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
    WHERE con.conrelid = 'saved_jobs'::regclass
      AND con.contype = 'f'
      AND att.attname = 'job_id'
  LOOP
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', fk_name);
  END LOOP;
END $$;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

DO $$
DECLARE
  fk_name text;
BEGIN
  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
    WHERE con.conrelid = 'saved_jobs'::regclass
      AND con.contype = 'f'
      AND att.attname = 'user_id'
  LOOP
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', fk_name);
  END LOOP;
END $$;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
