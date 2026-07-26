// Persistent Node/Express server.
//
// This is the only backend. It serves the API and the prerendered front end
// from one long-lived process, so DB connections stay warm, rate limiting is
// real, and there are no per-request cold starts.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createApiRouter } from './server/routes.js';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development.local' });
  dotenv.config({ path: '.env', override: false });
} else {
  dotenv.config();
}

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
// Production is the default: dev mode must be opted into explicitly. If a host
// leaves NODE_ENV unset we still serve the built site rather than trying to
// boot Vite, which is not installed in the production image.
const isProduction = process.env.NODE_ENV !== 'development';

// Resolved from the working directory rather than the bundle location, so the
// compiled server can live anywhere (dist-server/) without the path shifting.
const distDir = process.env.DIST_DIR
  ? path.resolve(process.env.DIST_DIR)
  : path.resolve(process.cwd(), 'dist');

const ALLOWED_ORIGINS = [
  'https://zacharywalkermusic.com',
  'https://www.zacharywalkermusic.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

async function startServer() {
  const app = express();

  // Render/Railway/Fly all sit behind a proxy; needed for correct client IPs.
  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    );
    // Light baseline CSP. AdSense / GTM / fonts need the listed hosts.
    // Keep this intentionally permissive so third-party tags continue to work.
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://www.googleadservices.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        "media-src 'self' blob:",
        "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com",
        "frame-src 'self' https://www.googletagmanager.com https://googleads.g.doubleclick.net",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    );
    next();
  });

  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow non-browser requests (no Origin header) and the known origins.
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          return cb(null, true);
        }
        return cb(null, false);
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(createApiRouter());

  // Anything still unmatched under /api is a genuine 404, not the SPA shell.
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  if (isProduction) {
    if (!fs.existsSync(distDir)) {
      throw new Error(`Build output missing at ${distDir}. Run "npm run build" first.`);
    }

    // Hashed asset filenames are safe to cache forever; index.html is not.
    app.use(
      express.static(distDir, {
        index: false,
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        },
      }),
    );

    // Prerendered markup — read once, served to every crawler and visitor.
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    app.get('*', (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).end(html);
    });
  } else {
    // Dev: Vite middleware with HMR. Imported dynamically so production images
    // never need Vite installed.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    // Report the mode actually in effect, not the raw env var, which may be unset.
    console.log(
      `[server] listening on http://${HOST}:${PORT} (${isProduction ? 'production' : 'development'})`,
    );
  });

  const shutdown = (signal: string) => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(() => process.exit(0));
    // Don't hang forever on lingering keep-alive sockets.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
