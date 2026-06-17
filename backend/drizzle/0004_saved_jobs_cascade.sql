-- ==============================================================================
-- Migration: Cascade saved job references when users or jobs are deleted
-- ==============================================================================

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_user_id_fkey,
  ADD CONSTRAINT saved_jobs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey,
  ADD CONSTRAINT saved_jobs_job_id_fkey
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
