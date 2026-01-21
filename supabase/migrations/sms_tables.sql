-- Migration: SMS Unsubscribes and Logs
-- Tables for managing SMS opt-outs and logging

-- Table for tracking SMS unsubscribes
CREATE TABLE IF NOT EXISTS sms_unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT, -- "STOP", "MANUAL", "BOUNCE", etc.
  resubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT sms_unsubscribes_phone_check CHECK (phone ~ '^\+[1-9]\d{1,14}$')
);

CREATE INDEX IF NOT EXISTS idx_sms_unsubscribes_phone ON sms_unsubscribes(phone);
CREATE INDEX IF NOT EXISTS idx_sms_unsubscribes_unsubscribed_at ON sms_unsubscribes(unsubscribed_at);

-- Table for SMS logs (audit trail)
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Reference to user_profiles.user_id
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL, -- "transactional", "promotional", "otp", "reminder"
  status TEXT NOT NULL, -- "sent", "delivered", "failed", "unsubscribed", "bounced"
  message_id TEXT, -- Twilio message SID
  error_code TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  
  CONSTRAINT sms_logs_phone_check CHECK (phone ~ '^\+[1-9]\d{1,14}$')
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs(phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_message_type ON sms_logs(message_type);

-- RLS Policies
ALTER TABLE sms_unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can manage unsubscribes
CREATE POLICY "Service role can manage unsubscribes" ON sms_unsubscribes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Only service role can manage logs
CREATE POLICY "Service role can manage logs" ON sms_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE sms_unsubscribes IS 'Tracks SMS opt-outs for compliance (TCPA/RGPD)';
COMMENT ON COLUMN sms_unsubscribes.reason IS 'Reason for unsubscribe: STOP, MANUAL, BOUNCE, etc.';
COMMENT ON COLUMN sms_unsubscribes.resubscribed_at IS 'Timestamp when user resubscribed (if applicable)';

COMMENT ON TABLE sms_logs IS 'Audit trail for all SMS sent via Twilio';
COMMENT ON COLUMN sms_logs.message_type IS 'Type: transactional, promotional, otp';
COMMENT ON COLUMN sms_logs.status IS 'Status: sent, delivered, failed, unsubscribed, bounced';
COMMENT ON COLUMN sms_logs.message_id IS 'Twilio message SID for tracking';
