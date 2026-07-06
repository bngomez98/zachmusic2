// Vercel Serverless Function: /api/subscribe
// Validate → upsert to database → send welcome email via Gmail SMTP

import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;
const GMAIL_USER = process.env.GMAIL_USER; // mgmt@zacharywalkermusic.com
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // Google App Password

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
  const subject = 'Welcome to the list';
  const html = `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#333">
<p style="font-size:16px">Hey ${displayName},</p>
<p>Thanks for signing up. You'll be the first to hear about upcoming shows, new recordings, and anything else worth sharing.</p>
<p>I keep things simple — no spam, no clutter. Just honest updates when there's something worth telling you about.</p>
<p>In the meantime, you can find me on <a href="https://instagram.com/zacharywalkermusic" style="color:#D4A853">Instagram</a> or check out upcoming shows at <a href="https://zacharywalkermusic.com/#shows" style="color:#D4A853">zacharywalkermusic.com</a>.</p>
<p style="margin-top:24px">— Zachary Walker</p>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
<p style="font-size:11px;color:#999">You signed up at zacharywalkermusic.com. To unsubscribe, reply to this email with "unsubscribe."</p>
</div>`;

  const boundary = '----=_Part_' + Math.random().toString(36).slice(2);
  const rawMessage = [
    `From: Zachary Walker <${GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Use Gmail SMTP via nodemailer-style approach with raw SMTP
  // Since we can't import nodemailer in serverless easily, use Google's Gmail API with service account
  // or fall back to basic SMTP via net/tls
  // Simplest: use fetch to Google's Gmail API with OAuth or App Password via SMTP relay

  // Using Google SMTP relay via raw TLS connection
  const net = await import('net');
  const tls = await import('tls');

  return new Promise<void>((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', {}, () => {
      let step = 0;
      let buffer = '';

      socket.on('data', (data) => {
        buffer += data.toString();
        if (!buffer.includes('\r\n')) return;

        const lines = buffer.split('\r\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line) continue;
          const code = parseInt(line.slice(0, 3), 10);

          if (step === 0 && code === 220) {
            socket.write(`EHLO zacharywalkermusic.com\r\n`);
            step = 1;
          } else if (step === 1 && code === 250) {
            const creds = Buffer.from(`\0${GMAIL_USER}\0${GMAIL_APP_PASSWORD}`).toString('base64');
            socket.write(`AUTH PLAIN ${creds}\r\n`);
            step = 2;
          } else if (step === 2 && code === 235) {
            socket.write(`MAIL FROM:<${GMAIL_USER}>\r\n`);
            step = 3;
          } else if (step === 3 && code === 250) {
            socket.write(`RCPT TO:<${to}>\r\n`);
            step = 4;
          } else if (step === 4 && code === 250) {
            socket.write('DATA\r\n');
            step = 5;
          } else if (step === 5 && code === 354) {
            socket.write(rawMessage + '\r\n.\r\n');
            step = 6;
          } else if (step === 6 && code === 250) {
            socket.write('QUIT\r\n');
            step = 7;
            resolve();
          } else if (step === 7) {
            socket.end();
          } else if (code >= 400) {
            socket.end();
            reject(new Error(`SMTP error at step ${step}: ${line}`));
          }
        }
      });

      socket.on('error', (err) => reject(err));
      socket.on('timeout', () => {
        socket.end();
        reject(new Error('SMTP timeout'));
      });
      socket.setTimeout(10000);
    });
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

    // Fire-and-forget welcome email
    sendWelcomeEmail(email, name).catch((e) =>
      console.error('Welcome email error:', e),
    );

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('subscribe handler error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
