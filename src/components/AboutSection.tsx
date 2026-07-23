import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Link as LinkIcon, MapPin, Music, Mic, Calendar } from 'lucide-react';
import { LINKS } from '../data';
import aboutImage from '../assets/images/regenerated_image_1781019033978.jpg';

export default function AboutSection() {
  return (
    <section id="about" className="bg-surface py-32 text-text-main relative overflow-hidden">
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

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
              <span className="w-8 h-[1px] bg-accent/60" />
              About
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-[3.75rem] font-display font-semibold tracking-tighter leading-[1.05] text-text-main mb-8"
            >
              Zachary Walker
            </motion.h2>

            <div className="space-y-5 text-text-muted text-[15px] leading-relaxed font-light max-w-xl">
              <p>
                Topeka, Kansas. Acoustic guitar, honest vocals, original songs and
                covers that actually fit the room. Folk, rock, indie, pop — whatever
                the set calls for.
              </p>
              <p>
                Currently holding a recurring residency at B&amp;B Theatres Topeka
                Wheatfield 9 and playing venues across northeast Kansas.
              </p>
              <p>
                First original release: <em className="text-text-main">Love and Madness</em> (2023).
                More on the way.
              </p>
              <p>
                Open for private events, weddings, bar and restaurant gigs, house
                concerts, festivals, and session work.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-text-muted/10">
              <Fact icon={<MapPin size={14} />} label="Based" value="Topeka, KS" />
              <Fact icon={<Music size={14} />} label="Genre" value="Folk · Rock · Indie · Pop" />
              <Fact icon={<Mic size={14} />} label="Format" value="Solo Acoustic" />
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
                @zacharywalkermusic
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
                Book a Show -&gt;
              </a>
            </div>
          </div>

          <div className="flex-1 md:order-2 order-1 w-full relative md:sticky md:top-24">
            <div className="absolute -inset-4 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative group"
            >
              <img
                src={aboutImage}
                alt="Zachary Walker performing acoustic guitar"
                loading="lazy"
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto object-cover aspect-[4/5] group-hover:scale-105 transition-transform duration-[1.5s] ease-out select-none"
              />
            </motion.div>
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
