// Vercel Serverless Function: /api/contact
// Validate → insert via Supabase REST API

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  EMAIL_RE, supabaseApiUrl, supabaseHeaders, extractMeta,
} from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name: rawName, email: rawEmail, message: rawMessage } = req.body || {};

  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const message = rawMessage.trim();
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  const name = typeof rawName === 'string' ? rawName.trim() || null : null;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server not configured — SUPABASE_URL or key missing' });
  }

  const { userAgent, ip } = extractMeta(req);

  try {
    const apiUrl = supabaseApiUrl();

    const insertRes = await fetch(`${apiUrl}/contact_messages`, {
      method: 'POST',
      headers: { ...supabaseHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ name, email, message, ip, user_agent: userAgent }),
    });

    if (!insertRes.ok) {
      const errBody = await insertRes.text();
      console.error('Supabase contact insert error:', insertRes.status, errBody);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(201).json({ message: 'Message received' });
  } catch (err) {
    console.error('contact handler error', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
