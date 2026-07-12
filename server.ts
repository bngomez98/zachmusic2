import express from "express";
import path from "path";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

const nodeEnv = process.env.NODE_ENV;

// Load env vars:
// - In development, prefer .env.development.local (Vercel-injected) then fall back to .env
// - In other environments, use default dotenv behavior (e.g. .env, .env.production, etc.)
if (nodeEnv === "development") {
  dotenv.config({ path: ".env.development.local" });
  dotenv.config({ path: ".env", override: false });
} else {
  dotenv.config();
}

const DATABASE_URL = process.env.DATABASE_URL;

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

// ---------- Mailer ----------
function createMailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function sendWelcomeEmail(toEmail: string, toName: string | null) {
  const mailer = createMailer();
  if (!mailer) {
    console.warn("[mailer] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping welcome email.");
    return;
  }
  const displayName = toName || toEmail.split("@")[0];
  const fromAddress = `Zachary Walker Music <${process.env.GMAIL_USER}>`;

  // Social icon URLs (inline SVG data URIs for email clients)
  const promoImageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jZ48pn8lh4r3tI4AHv1GKUrHHYVSNC.png";

  await mailer.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: "Thank you for signing up for the newsletter!",
    text: [
      `Hey ${displayName},`,
      "",
      "Thank you for signing up for the newsletter! This project is currently under development. Stay tuned, release is July 1st, 2026!",
      "",
      "More to come, stay tuned!",
      "",
      "You are receiving this email because you opted in via our site.",
      "",
      "Follow along:",
      "Instagram: https://www.instagram.com/za.chary5068",
      "Facebook:  https://www.facebook.com/topcityzachary",
      "YouTube:   https://www.youtube.com/@fullmetalzcw",
      "TikTok:    https://www.tiktok.com/@fullmetalzcw",
      "",
      "Want to change how you receive these emails?",
      "Reply to this email with 'unsubscribe' in the subject to be removed.",
      "",
      "Zachary Walker Music",
      "Topeka, KS 66604",
      "United States of America",
    ].join("\n"),
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;max-width:520px;width:100%;">

          <!-- Header message -->
          <tr>
            <td style="padding:24px 28px 16px;font-size:14px;line-height:1.6;color:#222;">
              Thank you for signing up for the newsletter! <span style="color:#b87e1a;">This project is currently under development.</span> Stay tuned, release is July 1st, 2026!
            </td>
          </tr>

          <!-- Promo Image -->
          <tr>
            <td align="center" style="padding:8px 28px 20px;">
              <img
                src="${promoImageUrl}"
                alt="Zachary Walker — Acoustic Originals &amp; Covers"
                width="420"
                style="max-width:100%;border-radius:4px;display:block;"
              />
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 28px;"><hr style="border:none;border-top:1px solid #e5e5e5;margin:0;" /></td></tr>

          <!-- Body copy -->
          <tr>
            <td style="padding:20px 28px 8px;font-size:14px;line-height:1.7;color:#444;">
              You are receiving this email because you opted in via our site.
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;font-size:14px;line-height:1.7;color:#444;">
              More to come, stay tuned!
            </td>
          </tr>

          <!-- Social icons -->
          <tr>
            <td align="center" style="padding:8px 28px 24px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding:0 8px;">
                  <a href="https://www.instagram.com/za.chary5068" target="_blank" style="display:inline-block;width:40px;height:40px;background:#222;border-radius:50%;text-align:center;line-height:40px;text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="20" height="20" alt="Instagram" style="vertical-align:middle;margin-top:10px;" />
                  </a>
                </td>
                <td style="padding:0 8px;">
                  <a href="https://www.facebook.com/topcityzachary" target="_blank" style="display:inline-block;width:40px;height:40px;background:#222;border-radius:50%;text-align:center;line-height:40px;text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174848.png" width="20" height="20" alt="Facebook" style="vertical-align:middle;margin-top:10px;" />
                  </a>
                </td>
                <td style="padding:0 8px;">
                  <a href="https://www.youtube.com/@fullmetalzcw" target="_blank" style="display:inline-block;width:40px;height:40px;background:#222;border-radius:50%;text-align:center;line-height:40px;text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174883.png" width="20" height="20" alt="YouTube" style="vertical-align:middle;margin-top:10px;" />
                  </a>
                </td>
                <td style="padding:0 8px;">
                  <a href="https://www.tiktok.com/@fullmetalzcw" target="_blank" style="display:inline-block;width:40px;height:40px;background:#222;border-radius:50%;text-align:center;line-height:40px;text-decoration:none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="20" height="20" alt="TikTok" style="vertical-align:middle;margin-top:10px;" />
                  </a>
                </td>
              </tr></table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 28px;"><hr style="border:none;border-top:1px solid #e5e5e5;margin:0;" /></td></tr>

          <!-- Unsubscribe -->
          <tr>
            <td style="padding:16px 28px 8px;font-size:12px;color:#666;line-height:1.6;">
              Want to change how you receive these emails?<br/>
              You can <a href="mailto:${process.env.GMAIL_USER}?subject=unsubscribe" style="color:#b87e1a;text-decoration:underline;">unsubscribe from this list</a>.
            </td>
          </tr>

          <!-- Footer address -->
          <tr>
            <td style="padding:8px 28px 28px;font-size:12px;color:#b87e1a;line-height:1.8;">
              Zachary Walker Music<br/>
              Topeka, KS 66604<br/>
              United States of America
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

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

      if (!isNew) return res.status(200).json({ message: "Already subscribed" });

      // Send welcome email (fire-and-forget — don't block the response)
      sendWelcomeEmail(email, name).catch((err) =>
        console.error("[mailer] welcome email failed:", err?.message || err),
      );
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

      // Supabase can handle sending confirmation email via trigger if needed
      // No Resend integration here

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
