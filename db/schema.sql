-- Live schema for the Supabase project backing this site.
--
-- This mirrors what is actually deployed and is the reference for the payloads
-- in server/routes.ts. Keep this file in sync when you change the tables.
--
-- Applied against Supabase, not via a local DATABASE_URL. Run through the
-- Supabase SQL editor or the MCP `apply_migration` tool.

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text,
  email       text not null,
  source      text,
  ip          text,
  user_agent  text,
  subscribed  boolean default true
);

-- PostgREST resolves `on_conflict=email` against a unique index on the bare
-- column. An expression index such as lower(email) does NOT match and raises
-- 42P10, so this must stay a plain column index. Addresses are lowercased in
-- server/routes.ts before insert.
create unique index if not exists subscribers_email_key
  on public.subscribers (email);

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text,
  email       text not null,
  message     text not null,
  ip          text,
  user_agent  text
);

create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  email       text not null,
  phone       text,
  event_type  text,
  event_date  text,
  venue       text,
  location    text,
  hours       text,
  budget      text,
  message     text not null,
  ip          text,
  user_agent  text,
  status      text default 'new'
);

create table if not exists public.consent_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  fingerprint text,
  -- Booleans, not 0/1 integers. Postgres rejects an integer literal here.
  analytics   boolean not null default false,
  marketing   boolean not null default false,
  ip          text,
  user_agent  text
);

-- The server authenticates with the service role key, which bypasses RLS.
-- These policies exist so that a leaked publishable/anon key cannot read data:
-- inserts are permitted, reads are denied.
alter table public.subscribers      enable row level security;
alter table public.contact_messages enable row level security;
alter table public.bookings         enable row level security;
alter table public.consent_log      enable row level security;

-- Drop existing policies if re-running this file so the statements are idempotent.
drop policy if exists "subscribers_insert" on public.subscribers;
drop policy if exists "subscribers_select_deny" on public.subscribers;
drop policy if exists "contact_insert" on public.contact_messages;
drop policy if exists "contact_select_deny" on public.contact_messages;
drop policy if exists "bookings_insert" on public.bookings;
drop policy if exists "bookings_select_deny" on public.bookings;
drop policy if exists "consent_insert" on public.consent_log;
drop policy if exists "consent_select_deny" on public.consent_log;

-- Allow inserts from the public role (anon key). The live API uses the service
-- role, but these policies still protect against a leaked publishable key.
create policy "subscribers_insert" on public.subscribers
  for insert to public with check (true);

create policy "contact_insert" on public.contact_messages
  for insert to public with check (true);

create policy "bookings_insert" on public.bookings
  for insert to public with check (true);

create policy "consent_insert" on public.consent_log
  for insert to public with check (true);

-- Explicitly deny all selects for the public role. Service role bypasses RLS.
create policy "subscribers_select_deny" on public.subscribers
  for select to public using (false);

create policy "contact_select_deny" on public.contact_messages
  for select to public using (false);

create policy "bookings_select_deny" on public.bookings
  for select to public using (false);

create policy "consent_select_deny" on public.consent_log
  for select to public using (false);
