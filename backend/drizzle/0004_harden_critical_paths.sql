-- ==============================================================================
-- Migration: Harden auth token purposes and job relation integrity
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(32);

-- Bestehende Zeilen hatten keinen Zweck. Verification-only ist sicherer, als alte
-- E-Mail-Verifizierungstokens zum Passwort-Reset zuzulassen.
UPDATE password_resets
SET purpose = 'email_verification'
WHERE purpose IS NULL;

ALTER TABLE password_resets
  ALTER COLUMN purpose SET DEFAULT 'password_reset',
  ALTER COLUMN purpose SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE password_resets
    ADD CONSTRAINT password_resets_purpose_check
    CHECK (purpose IN ('email_verification', 'password_reset'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey,
  DROP CONSTRAINT IF EXISTS applications_job_id_jobs_id_fk,
  ADD CONSTRAINT applications_job_id_jobs_id_fk
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

ALTER TABLE saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey,
  DROP CONSTRAINT IF EXISTS saved_jobs_job_id_jobs_id_fk,
  ADD CONSTRAINT saved_jobs_job_id_jobs_id_fk
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
