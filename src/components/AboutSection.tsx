import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Link as LinkIcon, Music, MapPin, Calendar } from 'lucide-react';
import { LINKS } from '../data';
import aboutImage from '../assets/images/regenerated_image_1781019033978.jpg';

export default function AboutSection() {
  return (
    <section id="about" className="bg-surface py-32 text-text-main relative overflow-hidden">
      <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 md:order-1 order-2 mt-8 md:mt-0">
          <span className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent mb-6 leading-relaxed">
            <span className="w-8 h-[1px] bg-accent/60"></span>
            About the Artist
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-display font-semibold tracking-tighter leading-[1.1] text-text-main mb-10">
            Acoustic stories from the heart of Kansas.
          </h2>
          <div className="space-y-6 text-text-muted text-base leading-relaxed font-light">
            <p className="text-text-main font-normal text-lg sm:text-xl leading-relaxed">
              Zachary Walker is an acoustic singer-songwriter based in Topeka, Kansas — a working musician, a husband,
              and a father who has spent the last several years balancing family life with the kind of late-night
              songwriting that good country and folk music tends to demand.
            </p>
            <p className="text-[15px]">
              His sound sits at the intersection of modern country, folk, and singer-songwriter Americana — fingerstyle
              and flatpicked acoustic guitar, plainspoken lyrics, and a warm baritone that carries equally well across
              a quiet wine bar or a packed Saturday-night lounge. Influences include Tyler Childers, Zach Bryan,
              Jason Isbell, and the long line of road-tested troubadours that came before them.
            </p>
            <p className="text-[15px]">
              You can catch him most often at <span className="text-text-main">B&amp;B Theatres Topeka Wheatfield 9</span>,
              where he plays multi-hour sets of originals and carefully chosen covers from 6:30pm to 10:30pm CST.
              Originals like <em>"Love and Madness"</em> (2023) live alongside requests pulled live off the
              floor — every show a little different from the last.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-text-muted/10">
            <Fact icon={<MapPin size={14} />} label="Based" value="Topeka, KS" />
            <Fact icon={<Music size={14} />} label="Genre" value="Acoustic Folk / Country" />
            <Fact icon={<Calendar size={14} />} label="Active Since" value="2023" />
          </div>

          <div className="flex flex-col sm:flex-row items-baseline sm:items-center gap-6 mt-10">
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-all duration-300 hover:text-accent text-[13px] tracking-wide uppercase font-semibold text-text-muted hover:translate-x-1">
              <Instagram size={16} />
              @za.chary5068
            </a>
            <a href={LINKS.facebookMusicPage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-all duration-300 hover:text-accent text-[13px] tracking-wide uppercase font-semibold text-text-muted hover:translate-x-1">
              <LinkIcon size={16} />
              Facebook Music Page
            </a>
          </div>
        </div>

        <div className="flex-1 md:order-2 order-1 w-full relative">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1.5 flex items-center gap-1.5">
        <span className="text-accent">{icon}</span>{label}
      </span>
      <span className="text-sm text-text-main font-medium">{value}</span>
    </div>
  );
}
