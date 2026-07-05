// Vercel Serverless Function: /api/subscribe
// Validate → upsert to database → send welcome email via SMTP

import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'Zachary Walker Music <no-reply@zacharywalkermusic.com>';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Module-level pool: reused across warm invocations
let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
    pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS subscribers (
          id BIGSERIAL PRIMARY KEY,
          name TEXT,
          email TEXT NOT NULL UNIQUE,
          source TEXT,
          ip TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        )`,
      )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;">
<tr><td align="center" style="padding:30px 10px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:4px;overflow:hidden;">

<!-- Main Content -->
<tr><td style="padding:30px 30px 10px;color:#333333;font-size:15px;line-height:1.6;">
  Thank you for signing up for the newsletter! This project is currently under development. Stay tuned, release is July 1st, 2026!
</td></tr>

<!-- Logo Image -->
<tr><td align="center" style="padding:10px 30px 20px;">
  <img src="https://zacharywalkermusic.com/logo.png" alt="Zachary Walker — Acoustic Originals &amp; Covers — Honest. Authentic. Music." width="400" style="max-width:100%;height:auto;display:block;border-radius:4px;" />
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 30px;"><hr style="border:none;border-top:1px solid #cccccc;margin:0;" /></td></tr>

<!-- Footer -->
<tr><td style="padding:20px 30px;color:#666666;font-size:13px;line-height:1.5;">
  You are receiving this email because you opted in via our site.<br /><br />
  More to come, stay tuned!
</td></tr>

<!-- Social Icons -->
<tr><td align="center" style="padding:0 30px 20px;">
  <a href="https://www.instagram.com/za.chary5068/reels/" style="text-decoration:none;margin:0 6px;" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/instagram-filled-dark-40.png" alt="Instagram" width="32" height="32" style="display:inline-block;" />
  </a>
  <a href="https://www.facebook.com/profile.php?id=61565838372447" style="text-decoration:none;margin:0 6px;" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/facebook-filled-dark-40.png" alt="Facebook" width="32" height="32" style="display:inline-block;" />
  </a>
  <a href="https://www.youtube.com/@fullmetalzcw" style="text-decoration:none;margin:0 6px;" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/youtube-filled-dark-40.png" alt="YouTube" width="32" height="32" style="display:inline-block;" />
  </a>
  <a href="https://www.tiktok.com/@fullmetalzcw" style="text-decoration:none;margin:0 6px;" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/tiktok-filled-dark-40.png" alt="TikTok" width="32" height="32" style="display:inline-block;" />
  </a>
</td></tr>

<!-- Unsubscribe & Address -->
<tr><td style="padding:10px 30px 30px;color:#999999;font-size:11px;line-height:1.5;">
  Want to change how you receive these emails?<br />
  You can <a href="mailto:mgmt@zacharywalkermusic.com?subject=Unsubscribe" style="color:#999999;">unsubscribe from this list</a>.<br /><br />
  Zachary Walker Music<br />
  Topeka, KS 66604<br />
  United States of America
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  const name = typeof rawName === 'string' ? rawName.trim() || null : null;
  const src = typeof source === 'string' ? source.trim() || 'footer' : 'footer';

  if (!DATABASE_URL) {
    return res.status(500).json({ error: 'Server not configured — DATABASE_URL missing' });
  }

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
    .toString()
    .split(',')[0]
    .trim();

  try {
    await ensureSchema();
    const result = await getPool().query(
      `INSERT INTO subscribers (name, email, source, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [name, email, src, ip, userAgent],
    );

    const isNew = result.rowCount === 1;

    if (!isNew) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    // Welcome email — fire-and-forget
    const transporter = getTransporter();
    if (transporter) {
      transporter
        .sendMail({
          from: SMTP_FROM,
          to: email,
          subject: 'Welcome to Zachary Walker Music!',
          html: WELCOME_HTML,
        })
        .catch((e) => console.error('welcome email error', e));
    }

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('subscribe handler error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
