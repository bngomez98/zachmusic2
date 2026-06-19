import express from "express";
import path from "path";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL. Set it in your environment (.env or Vercel).");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  // For Neon on serverless platforms you may need:
  // ssl: { rejectUnauthorized: false }
});

async function ensureSchema() {
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
      email TEXT NOT NULL UNIQUE,
      source TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

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

  // Execute the schema SQL (pg allows multiple statements in a single query)
  await pool.query(sql);
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
    const { email: rawEmail, source = "footer" } = req.body || {};
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ error: "Valid email is required" });
    }
    const email = rawEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email is required" });

    const ip = clientIp(req);
    const ua = req.get("user-agent") || "";

    try {
      const result = await pool.query(
        `INSERT INTO subscribers (email, source, ip, user_agent)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [email, source, ip, ua]
      );

      if (result.rowCount === 0) {
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
    if (!EMAIL_RE.test(b.email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if ((b.message || "").length > 5000) {
      return res.status(400).json({ error: "Message too long" });
    }
    try {
      await pool.query(
        `INSERT INTO bookings
          (name, email, phone, event_type, event_date, venue, location, hours, budget, message, ip, user_agent)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          b.name.trim(),
          b.email.trim().toLowerCase(),
          b.phone?.trim() || null,
          b.eventType?.trim() || null,
          b.eventDate?.trim() || null,
          b.venue?.trim() || null,
          b.location?.trim() || null,
          b.hours?.trim() || null,
          b.budget?.trim() || null,
          b.message.trim(),
          clientIp(req),
          req.get("user-agent") || ""
        ]
      );
      res.status(201).json({ message: "Booking inquiry received" });
    } catch (err) {
      console.error("booking error", err);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });

  // ---------- Contact ----------
  app.post("/api/contact", rateLimit("contact", 6, 60_000), async (req, res) => {
    const { name, email, message } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!message || !message.trim()) return res.status(400).json({ error: "Message is required" });
    try {
      await pool.query(
        "INSERT INTO contact_messages (name, email, message, ip, user_agent) VALUES ($1, $2, $3, $4, $5)",
        [name?.trim() || null, email.trim().toLowerCase(), message.trim(), clientIp(req), req.get("user-agent") || ""]
      );
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
      await pool.query(
        "INSERT INTO consent_log (fingerprint, analytics, marketing, ip, user_agent) VALUES ($1, $2, $3, $4, $5)",
        [(fingerprint || "").toString().slice(0, 64), analytics ? 1 : 0, marketing ? 1 : 0, clientIp(req), req.get("user-agent") || ""]
      );
      res.status(201).json({ ok: true });
    } catch (err) {
      console.error("consent error", err);
      res.status(500).json({ error: "Failed to record consent" });
    }
  });

  // ---------- Healthz ----------
  app.get("/healthz", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
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
      await pool.end();
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
