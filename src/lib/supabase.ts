const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && EMAIL_RE.test(v.trim());

export const isSupabaseConfigured = (): boolean => true;

export interface SubscribeArgs {
  name?: string;
  email: string;
  source?: string;
}

export interface BookingArgs {
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate: string;
  venue?: string;
  location?: string;
  hours?: string;
  budget?: string;
  message: string;
}

export interface ContactArgs {
  name?: string;
  email: string;
  message: string;
}

export interface ConsentArgs {
  analytics: boolean;
  marketing: boolean;
  fingerprint?: string;
}

async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submission failed. Please try again.');
  return data;
}

export async function subscribeNewsletter({ name, email, source = 'web' }: SubscribeArgs) {
  if (!isEmail(email)) throw new Error('Please enter a valid email address.');
  const data = await apiPost('/api/subscribe', {
    name: name?.trim() || null,
    email: email.trim().toLowerCase(),
    source,
  });
  return { ok: true, alreadySubscribed: data.message === 'Already subscribed' };
}

export async function submitBooking(args: BookingArgs) {
  if (!args.name?.trim()) throw new Error('Please enter your name.');
  if (!isEmail(args.email)) throw new Error('Please enter a valid email.');
  if (!args.eventDate) throw new Error('Please choose an event date.');
  if (!args.message?.trim()) throw new Error('Please include a brief message.');

  await apiPost('/api/booking', {
    name: args.name.trim(),
    email: args.email.trim().toLowerCase(),
    phone: args.phone?.trim() || null,
    eventType: args.eventType?.trim() || null,
    eventDate: args.eventDate?.trim() || null,
    venue: args.venue?.trim() || null,
    location: args.location?.trim() || null,
    hours: args.hours?.trim() || null,
    budget: args.budget?.trim() || null,
    message: args.message.trim(),
  });
  return { ok: true };
}

export async function submitContact(args: ContactArgs) {
  if (!isEmail(args.email)) throw new Error('Please enter a valid email.');
  if (!args.message?.trim()) throw new Error('Please include a message.');
  await apiPost('/api/contact', {
    name: args.name?.trim() || null,
    email: args.email.trim().toLowerCase(),
    message: args.message.trim(),
  });
  return { ok: true };
}

export async function logConsent(args: ConsentArgs) {
  try {
    await apiPost('/api/consent', {
      fingerprint: args.fingerprint?.slice(0, 64) || null,
      analytics: args.analytics,
      marketing: args.marketing,
    });
  } catch {
    // Non-critical — consent is also stored in localStorage.
  }
}
