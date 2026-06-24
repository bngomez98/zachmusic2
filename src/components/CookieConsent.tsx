import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Settings, Check, X } from 'lucide-react';
import { logConsent } from '../lib/supabase';

export interface ConsentPrefs {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: number;
}

const STORAGE_KEY = 'zw_consent';
const VERSION = 1;

export function getConsent(): ConsentPrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPrefs;
    if (parsed.version !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(prefs: Omit<ConsentPrefs, 'essential' | 'timestamp' | 'version'>) {
  const full: ConsentPrefs = {
    essential: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    timestamp: new Date().toISOString(),
    version: VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent('zw:consent', { detail: full }));

  // Update GTM/gtag consent mode in real-time.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _gtag = (window as any).gtag;
    if (typeof _gtag === 'function') {
      _gtag('consent', 'update', {
        analytics_storage: full.analytics ? 'granted' : 'denied',
        ad_storage: full.marketing ? 'granted' : 'denied',
        ad_user_data: full.marketing ? 'granted' : 'denied',
        ad_personalization: full.marketing ? 'granted' : 'denied',
      });
    }
  } catch { /* non-critical */ }

  // Fire-and-forget remote audit log (non-blocking).
  void logConsent({ analytics: full.analytics, marketing: full.marketing });
  return full;
}

interface Props {
  onOpenPolicy?: () => void;
}

export default function CookieConsent({ onOpenPolicy }: Props) {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const existing = getConsent();
      if (!existing) setVisible(true);
      else {
        setAnalytics(existing.analytics);
        setMarketing(existing.marketing);
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = () => {
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener('zw:open-consent', handler);
    return () => window.removeEventListener('zw:open-consent', handler);
  }, []);

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
  };
  const rejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
  };
  const savePrefs = () => {
    saveConsent({ analytics, marketing });
    setVisible(false);
    setShowPrefs(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[150]"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <div className="bg-surface/95 backdrop-blur-lg border border-accent/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full border border-accent/40 flex items-center justify-center flex-shrink-0">
                  <Cookie size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base text-text-main tracking-tight">We value your privacy</h3>
                  <p className="text-text-muted text-xs mt-1 leading-relaxed">
                    We use essential cookies to make this site work and, with your permission, optional cookies for
                    analytics and to improve your experience.{' '}
                    {onOpenPolicy && (
                      <button onClick={onOpenPolicy} className="text-accent hover:underline">Cookie Policy</button>
                    )}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {showPrefs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 my-4 pt-3 border-t border-white/5">
                      <Row label="Essential" desc="Required for the site to function." checked disabled />
                      <Row
                        label="Analytics"
                        desc="Anonymous usage data so we can improve the site."
                        checked={analytics}
                        onChange={setAnalytics}
                      />
                      <Row
                        label="Marketing"
                        desc="Newsletter performance and remarketing pixels."
                        checked={marketing}
                        onChange={setMarketing}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap gap-2 mt-4">
                {!showPrefs ? (
                  <>
                    <button
                      onClick={acceptAll}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-accent text-base text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Accept All
                    </button>
                    <button
                      onClick={rejectAll}
                      className="flex-1 min-w-[120px] px-4 py-2.5 border border-text-muted/30 text-text-main text-xs font-semibold uppercase tracking-wider rounded-md hover:border-accent hover:text-accent transition-colors"
                    >
                      Reject Non-Essential
                    </button>
                    <button
                      onClick={() => setShowPrefs(true)}
                      className="flex-1 min-w-[120px] px-4 py-2.5 text-text-muted text-xs font-semibold uppercase tracking-wider rounded-md hover:text-accent transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings size={14} /> Manage
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={savePrefs}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-accent text-base text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Save Preferences
                    </button>
                    <button
                      onClick={() => setShowPrefs(false)}
                      className="px-4 py-2.5 text-text-muted text-xs font-semibold uppercase tracking-wider rounded-md hover:text-accent transition-colors"
                      aria-label="Back"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-70' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 accent-accent w-4 h-4"
      />
      <span className="flex-1">
        <span className="text-text-main text-xs font-semibold uppercase tracking-wider block">{label}{disabled && ' (Always On)'}</span>
        <span className="text-text-muted text-[11px] leading-relaxed">{desc}</span>
      </span>
    </label>
  );
}
