// Vercel Serverless Function: /api/subscribe
// Validate → insert via Supabase REST API → send welcome email via Gmail SMTP

import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  GMAIL_USER, GMAIL_APP_PASSWORD,
  EMAIL_RE, esc, supabaseApiUrl, supabaseHeaders, extractMeta, buildWelcomeHtml,
} from './_utils';

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
    subject: 'Welcome to the list ✦',
    html: buildWelcomeHtml(displayName),
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

  const { userAgent, ip } = extractMeta(req);

  try {
    const apiUrl = supabaseApiUrl();

    const insertRes = await fetch(
      `${apiUrl}/subscribers?on_conflict=email`,
      {
        method: 'POST',
        headers: {
          ...supabaseHeaders(),
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
