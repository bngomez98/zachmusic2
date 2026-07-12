// Vercel Serverless Function: /api/welcome-email
// Standalone endpoint to send (or re-send) the welcome email via Gmail SMTP.
// Requires ADMIN_SECRET token via Authorization header.
// Accepts POST { email, name? }

import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  GMAIL_USER, GMAIL_APP_PASSWORD,
  EMAIL_RE, esc, supabaseApiUrl, supabaseHeaders, buildWelcomeHtml,
} from './_utils';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ADMIN_SECRET) {
    return res.status(500).json({ error: 'ADMIN_SECRET not configured' });
  }

  const authHeader = (req.headers['authorization'] || '').toString();
  if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: 'Email not configured' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server not configured — Supabase credentials missing' });
  }

  const { email: rawEmail, name: rawName } = req.body || {};
  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const name = typeof rawName === 'string' ? rawName.trim() || null : null;
  const displayName = name ? esc(name) : 'there';

  const apiUrl = supabaseApiUrl();
  const check = await fetch(
    `${apiUrl}/subscribers?email=eq.${encodeURIComponent(email)}&select=email`,
    { headers: supabaseHeaders() },
  );

  if (!check.ok) {
    const errBody = await check.text();
    console.error('Supabase check error:', check.status, errBody);
    return res.status(500).json({ error: 'Failed to verify subscriber status' });
  }

  const rows = await check.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(404).json({ error: 'Email not found in subscriber list' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `Zachary Walker <${GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to the list ✦',
      html: buildWelcomeHtml(displayName),
    });

    return res.status(200).json({ message: 'Welcome email sent' });
  } catch (err) {
    console.error('welcome-email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
