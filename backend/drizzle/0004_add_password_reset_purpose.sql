-- ==============================================================================
-- Migration: Separate password reset and email verification token purposes
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(30);

-- Bestehende Zeilen lassen sich nicht sicher unterscheiden. Deshalb bleiben sie
-- nur fuer E-Mail-Verifikation gueltig; Passwort-Resets koennen neu angefordert werden.
UPDATE password_resets
SET purpose = 'email_verification'
WHERE purpose IS NULL;

ALTER TABLE password_resets
  ALTER COLUMN purpose SET DEFAULT 'email_verification',
  ALTER COLUMN purpose SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE password_resets
    ADD CONSTRAINT password_resets_purpose_check
    CHECK (purpose IN ('email_verification', 'password_reset'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_password_resets_token_purpose
  ON password_resets(token, purpose);
