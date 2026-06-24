import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Vite exposes env vars prefixed with VITE_ at build time.
// Values are baked in during `vite build` and available at runtime via import.meta.env.
const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = (): boolean =>
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  if (!isSupabaseConfigured()) {
    throw new Error(
      'This form is temporarily unavailable. Please email mgmt@zacharywalkermusic.com.',
    );
  }
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-zw-source': 'web' } },
  });
  return _client;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && EMAIL_RE.test(v.trim());

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubscribeArgs {
  name: string;
  email: string;
  source?: string;
}

export interface BookingArgs {
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate: string;
  venue?: string;
  location?: string;
  hours?: string;
  budget?: string;
  message: string;
}

export interface ContactArgs {
  name?: string;
  email: string;
  message: string;
}

export interface ConsentArgs {
  analytics: boolean;
  marketing: boolean;
  fingerprint?: string;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function subscribeNewsletter({ name, email, source = 'web' }: SubscribeArgs) {
  if (!name?.trim()) throw new Error('Please enter your name.');
  if (!isEmail(email)) throw new Error('Please enter a valid email address.');

  const ua =
    typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null;

  const { error } = await getClient()
    .from('subscribers')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      source,
      user_agent: ua,
    });

  if (error) {
    // Unique-constraint violation → already subscribed, treat as success
    if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
      return { ok: true, alreadySubscribed: true };
    }
    throw new Error(error.message ?? 'Could not subscribe right now. Please try again.');
  }

  return { ok: true, alreadySubscribed: false };
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export async function submitBooking(args: BookingArgs) {
  if (!args.name?.trim()) throw new Error('Please enter your name.');
  if (!isEmail(args.email)) throw new Error('Please enter a valid email.');
  if (!args.eventDate) throw new Error('Please choose an event date.');
  if (!args.message?.trim()) throw new Error('Please include a brief message.');

  const { error } = await getClient()
    .from('bookings')
    .insert({
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      phone: args.phone?.trim() || null,
      event_type: args.eventType?.trim() || null,
      event_date: args.eventDate.trim(),
      venue: args.venue?.trim() || null,
      location: args.location?.trim() || null,
      hours: args.hours?.trim() || null,
      budget: args.budget?.trim() || null,
      message: args.message.trim(),
    });

  if (error) throw new Error(error.message ?? 'Could not submit your inquiry right now.');
  return { ok: true };
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export async function submitContact(args: ContactArgs) {
  if (!isEmail(args.email)) throw new Error('Please enter a valid email.');
  if (!args.message?.trim()) throw new Error('Please include a message.');

  const { error } = await getClient()
    .from('contact_messages')
    .insert({
      name: args.name?.trim() || null,
      email: args.email.trim().toLowerCase(),
      message: args.message.trim(),
    });

  if (error) throw new Error(error.message ?? 'Could not send your message right now.');
  return { ok: true };
}

// ─── Consent log ──────────────────────────────────────────────────────────────

export async function logConsent(args: ConsentArgs) {
  try {
    await getClient()
      .from('consent_log')
      .insert({
        fingerprint: args.fingerprint?.slice(0, 64) ?? null,
        analytics: args.analytics,
        marketing: args.marketing,
        user_agent:
          (typeof navigator !== 'undefined' ? navigator.userAgent : null)?.slice(0, 500) ??
          null,
      });
  } catch {
    // Non-critical — consent is also persisted in localStorage.
  }
}
