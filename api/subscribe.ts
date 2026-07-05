// Vercel Serverless Function: /api/subscribe
// Validate → upsert to database → send welcome email via Resend

import { Pool } from 'pg';
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_KEY = process.env.RESEND_API_KEY;
const SITE = 'https://zacharywalkermusic.com';

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

    // Welcome email — best effort, awaited so Vercel doesn't freeze before it sends
    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);
      try {
        const { error } = await resend.emails.send({
          from: 'Zachary Walker <no-reply@zacharywalkermusic.com>',
          to: email,
          subject: 'Welcome to the Newsletter!',
          html: WELCOME_HTML,
        });
        if (error) console.error('Resend welcome error:', error);
      } catch (e) {
        console.error('resend welcome email error', e);
      }
    }

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('subscribe handler error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}

const WELCOME_HTML = `
<div style="max-width:600px;margin:0 auto;background:#1a1a1a;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0">
  <div style="padding:24px 24px 16px">
    <p style="margin:0 0 4px;font-size:15px;line-height:1.5">
      Thank you for signing up for the newsletter! This project is currently under development. Stay tuned, release is July 1st, 2026!
    </p>
  </div>
  <div style="text-align:center;padding:0 24px">
    <img src="${SITE}/promo.jpg" alt="Zachary Walker — Acoustic Originals &amp; Covers" style="width:100%;max-width:520px;border-radius:4px" />
  </div>
  <div style="padding:24px;font-size:13px;line-height:1.6;color:#999">
    <p style="margin:0 0 8px">You are receiving this email because you opted in via our site.</p>
    <p style="margin:0 0 16px">More to come, stay tuned!</p>
    <div style="text-align:center;margin:16px 0">
      <a href="https://www.instagram.com/za.chary5068/reels/" style="text-decoration:none;margin:0 6px">
        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" width="32" height="32" />
      </a>
      <a href="https://www.facebook.com/profile.php?id=61565838372447" style="text-decoration:none;margin:0 6px">
        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/facebook.png" alt="Facebook" width="32" height="32" />
      </a>
      <a href="https://www.youtube.com/@fullmetalzcw" style="text-decoration:none;margin:0 6px">
        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/youtube.png" alt="YouTube" width="32" height="32" />
      </a>
      <a href="https://www.tiktok.com/@fullmetalzcw" style="text-decoration:none;margin:0 6px">
        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/tiktok.png" alt="TikTok" width="32" height="32" />
      </a>
    </div>
    <p style="margin:16px 0 4px;font-size:12px;color:#777">Want to change how you receive these emails?</p>
    <p style="margin:0 0 16px;font-size:12px;color:#777">You can <a href="${SITE}" style="color:#c9a84c">unsubscribe from this list</a>.</p>
    <p style="margin:0;font-size:12px;color:#777">Zachary Walker Music<br>Topeka, KS 66604<br>United States of America</p>
  </div>
</div>
`;
