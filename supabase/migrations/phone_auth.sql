-- Migration: Phone Authentication Support
-- Adds phone-based OTP authentication and SMS consent tracking

-- Table for storing OTP codes
CREATE TABLE IF NOT EXISTS phone_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  consent_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for fast lookups
  CONSTRAINT phone_otps_phone_check CHECK (phone ~ '^\+[1-9]\d{1,14}$')
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON phone_otps(phone);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires ON phone_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_otps_used ON phone_otps(used);

-- Add phone column to user_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone TEXT;
    CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
  END IF;
END $$;

-- Add SMS consent columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'sms_consent'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN sms_consent BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_profiles ADD COLUMN sms_consent_at TIMESTAMPTZ;
  END IF;
END $$;

-- Function to clean up expired OTPs (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM phone_otps
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OTPs (if needed for debugging)
CREATE POLICY "Users can view own OTPs" ON phone_otps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.phone = phone_otps.phone
      AND user_profiles.user_id = auth.uid()
    )
  );

-- Only service role can insert/update OTPs
CREATE POLICY "Service role can manage OTPs" ON phone_otps
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE phone_otps IS 'Stores OTP codes for phone authentication';
COMMENT ON COLUMN phone_otps.otp_hash IS 'SHA256 hash of OTP code + phone + salt';
COMMENT ON COLUMN phone_otps.consent_sms IS 'User consent to receive SMS reminders';
