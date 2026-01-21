-- Migration: Add username column to user_profiles
-- Adds username field for the ultra minimal signup flow

-- Add username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
  END IF;
END $$;

-- Comments
COMMENT ON COLUMN user_profiles.username IS 'Unique username/handle for user identity (e.g., @username)';
