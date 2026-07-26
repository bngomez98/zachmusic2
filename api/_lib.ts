import type { VercelRequest, VercelResponse } from '@vercel/node';

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function readEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : null;
}

export function readText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

export function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m] || m,
  );
}

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error('SUPABASE_URL is not set');
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/rest/v1') ? trimmed : `${trimmed}/rest/v1`;
}

function supabaseHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export type InsertResult =
  | { ok: true; rows: unknown[] }
  | { ok: false; status: number; detail: string };

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

  const response = await fetch(`${supabaseUrl()}/${table}${query}`, {
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

export function clientIp(req: VercelRequest): string {
  const forwarded = (req.headers['x-forwarded-for'] || '').toString();
  return (forwarded.split(',')[0] || '').trim();
}

export function requestMeta(req: VercelRequest): { ip: string; userAgent: string } {
  return {
    ip: clientIp(req),
    userAgent: ((req.headers['user-agent'] as string) || '').slice(0, 500),
  };
}

export function requirePost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}

export function requireSupabase(res: VercelResponse): boolean {
  if (!supabaseConfigured()) {
    res.status(503).json({ error: 'Server not configured — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing' });
    return false;
  }
  return true;
}
