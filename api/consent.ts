import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATABASE_URL = process.env.DATABASE_URL;

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
        `CREATE TABLE IF NOT EXISTS consent_log (
          id BIGSERIAL PRIMARY KEY,
          fingerprint TEXT,
          analytics INTEGER NOT NULL,
          marketing INTEGER NOT NULL,
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

  const { fingerprint, analytics, marketing } = req.body || {};

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
      `INSERT INTO consent_log (fingerprint, analytics, marketing, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        (fingerprint || '').toString().slice(0, 64),
        analytics ? 1 : 0,
        marketing ? 1 : 0,
        ip,
        userAgent,
      ],
    );
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('consent handler error', err);
    return res.status(500).json({ error: 'Failed to record consent' });
  }
}
