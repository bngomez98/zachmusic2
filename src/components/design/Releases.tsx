import React, { useState } from 'react';
import { RELEASES } from '@/data';
import { Play } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

export default function ReleasesSection() {
  const [activeVideo, setActiveVideo] = useState<{ src: string; title: string; subtitle?: string } | null>(null);

  return (
    <>
      <section id="releases" className="bg-surface py-32 border-t border-text-muted/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center mb-16 gap-4">
            <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent leading-relaxed">
              <span className="w-4 h-[1px] bg-accent/60" />
              Music
              <span className="w-4 h-[1px] bg-accent/60" />
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">
              Releases
            </h2>
            <div className="w-10 h-[1px] bg-accent/40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {RELEASES.map((r) => (
              <article
                key={r.id}
                className="bg-base/60 border border-text-muted/10 rounded-2xl overflow-hidden group hover:border-accent/30 transition-colors"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
                  {r.cover && (
                    <img
                      src={r.cover}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  )}
                  {/* Play button overlay — only for tracks with audio/video */}
                  {(r.hasAudio || r.videoUrl) && (
                    <button
                      type="button"
                      aria-label={`Play ${r.title}`}
                      onClick={() =>
                        setActiveVideo({
                          src: r.videoUrl || r.audioUrl || '',
                          title: r.title,
                          subtitle: r.subtitle,
                        })
                      }
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center shadow-xl">
                        <Play size={24} className="text-base ml-1" fill="currentColor" />
                      </span>
                    </button>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-2">
                    {r.subtitle}
                  </p>
                  <h3 className="font-display text-xl font-medium text-text-main mb-2 tracking-tight">
                    {r.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    {r.description}
                  </p>
                  {(r.hasAudio || r.videoUrl) && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveVideo({
                          src: r.videoUrl || r.audioUrl || '',
                          title: r.title,
                          subtitle: r.subtitle,
                        })
                      }
                      className="inline-flex items-center gap-2 text-accent text-xs uppercase tracking-[0.2em] font-semibold hover:gap-3 transition-all"
                    >
                      <Play size={10} fill="currentColor" /> Listen Now
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activeVideo && (
        <VideoPlayer
          src={activeVideo.src}
          title={activeVideo.title}
          subtitle={activeVideo.subtitle}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
