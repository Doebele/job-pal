-- ==============================================================================
-- Migration: Harden token purpose and job/application integrity
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'email_verification';

ALTER TABLE password_resets
  DROP CONSTRAINT IF EXISTS password_resets_purpose_check;

ALTER TABLE password_resets
  ADD CONSTRAINT password_resets_purpose_check
  CHECK (purpose IN ('email_verification', 'password_reset'));

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey;

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_jobs_id_fk;

ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_jobs_id_fk;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
