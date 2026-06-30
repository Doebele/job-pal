-- ==============================================================================
-- Migration: Harden token purposes and job/application relations
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'email_verification';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'password_resets_purpose_check'
  ) THEN
    ALTER TABLE password_resets
      ADD CONSTRAINT password_resets_purpose_check
      CHECK (purpose IN ('password_reset', 'email_verification'));
  END IF;
END $$;

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey;

ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_user_id_fkey;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_jobs_user_job
  ON saved_jobs(user_id, job_id);
