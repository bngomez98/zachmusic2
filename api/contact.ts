import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readEmail, readText, requestMeta, requirePost, requireSupabase, supabaseInsert } from './_lib.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;
  if (!requireSupabase(res)) return;

  const email = readEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: 'Valid email is required' });

  const message = readText(req.body?.message);
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (message.length > 5000) return res.status(400).json({ error: 'Message too long' });

  const { ip, userAgent } = requestMeta(req);

  try {
    const result = await supabaseInsert('contact_messages', {
      name: readText(req.body?.name),
      email,
      message,
      ip,
      user_agent: userAgent,
    });

    if (!result.ok) {
      const { status, detail } = result as { ok: false; status: number; detail: string };
      console.error('[contact] supabase insert failed:', status, detail);
      return res.status(502).json({ error: 'Failed to send message' });
    }

    return res.status(201).json({ message: 'Message received' });
  } catch (err) {
    console.error('[contact] error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
