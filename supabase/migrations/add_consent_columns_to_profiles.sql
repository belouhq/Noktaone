-- Migration: Add consent columns to profiles table
-- Adds RGPD compliance columns for consent management

-- Add consent_version column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'consent_version'
  ) THEN
    ALTER TABLE profiles ADD COLUMN consent_version TEXT;
  END IF;
END $$;

-- Add consent_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'consent_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN consent_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add marketing_opt_in column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'marketing_opt_in'
  ) THEN
    ALTER TABLE profiles ADD COLUMN marketing_opt_in BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Comments
COMMENT ON COLUMN profiles.consent_version IS 'Version of consent terms accepted by user';
COMMENT ON COLUMN profiles.consent_at IS 'Timestamp when consent was given';
COMMENT ON COLUMN profiles.marketing_opt_in IS 'User consent for marketing communications';
