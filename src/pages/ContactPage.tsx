import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Instagram,
  Facebook,
  Mail,
  ArrowRight,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { LINKS } from '@/data';
import { isEmail, submitContact, subscribeNewsletter } from '@/lib/supabase';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlName, setNlName] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [nlErr, setNlErr] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const onContact = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!isEmail(email)) {
      setErrMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    // Validate message
    if (!message.trim()) {
      setErrMsg('Please include a message.');
      setStatus('error');
      return;
    }

    // Prevent double submission
    if (status === 'sending') return;

    setStatus('sending');
    setErrMsg('');

    try {
      await submitContact({
        name: name.trim() || undefined,
        email: email.trim().toLowerCase(),
        message: message.trim(),
      });

      setStatus('success');

      // Clear inputs
      setName('');
      setEmail('');
      setMessage('');

      // Auto-reset after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Unable to send message. Please try again.');
    }
  };

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!isEmail(nlEmail)) {
      setNlErr('Please enter a valid email address.');
      setNlStatus('error');
      return;
    }

    // Prevent double submission
    if (nlStatus === 'loading') return;

    setNlStatus('loading');
    setNlErr('');

    try {
      const result = await subscribeNewsletter({
        name: nlName.trim() || undefined,
        email: nlEmail.trim().toLowerCase(),
        source: 'contact-page',
      });

      setNlStatus('success');

      // Clear inputs
      setNlName('');
      setNlEmail('');

      // Auto-reset after 4 seconds
      setTimeout(() => setNlStatus('idle'), 4000);
    } catch (err) {
      setNlStatus('error');
      setNlErr(err instanceof Error ? err.message : 'Unable to subscribe. Please try again.');
    }
  };

  return (
    <section className="bg-base pt-32 pb-24 text-text-main min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60" />
            Get in Touch
            <span className="w-4 h-[1px] bg-accent/60" />
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">
            Contact
          </h1>
          <div className="w-10 h-[1px] bg-accent/40" />
          <p className="text-text-muted text-base max-w-2xl">
            Reach out below or email directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {status === 'success' ? (
              <div className="bg-surface/60 border border-accent/30 rounded-2xl p-12 text-center">
                <CheckCircle size={40} className="text-accent mx-auto mb-4" />
                <h3 className="font-display text-2xl text-text-main mb-2">Message sent</h3>
                <p className="text-text-muted text-sm">Thanks for reaching out — I'll get back to you soon.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 text-xs uppercase tracking-widest text-text-muted hover:text-accent transition-colors">
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={onContact} className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-10 flex flex-col gap-5">
                <h3 className="font-display text-xl text-accent mb-1">Send a Message</h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-text-muted/80 font-mono mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-base/60 border border-white/5 rounded-md px-4 py-3 text-sm text-text-main placeholder-text-muted/40 focus:border-accent/60 focus:outline-none transition-colors"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-text-muted/80 font-mono mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                    className="w-full bg-base/60 border border-white/5 rounded-md px-4 py-3 text-sm text-text-main placeholder-text-muted/40 focus:border-accent/60 focus:outline-none transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-text-muted/80 font-mono mb-2">Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-base/60 border border-white/5 rounded-md px-4 py-3 text-sm text-text-main placeholder-text-muted/40 focus:border-accent/60 focus:outline-none transition-colors min-h-[140px] resize-y"
                    required
                  />
                </div>

                {status === 'error' && errMsg && (
                  <div role="alert" className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle size={14} /> {errMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex items-center justify-center gap-2 bg-accent text-base px-8 py-4 font-semibold text-sm uppercase tracking-widest rounded-md hover:bg-accent/90 disabled:opacity-60 transition-colors"
                >
                  {status === 'sending' ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            {/* Direct contact */}
            <div className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="font-display text-lg text-accent mb-4 tracking-tight">Direct Contact</h3>
              <a
                href="mailto:mgmt@zacharywalkermusic.com"
                className="flex items-center gap-3 text-text-muted hover:text-accent transition-colors text-sm mb-4"
              >
                <Mail size={16} /> mgmt@zacharywalkermusic.com
              </a>
              <div className="flex items-center gap-4">
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                  <Instagram size={20} />
                </a>
                <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-text-muted hover:text-accent transition-colors p-2 border border-white/5 rounded-full hover:border-accent/30 bg-surface/50">
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="font-display text-lg text-accent mb-2 tracking-tight">Newsletter</h3>
              <p className="text-sm text-text-muted mb-5">Show dates, new releases, and occasional updates.</p>
              {nlStatus === 'success' ? (
                <p className="text-accent text-xs flex items-center gap-2"><CheckCircle size={14} /> Subscribed.</p>
              ) : (
                <form onSubmit={onSubscribe} className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={nlName}
                    onChange={(e) => setNlName(e.target.value)}
                    placeholder="YOUR NAME"
                    className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors duration-200"
                    disabled={nlStatus === 'loading'}
                  />
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={nlEmail}
                      onChange={(e) => setNlEmail(e.target.value)}
                      placeholder="YOUR EMAIL"
                      className="w-full bg-transparent border-b border-text-muted/30 pb-3 outline-none text-sm tracking-wide text-text-main placeholder-text-muted/50 focus:border-accent transition-colors duration-200"
                      required
                      disabled={nlStatus === 'loading'}
                    />
                    <button type="submit" aria-label="Subscribe" className="absolute right-0 top-0 pb-3 text-text-muted hover:text-accent transition-colors disabled:opacity-50" disabled={nlStatus === 'loading'}>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  {nlStatus === 'error' && <p className="text-red-400 text-xs">{nlErr}</p>}
                </form>
              )}
            </div>

            {/* Booking CTA */}
            <div className="bg-accent/5 border border-accent/30 rounded-2xl p-6">
              <p className="text-text-main text-sm font-medium mb-1">Looking to book?</p>
              <p className="text-text-muted text-xs leading-relaxed mb-4">
                Use the booking form for event inquiries and quotes.
              </p>
              <a
                href="/booking"
                className="inline-flex items-center gap-2 text-accent text-xs uppercase tracking-[0.2em] font-semibold hover:gap-3 transition-all"
              >
                <Send size={14} /> Go to Booking Form →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
