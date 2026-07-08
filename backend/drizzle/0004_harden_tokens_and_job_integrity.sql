-- ==============================================================================
-- Migration: Harden token purpose and job/application relationships
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'email_verification';

-- Bestehende uneindeutige Tokens stammen aus der Zeit vor der Zwecktrennung
-- und duerfen nicht als Passwort-Reset-Token akzeptiert werden.
UPDATE password_resets
SET purpose = 'email_verification'
WHERE purpose IS NULL OR purpose = '';

ALTER TABLE password_resets
  ADD CONSTRAINT password_resets_purpose_check
  CHECK (purpose IN ('password_reset', 'email_verification'));

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'applications'::regclass
    AND contype = 'f'
    AND conkey = ARRAY[
      (SELECT attnum FROM pg_attribute WHERE attrelid = 'applications'::regclass AND attname = 'job_id')
    ]
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'saved_jobs'::regclass
    AND contype = 'f'
    AND conkey = ARRAY[
      (SELECT attnum FROM pg_attribute WHERE attrelid = 'saved_jobs'::regclass AND attname = 'job_id')
    ]
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE saved_jobs DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
