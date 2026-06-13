import { Instagram, Facebook, Youtube, Radio, Menu, X } from 'lucide-react';
import { Instagram, Facebook, Menu, X, Search, Coffee } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LINKS } from '../data';

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  );
}

export default function Nav() {
interface Props {
  onOpenSearch: () => void;
  onOpenTip: () => void;
}

export default function Nav({ onOpenSearch, onOpenTip }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenSearch]);

  const navLinks = [
    { name: 'ABOUT', href: '#about' },
    { name: 'MUSIC', href: '#music' },
    { name: 'SHOWS', href: '#shows' },
    { name: 'BOOKING', href: '#booking' },
    { name: 'LINKS', href: '#links' },
  ];

  const socialIcons = [
    { href: LINKS.instagram, Icon: Instagram, label: 'Instagram' },
    { href: LINKS.tiktok, Icon: TikTokIcon, label: 'TikTok' },
    { href: LINKS.youtube, Icon: Youtube, label: 'YouTube' },
    { href: LINKS.twitch, Icon: Radio, label: 'Twitch' },
    { href: LINKS.facebook, Icon: Facebook, label: 'Facebook' },
    { name: 'BOOK', href: '#booking' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-base/90 backdrop-blur-md py-4 border-b border-text-muted/10' : 'bg-transparent py-6 border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 group z-50">
            <div className="w-8 h-8 flex items-center justify-center border border-accent/40 rounded-full group-hover:border-accent group-hover:bg-accent/10 transition-all duration-300">
              <span className="font-display text-accent text-[17px] leading-none mt-[2px] ml-[1px]">Z</span>
            </div>
            <span className="text-[17px] font-display font-medium tracking-[0.18em] text-text-main group-hover:text-accent transition-colors uppercase mt-1 hidden sm:block">Zachary Walker</span>
          </a>

          <div className="hidden lg:flex gap-6 items-center">
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-xs font-medium tracking-[0.2em] text-text-muted hover:text-accent transition-colors">
                {link.name}
              </a>
            ))}
            <div className="w-px h-4 bg-text-muted/30 mx-1" />
            {socialIcons.map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-text-muted hover:text-accent transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>

          <button className="lg:hidden text-text-main" onClick={() => setIsOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
            <button
              onClick={onOpenSearch}
              aria-label="Search"
              className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs"
            >
              <Search size={16} />
              <kbd className="text-[9px] uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>
            <button
              onClick={onOpenTip}
              className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent text-[10px] font-semibold uppercase tracking-widest px-3 py-2 rounded-full hover:bg-accent hover:text-base transition-all"
            >
              <Coffee size={12} /> Tip
            </button>
            <div className="w-px h-4 bg-text-muted/30" />
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-text-muted hover:text-accent transition-colors">
              <Instagram size={18} />
            </a>
            <a href={LINKS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-text-muted hover:text-accent transition-colors">
              <Facebook size={18} />
            </a>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={onOpenSearch} aria-label="Search" className="text-text-main p-2">
              <Search size={20} />
            </button>
            <button className="text-text-main p-2" onClick={() => setIsOpen(true)} aria-label="Menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-base flex flex-col items-center justify-center px-6"
          >
            <button className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors" onClick={() => setIsOpen(false)} aria-label="Close menu">
            <button className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors p-2" onClick={() => setIsOpen(false)} aria-label="Close menu">
              <X size={32} />
            </button>
            <div className="flex flex-col items-center gap-8 w-full">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-3xl font-display font-medium tracking-widest text-text-main hover:text-accent transition-colors">
                  {link.name}
                </a>
              ))}
              <div className="w-16 h-px bg-text-muted/30 my-2" />
              <div className="flex gap-6 flex-wrap justify-center">
                {socialIcons.map(({ href, Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-text-muted hover:text-accent transition-colors">
                    <Icon size={26} />
                  </a>
                ))}
              <button
                onClick={() => { setIsOpen(false); onOpenTip(); }}
                className="inline-flex items-center gap-2 bg-accent text-base px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest mt-2"
              >
                <Coffee size={14} /> Buy Me a Coffee
              </button>
              <div className="w-16 h-px bg-text-muted/30 my-2" />
              <div className="flex gap-8">
                <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-text-muted hover:text-accent transition-colors">
                  <Instagram size={28} />
                </a>
                <a href={LINKS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-text-muted hover:text-accent transition-colors">
                  <Facebook size={28} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
