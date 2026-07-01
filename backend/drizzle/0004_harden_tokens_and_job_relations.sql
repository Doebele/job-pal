-- ==============================================================================
-- Migration: Separate auth token purposes and harden job relations
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'email_verification';

CREATE INDEX IF NOT EXISTS idx_password_resets_token_purpose
  ON password_resets(token, purpose);

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_job_id_jobs_id_fk;
ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_job_id_jobs_id_fk;
ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
