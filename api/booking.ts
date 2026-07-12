// Vercel Serverless Function: /api/booking
// Validate → insert via Supabase REST API → send notifications via Gmail SMTP

import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  GMAIL_USER, GMAIL_APP_PASSWORD,
  EMAIL_RE, esc, supabaseApiUrl, supabaseHeaders, extractMeta,
} from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const b = req.body || {};
  const required = ['name', 'email', 'eventDate', 'message'];
  for (const f of required) {
    if (!b[f] || typeof b[f] !== 'string' || !b[f].trim()) {
      return res.status(400).json({ error: `Missing required field: ${f}` });
    }
  }

  const email = b.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if ((b.message || '').length > 5000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server not configured — SUPABASE_URL or key missing' });
  }

  const { userAgent, ip } = extractMeta(req);

  try {
    const apiUrl = supabaseApiUrl();

    const insertRes = await fetch(`${apiUrl}/bookings`, {
      method: 'POST',
      headers: { ...supabaseHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        name: b.name.trim(),
        email,
        phone: b.phone ? String(b.phone).trim() : null,
        event_type: b.eventType ? String(b.eventType).trim() : null,
        event_date: b.eventDate ? String(b.eventDate).trim() : null,
        venue: b.venue ? String(b.venue).trim() : null,
        location: b.location ? String(b.location).trim() : null,
        hours: b.hours ? String(b.hours).trim() : null,
        budget: b.budget ? String(b.budget).trim() : null,
        message: b.message.trim(),
        ip,
        user_agent: userAgent,
        status: 'new',
      }),
    });

    if (!insertRes.ok) {
      const errBody = await insertRes.text();
      console.error('Supabase booking insert error:', insertRes.status, errBody);
      return res.status(500).json({ error: 'Failed to submit inquiry' });
    }

    if (GMAIL_USER && GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      });

      const name = esc(b.name.trim());
      const details = [
        ['Name', name],
        ['Email', esc(email)],
        ['Phone', b.phone ? esc(String(b.phone).trim()) : '—'],
        ['Event Date', b.eventDate ? esc(String(b.eventDate).trim()) : '—'],
        ['Event Type', b.eventType ? esc(String(b.eventType).trim()) : '—'],
        ['Venue', b.venue ? esc(String(b.venue).trim()) : '—'],
        ['Location', b.location ? esc(String(b.location).trim()) : '—'],
        ['Hours', b.hours ? esc(String(b.hours).trim()) : '—'],
        ['Budget', b.budget ? esc(String(b.budget).trim()) : '—'],
        ['Message', esc(b.message.trim())],
      ]
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600;color:#D4A853">${k}</td><td style="padding:4px 0;color:#CCCCCC">${v}</td></tr>`)
        .join('');

      const eventDate = b.eventDate ? esc(String(b.eventDate).trim()) : '';
      const eventType = b.eventType ? esc(String(b.eventType).trim()) : '';

      try {
        await transporter.sendMail({
          from: `Zachary Walker Bookings <${GMAIL_USER}>`,
          to: GMAIL_USER,
          replyTo: email,
          subject: `New Booking Inquiry — ${b.name.trim()}`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#111;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.06)">
<h2 style="margin:0 0 20px;color:#FFFFFF;font-size:20px">New Booking Inquiry</h2>
<table style="border-collapse:collapse;font-family:sans-serif;width:100%">${details}</table>
<p style="margin-top:16px;color:#666;font-size:13px">Reply directly to this email to reach ${name} at ${esc(email)}.</p>
</div>`,
        });
      } catch (e) {
        console.error('Booking mgmt email error:', e);
      }

      try {
        await transporter.sendMail({
          from: `Zachary Walker <${GMAIL_USER}>`,
          to: email,
          subject: 'Booking Inquiry Received',
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#111;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.06)">
<p style="color:#FFFFFF;font-size:16px;margin:0 0 16px">Hi ${name},</p>
<p style="color:#CCCCCC;font-size:15px;line-height:1.7;margin:0 0 16px">Thanks for your booking inquiry. I'll personally review the details and reply within 48 hours.</p>
<p style="color:#CCCCCC;font-size:15px;line-height:1.7;margin:0 0 16px">Event: ${eventDate}${eventType ? ` — ${eventType}` : ''}</p>
<p style="color:#CCCCCC;font-size:15px;margin:24px 0 0">— Zachary Walker</p>
</div>`,
        });
      } catch (e) {
        console.error('Booking confirmation email error:', e);
      }
    }

    return res.status(201).json({ message: 'Booking inquiry received' });
  } catch (err) {
    console.error('booking handler error', err);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
}
