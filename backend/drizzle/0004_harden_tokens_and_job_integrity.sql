-- ==============================================================================
-- Migration: Harden token purpose and job/application integrity
-- ==============================================================================

-- Existing ambiguous rows are treated as email-verification tokens so they cannot
-- be used to reset passwords without an explicit forgot-password flow.
ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'email_verification';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'password_resets_purpose_check'
      AND conrelid = 'password_resets'::regclass
  ) THEN
    ALTER TABLE password_resets
      ADD CONSTRAINT password_resets_purpose_check
      CHECK (purpose IN ('password_reset', 'email_verification'));
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT c.conname
    INTO constraint_name
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid
     AND a.attnum = ANY(c.conkey)
   WHERE c.conrelid = 'applications'::regclass
     AND c.contype = 'f'
     AND a.attname = 'job_id'
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
  constraint_name text;
BEGIN
  IF to_regclass('saved_jobs') IS NULL THEN
    RETURN;
  END IF;

  SELECT c.conname
    INTO constraint_name
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid
     AND a.attnum = ANY(c.conkey)
   WHERE c.conrelid = 'saved_jobs'::regclass
     AND c.contype = 'f'
     AND a.attname = 'job_id'
   LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('saved_jobs') IS NOT NULL THEN
    ALTER TABLE saved_jobs
      ADD CONSTRAINT saved_jobs_job_id_jobs_id_fk
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
  END IF;
END $$;
