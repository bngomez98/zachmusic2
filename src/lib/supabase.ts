import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        'This form is temporarily unavailable. Please email mgmt@zacharywalkermusic.com.',
      );
    }
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-zw-source': 'web' } },
    });
  }
  return client;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && EMAIL_RE.test(v.trim());

export interface SubscribeArgs {
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

export async function subscribeNewsletter({ email, source = 'web' }: SubscribeArgs) {
  if (!isEmail(email)) throw new Error('Please enter a valid email address.');
  const { error } = await supabase().from('subscribers').insert({
    email: email.trim().toLowerCase(),
    source,
  });
  if (error) {
    // Unique constraint violation → treat as already-subscribed.
    if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) {
      return { ok: true, alreadySubscribed: true };
    }
    throw new Error(error.message || 'Could not subscribe right now.');
  }
  return { ok: true, alreadySubscribed: false };
}

export async function submitBooking(args: BookingArgs) {
  if (!args.name?.trim()) throw new Error('Please enter your name.');
  if (!isEmail(args.email)) throw new Error('Please enter a valid email.');
  if (!args.eventDate) throw new Error('Please choose an event date.');
  if (!args.message?.trim()) throw new Error('Please include a brief message.');

  const { error } = await supabase().from('bookings').insert({
    name: args.name.trim(),
    email: args.email.trim().toLowerCase(),
    phone: args.phone?.trim() || null,
    event_type: args.eventType?.trim() || null,
    event_date: args.eventDate?.trim() || null,
    venue: args.venue?.trim() || null,
    location: args.location?.trim() || null,
    hours: args.hours?.trim() || null,
    budget: args.budget?.trim() || null,
    message: args.message.trim(),
  });
  if (error) throw new Error(error.message || 'Could not submit your inquiry right now.');
  return { ok: true };
}

export async function submitContact(args: ContactArgs) {
  if (!isEmail(args.email)) throw new Error('Please enter a valid email.');
  if (!args.message?.trim()) throw new Error('Please include a message.');
  const { error } = await supabase().from('contact_messages').insert({
    name: args.name?.trim() || null,
    email: args.email.trim().toLowerCase(),
    message: args.message.trim(),
  });
  if (error) throw new Error(error.message || 'Could not send your message right now.');
  return { ok: true };
}

export async function logConsent(args: ConsentArgs) {
  try {
    await supabase().from('consent_log').insert({
      fingerprint: args.fingerprint?.slice(0, 64) || null,
      analytics: args.analytics,
      marketing: args.marketing,
      user_agent: (typeof navigator !== 'undefined' ? navigator.userAgent : null)?.slice(0, 500) || null,
    });
  } catch {
    // Non-critical — consent is also stored in localStorage.
  }
}
