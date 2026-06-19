-- ==============================================================================
-- Migration: Prevent destructive job deletes
-- ==============================================================================

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
