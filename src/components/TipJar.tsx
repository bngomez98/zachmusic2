import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Copy, Check, ExternalLink, Music2 } from 'lucide-react';

const HANDLE = 'fullmetalzcw';

const SERVICES = [
  {
    name: 'PayPal',
    handle: `@${HANDLE}`,
    url: `https://www.paypal.com/paypalme/${HANDLE}`,
    color: 'from-[#0070BA] to-[#003087]',
    icon: 'P',
  },
  {
    name: 'Cash App',
    handle: `$${HANDLE}`,
    url: `https://cash.app/$${HANDLE}`,
    color: 'from-[#00D632] to-[#008E20]',
    icon: '$',
  },
  {
    name: 'Venmo',
    handle: `@${HANDLE}`,
    url: `https://venmo.com/u/${HANDLE}`,
    color: 'from-[#3D95CE] to-[#0074DE]',
    icon: 'V',
  },
];

const PRESETS = [3, 5, 10, 25];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TipJar({ open, onClose }: Props) {
  const [amount, setAmount] = useState<number | string>(5);
  const [copied, setCopied] = useState<string | null>(null);

  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;

  const tipUrl = (svc: typeof SERVICES[number]) => {
    if (svc.name === 'PayPal') return `${svc.url}/${numAmount}USD`;
    if (svc.name === 'Cash App') return `${svc.url}/${numAmount}`;
    if (svc.name === 'Venmo') {
      const params = new URLSearchParams({
        txn: 'pay',
        audience: 'public',
        recipients: HANDLE,
        amount: String(numAmount),
        note: 'Supporting Zachary Walker Music',
      });
      return `https://venmo.com/?${params.toString()}`;
    }
    return svc.url;
  };

  const copyHandle = async (svcName: string, handle: string) => {
    try {
      await navigator.clipboard.writeText(handle);
      setCopied(svcName);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tip-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <Music2 size={16} className="text-accent" />
                </div>
                <div>
                  <h3 id="tip-title" className="font-display text-xl text-text-main tracking-tight">Support the Music</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted/70 font-mono">Keep the songs coming</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-text-muted hover:text-accent transition-colors p-2 rounded-full hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-text-muted text-xs mb-5 leading-relaxed">
                Independent music is fueled by community. If something you heard moved you, a tip keeps the strings
                fresh and the next song on its way.
              </p>

              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-[0.18em] text-text-muted/80 font-mono mb-2">Amount (USD)</label>
                <div className="flex gap-2 mb-3">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                        numAmount === p
                          ? 'bg-accent text-base border-accent font-semibold'
                          : 'border-white/10 text-text-muted hover:border-accent/40 hover:text-accent'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-base/60 border border-white/5 rounded-md pl-7 pr-4 py-2.5 text-sm text-text-main focus:border-accent/60 focus:outline-none"
                    placeholder="Custom amount"
                    aria-label="Tip amount"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {SERVICES.map((svc) => (
                  <div
                    key={svc.name}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border border-white/5 bg-base/40 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${svc.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {svc.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text-main font-medium">{svc.name}</p>
                        <p className="text-[11px] text-text-muted font-mono truncate">{svc.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => copyHandle(svc.name, svc.handle)}
                        title="Copy handle"
                        aria-label={`Copy ${svc.name} handle`}
                        className="p-2 text-text-muted hover:text-accent transition-colors rounded-md"
                      >
                        {copied === svc.name ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                      </button>
                      <a
                        href={tipUrl(svc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-accent text-base px-3 py-2 rounded-md text-[11px] uppercase tracking-widest font-semibold hover:bg-accent/90 transition-colors"
                      >
                        Tip <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-text-muted/60 font-mono mt-6">
                <Heart size={10} className="text-accent fill-accent" /> Thank you for listening
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
