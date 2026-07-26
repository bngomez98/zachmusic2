// All HTTP API routes. This is the single backend — there is no parallel
// serverless implementation to keep in sync.

import express, { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  EMAIL_RE,
  env,
  esc,
  clientIp,
  requestMeta,
  supabaseConfigured,
  supabaseInsert,
  subscribeInsert,
  subscriberExists,
} from './lib.js';
import { sendWelcomeEmail, sendBookingEmails, buildWelcomeHtml, createMailer } from './email.js';

/**
 * Per-IP, per-endpoint fixed-window limiter.
 *
 * In-memory, so limits are per-process. That is sufficient for a single
 * long-lived instance; a shared store would be needed before scaling out.
 */
function createRateLimiter() {
  const buckets = new Map<string, { count: number; start: number }>();

  // Bound memory: drop windows that can no longer be active.
  setInterval(
    () => {
      const cutoff = Date.now() - 10 * 60_000;
      for (const [key, bucket] of buckets) {
        if (bucket.start < cutoff) buckets.delete(key);
      }
    },
    5 * 60_000,
  ).unref();

  return (endpoint: string, max: number, windowMs: number) =>
    (req: Request, res: Response, next: NextFunction) => {
      const key = `${endpoint}:${clientIp(req)}`;
      const now = Date.now();
      const bucket = buckets.get(key);

      if (!bucket || now - bucket.start > windowMs) {
        buckets.set(key, { count: 1, start: now });
        return next();
      }
      if (bucket.count >= max) {
        res.setHeader('Retry-After', Math.ceil((bucket.start + windowMs - now) / 1000));
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }

      bucket.count++;
      next();
    };
}

/** Rejects the request unless Supabase credentials are present. */
function requireSupabase(_req: Request, res: Response, next: NextFunction) {
  if (!supabaseConfigured()) {
    return res
      .status(503)
      .json({
        error:
          'Newsletter is temporarily unavailable (server not fully configured). Please try again later or email mgmt@zacharywalkermusic.com.',
      });
  }
  next();
}

function readEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : null;
}

function readText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

export function createApiRouter(): Router {
  const router = Router();
  const rateLimit = createRateLimiter();

  router.use(express.json({ limit: '64kb' }));

  // ---------- Newsletter ----------
  router.post(
    '/api/subscribe',
    rateLimit('subscribe', 8, 60_000),
    requireSupabase,
    async (req, res) => {
      const email = readEmail(req.body?.email);
      if (!email) return res.status(400).json({ error: 'Valid email is required' });

      const name = readText(req.body?.name);
      const source = readText(req.body?.source) || 'newsletter-hero';
      const { ip, userAgent } = requestMeta(req);

      try {
        // Works with anon key (insert-only RLS) or service role.
        // Duplicates are detected via unique constraint (409 / 23505), not SELECT.
        const result = await subscribeInsert({
          name,
          email,
          source,
          ip,
          user_agent: userAgent,
        });

        if (!result.ok) {
          console.error('[subscribe] insert failed:', result.status, result.detail);
          return res.status(502).json({
            error:
              'Failed to subscribe. Please try again or email mgmt@zacharywalkermusic.com.',
          });
        }

        if (!result.created) {
          return res.status(200).json({ message: 'Already subscribed' });
        }

        // Don't block the response on SMTP.
        sendWelcomeEmail(email, name).catch((err) =>
          console.error('[subscribe] welcome email failed:', err),
        );

        return res.status(201).json({ message: 'Successfully subscribed' });
      } catch (err) {
        console.error('[subscribe] error:', err);
        return res.status(500).json({
          error:
            'Failed to subscribe. Please try again or email mgmt@zacharywalkermusic.com.',
        });
      }
    },
  );

  // ---------- Bookings ----------
  router.post('/api/booking', rateLimit('booking', 4, 60_000), requireSupabase, async (req, res) => {
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
        console.error('[booking] supabase insert failed:', result.status, result.detail);
        return res.status(502).json({ error: 'Failed to submit inquiry' });
      }

      sendBookingEmails(booking).catch((err) =>
        console.error('[booking] notification failed:', err),
      );

      return res.status(201).json({ message: 'Booking inquiry received' });
    } catch (err) {
      console.error('[booking] error:', err);
      return res.status(500).json({ error: 'Failed to submit inquiry' });
    }
  });

  // ---------- Contact ----------
  router.post('/api/contact', rateLimit('contact', 6, 60_000), requireSupabase, async (req, res) => {
    const email = readEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: 'Valid email is required' });

    const message = readText(req.body?.message);
    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (message.length > 5000) return res.status(400).json({ error: 'Message too long' });

    const { ip, userAgent } = requestMeta(req);

    try {
      const result = await supabaseInsert('contact_messages', {
        name: readText(req.body?.name),
        email,
        message,
        ip,
        user_agent: userAgent,
      });

      if (!result.ok) {
        console.error('[contact] supabase insert failed:', result.status, result.detail);
        return res.status(502).json({ error: 'Failed to send message' });
      }

      return res.status(201).json({ message: 'Message received' });
    } catch (err) {
      console.error('[contact] error:', err);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // ---------- Cookie consent ----------
  router.post('/api/consent', rateLimit('consent', 20, 60_000), requireSupabase, async (req, res) => {
    const { fingerprint, analytics, marketing } = req.body || {};
    const { ip, userAgent } = requestMeta(req);

    try {
      // analytics/marketing are boolean columns — send booleans, not 1/0.
      const result = await supabaseInsert('consent_log', {
        fingerprint: (fingerprint ?? '').toString().slice(0, 64),
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        ip,
        user_agent: userAgent,
      });

      if (!result.ok) {
        console.error('[consent] supabase insert failed:', result.status, result.detail);
        return res.status(502).json({ error: 'Failed to record consent' });
      }

      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('[consent] error:', err);
      return res.status(500).json({ error: 'Failed to record consent' });
    }
  });

  // ---------- Admin: re-send a welcome email ----------
  router.post(
    '/api/welcome-email',
    rateLimit('welcome-email', 10, 60_000),
    requireSupabase,
    async (req, res) => {
      const adminSecret = env.adminSecret();
      if (!adminSecret) {
        return res.status(503).json({ error: 'ADMIN_SECRET not configured' });
      }
      if (req.get('authorization') !== `Bearer ${adminSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const email = readEmail(req.body?.email);
      if (!email) return res.status(400).json({ error: 'Valid email is required' });

      const mailer = createMailer();
      if (!mailer) return res.status(503).json({ error: 'Email not configured' });

      try {
        // subscriberExists requires service role; without it we still attempt send.
        if (env.hasServiceRole() && !(await subscriberExists(email))) {
          return res.status(404).json({ error: 'Email not found in subscriber list' });
        }

        const name = readText(req.body?.name);
        await mailer.sendMail({
          from: `Zachary Walker <${env.gmailUser()}>`,
          to: email,
          subject: 'Welcome to the list ✦',
          html: buildWelcomeHtml(name ? esc(name) : 'there'),
        });

        return res.status(200).json({ message: 'Welcome email sent' });
      } catch (err) {
        console.error('[welcome-email] error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
      }
    },
  );

  // ---------- Health ----------
  router.get('/healthz', async (_req, res) => {
    const checks = {
      supabase: supabaseConfigured(),
      serviceRole: env.hasServiceRole(),
      email: Boolean(env.gmailUser() && env.gmailPassword()),
    };
    res.status(checks.supabase ? 200 : 503).json({
      ok: checks.supabase,
      checks,
      hint: checks.supabase
        ? checks.serviceRole
          ? 'Supabase service role active. Full admin + newsletter paths available.'
          : 'Supabase anon key active. Newsletter inserts work; set SUPABASE_SERVICE_ROLE_KEY for admin reads.'
        : 'Supabase URL/key missing.',
      time: new Date().toISOString(),
    });
  });

  return router;
}
