import React from 'react';
import { motion } from 'motion/react';
import { RELEASES } from '../data';
import { Play, ExternalLink } from 'lucide-react';

export default function MusicSection() {
  const openPlayer = (src?: string) => {
    window.dispatchEvent(new CustomEvent('zw:open-player', { detail: { src: src || '/loveandmadness.mp3' } }));
  };

  const release = RELEASES[0];

  return (
    <section id="music" className="bg-base py-32 text-text-main">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent mb-2 leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60" />
            Original Music
            <span className="w-4 h-[1px] bg-accent/60" />
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">Discography</h2>
          <div className="w-10 h-[1px] bg-accent/40" />
        </div>

        {release && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row gap-10 md:gap-16 items-center"
          >
            <div className="w-full md:w-[45%] flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-4 bg-accent/5 rounded-3xl blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
                  <img
                    src={release.cover}
                    alt={release.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                  />
                  {release.hasAudio && (
                    <button
                      onClick={() => openPlayer(release.audioUrl)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-500"
                      aria-label={`Play ${release.title}`}
                    >
                      <span className="w-16 h-16 rounded-full bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-[0_8px_30px_rgba(212,168,83,0.4)]">
                        <Play size={24} className="text-base fill-current ml-1" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-mono mb-4">{release.subtitle}</p>
              <h3 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-6 text-text-main">
                {release.title}
              </h3>
              <p className="text-text-muted text-[15px] leading-relaxed font-light mb-8 max-w-lg">
                {release.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 max-w-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">Writer</p>
                  <p className="text-sm text-text-main">Zachary Walker</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">Genre</p>
                  <p className="text-sm text-text-main">Folk / Indie</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">Released</p>
                  <p className="text-sm text-text-main">April 2023</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">Format</p>
                  <p className="text-sm text-text-main">Single</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {release.hasAudio && (
                  <button
                    onClick={() => openPlayer(release.audioUrl)}
                    className="group inline-flex items-center gap-2 bg-accent text-base px-6 py-3 font-semibold text-[13px] uppercase tracking-[0.15em] hover:bg-accent/90 transition-colors rounded-full"
                  >
                    <Play size={16} className="fill-current" /> Listen Now
                  </button>
                )}
                {release.ctaLink && (
                  <a
                    href={release.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-white/10 text-text-muted px-6 py-3 text-[13px] uppercase tracking-[0.15em] hover:border-accent/40 hover:text-accent transition-colors rounded-full"
                  >
                    Watch <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {RELEASES.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-16">
            {RELEASES.slice(1).map((r) => (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => r.hasAudio && openPlayer(r.audioUrl)}
              >
                <div className="aspect-square rounded-xl overflow-hidden border border-white/5 mb-3">
                  <img src={r.cover} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <p className="text-sm font-medium text-text-main truncate">{r.title}</p>
                <p className="text-[11px] text-text-muted truncate">{r.subtitle}</p>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
