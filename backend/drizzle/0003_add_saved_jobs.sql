-- ==============================================================================
-- Migration: Add saved_jobs table for bookmarking jobs
-- ==============================================================================

CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'saved',
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_jobs_user_job UNIQUE (user_id, job_id)
);

COMMENT ON COLUMN saved_jobs.status IS 'saved, contacted, application_sent, rejected, invited';
