// Outbound email over Gmail SMTP (nodemailer). No third-party email API.

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env, esc } from './lib.js';

const SITE_URL = 'https://zacharywalkermusic.com';
const ACCENT = '#D4A853';

/** Returns null when SMTP credentials are absent, so callers can skip sending. */
export function createMailer(): Transporter | null {
  const user = env.gmailUser();
  const pass = env.gmailPassword();
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export function buildWelcomeHtml(displayName: string): string {
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
      <a href="${SITE_URL}/#shows" style="display:inline-block;background-color:${ACCENT};color:#0A0A0A;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 24px;border-radius:4px">Upcoming Shows</a>
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

export async function sendWelcomeEmail(to: string, name: string | null): Promise<void> {
  const mailer = createMailer();
  if (!mailer) {
    console.warn('[mail] GMAIL_USER/GMAIL_APP_PASSWORD unset — skipping welcome email');
    return;
  }

  await mailer.sendMail({
    from: `Zachary Walker <${env.gmailUser()}>`,
    to,
    subject: 'Welcome to the list ✦',
    html: buildWelcomeHtml(name ? esc(name) : 'there'),
  });
}

export interface BookingDetails {
  name: string;
  email: string;
  phone?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  venue?: string | null;
  location?: string | null;
  hours?: string | null;
  budget?: string | null;
  message: string;
}

/**
 * Notifies management and confirms to the customer. Failures are logged rather
 * than thrown: the booking is already persisted by the time this runs, so a
 * bad SMTP credential must not turn a saved booking into a 500.
 */
export async function sendBookingEmails(booking: BookingDetails): Promise<void> {
  const mailer = createMailer();
  if (!mailer) {
    console.warn('[mail] GMAIL_USER/GMAIL_APP_PASSWORD unset — skipping booking emails');
    return;
  }

  const from = env.gmailUser();
  const name = esc(booking.name);
  const dash = '—';

  const rows: [string, string][] = [
    ['Name', name],
    ['Email', esc(booking.email)],
    ['Phone', booking.phone ? esc(booking.phone) : dash],
    ['Event Date', booking.eventDate ? esc(booking.eventDate) : dash],
    ['Event Type', booking.eventType ? esc(booking.eventType) : dash],
    ['Venue', booking.venue ? esc(booking.venue) : dash],
    ['Location', booking.location ? esc(booking.location) : dash],
    ['Hours', booking.hours ? esc(booking.hours) : dash],
    ['Budget', booking.budget ? esc(booking.budget) : dash],
    ['Message', esc(booking.message)],
  ];

  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600;color:${ACCENT}">${k}</td><td style="padding:4px 0;color:#CCCCCC">${v}</td></tr>`,
    )
    .join('');

  try {
    await mailer.sendMail({
      from: `Zachary Walker Bookings <${from}>`,
      to: from,
      replyTo: booking.email,
      subject: `New Booking Inquiry — ${booking.name}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#111;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.06)">
<h2 style="margin:0 0 20px;color:#FFFFFF;font-size:20px">New Booking Inquiry</h2>
<table style="border-collapse:collapse;width:100%">${table}</table>
<p style="margin-top:16px;color:#666;font-size:13px">Reply directly to this email to reach ${name}.</p>
</div>`,
    });
  } catch (err) {
    console.error('[mail] booking notification failed:', err);
  }

  // filter(Boolean) does not narrow away null/undefined, so use a type guard.
  const eventLine = [booking.eventDate, booking.eventType]
    .filter((value): value is string => Boolean(value))
    .map(esc)
    .join(' — ');

  try {
    await mailer.sendMail({
      from: `Zachary Walker <${from}>`,
      to: booking.email,
      subject: 'Booking Inquiry Received',
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#111;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.06)">
<p style="color:#FFFFFF;font-size:16px;margin:0 0 16px">Hi ${name},</p>
<p style="color:#CCCCCC;font-size:15px;line-height:1.7;margin:0 0 16px">Thanks for your booking inquiry. I'll personally review the details and reply within 48 hours.</p>
${eventLine ? `<p style="color:#CCCCCC;font-size:15px;line-height:1.7;margin:0 0 16px">Event: ${eventLine}</p>` : ''}
<p style="color:#CCCCCC;font-size:15px;margin:24px 0 0">— Zachary Walker</p>
</div>`,
    });
  } catch (err) {
    console.error('[mail] booking confirmation failed:', err);
  }
}
