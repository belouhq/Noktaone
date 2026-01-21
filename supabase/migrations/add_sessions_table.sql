-- Migration: Add sessions table for custom session management
-- Used by phone auth flow for session tokens

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- UUID session token
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Optional metadata
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(id);

-- RLS Policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Service role can manage all sessions
CREATE POLICY "Service role can manage sessions" ON sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = sessions.user_id
        AND profiles.id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE sessions IS 'Custom session tokens for phone authentication';
COMMENT ON COLUMN sessions.id IS 'UUID session token stored in HTTP-only cookie';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration timestamp (default: 30 days)';
