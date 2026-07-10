-- ==============================================================================
-- Migration: Harden token purposes and job/application integrity
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30);

UPDATE password_resets
SET purpose = 'email_verification'
WHERE purpose IS NULL;

ALTER TABLE password_resets
  ALTER COLUMN purpose SET DEFAULT 'password_reset',
  ALTER COLUMN purpose SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_password_resets_token_purpose
  ON password_resets(token, purpose);

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey;

ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_fkey
  FOREIGN KEY (job_id)
  REFERENCES jobs(id)
  ON DELETE RESTRICT;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_fkey
  FOREIGN KEY (job_id)
  REFERENCES jobs(id)
  ON DELETE CASCADE;
