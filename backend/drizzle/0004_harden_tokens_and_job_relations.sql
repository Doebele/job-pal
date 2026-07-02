-- ==============================================================================
-- Migration: Harden auth token purposes and job relation deletes
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(32);

-- Existing rows were ambiguous; treating them as verification tokens prevents
-- old email-verification links from being accepted as password-reset links.
UPDATE password_resets
SET purpose = 'email_verification'
WHERE purpose IS NULL;

ALTER TABLE password_resets
  ALTER COLUMN purpose SET NOT NULL;

ALTER TABLE password_resets
  DROP CONSTRAINT IF EXISTS password_resets_purpose_check;
ALTER TABLE password_resets
  ADD CONSTRAINT password_resets_purpose_check
  CHECK (purpose IN ('email_verification', 'reset_password'));

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_jobs_id_fk;
ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;
ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_jobs_id_fk;
ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
