# zacharywalkermusic.com

React + TypeScript front end served, prerendered, by a persistent Node/Express
server. One process handles both the API and the site.

## Architecture

The site is **not serverless** and **not a bare SPA**.

- **One backend.** `server.ts` mounts `server/routes.ts`; that router is the only
  API implementation. There is no parallel serverless copy to keep in sync.
- **Prerendered HTML.** `npm run build` server-renders the app at build time and
  injects the markup into `dist/index.html`, so crawlers receive a fully
  populated page (~57 KB) instead of an empty `<div id="root">`. The browser
  hydrates that markup rather than discarding it.
- **A long-lived process.** Rate limiting holds real state, and there are no
  per-request cold starts.

```
server.ts            entry: env, middleware, static + prerendered HTML, listen
server/routes.ts     every API route, with per-IP rate limiting
server/lib.ts        config + Supabase REST access
server/email.ts      Gmail SMTP (welcome + booking mail)
src/entry-server.tsx build-time render entry
scripts/prerender.js injects rendered markup into dist/index.html
db/schema.sql        reference copy of the live Supabase schema
```

## Local development

```bash
npm install
npm run dev      # Vite middleware + HMR on http://localhost:3000
```

`npm run dev` is the only mode that runs Vite. Everything else serves the build.

```bash
npm run build    # client -> SSR bundle -> prerender -> server bundle
npm start        # run the production build
npm run lint     # tsc --noEmit
npm run clean    # remove build artifacts
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Supabase project URL. `/rest/v1` is appended if absent. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Service role / secret** key. |
| `GMAIL_USER` | no | Gmail address used to send mail. |
| `GMAIL_APP_PASSWORD` | no | Gmail app password. |
| `ADMIN_SECRET` | no | Bearer token for `POST /api/welcome-email`. |
| `PORT` | no | Listen port (default `3000`). |

Without the Supabase pair the API returns `503` and says which variable is
missing. Without the Gmail pair, submissions are still recorded and only the
email is skipped.

The key must be the **service role** key, not the publishable/anon one.
`/api/subscribe` reads back the inserted row to distinguish a new signup from a
duplicate, and the `Deny anon select` RLS policy blocks that read for anon keys 
which would make every signup look like a duplicate and suppress welcome emails.

## Deployment

Any host that runs a container or a Node process. `Dockerfile` is multi-stage;
`render.yaml` is a ready Render blueprint.

```bash
docker build -t zacharywalkermusic .
docker run -p 3000:3000 --env-file .env zacharywalkermusic
```

Use a plan that does **not** sleep when idle  an instance that spins down on
idle reintroduces the cold starts this architecture exists to avoid.

`GET /healthz` returns `200` when Supabase is configured and `503` otherwise,
and reports which subsystems are wired up. Point the platform health check at it.

## API

All routes accept and return JSON. Rate limits are per IP, per minute.

| Route | Limit | Notes |
| --- | --- | --- |
| `POST /api/subscribe` | 8 | `201` new, `200` already subscribed |
| `POST /api/booking` | 4 | Emails management and the customer |
| `POST /api/contact` | 6 | |
| `POST /api/consent` | 20 | Boolean consent flags |
| `POST /api/welcome-email` | 10 | Requires `Authorization: Bearer $ADMIN_SECRET` |
| `GET /healthz` |  | |

## Newsletter

The newsletter system is fully functional:
- Users can subscribe via the Newsletter component on the homepage
- Welcome emails are automatically sent to new subscribers
- Subscriber data is stored in Supabase with source tracking
- Duplicate subscriptions are prevented via unique email constraint
- Rate limiting prevents abuse (8 requests/minute per IP)

### Welcome Email

The welcome email includes:
- Personalized greeting with the subscriber's name
- Information about what to expect (shows, releases, updates)
- Links to upcoming shows and social media
- Clear unsubscribe instructions

## Database

`db/schema.sql` mirrors the live Supabase schema; keep it updated alongside any
change. Two constraints the code depends on:

- `subscribers.email` needs a unique index on the **bare column**. PostgREST
  resolves `on_conflict=email` against it, and an expression index such as
  `lower(email)` does not match  it raises `42P10`.
- `consent_log.analytics` / `.marketing` are **booleans**. Sending `1`/`0`
  fails.

## Project Structure

```
.
├── src/
│   ├── components/     # React components (Newsletter, Footer, etc.)
│   ├── pages/          # Page components
│   ├── lib/            # Client-side utilities (supabase.ts)
│   ├── App.tsx         # Main app with routing
│   └── entry-server.tsx # SSR entry point
├── server/
│   ├── routes.ts       # API route handlers
│   ├── email.ts        # Email templates and sending
│   └── lib.ts          # Server utilities
├── db/
│   └── schema.sql      # Database schema
├── public/            # Static assets
├── scripts/
│   └── prerender.js    # Prerender script
├── server.ts          # Express server entry
├── index.html          # HTML template
└── package.json        # Dependencies and scripts
```
