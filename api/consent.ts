import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requestMeta, requirePost, requireSupabase, supabaseInsert } from './_lib.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;
  if (!requireSupabase(res)) return;

  const { fingerprint, analytics, marketing } = req.body || {};
  const { ip, userAgent } = requestMeta(req);

  try {
    const result = await supabaseInsert('consent_log', {
      fingerprint: (fingerprint ?? '').toString().slice(0, 64),
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      ip,
      user_agent: userAgent,
    });

    if (!result.ok) {
      const { status, detail } = result as { ok: false; status: number; detail: string };
      console.error('[consent] supabase insert failed:', status, detail);
      return res.status(502).json({ error: 'Failed to record consent' });
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[consent] error:', err);
    return res.status(500).json({ error: 'Failed to record consent' });
  }
}
