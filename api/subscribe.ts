// Vercel Serverless Function: /api/subscribe
// Validate → insert via Supabase REST API → send welcome email via Gmail SMTP

import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function esc(s: string) {
  return s.replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m),
  );
}

async function sendWelcomeEmail(to: string, name: string | null) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;

  const displayName = name ? esc(name) : 'there';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  await transporter.sendMail({
    from: `Zachary Walker <${GMAIL_USER}>`,
    to,
    subject: 'Welcome to the list',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#333">
<p style="font-size:16px">Hey ${displayName},</p>
<p>Thanks for signing up. You'll be the first to hear about upcoming shows, new recordings, and anything else worth sharing.</p>
<p>I keep things simple — no spam, no clutter. Just honest updates when there's something worth telling you about.</p>
<p>In the meantime, you can find me on <a href="https://instagram.com/zacharywalkermusic" style="color:#D4A853">Instagram</a> or check out upcoming shows at <a href="https://zacharywalkermusic.com/#shows" style="color:#D4A853">zacharywalkermusic.com</a>.</p>
<p style="margin-top:24px">— Zachary Walker</p>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
<p style="font-size:11px;color:#999">You signed up at zacharywalkermusic.com. To unsubscribe, reply to this email with "unsubscribe."</p>
</div>`,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name: rawName, email: rawEmail, source = 'newsletter-hero' } = req.body || {};
  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const name = typeof rawName === 'string' ? rawName.trim() || null : null;
  const src = typeof source === 'string' ? source.trim() || 'newsletter-hero' : 'newsletter-hero';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server not configured — SUPABASE_URL or key missing' });
  }

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
    .toString()
    .split(',')[0]
    .trim();

  try {
    const apiUrl = SUPABASE_URL.endsWith('/rest/v1')
      ? SUPABASE_URL
      : `${SUPABASE_URL}/rest/v1`;

    const insertRes = await fetch(
      `${apiUrl}/subscribers?on_conflict=email`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation,resolution=ignore-duplicates',
        },
        body: JSON.stringify({ name, email, source: src, ip, user_agent: userAgent }),
      },
    );

    if (!insertRes.ok) {
      const errBody = await insertRes.text();
      console.error('Supabase insert error:', insertRes.status, errBody);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    const rows = await insertRes.json();
    const isNew = Array.isArray(rows) && rows.length > 0;

    if (!isNew) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    try {
      await sendWelcomeEmail(email, name);
    } catch (e) {
      console.error('Welcome email error:', e);
    }

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('subscribe handler error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
