import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Link as LinkIcon, Music, MapPin, Calendar, Mic, Quote } from 'lucide-react';
import { LINKS } from '../data';
import aboutImage from '../assets/images/regenerated_image_1781019033978.jpg';

export default function AboutSection() {
  return (
    <section id="about" className="bg-surface py-32 text-text-main relative overflow-hidden">
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start gap-16">
          <div className="flex-1 md:order-1 order-2 mt-8 md:mt-0">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent mb-6 leading-relaxed"
            >
              <span className="w-8 h-[1px] bg-accent/60"></span>
              About
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-[3.75rem] font-display font-semibold tracking-tighter leading-[1.05] text-text-main mb-8"
            >
              Songs written close to home,
              <br />
              <span className="italic text-accent/90 font-light">played wherever they're needed.</span>
            </motion.h2>

            <div className="space-y-6 text-text-muted text-base leading-relaxed font-light">
              <p className="text-text-main font-normal text-lg sm:text-xl leading-relaxed">
                I'm Zachary Walker — a singer-songwriter based in Topeka, Kansas. I write and
                perform acoustic
              </p>

              <p className="text-[15px]">
                
                <span className="text-text-main">

              <p className="text-[15px]">
                
              </p>

              <p className="text-[15px]">
                I take bookings for private events, weddings, restaurant residencies, corporate
                nights, and intimate house concerts — and I'm always open to collaboration,
                co-writes, and session work. If something in the music finds you, I'd love to
                hear from you.
              </p>
            </div>

            {/* Pull-quote */}
            <motion.figure
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="my-10 pl-6 border-l-2 border-accent/40 relative"
            >
              <Quote size={20} className="absolute -left-3 -top-1 text-accent/60 bg-surface p-0.5 rounded-full" />
              <blockquote className="text-xl md:text-2xl font-display italic text-text-main/90 leading-snug">
                "If the words are honest and the guitar's in tune, that's most of the job."
              </blockquote>
              <figcaption className="text-[11px] uppercase tracking-[0.2em] text-accent/80 font-mono mt-3">
                — Zachary Walker
              </figcaption>
            </motion.figure>

            {/* Fact pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-text-muted/10">
              <Fact icon={<MapPin size={14} />} label="Based" value="Topeka, KS" />
              <Fact icon={<Music size={14} />} label="Genre" value="Folk · Country" />
              <Fact icon={<Mic size={14} />} label="Sets" value="3 Hours / Night" />
              <Fact icon={<Calendar size={14} />} label="Active Since" value="2023" />
            </div>

            <div className="flex flex-col sm:flex-row items-baseline sm:items-center gap-6 mt-10">
              <a
                href={LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-all duration-300 hover:text-accent text-[13px] tracking-wide uppercase font-semibold text-text-muted hover:translate-x-1"
              >
                <Instagram size={16} />
                @za.chary5068
              </a>
              <a
                href={LINKS.facebookMusicPage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-all duration-300 hover:text-accent text-[13px] tracking-wide uppercase font-semibold text-text-muted hover:translate-x-1"
              >
                <LinkIcon size={16} />
                Facebook Music Page
              </a>
              <a
                href="#booking"
                className="ml-auto inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-accent font-semibold hover:gap-3 transition-all duration-300"
              >
                Book a Show →
              </a>
            </div>
          </div>

          <div className="flex-1 md:order-2 order-1 w-full relative md:sticky md:top-24">
            <div className="absolute -inset-4 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay z-10 pointer-events-none" />
              <img
                src={aboutImage}
                alt="Zachary Walker performing acoustic guitar"
                loading="lazy"
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto object-cover aspect-[4/5] group-hover:scale-110 transition-transform duration-[1.5s] ease-out select-none"
              />
              {/* Floating credit chip */}
              <div className="absolute bottom-4 left-4 z-20 bg-base/80 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-text-muted font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Live · Topeka, KS
              </div>
            </motion.div>

            {/* Stat strip below image */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <MiniStat label="Originals" value="Released" />
              <MiniStat label="Covers" value="Curated" />
              <MiniStat label="Bookings" value="Open" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1.5 flex items-center gap-1.5">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      <span className="text-sm text-text-main font-medium">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/5 rounded-lg p-3 text-center bg-base/30 backdrop-blur-sm">
      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-0.5">{label}</p>
      <p className="text-xs text-accent font-medium">{value}</p>
    </div>
  );
}
