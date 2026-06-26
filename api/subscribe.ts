// Vercel Serverless Function: /api/subscribe
// Handles newsletter signup: validate, insert to Supabase, send welcome via Resend if configured.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name: rawName, email: rawEmail, source = 'footer' } = req.body || {};
  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const name = typeof rawName === 'string' ? rawName.trim() : null;
  const src = typeof source === 'string' ? source.trim() || 'footer' : 'footer';

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();

  try {
    const { error, data } = await supabase
      .from('subscribers')
      .insert({ name: name || null, email, source: src, ip, user_agent: userAgent })
      .select('id')
      .maybeSingle();

    if (error) {
      if (error.code === '23505' || (error.message || '').toLowerCase().includes('duplicate')) {
        return res.status(200).json({ message: 'Already subscribed' });
      }
      console.error('subscribe insert error', error);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    const isNew = !!data;

    // Welcome email (best effort)
    if (RESEND_KEY && isNew) {
      const display = name || 'there';
      const resend = new Resend(RESEND_KEY);

      resend.emails.send({
        from: 'Zachary Walker <no-reply@zacharywalkermusic.com>',
        to: email,
        subject: 'Welcome to the Newsletter',
        html: `<p>Hi ${display},</p><p>Thanks for subscribing to Zachary Walker updates. You'll hear about new releases, shows, and exclusives.</p><p>— Zachary</p>`,
      }).then(({ data, error }) => {
        if (error) console.error('Resend welcome error:', error);
        // else console.log('Welcome email sent:', data?.id);
      }).catch((e) => console.error('resend welcome error', e));
    }

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('subscribe handler error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
