-- 001_init.sql
-- Initial schema for Neon/Postgres

-- Subscribers (newsletter)
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add name column if upgrading from older schema
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscribers' AND column_name='name') THEN
    ALTER TABLE subscribers ADD COLUMN name TEXT;
  END IF;
END $$;

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

-- Row Level Security (RLS) for direct client-side inserts (using anon key)
-- This project uses Supabase client directly from the browser for forms (newsletter, booking, contact, consent).
-- Enable RLS and allow public (anon) inserts. Keep other operations restricted.

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert to subscribers" ON subscribers
  FOR INSERT
  WITH CHECK (true);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert to bookings" ON bookings
  FOR INSERT
  WITH CHECK (true);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert to contact_messages" ON contact_messages
  FOR INSERT
  WITH CHECK (true);

ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert to consent_log" ON consent_log
  FOR INSERT
  WITH CHECK (true);

-- Note: For production, you may want more restrictive policies.
-- These permissive INSERT policies allow the public newsletter/booking forms (via anon key).
-- Run this migration (or apply the ALTER/CREATE POLICY statements) on your Supabase project.
