-- 001_init.sql
-- Initial schema for Neon/Postgres

-- Subscribers (newsletter)
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings inquiries
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT,
  event_date TEXT,
  venue TEXT,
  location TEXT,
  hours TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Consent log
CREATE TABLE IF NOT EXISTS consent_log (
  id BIGSERIAL PRIMARY KEY,
  fingerprint TEXT,
  analytics INTEGER NOT NULL,
  marketing INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email_lower ON subscribers (lower(email));
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages (created_at);

-- Example Row Level Security (RLS) policies (OPTIONAL)
-- Only enable RLS if you plan to allow direct client access (e.g., via JWT-authenticated role).
-- For server-only usage (server uses full DB role), you generally do NOT enable RLS.
-- Uncomment and adapt if needed:

-- ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY subscribers_insert_policy ON subscribers
--   FOR INSERT
--   USING (true)
--   WITH CHECK (true);

-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY bookings_insert_policy ON bookings
--   FOR INSERT
--   USING (true)
--   WITH CHECK (true);

-- You can also create a dedicated limited role for client access and grant only INSERT:
-- CREATE ROLE web_role NOINHERIT;
-- GRANT INSERT ON TABLE subscribers TO web_role;
-- (Then configure your client to connect as web_role with limited permissions.)
