-- Admin sessions table
CREATE TABLE admin_sessions (
  token UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for expiry cleanup
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (server-side API routes manage access)
CREATE POLICY "Allow all operations on admin_sessions" ON admin_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);
