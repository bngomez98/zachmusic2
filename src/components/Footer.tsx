import React, { useState } from 'react';
import { Instagram, Facebook, Mail, ArrowRight, Copyright, Coffee } from 'lucide-react';
import { LINKS } from '../data';
import { LegalDoc } from './LegalModal';
import { subscribeNewsletter } from '../lib/supabase';

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  );
}

function SpotifyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const socialIcons = [
  { href: LINKS.instagram, Icon: Instagram, label: 'Instagram' },
  { href: LINKS.tiktok, Icon: TikTokIcon, label: 'TikTok' },
  { href: LINKS.youtube, Icon: Youtube, label: 'YouTube' },
  { href: LINKS.twitch, Icon: Radio, label: 'Twitch' },
  { href: LINKS.facebook, Icon: Facebook, label: 'Facebook' },
  { href: LINKS.spotify, Icon: SpotifyIcon, label: 'Spotify' },
];

const footerLinks = [
  { name: 'About', href: '#about' },
  { name: 'Music', href: '#music' },
  { name: 'Shows', href: '#shows' },
  { name: 'Booking', href: '#booking' },
  { name: 'Links', href: '#links' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
interface Props {
  onOpenLegal: (doc: Exclude<LegalDoc, null>) => void;
  onOpenTip: () => void;
  onOpenConsent: () => void;
}

export default function Footer({ onOpenLegal, onOpenTip, onOpenConsent }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setErrMsg('');
    try {
      await subscribeNewsletter({ email, source: 'footer' });
      setStatus('success');
      setEmail('');
    } catch (err) {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrMsg(data?.error || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-base pt-32 pb-12 text-text-main">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-16">

          {/* Brand + contact */}
          <div className="flex flex-col items-start gap-6 max-w-sm">
            <div className="w-16 h-16 flex items-center justify-center border border-accent/30 rounded-full">
              <span className="font-display text-accent text-3xl leading-none mt-1 ml-[2px]">Z</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-medium tracking-tight">{"Let's Connect"}</h2>
            <div className="w-10 h-px bg-accent/60" />
            <a href="mailto:mgmt@zacharywalkermusic.com" className="text-text-muted hover:text-accent transition-colors inline-flex items-center gap-3 text-lg font-light tracking-wide group">
              <Mail size={20} className="group-hover:stroke-accent transition-colors duration-300" />
              mgmt@zacharywalkermusic.com
            </a>

            {/* All social icons */}
            <div className="flex items-center flex-wrap gap-3 mt-2">
              {socialIcons.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-text-muted hover:text-accent transition-colors p-2.5 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick nav + Newsletter */}
          <div className="flex flex-col sm:flex-row gap-12 w-full md:max-w-lg">

            {/* Quick nav */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-2">Navigate</p>
              {footerLinks.map((l) => (
                <a key={l.name} href={l.href} className="text-text-muted hover:text-accent transition-colors text-sm font-light tracking-wide hover:translate-x-1 inline-block transition-transform duration-200">
                  {l.name}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="flex-1 bg-surface/50 border border-white/5 p-8 rounded-2xl">
              <h3 className="font-display text-xl mb-2 text-accent">Newsletter</h3>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">Sign up for new releases, live show dates, and exclusive content.</p>
              <form onSubmit={handleSubscribe} className="relative flex items-center w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR EMAIL"
                  className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors pr-10"
                  required
                  disabled={status === 'loading' || status === 'success'}
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 pb-3 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                  disabled={status === 'loading' || status === 'success'}
                  aria-label="Subscribe"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
              {status === 'success' && <p className="text-accent text-xs mt-3">Thanks for subscribing.</p>}
              {status === 'error' && <p className="text-red-400 text-xs mt-3">Something went wrong. Try again.</p>}
            </div>
          </div>
        </div>

        {/* Watermark */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <Instagram size={20} />
              </a>
              <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <Facebook size={20} />
              </a>
              <button
                onClick={onOpenTip}
                className="ml-2 inline-flex items-center gap-2 bg-accent text-base px-4 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-widest hover:bg-accent/90 transition-colors"
              >
                <Coffee size={14} /> Buy Me a Coffee
              </button>
            </div>
          </div>

          <div className="flex w-full md:max-w-sm flex-col bg-surface/50 border border-white/5 p-8 rounded-2xl">
            <h3 className="font-display text-xl mb-2 text-accent">Newsletter</h3>
            <p className="text-sm text-text-muted mb-6">Sign up to receive updates on new releases, live shows, and exclusive content.</p>
            <form onSubmit={handleSubscribe} className="relative flex items-center w-full">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors pr-10"
                required
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-0 top-0 pb-3 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                disabled={status === 'loading' || status === 'success'}
              >
                <ArrowRight size={18} />
              </button>
            </form>
            {status === 'success' && <p className="text-accent text-xs mt-3">Thanks for subscribing. Watch your inbox.</p>}
            {status === 'error' && <p className="text-red-400 text-xs mt-3">{errMsg}</p>}
            <p className="text-[10px] text-text-muted/50 mt-4 leading-relaxed">
              By subscribing you agree to our{' '}
              <button onClick={() => onOpenLegal('privacy')} className="underline hover:text-accent transition-colors">Privacy Policy</button>.
              You can unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Massive Typographic Treatment */}
        <div className="w-full overflow-hidden flex justify-center items-center py-16 opacity-[0.03] select-none pointer-events-none">
          <h2 className="text-[12vw] font-display font-bold leading-none whitespace-nowrap tracking-tighter">
            ZACHARY WALKER
          </h2>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-text-muted/10 text-xs text-text-muted tracking-widest uppercase gap-6">
          <p>&copy; {new Date().getFullYear()} Zachary Walker. All Rights Reserved.</p>
          <div className="flex gap-5 flex-wrap justify-center">
            {socialIcons.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="hover:text-accent transition-colors">
                <Icon size={17} />
              </a>
            ))}
        <div className="border-t border-white/5 pt-8 mb-8">
          <div className="flex items-start gap-3 text-text-muted text-xs leading-relaxed max-w-3xl">
            <Copyright size={14} className="text-accent flex-shrink-0 mt-0.5" />
            <p>
              <span className="text-text-main">2023&ndash;{year} Zachary Walker. All Rights Reserved.</span>{' '}
              All original musical compositions, sound recordings, lyrics, performances, photography, video, artwork,
              and website design are the exclusive property of Zachary Walker and are protected under United States
              and international copyright law. Unauthorized reproduction, distribution, sampling, AI training, or
              commercial use is strictly prohibited.{' '}
              <button onClick={() => onOpenLegal('copyright')} className="text-accent hover:underline">Full notice &rarr;</button>
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-text-muted/10 text-xs text-text-muted tracking-widest uppercase gap-6">
          <p>&copy; {year} Zachary Walker</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-accent transition-colors tracking-widest">Privacy</button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-accent transition-colors tracking-widest">Terms</button>
            <button onClick={() => onOpenLegal('copyright')} className="hover:text-accent transition-colors tracking-widest">Copyright</button>
            <button onClick={() => onOpenLegal('cookies')} className="hover:text-accent transition-colors tracking-widest">Cookies</button>
            <button onClick={onOpenConsent} className="hover:text-accent transition-colors tracking-widest">Preferences</button>
            <a href="mailto:mgmt@zacharywalkermusic.com" className="hover:text-accent transition-colors tracking-widest">Contact</a>
          </div>
          <div className="flex gap-6">
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-accent transition-colors">
              <Instagram size={18} />
            </a>
            <a href={LINKS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-accent transition-colors">
              <Facebook size={18} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
