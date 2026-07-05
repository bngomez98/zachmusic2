import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
    pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS contact_messages (
          id BIGSERIAL PRIMARY KEY,
          name TEXT,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          ip TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        )`,
      )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name: rawName, email: rawEmail, message: rawMessage } = req.body || {};

  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const message = rawMessage.trim();
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  const name = typeof rawName === 'string' ? rawName.trim() || null : null;

  if (!DATABASE_URL) {
    return res.status(500).json({ error: 'Server not configured — DATABASE_URL missing' });
  }

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
    .toString()
    .split(',')[0]
    .trim();

  try {
    await ensureSchema();
    await getPool().query(
      `INSERT INTO contact_messages (name, email, message, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, message, ip, userAgent],
    );
    return res.status(201).json({ message: 'Message received' });
  } catch (err) {
    console.error('contact handler error', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
