// Vercel Serverless Function: /api/booking
// Handles booking requests: validate, insert to Supabase, send confirmation via Resend if configured.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default async function handler(req: any, res: any) {
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

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();

  const payload = {
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
  };

  try {
    const { error } = await supabase.from('bookings').insert(payload);
    if (error) {
      console.error('booking insert error', error);
      return res.status(500).json({ error: 'Failed to submit inquiry' });
    }

    // Confirmation email (best effort)
    if (RESEND_KEY) {
      const display = payload.name;
      const resend = new Resend(RESEND_KEY);

      resend.emails.send({
        from: 'Zachary Walker <no-reply@zacharywalkermusic.com>',
        to: email,
        subject: 'Booking Inquiry Received',
        html: `<p>Hi ${display},</p>
<p>Thanks for your booking inquiry. I'll personally review the details and reply within 48 hours.</p>
<p>Event: ${payload.event_date || ''} — ${payload.event_type || ''}</p>
<p>— Zachary Walker</p>`,
      }).then(({ data, error }) => {
        if (error) console.error('Resend booking error:', error);
      }).catch((e) => console.error('resend booking email error', e));
    }

    return res.status(201).json({ message: 'Booking inquiry received' });
  } catch (err) {
    console.error('booking handler error', err);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
}
