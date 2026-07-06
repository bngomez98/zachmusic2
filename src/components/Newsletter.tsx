import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeNewsletter, isEmail } from '../lib/supabase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'already' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setErrMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrMsg('');
    try {
      const result = await subscribeNewsletter({ email, source: 'newsletter-hero' });
      setStatus(result.alreadySubscribed ? 'already' : 'success');
      if (!result.alreadySubscribed) setEmail('');
    } catch (err) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="bg-base py-16 relative overflow-hidden border-t border-text-muted/10">
      <div className="absolute inset-0 bg-gradient-to-b from-base via-surface/30 to-base pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 lg:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent leading-relaxed mb-4">
            <span className="w-4 h-[1px] bg-accent/60" />
            Stay Connected
            <span className="w-4 h-[1px] bg-accent/60" />
          </span>

          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-text-main mb-3">
            Get show dates & new music first
          </h2>
          <p className="text-text-muted text-sm max-w-md mx-auto mb-8">
            No spam — just upcoming shows, new releases, and the occasional behind-the-scenes update.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-accent text-sm"
            >
              <CheckCircle size={18} />
              <span>You're in — check your inbox for a welcome note.</span>
            </motion.div>
          ) : status === 'already' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-accent text-sm"
            >
              <CheckCircle size={18} />
              <span>You're already subscribed — thanks for being here.</span>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full bg-surface/80 border border-white/5 rounded-md pl-11 pr-4 py-3.5 text-sm text-text-main placeholder-text-muted/40 focus:border-accent/60 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center gap-2 bg-accent text-base px-6 py-3.5 font-semibold text-sm uppercase tracking-widest rounded-md hover:bg-accent/90 disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}

          {status === 'error' && errMsg && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-xs mt-3">
              <AlertCircle size={14} /> {errMsg}
            </div>
          )}

          <p className="text-text-muted/40 text-[10px] mt-4 tracking-wide">
            Unsubscribe anytime. We respect your privacy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
