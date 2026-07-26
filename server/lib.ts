// Shared server helpers: config, Supabase REST access, request metadata.
//
// Every environment value is read lazily inside a function rather than into a
// module-scope const. ESM hoists imports, so module-scope reads would evaluate
// before server.ts calls dotenv.config() and would silently capture undefined.

import type { Request } from 'express';

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Public anon key for this project — safe to ship. Used only when the host
// has not set SUPABASE_SERVICE_ROLE_KEY. Inserts work via RLS insert policies;
// selects still require the service role.
const PUBLIC_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzeGNxb2hxdnV2YXBibWZjdm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTU4MDQsImV4cCI6MjA4OTYzMTgwNH0.Y6UbQhccBdoRINrZ3WeXdR7ek9v6OtS_7Zu-OljXZNc';

const PUBLIC_SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://fsxcqohqvuvapbmfcvnu.supabase.co';

export const env = {
  supabaseUrl: () => process.env.SUPABASE_URL || PUBLIC_SUPABASE_URL,
  // Prefer real service role; fall back to anon so inserts still work without
  // dashboard secrets. Selects / admin paths need service role.
  supabaseKey: () => process.env.SUPABASE_SERVICE_ROLE_KEY || PUBLIC_ANON_KEY,
  hasServiceRole: () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  gmailUser: () => process.env.GMAIL_USER,
  gmailPassword: () => process.env.GMAIL_APP_PASSWORD,
  adminSecret: () => process.env.ADMIN_SECRET,
};

export function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#039;' })[m] || m,
  );
}

export function supabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl() && env.supabaseKey());
}

/** Normalises SUPABASE_URL so it works whether or not /rest/v1 is included. */
export function supabaseApiUrl(): string {
  const url = env.supabaseUrl();
  if (!url) throw new Error('SUPABASE_URL is not set');
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/rest/v1') ? trimmed : `${trimmed}/rest/v1`;
}

export function supabaseHeaders(): Record<string, string> {
  const key = env.supabaseKey();
  if (!key) throw new Error('Supabase key is not set');
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export function clientIp(req: Request): string {
  const forwarded = (req.headers['x-forwarded-for'] || '').toString();
  return (forwarded.split(',')[0] || req.socket.remoteAddress || '').trim();
}

export function requestMeta(req: Request): { ip: string; userAgent: string } {
  return {
    ip: clientIp(req),
    userAgent: (req.get('user-agent') || '').slice(0, 500),
  };
}

export type InsertResult =
  | { ok: true; rows: unknown[]; created: boolean }
  | { ok: false; status: number; detail: string };

/**
 * Inserts a row through Supabase's REST API.
 *
 * Duplicate detection does NOT rely on returning representation (anon keys
 * cannot SELECT under deny-select RLS). Instead:
 * - 2xx + Prefer ignore-duplicates → created unknown; treat as success
 * - unique_violation / 409 → already exists
 */
export async function supabaseInsert(
  table: string,
  row: Record<string, unknown>,
  opts: {
    onConflict?: string;
    returning?: 'minimal' | 'representation';
    ignoreDuplicates?: boolean;
  } = {},
): Promise<InsertResult> {
  const { onConflict, returning = 'minimal', ignoreDuplicates = false } = opts;

  const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  const prefer = [
    `return=${returning}`,
    ...(ignoreDuplicates ? ['resolution=ignore-duplicates'] : []),
  ].join(',');

  const response = await fetch(`${supabaseApiUrl()}/${table}${query}`, {
    method: 'POST',
    headers: { ...supabaseHeaders(), Prefer: prefer },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detail = await response.text();
    // Unique violation → already exists (works with anon key).
    if (
      response.status === 409 ||
      /duplicate key|unique_violation|23505/i.test(detail)
    ) {
      return { ok: true, rows: [], created: false };
    }
    return { ok: false, status: response.status, detail };
  }

  if (returning === 'minimal') {
    // With ignore-duplicates, PostgREST may return 201 for both new and
    // existing rows. Prefer treating 2xx as created when we cannot read back.
    // Callers that need exact new-vs-existing should not use ignoreDuplicates
    // with anon keys — use the plain insert path and catch 409 instead.
    return { ok: true, rows: [], created: true };
  }

  const parsed = await response.json().catch(() => []);
  const rows = Array.isArray(parsed) ? parsed : [];
  return { ok: true, rows, created: rows.length > 0 };
}

/**
 * Subscribe-specific insert that works with both service role and anon keys.
 * Returns { created: true } for a new row, { created: false } if the email
 * was already on the list.
 */
export async function subscribeInsert(row: {
  name: string | null;
  email: string;
  source: string;
  ip: string;
  user_agent: string;
}): Promise<InsertResult> {
  // Plain insert (no ignore-duplicates). Unique violation → already subscribed.
  // This is the reliable path under anon + deny-select RLS.
  const result = await supabaseInsert('subscribers', row, {
    returning: 'minimal',
  });

  if (!result.ok) return result;

  // If we somehow got representation with rows, trust that.
  if (result.rows.length > 0) return { ...result, created: true };

  return result;
}

/** True when `email` already exists in subscribers. Needs service role (SELECT). */
export async function subscriberExists(email: string): Promise<boolean> {
  if (!env.hasServiceRole()) {
    // Anon cannot SELECT — assume unknown / not found for admin paths.
    return false;
  }

  const response = await fetch(
    `${supabaseApiUrl()}/subscribers?email=eq.${encodeURIComponent(email)}&select=email`,
    { headers: supabaseHeaders() },
  );

  if (!response.ok) {
    throw new Error(`Supabase lookup failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}
