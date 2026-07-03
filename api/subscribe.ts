// Vercel Serverless Function: /api/subscribe
// Validate → upsert to database → send welcome email via Mailgun or simple POST

import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'zacharywalkermusic.com';

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

const WELCOME_HTML = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif}</style>
  </head>
  <body dir="ltr" lang="en" style="background-color:#1a1a1a;color:#ffffff;padding:20px">
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td dir="ltr" lang="en" style="max-width:600px;margin:0 auto">
            <div style="background-color:#2a2a2a;border:1px solid #3a3a3a;border-radius:8px;padding:40px;text-align:center">
              <h1 style="margin:0 0 20px 0;font-size:28px;color:#d4a853">Welcome, Friend!</h1>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6">
                Thanks for signing up to Zachary Walker's newsletter! 🎵
              </p>
              <p style="margin:0 0 30px 0;font-size:14px;color:#cccccc;line-height:1.6">
                Stay tuned for exclusive updates on new releases, live shows, and behind-the-scenes content.
              </p>
              <p style="margin:0;font-size:12px;color:#888888">
                See you soon,<br/>Zachary Walker
              </p>
            </div>
            <p style="margin:20px 0 0 0;font-size:11px;color:#666666;text-align:center">
              © 2026 Zachary Walker. All rights reserved.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

async function sendWelcomeEmail(email: string, name?: string | null): Promise<boolean> {
  try {
    if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
      // Try Mailgun first
      const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');
      const formData = new URLSearchParams();
      formData.append('from', 'Zachary Walker <noreply@zacharywalkermusic.com>');
      formData.append('to', email);
      formData.append('subject', 'Welcome to the Newsletter');
      formData.append('html', WELCOME_HTML);

      const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (res.ok) {
        console.log(`Welcome email sent to ${email} via Mailgun`);
        return true;
      }
      console.error(`Mailgun error: ${res.status} ${await res.text()}`);
    }

    // Fallback: log that we tried but couldn't send
    console.warn(
      `Welcome email not sent to ${email} — Mailgun not configured. Email: ${email}, Name: ${name}`,
    );
    return false;
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return false;
  }
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
    const result = await getPool().query(
      `INSERT INTO subscribers (name, email, source, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [name, email, src, ip, userAgent],
    );

    const isNew = result.rowCount === 1;

    // Send welcome email asynchronously (don't block response)
    if (isNew) {
      sendWelcomeEmail(email, name).catch((err) =>
        console.error('Failed to send welcome email:', err),
      );
    }

    if (!isNew) {
      return res.status(200).json({ message: 'Already subscribed' });
    }
    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('subscribe handler error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
