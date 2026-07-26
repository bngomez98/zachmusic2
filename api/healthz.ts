import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseConfigured } from './_lib.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const checks = {
    supabase: supabaseConfigured(),
    email: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
  };
  res.status(checks.supabase ? 200 : 503).json({
    ok: checks.supabase,
    checks,
    time: new Date().toISOString(),
  });
}
