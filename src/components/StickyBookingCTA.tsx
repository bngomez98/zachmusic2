import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, X } from 'lucide-react';

const DISMISS_KEY = 'zw_booking_cta_dismissed';

export default function StickyBookingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');

    const onScroll = () => {
      const y = window.scrollY;
      const height = window.innerHeight;
      // Show after hero (~1 viewport), hide once user is inside the booking section.
      const bookingEl = document.getElementById('booking');
      const bookingTop = bookingEl ? bookingEl.getBoundingClientRect().top + window.scrollY : Infinity;
      const inBooking = bookingEl ? y + height > bookingTop && y < bookingTop + (bookingEl.offsetHeight || 0) : false;
      setVisible(y > height * 0.85 && !inBooking);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[140] items-center gap-2 bg-surface/95 backdrop-blur-md border border-accent/40 rounded-full px-2 py-2 pl-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <Calendar size={14} className="text-accent" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-text-main font-semibold">
            Booking 2026
          </span>
          <a
            href="#booking"
            className="inline-flex items-center gap-1.5 bg-accent text-base px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-accent/90 transition-colors"
          >
            Book a Show →
          </a>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-text-muted hover:text-accent transition-colors p-1.5 rounded-full"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
