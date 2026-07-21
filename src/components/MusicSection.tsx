import React from 'react';
import { motion } from 'motion/react';
import { RELEASES } from '../data';
import { Play, ExternalLink } from 'lucide-react';

export default function MusicSection() {
  const release = RELEASES[0];

  const openPlayer = (src?: string) => {
    window.dispatchEvent(new CustomEvent('zw:open-player', { detail: { src: src || '/loveandmadness.mp3' } }));
  };

  return (
    <section id="music" className="bg-base py-32 text-text-main relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60" />
            Listen
            <span className="w-4 h-[1px] bg-accent/60" />
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">Music</h2>
          <div className="w-10 h-[1px] bg-accent/40" />
          <p className="text-text-muted text-base max-w-2xl">
            Original acoustic arrangements and performances — folk, rock, and indie songs
            written and recorded in Topeka, Kansas.
          </p>
        </div>

        {release && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row items-center gap-12 md:gap-16"
          >
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute -inset-8 bg-accent/[0.06] rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <img
                  src={release.cover}
                  alt={`${release.title} — album artwork`}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out select-none"
                />
                {release.hasAudio && (
                  <button
                    onClick={() => openPlayer(release.audioUrl)}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-500"
                    aria-label={`Play ${release.title}`}
                  >
                    <div className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-[0_8px_30px_rgba(212,168,83,0.4)]">
                      <Play size={32} className="text-base ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-start">
              <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-mono mb-4">
                {release.subtitle}
              </p>
              <h3 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-6">
                {release.title}
              </h3>
              <p className="text-text-muted text-base leading-relaxed mb-8 max-w-md font-light">
                {release.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {release.hasAudio && (
                  <button
                    onClick={() => openPlayer(release.audioUrl)}
                    className="group inline-flex items-center gap-3 bg-accent text-base px-8 py-4 font-semibold text-[13px] tracking-[0.15em] uppercase hover:bg-accent/90 transition-all duration-300 shadow-[0_8px_30px_rgba(212,168,83,0.2)]"
                  >
                    <Play size={18} fill="currentColor" /> Listen Now
                  </button>
                )}
                {release.ctaLink && release.ctaLink !== '#' && (
                  <a
                    href={release.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-text-main/20 hover:border-accent text-text-muted hover:text-accent px-6 py-4 text-[12px] tracking-[0.15em] uppercase transition-all duration-300"
                  >
                    <ExternalLink size={14} /> Watch
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-text-muted/10 w-full max-w-md">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">Written by</p>
                  <p className="text-sm text-text-main font-medium">Zachary Walker</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">Genre</p>
                  <p className="text-sm text-text-main font-medium">Folk / Indie</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">Released</p>
                  <p className="text-sm text-text-main font-medium">April 2023</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
