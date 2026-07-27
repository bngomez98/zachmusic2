import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readEmail, readText, requestMeta, requirePost, requireSupabase, supabaseInsert } from './_lib.js';
import nodemailer from 'nodemailer';
import { esc } from './_lib.js';

function createMailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

function buildWelcomeHtml(displayName: string): string {
  const ACCENT = '#D4A853';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
<tr><td align="center" style="padding:32px 0 24px">
  <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.02em;color:#FFFFFF">ZACHARY WALKER</h1>
  <div style="width:40px;height:2px;background-color:${ACCENT};margin:12px auto 0"></div>
</td></tr>
<tr><td style="background-color:#111111;border-radius:8px;padding:36px 32px;border:1px solid rgba(255,255,255,0.06)">
  <p style="margin:0 0 20px;font-size:18px;color:#FFFFFF;line-height:1.5">Hey ${displayName},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#CCCCCC;line-height:1.7">Thanks for joining the list. You'll be the first to know about upcoming shows, new recordings, and anything else worth sharing.</p>
  <p style="margin:0 0 16px;font-size:15px;color:#CCCCCC;line-height:1.7">I keep things simple — no spam, no clutter. Just honest updates when there's something worth telling you about.</p>
  <p style="margin:0 0 28px;font-size:15px;color:#CCCCCC;line-height:1.7">In the meantime, here's where you can find me:</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
  <tr>
    <td align="center" style="padding-right:12px">
      <a href="https://zacharywalkermusic.com/shows" style="display:inline-block;background-color:${ACCENT};color:#0A0A0A;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 24px;border-radius:4px">Upcoming Shows</a>
    </td>
    <td align="center">
      <a href="https://instagram.com/zacharywalkermusic" style="display:inline-block;background-color:transparent;color:${ACCENT};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 24px;border-radius:4px;border:1px solid ${ACCENT}">Instagram</a>
    </td>
  </tr>
  </table>
  <p style="margin:32px 0 0;font-size:15px;color:#CCCCCC;line-height:1.5">— Zachary Walker</p>
</td></tr>
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
  // Validate request method
  if (!requirePost(req, res)) return;

  // Validate Supabase configuration
  if (!requireSupabase(res)) return;

  // Validate and parse email
  const email = readEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Parse optional fields
  const name = readText(req.body?.name);
  const source = readText(req.body?.source) || 'newsletter-hero';
  const { ip, userAgent } = requestMeta(req);

  try {
    // Attempt to insert into subscribers table
    // - onConflict: 'email' handles duplicates gracefully
    // - ignoreDuplicates: true means we don't count it as an error
    // - returning: 'representation' tells us if the row was actually inserted
    const result = await supabaseInsert('subscribers', {
      name,
      email,
      source,
      ip,
      user_agent: userAgent,
    });

    if (!result.ok) {
      const { status, detail } = result as { ok: false; status: number; detail: string };
      console.error('[subscribe]', { status, detail, email });

      // Distinguish between client errors and server errors
      if (status === 409) {
        // Conflict: email already exists
        return res.status(200).json({ message: 'Already subscribed' });
      }

      return res.status(502).json({ error: 'Unable to subscribe. Please try again.' });
    }

    // Check if row was actually inserted (empty result = already existed)
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    // Send welcome email asynchronously (don't block response on email failure)
    const mailer = createMailer();
    if (mailer) {
      mailer
        .sendMail({
          from: `Zachary Walker <${process.env.GMAIL_USER}>`,
          to: email,
          subject: 'Welcome to the list ✦',
          html: buildWelcomeHtml(name ? esc(name) : 'there'),
        })
        .catch((err: unknown) => {
          console.error('[subscribe] email failed:', { email, error: String(err) });
        });
    } else {
      console.warn('[subscribe] email not configured (GMAIL_USER or GMAIL_APP_PASSWORD missing)');
    }

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('[subscribe] exception:', { email, error: String(err) });
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
}
