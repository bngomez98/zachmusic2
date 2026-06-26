# Zachary Music (zachmusic2)

Vite + React frontend deployed to Vercel. Newsletter signups and booking inquiries are handled by serverless API routes (`/api/subscribe`, `/api/booking`) that write to Supabase and send emails via Resend.

## Quick start (local dev)

1. Install dependencies

```bash
npm install
```

2. Environment

```bash
cp .env.example .env
# edit .env with your keys (local only)
```

**Never commit .env or real secrets.**

3. Run dev server (uses server.ts + Express for /api routes)

```bash
npm run dev
```

4. Build

```bash
npm run build
```

## Production (Vercel)

This is a **Vite** project on Vercel using:
- Static build output in `dist/`
- Serverless functions in `api/*.ts` (for Supabase inserts + Resend emails)
- `vercel.json` configures the build + SPA fallback

### Required Vercel Environment Variables (set in Vercel Dashboard → Settings → Environment Variables)

**Public (client-side):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Server-side only (functions + any server code):**
- `SUPABASE_URL` (same as above)
- `SUPABASE_SERVICE_ROLE_KEY` (full service role key — required for writes)
- `RESEND_API_KEY`

Optional for server.ts pg path:
- `DATABASE_URL` (Supabase Postgres connection string)

After setting vars, redeploy.

## Environment files

- `.env.example` — reference with actual project values for public keys
- `env.production` — build-time public config loaded by Vite for production
- Never put service role keys or Resend key in VITE_ prefixed vars

See the files for the current project Supabase URL and public anon key.

## Database

Tables (subscribers with `name` + `email`, bookings, etc.) are defined in `db/migrations/001_init.sql`.

Use the Supabase dashboard SQL editor or run migrations locally with the provided connection string.

## Emails

- Welcome email on newsletter signup
- Confirmation email on booking request

Handled via official Resend SDK in the API routes when `RESEND_API_KEY` is present.

Repository

- Homepage: https://zacharywalkermusic.com
- Framework: Vite + React + TypeScript
- Deploy: Vercel (static + serverless functions)

License

See LICENSE.md in the repository.
