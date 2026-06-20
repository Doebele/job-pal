-- ==============================================================================
-- Migration: Ensure saved job rows do not block user/job deletion
-- ==============================================================================

ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_user_id_fkey;
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_user_id_users_id_fk;
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_job_id_jobs_id_fk;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
