import React from 'react';
import { motion } from 'motion/react';
import { RELEASES } from '../data';
import { Play } from 'lucide-react';

export default function MusicSection() {
  const openPlayer = (src?: string) => {
    window.dispatchEvent(new CustomEvent('zw:open-player', { detail: { src: src || '/loveandmadness.mp3' } }));
  };

  return (
    <section id="music" className="bg-base py-24 text-text-main">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight">Music</h2>
          <p className="text-text-muted mt-3 max-w-2xl mx-auto">
            Original acoustic arrangements and performances — folk, rock, and indie songs written and recorded in Topeka, Kansas. Every track is written, performed, and produced by Zachary Walker.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {RELEASES.map((release) => (
            <motion.article
              key={release.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] bg-base overflow-hidden">
                <img
                  src={release.cover}
                  alt={release.title}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <p className="text-[10px] uppercase tracking-widest text-accent mb-2">{release.subtitle}</p>
                <h3 className="text-lg font-display font-semibold mb-2">{release.title}</h3>
                <p className="text-text-muted text-sm mb-4 flex-1">{release.description}</p>

                <div className="flex items-center gap-3 mt-4">
                  {release.hasAudio ? (
                    <button
                      onClick={() => openPlayer(release.audioUrl || '/loveandmadness.mp3')}
                      className="inline-flex items-center gap-2 bg-accent text-base px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-accent/90 transition-colors"
                      aria-label={`Listen to ${release.title}`}
                    >
                      <Play size={16} /> Listen Now
                    </button>
                  ) : (
                    <span className="text-xs text-text-muted uppercase tracking-widest">No audio available</span>
                  )}

                  <button
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    className="ml-auto text-xs text-text-muted hover:text-accent underline"
                    aria-label={`More info about ${release.title}`}
                  >
                    More info
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
