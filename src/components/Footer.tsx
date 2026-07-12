import React, { useState } from 'react';
import { Instagram, Facebook, Mail, ArrowRight, Copyright } from 'lucide-react';
import { LINKS } from '../data';
import { LegalDoc } from './LegalModal';

interface Props {
  onOpenLegal: (doc: Exclude<LegalDoc, null>) => void;
  onOpenConsent: () => void;
}

export default function Footer({ onOpenLegal, onOpenConsent }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrMsg('');

    try {
      const resp = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), source: 'footer' }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok || resp.status === 200 || resp.status === 201) {
        setStatus('success');
        // fire gtag
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', 'newsletter_signup', { source: 'footer' });
        }
        setName('');
        setEmail('');
        return;
      }
      throw new Error(data?.error || data?.message || 'Submission failed. Please try again.');
    } catch (err) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setErrMsg(msg);
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

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <Instagram size={20} />
              </a>
              <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="flex w-full md:max-w-sm flex-col bg-surface/50 border border-white/5 p-8 rounded-2xl">
            <h3 className="font-display text-xl mb-2 text-accent">Newsletter</h3>
            <p className="text-sm text-text-muted mb-6">Sign up to receive updates on new releases, live shows, and exclusive content.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="YOUR NAME"
                  className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors duration-200"
                  disabled={status === 'loading' || status === 'success'}
                />
              </div>
              <div className="relative flex items-center w-full">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="YOUR EMAIL"
                  className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors duration-200"
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
              </div>
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
