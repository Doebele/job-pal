-- ==============================================================================
-- Migration: Ensure saved_jobs foreign keys cascade on parent deletion
-- ==============================================================================

DO $$
DECLARE
  fk_name text;
BEGIN
  FOR fk_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'saved_jobs'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) LIKE 'FOREIGN KEY (user_id)%'
  LOOP
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', fk_name);
  END LOOP;
END $$;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

DO $$
DECLARE
  fk_name text;
BEGIN
  FOR fk_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'saved_jobs'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) LIKE 'FOREIGN KEY (job_id)%'
  LOOP
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', fk_name);
  END LOOP;
END $$;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
