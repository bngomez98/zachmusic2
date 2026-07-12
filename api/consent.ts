// Vercel Serverless Function: /api/consent
// Record cookie consent choices via Supabase REST API

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  supabaseApiUrl, supabaseHeaders, extractMeta,
} from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fingerprint, analytics, marketing } = req.body || {};

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server not configured — SUPABASE_URL or key missing' });
  }

  const { userAgent, ip } = extractMeta(req);

  try {
    const apiUrl = supabaseApiUrl();

    const insertRes = await fetch(`${apiUrl}/consent_log`, {
      method: 'POST',
      headers: { ...supabaseHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        fingerprint: (fingerprint || '').toString().slice(0, 64),
        analytics: analytics ? 1 : 0,
        marketing: marketing ? 1 : 0,
        ip,
        user_agent: userAgent,
      }),
    });

    if (!insertRes.ok) {
      const errBody = await insertRes.text();
      console.error('Supabase consent insert error:', insertRes.status, errBody);
      return res.status(500).json({ error: 'Failed to record consent' });
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('consent handler error', err);
    return res.status(500).json({ error: 'Failed to record consent' });
  }
}
