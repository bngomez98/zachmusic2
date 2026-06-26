import React from 'react';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-base"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-36 relative z-10">
        <p className="text-[12px] font-medium tracking-[0.2em] uppercase text-accent mb-6 flex items-center gap-2">
          <span className="w-6 h-[1px] bg-accent/60" />
          Singer-Songwriter — Topeka, KS
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold tracking-tight leading-[0.95] mb-6">
          Zachary Walker
        </h1>
        <p className="text-base md:text-lg text-text-muted max-w-lg mb-10 font-light leading-relaxed">
          Acoustic originals and covers. Available for bookings, live shows, and
          licensing inquiries.
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
    </section>
  );
}
