import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface Props {
  source?: string;
}

export default function NewsletterSignup({ source = 'hero' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => setStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrMsg('');

    try {
      const resp = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setStatus('success');
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', 'newsletter_signup', { source });
        }
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

  return (
    <section className="w-full bg-base py-20 border-t border-white/5">
      <div className="max-w-2xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight mb-4">
            Stay Updated
          </h2>
          <p className="text-text-muted mb-8 text-lg">
            Get notified about new releases, upcoming shows, and exclusive content.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-surface/50 border border-white/10 rounded-lg px-4 py-3 outline-none text-sm text-text-main placeholder-text-muted/50 focus:border-accent transition-colors disabled:opacity-50"
                required
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="bg-accent text-base px-8 py-3 rounded-lg font-semibold text-[14px] uppercase tracking-wider hover:bg-accent/90 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>

            {status === 'success' && (
              <p className="text-accent text-sm">Thanks! Check your inbox for a welcome email.</p>
            )}
            {status === 'error' && <p className="text-red-400 text-sm">{errMsg}</p>}
          </form>

          <p className="text-[12px] text-text-muted/50 mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
