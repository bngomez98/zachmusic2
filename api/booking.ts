// Vercel Serverless Function: /api/booking
// Handles booking requests: validate, insert to Supabase, send confirmation via Resend if configured.

import { PostgrestClient } from '@supabase/postgrest-js';
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const REST_URL = 'https://ep-steep-salad-aqq9cg1j.apirest.c-8.us-east-1.aws.neon.tech/neondb/rest/v1';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobmVibmdkc25oeW5pYXNreGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODk5NDQsImV4cCI6MjA4OTI2NTk0NH0.QILQsJmJ7j6B2xvMws1lKQq-hS7qVhUGmM10xbxdjfE';
const RESEND_KEY = 're_hNHYtfBA_NmkeUhuCiEvBRZURygziLzZp';
const JWKS_URL = 'https://ep-steep-salad-aqq9cg1j.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json';
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS);
    return payload;
  } catch (e) {
    console.error('JWT verify failed', e);
    return null;
  }
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  if (!REST_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const postgrest = new PostgrestClient(REST_URL, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();

  // JWT verification (optional, for future auth; doesn't fail the request if no token or invalid)
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader ? (typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined) : undefined;
    const verified = await verifyToken(token);
    if (verified) {
      console.log('Verified booking request from:', verified.sub || verified.email);
    }
  } catch (verifyErr) {
    console.error('JWT verification error (non-fatal):', verifyErr);
    // Continue without auth
  }

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
    const { error } = await postgrest.from('bookings').insert(payload);
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
