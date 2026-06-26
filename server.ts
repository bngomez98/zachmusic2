import express from "express";
import path from "path";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
// @ts-ignore - resend will be installed on Vercel and in proper pnpm env
import { Resend } from "resend";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ihnebngdsnhyniaskxiq.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobmVibmdkc25oeW5pYXNreGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODk5NDQsImV4cCI6MjA4OTI2NTk0NH0.QILQsJmJ7j6B2xvMws1lKQq-hS7qVhUGmM10xbxdjfE';

let pool: Pool | null = null;
let supabaseAdmin: SupabaseClient | null = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
  });
} else if (SUPABASE_URL && SERVICE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else {
  console.warn("No DATABASE_URL or Supabase service key. /api routes will fail until configured.");
}

async function ensureSchema() {
  if (pool) {
    // Create a migration tracking table and required application tables (idempotent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGSERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // Create application tables
    const sql = `
      CREATE TABLE IF NOT EXISTS subscribers (
        id BIGSERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        source TEXT,
        ip TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS name TEXT;

      CREATE TABLE IF NOT EXISTS bookings (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        event_type TEXT,
        event_date TEXT,
        venue TEXT,
        location TEXT,
        hours TEXT,
        budget TEXT,
        message TEXT NOT NULL,
        ip TEXT,
        user_agent TEXT,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id BIGSERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        ip TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS consent_log (
        id BIGSERIAL PRIMARY KEY,
        fingerprint TEXT,
        analytics INTEGER NOT NULL,
        marketing INTEGER NOT NULL,
        ip TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_subscribers_email_lower ON subscribers (lower(email));
    `;

    await pool.query(sql);
  } else if (supabaseAdmin) {
    // For Supabase service, tables are expected to exist (use migration or dashboard).
    // We can optionally ensure via rpc or skip. Rely on migration file for now.
  }
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clientIp(req: express.Request): string {
  const fwd = (req.headers["x-forwarded-for"] || "").toString();
  return (fwd.split(",")[0] || req.socket.remoteAddress || "").trim();
}

async function startServer() {
  await ensureSchema();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json({ limit: "64kb" }));

  // Simple in-memory rate limit (per-IP per-endpoint)
  const rateBuckets = new Map<string, { count: number; ts: number }>();
  const rateLimit = (endpoint: string, max: number, windowMs: number) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const key = `${endpoint}:${clientIp(req)}`;
      const now = Date.now();
      const b = rateBuckets.get(key);
      if (!b || now - b.ts > windowMs) {
        rateBuckets.set(key, { count: 1, ts: now });
        return next();
      }
      if (b.count >= max) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
      }
      b.count++;
      next();
    };

  // ---------- Newsletter ----------
  app.post("/api/subscribe", rateLimit("subscribe", 8, 60_000), async (req, res) => {
    const { name: rawName, email: rawEmail, source = "footer" } = req.body || {};
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ error: "Valid email is required" });
    }
    const email = rawEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email is required" });
    const name = (typeof rawName === "string" ? rawName.trim() : "") || null;
    const sourceValue = typeof source === "string" ? source.trim() || "footer" : "footer";

    const ip = clientIp(req);
    const ua = req.get("user-agent") || "";

    try {
      let isNew = true;
      if (pool) {
        const result = await pool.query(
          `INSERT INTO subscribers (name, email, source, ip, user_agent)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING
           RETURNING id`,
          [name, email, sourceValue, ip, ua]
        );
        isNew = result.rowCount === 1;
      } else if (supabaseAdmin) {
        const { error, data } = await supabaseAdmin
          .from('subscribers')
          .insert({ name, email, source: sourceValue, ip, user_agent: ua })
          .select('id')
          .maybeSingle();
        if (error) {
          if (error.code === '23505' || (error.message || '').toLowerCase().includes('duplicate')) {
            isNew = false;
          } else {
            throw error;
          }
        } else {
          isNew = !!data;
        }
      } else {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Send welcome email (best effort)
      const effectiveResendKey = process.env.RESEND_API_KEY || 're_hNHYtfBA_NmkeUhuCiEvBRZURygziLzZp';
      if (effectiveResendKey && isNew) {
        const toEmail = email;
        const displayName = name || "there";
        const resend = new Resend(effectiveResendKey);

        resend.emails.send({
          from: "Zachary Walker <no-reply@zacharywalkermusic.com>",
          to: toEmail,
          subject: "Welcome to the Newsletter",
          html: `<p>Hi ${displayName},</p><p>Thanks for subscribing to Zachary Walker updates. You'll hear about new releases, shows, and exclusives.</p><p>— Zachary</p>`,
        }).then(({ data, error }: any) => {
          if (error) console.error("Resend subscribe error:", error);
        }).catch((e: any) => console.error("resend subscribe email error", e));
      }

      if (!isNew) {
        return res.status(200).json({ message: "Already subscribed" });
      }
      return res.status(201).json({ message: "Successfully subscribed" });
    } catch (err) {
      console.error("subscribe error", err);
      return res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // ---------- Bookings ----------
  app.post("/api/booking", rateLimit("booking", 4, 60_000), async (req, res) => {
    const b = req.body || {};
    const required = ["name", "email", "eventDate", "message"];
    for (const f of required) {
      if (!b[f] || typeof b[f] !== "string" || !b[f].trim()) {
        return res.status(400).json({ error: `Missing required field: ${f}` });
      }
    }
    const email = b.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if ((b.message || "").length > 5000) {
      return res.status(400).json({ error: "Message too long" });
    }
    const ip = clientIp(req);
    const ua = req.get("user-agent") || "";
    try {
      if (pool) {
        await pool.query(
          `INSERT INTO bookings
            (name, email, phone, event_type, event_date, venue, location, hours, budget, message, ip, user_agent)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            b.name.trim(),
            email,
            b.phone?.trim() || null,
            b.eventType?.trim() || null,
            b.eventDate?.trim() || null,
            b.venue?.trim() || null,
            b.location?.trim() || null,
            b.hours?.trim() || null,
            b.budget?.trim() || null,
            b.message.trim(),
            ip,
            ua
          ]
        );
      } else if (supabaseAdmin) {
        const { error } = await supabaseAdmin.from('bookings').insert({
          name: b.name.trim(),
          email,
          phone: b.phone?.trim() || null,
          event_type: b.eventType?.trim() || null,
          event_date: b.eventDate?.trim() || null,
          venue: b.venue?.trim() || null,
          location: b.location?.trim() || null,
          hours: b.hours?.trim() || null,
          budget: b.budget?.trim() || null,
          message: b.message.trim(),
          ip,
          user_agent: ua,
          status: 'new',
        });
        if (error) throw error;
      } else {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Send confirmation email (best effort)
      const effectiveResendKey2 = process.env.RESEND_API_KEY || 're_hNHYtfBA_NmkeUhuCiEvBRZURygziLzZp';
      if (effectiveResendKey2) {
        const displayName = b.name.trim();
        const resend = new Resend(effectiveResendKey2);

        resend.emails.send({
          from: "Zachary Walker <no-reply@zacharywalkermusic.com>",
          to: email,
          subject: "Booking Inquiry Received",
          html: `<p>Hi ${displayName},</p>
<p>Thanks for your booking inquiry. I'll personally review the details and reply within 48 hours.</p>
<p>Event: ${b.eventDate || ''} — ${b.eventType || ''}</p>
<p>— Zachary Walker</p>`,
        }).then(({ data, error }: any) => {
          if (error) console.error("Resend booking error:", error);
        }).catch((e: any) => console.error("resend booking email error", e));
      }

      res.status(201).json({ message: "Booking inquiry received" });
    } catch (err) {
      console.error("booking error", err);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });

  // ---------- Contact ----------
  app.post("/api/contact", rateLimit("contact", 6, 60_000), async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : null;
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!message) return res.status(400).json({ error: "Message is required" });
    try {
      if (pool) {
        await pool.query(
          "INSERT INTO contact_messages (name, email, message, ip, user_agent) VALUES ($1, $2, $3, $4, $5)",
          [name || null, email, message, clientIp(req), req.get("user-agent") || ""]
        );
      } else if (supabaseAdmin) {
        await supabaseAdmin.from('contact_messages').insert({
          name: name || null,
          email,
          message,
          ip: clientIp(req),
          user_agent: req.get("user-agent") || "",
        });
      } else {
        return res.status(500).json({ error: "Database not configured" });
      }
      res.status(201).json({ message: "Message received" });
    } catch (err) {
      console.error("contact error", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ---------- Consent log ----------
  app.post("/api/consent", rateLimit("consent", 20, 60_000), async (req, res) => {
    const { fingerprint, analytics, marketing } = req.body || {};
    try {
      if (pool) {
        await pool.query(
          "INSERT INTO consent_log (fingerprint, analytics, marketing, ip, user_agent) VALUES ($1, $2, $3, $4, $5)",
          [(fingerprint || "").toString().slice(0, 64), analytics ? 1 : 0, marketing ? 1 : 0, clientIp(req), req.get("user-agent") || ""]
        );
      } else if (supabaseAdmin) {
        await supabaseAdmin.from('consent_log').insert({
          fingerprint: (fingerprint || "").toString().slice(0, 64),
          analytics: analytics ? 1 : 0,
          marketing: marketing ? 1 : 0,
          ip: clientIp(req),
          user_agent: req.get("user-agent") || "",
        });
      } else {
        return res.status(500).json({ error: "Database not configured" });
      }
      res.status(201).json({ ok: true });
    } catch (err) {
      console.error("consent error", err);
      res.status(500).json({ error: "Failed to record consent" });
    }
  });

  // ---------- Healthz ----------
  app.get("/healthz", async (_req, res) => {
    try {
      if (pool) {
        await pool.query("SELECT 1");
      } else if (supabaseAdmin) {
        await supabaseAdmin.from('subscribers').select('id').limit(1);
      } else {
        res.status(503).json({ ok: false });
        return;
      }
      res.json({ ok: true, time: new Date().toISOString() });
    } catch (err) {
      console.error("healthz error", err);
      res.status(503).json({ ok: false });
    }
  });

  // ---------- Vite middleware / static ----------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1y", immutable: true, index: false }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down...");
    server.close();
    try {
      if (pool) await pool.end();
    } catch (err) {
      console.error("Error shutting down pool", err);
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
