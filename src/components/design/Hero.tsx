import React, { useState } from 'react';
import { Play } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

export default function Hero() {
  const [promoOpen, setPromoOpen] = useState(false);

  return (
    <>
      <section
        id="hero"
        className="relative overflow-hidden bg-base"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-36 relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-12">
          {/* Text column */}
          <div className="flex-1">
            <p className="text-[12px] font-medium tracking-[0.2em] uppercase text-accent mb-6 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-accent/60" />
              Singer-Songwriter — Topeka, KS
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold tracking-tight leading-[0.95] mb-6">
              Zachary Walker
            </h1>
            <p className="text-base md:text-lg text-text-muted max-w-lg mb-10 font-light leading-relaxed">
              Acoustic originals and covers. Performing in northeast Kansas and
              available for bookings, live shows, and licensing inquiries.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#releases"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent text-base text-sm font-semibold uppercase tracking-widest rounded-md hover:bg-accent/90 transition-colors"
              >
                Listen
              </a>
              <a
                href="#booking"
                className="inline-flex items-center justify-center px-8 py-4 border border-text-muted/30 text-text-main text-sm font-semibold uppercase tracking-widest rounded-md hover:border-accent hover:text-accent transition-colors"
              >
                Book a Show
              </a>
            </div>
          </div>

          {/* Promo video thumbnail */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 lg:w-72 xl:w-80">
            <button
              type="button"
              onClick={() => setPromoOpen(true)}
              aria-label="Watch promo video"
              className="relative w-full aspect-[9/16] lg:aspect-[9/16] rounded-2xl overflow-hidden bg-surface border border-white/5 hover:border-accent/30 transition-colors group block max-w-[240px] mx-auto lg:mx-0"
            >
              <video
                src="/promo.mp4"
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover pointer-events-none"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Play size={20} className="text-base ml-0.5" fill="currentColor" />
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xs font-semibold">Watch</p>
                <p className="text-white/60 text-[10px] uppercase tracking-widest">Promo</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {promoOpen && (
        <VideoPlayer
          src="/promo.mp4"
          title="Zachary Walker"
          subtitle="Promo"
          onClose={() => setPromoOpen(false)}
        />
      )}
    </>
  );
}
