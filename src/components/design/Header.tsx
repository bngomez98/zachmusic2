import React, { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#releases', label: 'Releases' },
  { href: '#shows', label: 'Shows' },
  { href: '#about', label: 'About' },
  { href: '#booking', label: 'Book a Show' },
  { href: '#contact', label: 'Contact' },
];

interface Props {
  onOpenTip?: () => void;
}

export default function Header({ onOpenTip }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full border-b border-text-muted/10 bg-base/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <a href="#" className="font-display text-xl font-medium text-accent tracking-tight">
          Zachary Walker
        </a>

        <nav className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-text-muted hover:text-accent transition-colors tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {onOpenTip && (
            <button
              type="button"
              onClick={onOpenTip}
              className="hidden sm:inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs uppercase tracking-widest"
            >
              <Heart size={14} /> Support
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-muted hover:text-accent transition-colors p-1"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-text-muted/10 bg-base px-6 py-4 space-y-3">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-text-muted hover:text-accent transition-colors tracking-wide py-1"
            >
              {l.label}
            </a>
          ))}
          {onOpenTip && (
            <button
              type="button"
              onClick={() => { onOpenTip(); setMobileOpen(false); }}
              className="flex items-center gap-2 text-accent text-sm tracking-wide py-1"
            >
              <Heart size={14} /> Support the Music
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
