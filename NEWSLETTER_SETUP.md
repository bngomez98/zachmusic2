# Newsletter Configuration & Setup

This document covers the complete newsletter subscription flow and how to set it up.

## Overview

The newsletter system has three components:

1. **Frontend** — Newsletter forms in `Newsletter.tsx`, `Footer.tsx`, and `ContactPage.tsx`
2. **Backend API** — `/api/subscribe` endpoint that handles database inserts and email
3. **Database** — Supabase `subscribers` table with automatic duplicate detection

## Architecture

### Frontend Flow

```
User enters email → Form validates → POST /api/subscribe → 
→ Backend inserts into Supabase → Email sent → Success response →
→ Component shows success state
```

### What happens:

1. User enters email (optional name)
2. Frontend validates email format
3. Frontend sends POST to `/api/subscribe`
4. Backend validates input and inserts into `subscribers` table
5. Database unique constraint on `email` handles duplicates gracefully
6. Welcome email is sent asynchronously (non-blocking)
7. Frontend receives response and shows appropriate message

## Setup Instructions

### 1. Environment Variables

You need two sets of environment variables:

#### Development (`.env`)

```
VITE_SUPABASE_URL=https://fsxcqohqvuvapbmfcvnu.supabase.co
VITE_SUPABASE_ANON_KEY=<public anon key>

SUPABASE_URL=https://fsxcqohqvuvapbmfcvnu.supabase.co/rest/v1
SUPABASE_SERVICE_ROLE_KEY=<secret service role key>

GMAIL_USER=mgmt@zacharywalkermusic.com
GMAIL_APP_PASSWORD=<Gmail app-specific password>
```

**Getting the keys:**

- **VITE_SUPABASE_ANON_KEY**: 
  - Go to Supabase Dashboard → Settings → API
  - Copy the "anon public" key (safe for client)

- **SUPABASE_SERVICE_ROLE_KEY**:
  - Go to Supabase Dashboard → Settings → API
  - Copy the "service_role secret" key
  - ⚠️ **NEVER** commit this to git. Use `.gitignore` for `.env`

- **GMAIL_APP_PASSWORD**:
  - Go to https://myaccount.google.com/apppasswords
  - Select Mail and Windows (or your device)
  - Google generates a 16-character password
  - Copy and paste into .env

#### Production (Vercel/Hosting)

Set these as secrets in your hosting dashboard (Vercel, etc.):

- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `GMAIL_APP_PASSWORD` (secret)

**Never** put secrets in `env.production` — that file is committed to git.

### 2. Database Schema

The `subscribers` table is already created in `db/schema.sql`:

```sql
create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text,
  email       text not null,
  source      text,
  ip          text,
  user_agent  text,
  subscribed  boolean default true
);

create unique index if not exists subscribers_email_key
  on public.subscribers (email);
```

**RLS Policies** allow public inserts but deny reads (service role bypasses these).

### 3. Testing the Newsletter

#### Local Development

```bash
# 1. Copy .env.example to .env
cp .env.example .env

# 2. Add your secrets to .env:
# - SUPABASE_SERVICE_ROLE_KEY
# - GMAIL_APP_PASSWORD

# 3. Start the dev server
npm run dev

# 4. Visit http://localhost:5173
# 5. Try subscribing via the Newsletter section or Footer
```

#### Via cURL (Backend Testing)

```bash
curl -X POST http://localhost:5173/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "source": "test"
  }'
```

Expected responses:

- **201 Created** (new subscription):
  ```json
  { "message": "Successfully subscribed" }
  ```

- **200 OK** (already subscribed):
  ```json
  { "message": "Already subscribed" }
  ```

- **400 Bad Request** (invalid email):
  ```json
  { "error": "Please enter a valid email address." }
  ```

- **503 Service Unavailable** (missing config):
  ```json
  { "error": "Server not configured — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing" }
  ```

### 4. Email Configuration

The `/api/subscribe` endpoint sends a welcome email if:

1. `GMAIL_USER` and `GMAIL_APP_PASSWORD` are configured
2. The subscription is new (not already subscribed)

If email is not configured, subscription still works — just no email is sent.

The welcome email:

- Is sent asynchronously (doesn't block the API response)
- Includes links to shows and Instagram
- Is styled as an HTML email for all clients
- Has an unsubscribe instruction (reply with "unsubscribe")

To test email locally, make sure your `.env` has:

```
GMAIL_USER=mgmt@zacharywalkermusic.com
GMAIL_APP_PASSWORD=<your 16-char app password>
```

Then check the backend logs for email delivery status.

## Error Handling

### Frontend

All form submissions prevent double-submission and show:

- **Error state** if validation fails or API returns error
- **Success state** if subscription succeeds
- **Already subscribed** if email already in database
- Auto-reset after 4-5 seconds (user can try again)

### Backend

The API endpoint:

1. Validates request method is POST
2. Checks Supabase config is present
3. Validates email format
4. Attempts insert with `onConflict: email, ignoreDuplicates`
5. Returns 409 (conflict) → 200 "Already subscribed"
6. Catches and logs all exceptions with context
7. Returns appropriate HTTP status and error message

## Database Queries

Check subscribers in Supabase:

```sql
-- View all subscribers
SELECT * FROM public.subscribers ORDER BY created_at DESC;

-- Check a specific email
SELECT * FROM public.subscribers WHERE email = 'user@example.com';

-- Count by source
SELECT source, COUNT(*) FROM public.subscribers GROUP BY source;

-- Delete a subscriber (if requested)
DELETE FROM public.subscribers WHERE email = 'user@example.com';
```

## Common Issues

### Newsletter signup returns 503 error

- Missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Check backend logs for the exact error
- Verify the service role key is the **secret** key, not the anon key

### Email not being sent

- `GMAIL_USER` or `GMAIL_APP_PASSWORD` missing from `.env`
- Gmail app password is incorrect or expired
- Check backend logs: `[subscribe] email failed`
- Email sends asynchronously — check logs, not the API response

### "Already subscribed" message on first signup

- Email already exists in the database
- User signed up via a different form earlier
- Check Supabase dashboard for the email

### Email validation is too strict/lenient

- Current regex: `/^[^@\s]+@[^@\s]+\.[^@\s]+$/`
- This allows most valid emails but rejects some edge cases
- Update `EMAIL_RE` in `src/lib/supabase.ts` if needed

## Forms Using This System

1. **Newsletter.tsx** — Hero section newsletter signup
   - Source: `newsletter-hero`
   - Optional name field
   
2. **Footer.tsx** — Footer newsletter form
   - Source: `footer`
   - Optional name field
   
3. **ContactPage.tsx** — Contact page sidebar newsletter
   - Source: `contact-page`
   - Optional name field

All three use the same backend and Supabase table.

## Security

- **RLS Policies**: Public can insert but cannot read
- **Service Role Key**: Only used server-side, never sent to client
- **Email Validation**: Both client and server validate email format
- **Input Sanitization**: HTML special chars escaped in welcome email
- **No Passwords**: Subscribers aren't users (no auth, no passwords)
- **IP Logging**: IP and user agent logged for security/debugging

## Production Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in hosting dashboard (never in .env)
- [ ] `GMAIL_APP_PASSWORD` set in hosting dashboard (never in .env)
- [ ] `GMAIL_USER` set correctly in env.production
- [ ] `.env` file in `.gitignore` (should not be committed)
- [ ] Subscriber table exists in Supabase (check via SQL editor)
- [ ] RLS policies are enabled on subscribers table
- [ ] Test subscription via production URL
- [ ] Verify welcome email arrives in inbox
- [ ] Check Supabase dashboard for new subscriber record

## Next Steps

- Add opt-in confirmation email (double opt-in) for compliance
- Add unsubscribe link to emails
- Add bulk email campaign system
- Add subscriber segmentation (e.g., by source)
- Add analytics (open rates, click tracking)
