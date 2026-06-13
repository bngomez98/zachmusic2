import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  venue: string;
  location: string;
  hours: string;
  budget: string;
  message: string;
  consent: boolean;
}

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  eventDate: '',
  eventType: 'Private Event',
  venue: '',
  location: '',
  hours: '',
  budget: '',
  message: '',
  consent: false,
};

export default function BookingSection() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Please enter a valid email.';
    if (!form.eventDate) return 'Please select a tentative event date.';
    if (!form.message.trim()) return 'Please include a brief message about your event.';
    if (!form.consent) return 'Please agree to the privacy policy to continue.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrMsg(err); setStatus('error'); return; }
    setStatus('sending');
    setErrMsg('');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
      setErrMsg('We couldn\'t submit your inquiry right now. Please email mgmt@zacharywalkermusic.com.');
    }
  };

  return (
    <section id="booking" className="bg-base py-32 text-text-main relative overflow-hidden border-t border-text-muted/10">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-12 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60"></span>
            Hire
            <span className="w-4 h-[1px] bg-accent/60"></span>
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">Book a Show</h2>
          <div className="w-10 h-[1px] bg-accent/40" />
          <p className="text-text-muted text-base max-w-xl">
            Weddings, private parties, restaurant residencies, corporate events — submit a few details and I'll reach
            out within 48 hours.
          </p>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-accent/40 bg-accent/5 rounded-2xl p-12 text-center"
          >
            <CheckCircle size={40} className="text-accent mx-auto mb-4" />
            <h3 className="font-display text-2xl text-text-main mb-2">Inquiry received</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto">
              Thanks — your booking inquiry has been sent. Expect a reply at <span className="text-accent">{form.email || 'your email'}</span> within 48 hours.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 text-xs uppercase tracking-widest text-text-muted hover:text-accent transition-colors"
            >
              Submit another
            </button>
          </motion.div>
        ) : (
          <form onSubmit={onSubmit} className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Your Name *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputCls}
                required
                autoComplete="name"
              />
            </Field>
            <Field label="Email *">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputCls}
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Phone (optional)">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputCls}
                autoComplete="tel"
              />
            </Field>
            <Field label="Event Type">
              <select
                value={form.eventType}
                onChange={(e) => update('eventType', e.target.value)}
                className={inputCls}
              >
                <option>Private Event</option>
                <option>Wedding / Ceremony</option>
                <option>Restaurant / Venue Residency</option>
                <option>Corporate Event</option>
                <option>Festival / Public Show</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Event Date *">
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => update('eventDate', e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Approx. Hours of Performance">
              <input
                type="text"
                placeholder="e.g. 3 hours, 6:30pm–9:30pm"
                value={form.hours}
                onChange={(e) => update('hours', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Venue Name">
              <input
                type="text"
                value={form.venue}
                onChange={(e) => update('venue', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="City / Location">
              <input
                type="text"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Budget Range (optional)" full>
              <input
                type="text"
                placeholder="Helps me tailor a fair quote"
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Tell me about your event *" full>
              <textarea
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                className={`${inputCls} min-h-[120px] resize-y`}
                required
              />
            </Field>

            <div className="md:col-span-2 flex items-start gap-3 text-xs text-text-muted">
              <input
                id="consent"
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update('consent', e.target.checked)}
                className="mt-0.5 accent-accent w-4 h-4"
              />
              <label htmlFor="consent" className="leading-relaxed">
                I agree to be contacted about this inquiry and acknowledge the Privacy Policy. Submitted details are
                stored solely for the purpose of responding to this booking request.
              </label>
            </div>

            {status === 'error' && errMsg && (
              <div className="md:col-span-2 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={14} /> {errMsg}
              </div>
            )}

            <div className="md:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-accent text-base px-8 py-4 font-semibold text-sm uppercase tracking-widest rounded-md hover:bg-accent/90 disabled:opacity-60 transition-colors"
              >
                {status === 'sending' ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={16} /> Submit Inquiry</>
                )}
              </button>
              <a
                href="mailto:mgmt@zacharywalkermusic.com"
                className="inline-flex items-center justify-center gap-2 text-text-muted hover:text-accent transition-colors text-xs uppercase tracking-widest"
              >
                <Mail size={14} /> Or email directly
              </a>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-4 border-t border-white/5">
              <Tag icon={<Calendar size={14} />} label="48-hour reply" />
              <Tag icon={<MapPin size={14} />} label="Topeka & surrounding KS" />
              <Tag icon={<Mail size={14} />} label="mgmt@zacharywalkermusic.com" />
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

const inputCls =
  'w-full bg-base/60 border border-white/5 rounded-md px-4 py-3 text-sm text-text-main placeholder-text-muted/40 focus:border-accent/60 focus:outline-none transition-colors';

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-[10px] uppercase tracking-[0.18em] text-text-muted/80 font-mono mb-2">{label}</label>
      {children}
    </div>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-text-muted/80">
      <span className="text-accent">{icon}</span> {label}
    </div>
  );
}
