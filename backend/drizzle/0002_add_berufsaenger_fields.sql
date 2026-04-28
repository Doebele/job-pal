-- ==============================================================================
-- Migration: Add Berufsanfänger fields to profiles table
-- ==============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS school_type VARCHAR(30),
  ADD COLUMN IF NOT EXISTS school_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
  ADD COLUMN IF NOT EXISTS target_roles JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS preferred_cantons JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS internships JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS soft_skills JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS motivation_statement TEXT,
  ADD COLUMN IF NOT EXISTS available_from VARCHAR(7),
  ADD COLUMN IF NOT EXISTS wants_training BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cv_parsed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cv_parsed_at TIMESTAMP;
