// Vercel Serverless Function: /api/welcome-email
// Standalone endpoint to send (or re-send) the welcome email via Gmail SMTP.
// Accepts POST { email, name? }

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

function buildWelcomeHtml(displayName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

<!-- Header -->
<tr><td align="center" style="padding:32px 0 24px">
  <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.02em;color:#FFFFFF">ZACHARY WALKER</h1>
  <div style="width:40px;height:2px;background-color:#D4A853;margin:12px auto 0"></div>
</td></tr>

<!-- Body card -->
<tr><td style="background-color:#111111;border-radius:8px;padding:36px 32px;border:1px solid rgba(255,255,255,0.06)">
  <p style="margin:0 0 20px;font-size:18px;color:#FFFFFF;line-height:1.5">Hey ${displayName},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#CCCCCC;line-height:1.7">Thanks for joining the list. You'll be the first to know about upcoming shows, new recordings, and anything else worth sharing.</p>
  <p style="margin:0 0 16px;font-size:15px;color:#CCCCCC;line-height:1.7">I keep things simple — no spam, no clutter. Just honest updates when there's something worth telling you about.</p>
  <p style="margin:0 0 28px;font-size:15px;color:#CCCCCC;line-height:1.7">In the meantime, here's where you can find me:</p>

  <!-- CTA buttons -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
  <tr>
    <td align="center" style="padding-right:12px">
      <a href="https://zacharywalkermusic.com/#shows" style="display:inline-block;background-color:#D4A853;color:#0A0A0A;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 24px;border-radius:4px">Upcoming Shows</a>
    </td>
    <td align="center">
      <a href="https://instagram.com/zacharywalkermusic" style="display:inline-block;background-color:transparent;color:#D4A853;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 24px;border-radius:4px;border:1px solid #D4A853">Instagram</a>
    </td>
  </tr>
  </table>

  <p style="margin:32px 0 0;font-size:15px;color:#CCCCCC;line-height:1.5">— Zachary Walker</p>
</td></tr>

<!-- Footer -->
<tr><td align="center" style="padding:24px 0">
  <p style="margin:0 0 6px;font-size:11px;color:#666666">You signed up at zacharywalkermusic.com</p>
  <p style="margin:0;font-size:11px;color:#666666">To unsubscribe, reply to this email with "unsubscribe."</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: 'Email not configured' });
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

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const apiUrl = SUPABASE_URL.endsWith('/rest/v1')
      ? SUPABASE_URL
      : `${SUPABASE_URL}/rest/v1`;

    const check = await fetch(
      `${apiUrl}/subscribers?email=eq.${encodeURIComponent(email)}&select=email`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );
    if (check.ok) {
      const rows = await check.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ error: 'Email not found in subscriber list' });
      }
    }
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
