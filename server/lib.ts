// Shared server helpers: config, Supabase REST access, request metadata.
//
// Every environment value is read lazily inside a function rather than into a
// module-scope const. ESM hoists imports, so module-scope reads would evaluate
// before server.ts calls dotenv.config() and would silently capture undefined.

import type { Request } from 'express';

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const env = {
  supabaseUrl: () => process.env.SUPABASE_URL,
  supabaseKey: () => process.env.SUPABASE_SERVICE_ROLE_KEY,
  gmailUser: () => process.env.GMAIL_USER,
  gmailPassword: () => process.env.GMAIL_APP_PASSWORD,
  adminSecret: () => process.env.ADMIN_SECRET,
};

export function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m] || m,
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
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
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
  | { ok: true; rows: unknown[] }
  | { ok: false; status: number; detail: string };

/**
 * Inserts a row through Supabase's REST API.
 *
 * `onConflict` + `ignoreDuplicates` map to `ON CONFLICT (col) DO NOTHING`, which
 * requires a unique index on that bare column. With `returning: 'representation'`
 * an empty rows array therefore means the row already existed.
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
    return { ok: false, status: response.status, detail: await response.text() };
  }

  if (returning === 'minimal') return { ok: true, rows: [] };

  const parsed = await response.json().catch(() => []);
  return { ok: true, rows: Array.isArray(parsed) ? parsed : [] };
}

/** True when `email` already exists in subscribers. Throws if the lookup fails. */
export async function subscriberExists(email: string): Promise<boolean> {
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
