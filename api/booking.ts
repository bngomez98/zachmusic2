// Vercel Serverless Function: /api/booking
// Validate → insert to Neon (pg) → send confirmation via Resend.

import { Pool } from 'pg';
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_KEY = process.env.RESEND_API_KEY;

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

  if (!DATABASE_URL) {
    return res.status(500).json({ error: 'Server not configured — DATABASE_URL missing' });
  }

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
    .toString()
    .split(',')[0]
    .trim();

  try {
    await getPool().query(
      `INSERT INTO bookings
        (name, email, phone, event_type, event_date, venue, location, hours, budget, message, ip, user_agent, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'new')`,
      [
        b.name.trim(),
        email,
        b.phone ? String(b.phone).trim() : null,
        b.eventType ? String(b.eventType).trim() : null,
        b.eventDate ? String(b.eventDate).trim() : null,
        b.venue ? String(b.venue).trim() : null,
        b.location ? String(b.location).trim() : null,
        b.hours ? String(b.hours).trim() : null,
        b.budget ? String(b.budget).trim() : null,
        b.message.trim(),
        ip,
        userAgent,
      ],
    );

    // Confirmation email — best effort
    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);
      resend.emails
        .send({
          from: 'Zachary Walker <no-reply@zacharywalkermusic.com>',
          to: email,
          subject: 'Booking Inquiry Received',
          html: `<p>Hi ${b.name.trim()},</p>
<p>Thanks for your booking inquiry. I'll personally review the details and reply within 48 hours.</p>
<p>Event: ${b.eventDate || ''} — ${b.eventType || ''}</p>
<p>— Zachary Walker</p>`,
        })
        .then(({ error }) => {
          if (error) console.error('Resend booking error:', error);
        })
        .catch((e) => console.error('resend booking email error', e));
    }

    return res.status(201).json({ message: 'Booking inquiry received' });
  } catch (err) {
    console.error('booking handler error', err);
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
}
