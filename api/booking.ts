import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readEmail, readText, requestMeta, requirePost, requireSupabase, supabaseInsert, esc } from './_lib.js';
import nodemailer from 'nodemailer';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;
  if (!requireSupabase(res)) return;

  const body = req.body || {};

  for (const field of ['name', 'eventDate', 'message'] as const) {
    if (!readText(body[field])) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  const email = readEmail(body.email);
  if (!email) return res.status(400).json({ error: 'Valid email is required' });

  const message = readText(body.message)!;
  if (message.length > 5000) return res.status(400).json({ error: 'Message too long' });

  const booking = {
    name: readText(body.name)!,
    email,
    phone: readText(body.phone),
    eventType: readText(body.eventType),
    eventDate: readText(body.eventDate),
    venue: readText(body.venue),
    location: readText(body.location),
    hours: readText(body.hours),
    budget: readText(body.budget),
    message,
  };

  const { ip, userAgent } = requestMeta(req);

  try {
    const result = await supabaseInsert('bookings', {
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      event_type: booking.eventType,
      event_date: booking.eventDate,
      venue: booking.venue,
      location: booking.location,
      hours: booking.hours,
      budget: booking.budget,
      message: booking.message,
      ip,
      user_agent: userAgent,
      status: 'new',
    });

    if (!result.ok) {
      const { status, detail } = result as { ok: false; status: number; detail: string };
      console.error('[booking] supabase insert failed:', status, detail);
      return res.status(502).json({ error: 'Failed to submit inquiry' });
    }

    const mailer = createMailer();
    if (mailer) {
      const from = process.env.GMAIL_USER!;
      const name = esc(booking.name);
      const ACCENT = '#D4A853';
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
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600;color:${ACCENT}">${k}</td><td style="padding:4px 0;color:#CCCCCC">${v}</td></tr>`)
        .join('');

      mailer
        .sendMail({
          from: `Zachary Walker Bookings <${from}>`,
          to: from,
          replyTo: booking.email,
          subject: `New Booking Inquiry — ${booking.name}`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#111;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.06)">
<h2 style="margin:0 0 20px;color:#FFFFFF;font-size:20px">New Booking Inquiry</h2>
<table style="border-collapse:collapse;width:100%">${table}</table>
<p style="margin-top:16px;color:#666;font-size:13px">Reply directly to this email to reach ${name}.</p>
</div>`,
        })
        .catch((err: unknown) => console.error('[booking] notification failed:', err));

      const eventLine = [booking.eventDate, booking.eventType]
        .filter((v): v is string => Boolean(v))
        .map(esc)
        .join(' — ');

      mailer
        .sendMail({
          from: `Zachary Walker <${from}>`,
          to: booking.email,
          subject: 'Booking Inquiry Received',
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#111;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.06)">
<p style="color:#FFFFFF;font-size:16px;margin:0 0 16px">Hi ${name},</p>
<p style="color:#CCCCCC;font-size:15px;line-height:1.7;margin:0 0 16px">Thanks for your booking inquiry. I'll personally review the details and reply within 48 hours.</p>
${eventLine ? `<p style="color:#CCCCCC;font-size:15px;line-height:1.7;margin:0 0 16px">Event: ${eventLine}</p>` : ''}
<p style="color:#CCCCCC;font-size:15px;margin:24px 0 0">— Zachary Walker</p>
</div>`,
        })
        .catch((err: unknown) => console.error('[booking] confirmation failed:', err));
    }

    return res.status(201).json({ message: 'Booking inquiry received' });
  } catch (err) {
    console.error('[booking] error:', err);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
}
