-- ==============================================================================
-- Migration: Harden auth token purpose and job/application integrity
-- ==============================================================================

-- Bestehende Zeilen sind mehrdeutig, weil Verifizierungs- und Reset-Tokens
-- dieselbe Tabelle nutzten. Sie werden sicherheitshalber als Verifizierung
-- behandelt, damit alte Verifizierungslinks kein Passwort zuruecksetzen.
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS purpose VARCHAR(30);
UPDATE password_resets SET purpose = 'email_verification' WHERE purpose IS NULL;
ALTER TABLE password_resets ALTER COLUMN purpose SET DEFAULT 'password_reset';
ALTER TABLE password_resets ALTER COLUMN purpose SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_password_resets_token_purpose
  ON password_resets(token, purpose);

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_job_id_jobs_id_fk;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT;

ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_user_id_users_id_fk;
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_user_id_fkey;
ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_job_id_jobs_id_fk;
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_job_id_fkey;
ALTER TABLE saved_jobs
  ADD CONSTRAINT saved_jobs_job_id_jobs_id_fk
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
