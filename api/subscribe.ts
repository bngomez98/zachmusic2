// Vercel Serverless Function: /api/subscribe
// Validate → upsert to database → send welcome email via Gmail SMTP

import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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
          subscribed BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now()
        )`,
      )
      .then(() =>
        getPool().query(
          `ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS subscribed BOOLEAN DEFAULT true`,
        ),
      )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

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
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
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
