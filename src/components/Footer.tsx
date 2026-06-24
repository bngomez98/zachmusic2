import React, { useState } from 'react';
import { Instagram, Facebook, Youtube, Mail, ArrowRight, Copyright, Heart } from 'lucide-react';
import { LINKS } from '../data';
import { LegalDoc } from './LegalModal';
import { subscribeNewsletter } from '../lib/supabase';

interface Props {
  onOpenLegal: (doc: Exclude<LegalDoc, null>) => void;
  onOpenTip: () => void;
  onOpenConsent: () => void;
}

export default function Footer({ onOpenLegal, onOpenTip, onOpenConsent }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setStatus('loading');
    setErrMsg('');

    try {
      const res = await subscribeNewsletter({ name, email, source: 'footer' });
      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        return;
      }
      throw new Error('Could not subscribe right now.');
    } catch (err) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Something went wrong. Try again.';
      if (msg.includes('temporarily unavailable') || msg.toLowerCase().includes('supabase')) {
        setErrMsg('This form is temporarily unavailable. Please email mgmt@zacharywalkermusic.com.');
      } else {
        setErrMsg(msg);
      }
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-base pt-32 pb-12 text-text-main">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-16">
          <div className="flex flex-col items-start gap-8 max-w-md">
            <div className="w-16 h-16 flex items-center justify-center border border-accent/30 rounded-full mb-4">
              <span className="font-display text-accent text-3xl leading-none mt-1 ml-[2px]">Z</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-medium tracking-tight">Let's Connect</h2>
            <div className="w-10 h-px bg-accent/60" />
            <a href="mailto:mgmt@zacharywalkermusic.com" className="text-text-muted hover:text-accent transition-colors inline-flex items-center gap-3 text-lg font-light tracking-wide group">
              <Mail size={20} className="group-hover:stroke-accent transition-colors duration-300" /> mgmt@zacharywalkermusic.com
            </a>

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <Instagram size={20} />
              </a>
              <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <Facebook size={20} />
              </a>
              <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <Youtube size={20} />
              </a>
              <a href={LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.72a4.85 4.85 0 01-1-.03z" />
                </svg>
              </a>
              <button
                onClick={onOpenTip}
                className="ml-1 inline-flex items-center gap-2 bg-accent text-base px-4 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-widest hover:bg-accent/90 transition-colors"
              >
                <Heart size={14} /> Support the Music
              </button>
            </div>
          </div>

          <div className="flex w-full md:max-w-sm flex-col bg-surface/50 border border-white/5 p-8 rounded-2xl">
            <h3 className="font-display text-xl mb-2 text-accent">Newsletter</h3>
            <p className="text-sm text-text-muted mb-6">Sign up for updates on new releases, live shows, and exclusive content.</p>
            {status === 'success' ? (
              <div className="py-4">
                <p className="text-accent text-sm font-medium mb-1">You&apos;re in.</p>
                <p className="text-text-muted text-xs leading-relaxed">Check your inbox — a welcome email is on its way with a preview of what&apos;s coming.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-4 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="YOUR NAME"
                    className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors"
                    required
                    disabled={status === 'loading'}
                  />
                </div>
                <div className="relative flex items-center w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="YOUR EMAIL"
                    className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors"
                    required
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-0 top-0 pb-3 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <svg className="animate-spin" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </div>
                {status === 'error' && <p className="text-red-400 text-xs">{errMsg}</p>}
              </form>
            )}
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
          <div className="flex gap-4">
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-accent transition-colors">
              <Instagram size={18} />
            </a>
            <a href={LINKS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-accent transition-colors">
              <Facebook size={18} />
            </a>
            <a href={LINKS.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-accent transition-colors">
              <Youtube size={18} />
            </a>
            <a href={LINKS.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="hover:text-accent transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.72a4.85 4.85 0 01-1-.03z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
