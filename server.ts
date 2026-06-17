import express from "express";
import path from "path";
import cors from "cors";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const DB_PATH = process.env.DB_PATH || "data.db";
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Supabase (server-side) - use when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Create local tables for fallback (SQLite)
db.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS consent_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint TEXT,
    analytics INTEGER NOT NULL,
    marketing INTEGER NOT NULL,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clientIp(req: express.Request): string {
  const fwd = (req.headers["x-forwarded-for"] || "").toString();
  return (fwd.split(",")[0] || req.socket.remoteAddress || "").trim();
}

async function startServer() {
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
    const { email, source = 'footer' } = req.body || {};
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const normalized = email.trim().toLowerCase();
    const ip = clientIp(req);
    const ua = req.get("user-agent") || "";

    // If a Supabase server client is configured (Neon or Supabase Postgres), write there first
    if (supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin.from('subscribers').insert({
          email: normalized,
          source,
          ip,
          user_agent: ua,
        });
        if (error) {
          // treat unique constraint as already-subscribed
          if (error.code === '23505' || (error.message || '').toLowerCase().includes('duplicate')) {
            return res.status(200).json({ message: 'Already subscribed' });
          }
          console.error('supabase subscribe error', error);
          // Fall through to try local DB as a fallback
        } else {
          return res.status(201).json({ message: 'Successfully subscribed' });
        }
      } catch (err) {
        console.error('supabase subscribe exception', err);
        // Fall through to sqlite fallback
      }
    }

    // Fallback to local SQLite DB
    try {
      const stmt = db.prepare(
        "INSERT INTO subscribers (email, source, ip, user_agent) VALUES (?, ?, ?, ?)"
      );
      stmt.run(normalized, source, ip, ua);
      return res.status(201).json({ message: "Successfully subscribed" });
    } catch (err: any) {
      if (err.message?.includes("UNIQUE constraint failed")) {
        return res.status(200).json({ message: "Already subscribed" });
      }
      console.error("subscribe error", err);
      return res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // ---------- Bookings ----------
  app.post("/api/booking", rateLimit("booking", 4, 60_000), (req, res) => {
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
      const stmt = db.prepare(`
        INSERT INTO bookings
          (name, email, phone, event_type, event_date, venue, location, hours, budget, message, ip, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
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
      );
      res.status(201).json({ message: "Booking inquiry received" });
    } catch (err) {
      console.error("booking error", err);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });

  // ---------- Contact ----------
  app.post("/api/contact", rateLimit("contact", 6, 60_000), (req, res) => {
    const { name, email, message } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!message || !message.trim()) return res.status(400).json({ error: "Message is required" });
    try {
      db.prepare(
        "INSERT INTO contact_messages (name, email, message, ip, user_agent) VALUES (?, ?, ?, ?, ?)"
      ).run(name?.trim() || null, email.trim().toLowerCase(), message.trim(), clientIp(req), req.get("user-agent") || "");
      res.status(201).json({ message: "Message received" });
    } catch (err) {
      console.error("contact error", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ---------- Consent log ----------
  app.post("/api/consent", rateLimit("consent", 20, 60_000), (req, res) => {
    const { fingerprint, analytics, marketing } = req.body || {};
    try {
      db.prepare(
        "INSERT INTO consent_log (fingerprint, analytics, marketing, ip, user_agent) VALUES (?, ?, ?, ?, ?)"
      ).run(
        (fingerprint || "").toString().slice(0, 64),
        analytics ? 1 : 0,
        marketing ? 1 : 0,
        clientIp(req),
        req.get("user-agent") || ""
      );
      res.status(201).json({ ok: true });
    } catch (err) {
      console.error("consent error", err);
      res.status(500).json({ error: "Failed to record consent" });
    }
  });

  // ---------- Health ----------
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
