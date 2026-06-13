import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Music, Calendar, Image as ImageIcon, Mail, BookOpen, Coffee } from 'lucide-react';
import { SHOWS, RELEASES } from '../data';

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  body?: string;
  anchor: string;
  type: 'show' | 'release' | 'page' | 'action';
  icon: React.ReactNode;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenLegal?: (doc: 'privacy' | 'terms' | 'copyright' | 'cookies') => void;
  onOpenTip?: () => void;
}

export default function SearchModal({ open, onClose, onOpenLegal, onOpenTip }: Props) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [
      { id: 'about', title: 'About the Artist', subtitle: 'Bio & background', anchor: '#about', type: 'page', icon: <BookOpen size={16} /> },
      { id: 'music', title: 'Music & Discography', subtitle: 'Originals and releases', anchor: '#music', type: 'page', icon: <Music size={16} /> },
      { id: 'shows', title: 'Upcoming Shows', subtitle: 'Live performances', anchor: '#shows', type: 'page', icon: <Calendar size={16} /> },
      { id: 'gallery', title: 'Gallery', subtitle: 'Photos & reels', anchor: '#gallery', type: 'page', icon: <ImageIcon size={16} /> },
      { id: 'booking', title: 'Book a Show', subtitle: 'Hire for your event', anchor: '#booking', type: 'page', icon: <Calendar size={16} /> },
      { id: 'contact', title: 'Contact & Newsletter', subtitle: 'Get in touch', anchor: '#contact', type: 'page', icon: <Mail size={16} /> },
    ];
    SHOWS.forEach((s) => items.push({
      id: `show-${s.id}`,
      title: s.title,
      subtitle: `${s.date} · ${s.location}`,
      body: s.amenities,
      anchor: '#shows',
      type: 'show',
      icon: <Calendar size={16} />,
    }));
    RELEASES.forEach((r) => items.push({
      id: `release-${r.id}`,
      title: r.title,
      subtitle: r.subtitle,
      body: r.description,
      anchor: '#music',
      type: 'release',
      icon: <Music size={16} />,
    }));
    items.push(
      { id: 'tip', title: 'Buy Me a Coffee', subtitle: 'Support via PayPal, Cash App, Venmo', anchor: 'action:tip', type: 'action', icon: <Coffee size={16} /> },
      { id: 'privacy', title: 'Privacy Policy', subtitle: 'How your data is handled', anchor: 'action:privacy', type: 'action', icon: <BookOpen size={16} /> },
      { id: 'terms', title: 'Terms & Conditions', subtitle: 'Site terms of use', anchor: 'action:terms', type: 'action', icon: <BookOpen size={16} /> },
      { id: 'copyright', title: 'Copyright & Licensing', subtitle: 'Rights and licensing', anchor: 'action:copyright', type: 'action', icon: <BookOpen size={16} /> },
      { id: 'cookies', title: 'Cookie Policy', subtitle: 'Cookies and tracking', anchor: 'action:cookies', type: 'action', icon: <BookOpen size={16} /> },
    );
    return items;
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return index.slice(0, 8);
    return index
      .map((item) => {
        const hay = `${item.title} ${item.subtitle ?? ''} ${item.body ?? ''}`.toLowerCase();
        let score = 0;
        for (const word of query.split(/\s+/)) {
          if (!word) continue;
          if (item.title.toLowerCase().startsWith(word)) score += 4;
          if (item.title.toLowerCase().includes(word)) score += 2;
          if (hay.includes(word)) score += 1;
        }
        return { item, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((r) => r.item);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      if (e.key === 'Enter' && results[active]) { e.preventDefault(); pick(results[active]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, active, onClose]);

  const pick = (item: SearchItem) => {
    if (item.anchor.startsWith('action:')) {
      const action = item.anchor.slice('action:'.length);
      if (action === 'tip') onOpenTip?.();
      else onOpenLegal?.(action as 'privacy' | 'terms' | 'copyright' | 'cookies');
    } else {
      const el = document.querySelector(item.anchor);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
              <Search size={18} className="text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                placeholder="Search shows, music, pages..."
                className="flex-1 bg-transparent outline-none text-text-main placeholder-text-muted/50 text-sm"
                aria-label="Search query"
              />
              <kbd className="hidden sm:inline-flex text-[10px] uppercase tracking-widest text-text-muted/60 font-mono border border-white/10 px-2 py-0.5 rounded">Esc</kbd>
              <button
                onClick={onClose}
                aria-label="Close search"
                className="text-text-muted hover:text-accent transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-5 py-10 text-center text-text-muted text-sm">
                  No matches for <span className="text-accent">"{q}"</span>
                </div>
              ) : (
                <ul role="listbox">
                  {results.map((item, i) => (
                    <li key={item.id}>
                      <button
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => pick(item)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                          i === active ? 'bg-accent/10 text-text-main' : 'text-text-muted hover:bg-white/[0.02]'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${i === active ? 'border-accent/40 text-accent' : 'border-white/5 text-text-muted'}`}>
                          {item.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate text-text-main">{item.title}</span>
                          {item.subtitle && (
                            <span className="block text-[11px] text-text-muted truncate">{item.subtitle}</span>
                          )}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted/50 font-mono">{item.type}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-5 py-3 border-t border-white/5 text-[10px] uppercase tracking-[0.18em] text-text-muted/50 font-mono flex justify-between">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
