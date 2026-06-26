// Vercel Serverless Function: /api/subscribe
// Handles newsletter signup: validate, insert to Supabase, send welcome via Resend if configured.

import { PostgrestClient } from '@supabase/postgrest-js';
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const REST_URL = 'https://ep-steep-salad-aqq9cg1j.apirest.c-8.us-east-1.aws.neon.tech/neondb/rest/v1';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobmVibmdkc25oeW5pYXNreGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODk5NDQsImV4cCI6MjA4OTI2NTk0NH0.QILQsJmJ7j6B2xvMws1lKQq-hS7qVhUGmM10xbxdjfE';
const RESEND_KEY = 're_hNHYtfBA_NmkeUhuCiEvBRZURygziLzZp';
const JWKS_URL = 'https://ep-steep-salad-aqq9cg1j.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json';
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS);
    return payload;
  } catch (e) {
    console.error('JWT verify failed', e);
    return null;
  }
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name: rawName, email: rawEmail, source = 'footer' } = req.body || {};
  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  const name = typeof rawName === 'string' ? rawName.trim() : null;
  const src = typeof source === 'string' ? source.trim() || 'footer' : 'footer';

  if (!REST_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const postgrest = new PostgrestClient(REST_URL, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();

  // JWT verification (optional, for future auth; doesn't fail the request if no token or invalid)
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader ? (typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined) : undefined;
    const verified = await verifyToken(token);
    if (verified) {
      console.log('Verified subscriber request from:', verified.sub || verified.email);
    }
  } catch (verifyErr) {
    console.error('JWT verification error (non-fatal):', verifyErr);
    // Continue without auth
  }

  try {
    const { error, data } = await postgrest
      .from('subscribers')
      .insert({ name: name || null, email, source: src, ip, user_agent: userAgent })
      .select('id')
      .maybeSingle();

    if (error) {
      const msg = (error as any)?.code || (error as any)?.message || '';
      if (msg === '23505' || String(msg).toLowerCase().includes('duplicate') || String(msg).includes('unique')) {
        return res.status(200).json({ message: 'Already subscribed' });
      }
      console.error('subscribe insert error', error);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    const isNew = !!data;

    // Welcome email (best effort) - using provided production template
    if (RESEND_KEY && isNew) {
      const display = name || 'there';
      const resend = new Resend(RESEND_KEY);

      const welcomeHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link
      rel="preload"
      as="image"
      href="https://cdn.resend.app/62840d2e-606c-484d-92f3-79be91d3bcb1" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta
      content="telephone=no,address=no,email=no,date=no,url=no"
      name="format-detection" />
    <style>
      @media (prefers-color-scheme: dark){li::marker{color:#c4c4c4}}
    </style>
    <style>

      @media (prefers-color-scheme: dark) {

      }
    </style>
  </head>
  <body dir="ltr" lang="en" style="background-color:#7e8a9a">
    <!--$--><!--html--><!--head--><!--body-->
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center">
      <tbody>
        <tr>
          <td
            dir="ltr"
            lang="en"
            style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:1em;min-height:100%;line-height:155%;background-color:#7e8a9a">
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width:600px;align:center;width:100%;height:200px;color:#000000;background-color:#d7dee9;border-radius:0px;border-color:#000000;line-height:155%">
              <tbody>
                <tr style="width:100%">
                  <td
                    style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px">
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      Thank you for signing up for the newsletter! This project
                      is currently under development. Stay tuned, release is
                      July 1st, 2026!
                    </p>
                    <img
                      alt=""
                      height="354"
                      src="https://cdn.resend.app/62840d2e-606c-484d-92f3-79be91d3bcb1"
                      style="display:block;outline:none;border:none;text-decoration:none;max-width:100%;border-radius:8px;height:auto"
                      width="354" />
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      <br />
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`;

      resend.emails.send({
        from: 'Zachary Walker <no-reply@zacharywalkermusic.com>',
        to: email,
        subject: 'Welcome to the Newsletter',
        html: welcomeHtml,
      }).then(({ data, error }) => {
        if (error) console.error('Resend welcome error:', error);
      }).catch((e) => console.error('resend welcome error', e));
    }

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err) {
    console.error('subscribe handler error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
