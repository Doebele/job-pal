-- ==============================================================================
-- Migration: Preserve applications when employer jobs are deleted
-- ==============================================================================

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey,
  ADD CONSTRAINT applications_job_id_fkey
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey,
  ADD CONSTRAINT saved_jobs_job_id_fkey
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
