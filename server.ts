import express from "express";
import path from "path";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
// @ts-ignore
import { Resend } from "resend";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

let pool: Pool | null = null;

if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
} else {
  console.warn("No DATABASE_URL set. /api routes will fail until configured.");
}

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id BIGSERIAL PRIMARY KEY,
      name TEXT,
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
  `);
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clientIp(req: express.Request): string {
  const fwd = (req.headers["x-forwarded-for"] || "").toString();
  return (fwd.split(",")[0] || req.socket.remoteAddress || "").trim();
}

const WELCOME_HTML = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link rel="preload" as="image" href="https://cdn.resend.app/62840d2e-606c-484d-92f3-79be91d3bcb1" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
    <style>@media (prefers-color-scheme: dark){li::marker{color:#c4c4c4}}</style>
  </head>
  <body dir="ltr" lang="en" style="background-color:#7e8a9a">
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td dir="ltr" lang="en" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif;font-size:1em;min-height:100%;line-height:155%;background-color:#7e8a9a">
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;color:#000000;background-color:#d7dee9;border-radius:0px;line-height:155%">
              <tbody>
                <tr style="width:100%">
                  <td style="padding:0">
                    <p style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      Thank you for signing up for the newsletter! This project is currently under development. Stay tuned, release is July 1st, 2026!
                    </p>
                    <img alt="" height="354" src="https://cdn.resend.app/62840d2e-606c-484d-92f3-79be91d3bcb1" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%;border-radius:8px;height:auto" width="354" />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

async function startServer() {
  await ensureSchema();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json({ limit: "64kb" }));

  // Simple in-memory rate limit (per-IP per-endpoint)
  const rateBuckets = new Map<string, { count: number; ts: number }>();
  const rateLimit =
    (endpoint: string, max: number, windowMs: number) =>
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
    const src = typeof source === "string" ? source.trim() || "footer" : "footer";
    const ip = clientIp(req);
    const ua = req.get("user-agent") || "";

    if (!pool) return res.status(500).json({ error: "Database not configured" });

    try {
      const result = await pool.query(
        `INSERT INTO subscribers (name, email, source, ip, user_agent)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [name, email, src, ip, ua],
      );
      const isNew = result.rowCount === 1;

      if (RESEND_API_KEY && isNew) {
        const resend = new Resend(RESEND_API_KEY);
        resend.emails
          .send({
            from: "Zachary Walker <no-reply@zacharywalkermusic.com>",
            to: email,
            subject: "Welcome to the Newsletter",
            html: WELCOME_HTML,
          })
          .then(({ error }: any) => {
            if (error) console.error("Resend subscribe error:", error);
          })
          .catch((e: any) => console.error("resend subscribe email error", e));
      }

      if (!isNew) return res.status(200).json({ message: "Already subscribed" });
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
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email is required" });
    if ((b.message || "").length > 5000) return res.status(400).json({ error: "Message too long" });

    if (!pool) return res.status(500).json({ error: "Database not configured" });

    const ip = clientIp(req);
    const ua = req.get("user-agent") || "";

    try {
      await pool.query(
        `INSERT INTO bookings
          (name, email, phone, event_type, event_date, venue, location, hours, budget, message, ip, user_agent, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'new')`,
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
          ua,
        ],
      );

      if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);
        resend.emails
          .send({
            from: "Zachary Walker <no-reply@zacharywalkermusic.com>",
            to: email,
            subject: "Booking Inquiry Received",
            html: `<p>Hi ${b.name.trim()},</p>
<p>Thanks for your booking inquiry. I'll personally review the details and reply within 48 hours.</p>
<p>Event: ${b.eventDate || ""} — ${b.eventType || ""}</p>
<p>— Zachary Walker</p>`,
          })
          .then(({ error }: any) => {
            if (error) console.error("Resend booking error:", error);
          })
          .catch((e: any) => console.error("resend booking email error", e));
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
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ error: "Valid email is required" });
    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!pool) return res.status(500).json({ error: "Database not configured" });

    try {
      await pool.query(
        "INSERT INTO contact_messages (name, email, message, ip, user_agent) VALUES ($1, $2, $3, $4, $5)",
        [name || null, email, message, clientIp(req), req.get("user-agent") || ""],
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
    if (!pool) return res.status(500).json({ error: "Database not configured" });
    try {
      await pool.query(
        "INSERT INTO consent_log (fingerprint, analytics, marketing, ip, user_agent) VALUES ($1, $2, $3, $4, $5)",
        [
          (fingerprint || "").toString().slice(0, 64),
          analytics ? 1 : 0,
          marketing ? 1 : 0,
          clientIp(req),
          req.get("user-agent") || "",
        ],
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
      if (pool) {
        await pool.query("SELECT 1");
        res.json({ ok: true, time: new Date().toISOString() });
      } else {
        res.status(503).json({ ok: false });
      }
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
