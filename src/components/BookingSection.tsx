import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  MapPin,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Music,
  Users,
  Clock,
  Shield,
} from 'lucide-react';
import { submitBooking, isEmail } from '../lib/supabase';

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

const EVENT_TYPES = [
  'Private Event',
  'Wedding / Ceremony',
  'Restaurant / Venue Residency',
  'Corporate Event',
  'Festival / Public Show',
  'House Concert',
  'Other',
];

export default function BookingSection() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!isEmail(form.email)) return 'Please enter a valid email.';
    if (!form.eventDate) return 'Please select a tentative event date.';
    if (!form.message.trim()) return 'Please include a brief message about your event.';
    if (!form.consent) return 'Please agree to the privacy policy to continue.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrMsg(err);
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrMsg('');
    try {
      await submitBooking(form);
      setStatus('success');
      setForm(INITIAL);
    } catch (e) {
      setStatus('error');
      setErrMsg(
        e instanceof Error
          ? e.message
          : "We couldn't submit your inquiry right now. Please email mgmt@zacharywalkermusic.com.",
      );
    }
  };

  return (
    <section
      id="booking"
      className="bg-base py-32 text-text-main relative overflow-hidden border-t border-text-muted/10"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full filter blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-accent/[0.03] rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60"></span>
            Hire
            <span className="w-4 h-[1px] bg-accent/60"></span>
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">
            Book a Show
          </h2>
          <div className="w-10 h-[1px] bg-accent/40" />
          <p className="text-text-muted text-base max-w-2xl">
            Weddings, private parties, restaurant residencies, corporate events — share a few
            details and you'll have a personal reply within 48 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Form column */}
          <div>
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-accent/40 bg-accent/5 rounded-2xl p-12 text-center"
              >
                <CheckCircle size={40} className="text-accent mx-auto mb-4" />
                <h3 className="font-display text-2xl text-text-main mb-2">Inquiry received</h3>
                <p className="text-text-muted text-sm max-w-md mx-auto">
                  Thanks — your booking inquiry is in. Expect a personal reply within 48 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-xs uppercase tracking-widest text-text-muted hover:text-accent transition-colors"
                >
                  Submit another →
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-5"
                noValidate
              >
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
                    {EVENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
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
                <Field label="Set Length / Hours">
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
                    placeholder="Helps tailor a fair quote"
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
                    placeholder="Indoor or outdoor? Number of guests? Specific song requests? The more I know, the better the set."
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
                    I agree to be contacted about this inquiry and acknowledge the Privacy
                    Policy. Submitted details are stored solely for the purpose of responding to
                    this booking request.
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
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Submit Inquiry
                      </>
                    )}
                  </button>
                  <a
                    href="mailto:booking@zacharywalkermusic.com"
                    className="inline-flex items-center justify-center gap-2 text-text-muted hover:text-accent transition-colors text-xs uppercase tracking-widest"
                  >
                    <Mail size={14} /> Or email directly
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar info column */}
          <aside className="flex flex-col gap-6">
            <div className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="font-display text-lg text-accent mb-1 tracking-tight">What's included</h3>
              <p className="text-text-muted text-[11px] uppercase tracking-[0.18em] font-mono mb-5">Base package</p>
              <ul className="space-y-3 text-sm text-text-muted">
                <Bullet>Solo acoustic performance — vocals + guitar</Bullet>
                <Bullet>Curated mix of originals, covers, and live requests</Bullet>
                <Bullet>Self-contained PA suitable for &lt; 150 guests</Bullet>
                <Bullet>Pre-event setlist consult by email</Bullet>
                <Bullet>Liability-insurance documentation on request</Bullet>
              </ul>
            </div>

            <div className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="font-display text-lg text-accent mb-4 tracking-tight">Logistics</h3>
              <div className="space-y-4">
                <Spec icon={<Clock size={14} />} label="Set length" value="60 min · 90 min · 3 hr" />
                <Spec icon={<MapPin size={14} />} label="Travel" value="Topeka + surrounding KS" />
                <Spec icon={<Users size={14} />} label="Audience size" value="Up to ~150 (PA included)" />
                <Spec icon={<Music size={14} />} label="Genre fit" value="Country · Folk · Singer-songwriter" />
                <Spec icon={<Calendar size={14} />} label="Reply time" value="Within 48 hours" />
                <Spec icon={<Shield size={14} />} label="Deposit" value="50% on booking, balance day-of" />
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/30 rounded-2xl p-6">
              <p className="text-text-main text-sm font-medium mb-1">Got a quick question?</p>
              <p className="text-text-muted text-xs leading-relaxed mb-4">
                Not ready to fill out the full form? Email and I'll reply personally.
              </p>
              <a
                href="mailto:booking@zacharywalkermusic.com"
                className="inline-flex items-center gap-2 text-accent text-xs uppercase tracking-[0.2em] font-semibold hover:gap-3 transition-all"
              >
                <Mail size={14} /> booking@zacharywalkermusic.com
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

const inputCls =
  'w-full bg-base/60 border border-white/5 rounded-md px-4 py-3 text-sm text-text-main placeholder-text-muted/40 focus:border-accent/60 focus:outline-none transition-colors';

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-[10px] uppercase tracking-[0.18em] text-text-muted/80 font-mono mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 leading-relaxed">
      <span className="text-accent mt-1.5 w-1 h-1 rounded-full bg-accent flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-muted/70 font-mono">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      <span className="text-xs text-text-main font-medium text-right">{value}</span>
    </div>
  );
}
