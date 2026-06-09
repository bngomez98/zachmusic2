import { Instagram, Facebook, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LINKS } from '../data';

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'MUSIC', href: '#music' },
    { name: 'SHOWS', href: '#shows' },
    { name: 'CONTACT', href: '#contact' }
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
          
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-xs font-medium tracking-[0.2em] text-text-muted hover:text-accent transition-colors">
                {link.name}
              </a>
            ))}
            <div className="w-px h-4 bg-text-muted/30 mx-2" />
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-text-muted hover:text-accent transition-colors">
              <Instagram size={18} />
            </a>
            <a href={LINKS.facebook} target="_blank" rel="noreferrer" className="text-text-muted hover:text-accent transition-colors">
              <Facebook size={18} />
            </a>
          </div>

          <button className="md:hidden text-text-main" onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </button>
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
            <button className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors" onClick={() => setIsOpen(false)}>
              <X size={32} />
            </button>
            <div className="flex flex-col items-center gap-10 w-full">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-3xl font-display font-medium tracking-widest text-text-main hover:text-accent transition-colors">
                  {link.name}
                </a>
              ))}
              <div className="w-16 h-px bg-text-muted/30 my-4" />
              <div className="flex gap-8">
                <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-text-muted hover:text-accent transition-colors">
                  <Instagram size={28} />
                </a>
                <a href={LINKS.facebook} target="_blank" rel="noreferrer" className="text-text-muted hover:text-accent transition-colors">
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
