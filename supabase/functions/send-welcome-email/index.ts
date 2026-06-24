import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();

    if (!email || !name) {
      return new Response(JSON.stringify({ error: 'name and email are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firstName = name.split(' ')[0];

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to the Zachary Walker Newsletter</title>
  <style>
    body { margin: 0; padding: 0; background: #0A0A0A; font-family: Georgia, 'Times New Roman', serif; color: #E8E2D9; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #0A0A0A; }
    .header { padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid rgba(212,168,83,0.2); }
    .logo-ring { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border: 1px solid rgba(212,168,83,0.4); border-radius: 50%; margin-bottom: 20px; }
    .logo-letter { font-size: 32px; color: #D4A853; font-family: Georgia, serif; line-height: 1; }
    .artist-name { font-size: 22px; font-weight: 600; color: #E8E2D9; letter-spacing: -0.02em; margin: 0 0 4px; }
    .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #9B9B9B; margin: 0; }
    .body { padding: 40px 40px 32px; }
    .greeting { font-size: 28px; color: #E8E2D9; font-weight: 600; margin: 0 0 20px; letter-spacing: -0.02em; }
    .text { font-size: 15px; line-height: 1.7; color: #9B9B9B; margin: 0 0 16px; }
    .accent { color: #D4A853; }
    .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 28px 0; }
    .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(212,168,83,0.7); font-family: 'Courier New', monospace; margin: 0 0 14px; }
    .feature-list { list-style: none; margin: 0 0 24px; padding: 0; }
    .feature-list li { font-size: 14px; color: #9B9B9B; padding: 8px 0 8px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); position: relative; line-height: 1.5; }
    .feature-list li::before { content: '—'; position: absolute; left: 0; color: #D4A853; }
    .feature-list li:last-child { border-bottom: none; }
    .cta-btn { display: inline-block; padding: 14px 32px; background: #D4A853; color: #0A0A0A; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; border-radius: 4px; margin: 8px 0 24px; }
    .signature { margin-top: 32px; }
    .sig-name { font-size: 18px; color: #D4A853; margin: 0 0 4px; }
    .sig-role { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(155,155,155,0.6); font-family: 'Courier New', monospace; margin: 0; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
    .footer-text { font-size: 11px; color: rgba(155,155,155,0.5); line-height: 1.6; margin: 0; }
    .footer-link { color: rgba(212,168,83,0.6); text-decoration: none; }
    @media (max-width: 600px) {
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
      .greeting { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-ring">
        <span class="logo-letter">Z</span>
      </div>
      <p class="artist-name">Zachary Walker</p>
      <p class="tagline">Singer-Songwriter &mdash; Topeka, KS</p>
    </div>

    <div class="body">
      <h1 class="greeting">Thank you for signing up, ${firstName}.</h1>

      <p class="text">
        You&rsquo;re now part of the inner circle. This newsletter is how I keep you closest to everything I&rsquo;m
        working on &mdash; the music, the shows, and the story behind it all.
      </p>

      <div class="divider"></div>

      <p class="section-label">What to expect</p>
      <ul class="feature-list">
        <li>Early access and first listens when new music drops &mdash; before it goes anywhere else</li>
        <li>Behind-the-scenes writing and recording updates from the debut EP (expected late 2026)</li>
        <li>Upcoming show announcements and presale opportunities</li>
        <li>Personal notes on the songs &mdash; what they mean, where they came from</li>
        <li>Exclusive content not posted on social media</li>
      </ul>

      <p class="text">
        My first studio-recorded EP is on the way. The songs draw from real life &mdash; loss, faith, resilience,
        and the quiet moments in between. I&rsquo;m glad you&rsquo;ll be along for it.
      </p>

      <a href="https://zacharywalkermusic.com" class="cta-btn">Visit the Site</a>

      <div class="divider"></div>

      <div class="signature">
        <p class="sig-name">Zachary Walker</p>
        <p class="sig-role">Singer &middot; Songwriter &middot; Topeka, KS</p>
      </div>
    </div>

    <div class="footer">
      <p class="footer-text">
        You received this because you subscribed at
        <a href="https://zacharywalkermusic.com" class="footer-link">zacharywalkermusic.com</a>.<br />
        To unsubscribe, reply with &ldquo;unsubscribe&rdquo; to
        <a href="mailto:mgmt@zacharywalkermusic.com" class="footer-link">mgmt@zacharywalkermusic.com</a>.<br />
        &copy; ${new Date().getFullYear()} Zachary Walker. All Rights Reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Zachary Walker <mgmt@zacharywalkermusic.com>',
        to: [email],
        subject: `Thanks for signing up, ${firstName} — here's what's coming`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
