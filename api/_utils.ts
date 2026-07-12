// Shared utilities for API endpoints

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const GMAIL_USER = process.env.GMAIL_USER;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function esc(s: string) {
  return s.replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m),
  );
}

export function supabaseApiUrl(): string {
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL not set');
  return SUPABASE_URL.endsWith('/rest/v1') ? SUPABASE_URL : `${SUPABASE_URL}/rest/v1`;
}

export function supabaseHeaders(): Record<string, string> {
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
}

export function extractMeta(req: { headers: Record<string, any>; socket?: { remoteAddress?: string } }) {
  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
    .toString()
    .split(',')[0]
    .trim();
  return { userAgent, ip };
}

export function buildWelcomeHtml(displayName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

<!-- Header -->
<tr><td align="center" style="padding:32px 0 24px">
  <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.02em;color:#FFFFFF">ZACHARY WALKER</h1>
  <div style="width:40px;height:2px;background-color:#D4A853;margin:12px auto 0"></div>
</td></tr>

<!-- Body card -->
<tr><td style="background-color:#111111;border-radius:8px;padding:36px 32px;border:1px solid rgba(255,255,255,0.06)">
  <p style="margin:0 0 20px;font-size:18px;color:#FFFFFF;line-height:1.5">Hey ${displayName},</p>
  <p style="margin:0 0 16px;font-size:15px;color:#CCCCCC;line-height:1.7">Thanks for joining the list. You'll be the first to know about upcoming shows, new recordings, and anything else worth sharing.</p>
  <p style="margin:0 0 16px;font-size:15px;color:#CCCCCC;line-height:1.7">I keep things simple — no spam, no clutter. Just honest updates when there's something worth telling you about.</p>
  <p style="margin:0 0 28px;font-size:15px;color:#CCCCCC;line-height:1.7">In the meantime, here's where you can find me:</p>

  <!-- CTA buttons -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
  <tr>
    <td align="center" style="padding-right:12px">
      <a href="https://zacharywalkermusic.com/#shows" style="display:inline-block;background-color:#D4A853;color:#0A0A0A;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 24px;border-radius:4px">Upcoming Shows</a>
    </td>
    <td align="center">
      <a href="https://instagram.com/zacharywalkermusic" style="display:inline-block;background-color:transparent;color:#D4A853;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;padding:12px 24px;border-radius:4px;border:1px solid #D4A853">Instagram</a>
    </td>
  </tr>
  </table>

  <p style="margin:32px 0 0;font-size:15px;color:#CCCCCC;line-height:1.5">— Zachary Walker</p>
</td></tr>

<!-- Footer -->
<tr><td align="center" style="padding:24px 0">
  <p style="margin:0 0 6px;font-size:11px;color:#666666">You signed up at zacharywalkermusic.com</p>
  <p style="margin:0;font-size:11px;color:#666666">To unsubscribe, reply to this email with "unsubscribe."</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
