-- ==============================================================================
-- Migration: Distinguish reset and email-verification tokens
-- ==============================================================================

ALTER TABLE password_resets
  ADD COLUMN IF NOT EXISTS token_type VARCHAR(30) NOT NULL DEFAULT 'password_reset';

CREATE INDEX IF NOT EXISTS idx_password_resets_token_type ON password_resets(token_type);
