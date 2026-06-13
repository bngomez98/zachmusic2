import React from 'react';
import { RELEASES } from '@/data';
import { ExternalLink } from 'lucide-react';

export default function ReleasesSection() {
  return (
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
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
                {r.cover && (
                  <img
                    src={r.cover}
                    alt={r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
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
                {r.ctaLink && r.ctaLink !== '#' && (
                  <a
                    href={r.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent text-xs uppercase tracking-[0.2em] font-semibold hover:gap-3 transition-all"
                  >
                    Listen <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
