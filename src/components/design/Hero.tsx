import React, { useRef, useEffect } from 'react';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      // Autoplay blocked — video stays paused silently.
    });
  }, []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-base min-h-screen flex items-center"
    >
      {/* Background video */}
      <video
        ref={videoRef}
        src="/promo.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ objectPosition: 'center top' }}
      />

      {/* Dark overlay so text stays legible */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Gradient fade at bottom into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-base to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-32 md:py-44 w-full">
        <p className="text-[12px] font-medium tracking-[0.2em] uppercase text-accent mb-6 flex items-center gap-2">
          <span className="w-6 h-[1px] bg-accent/60" />
          Singer-Songwriter — Topeka, KS
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-display font-semibold tracking-tight leading-[0.92] mb-6 text-white">
          Zachary<br />Walker
        </h1>
        <p className="text-base md:text-lg text-white/70 max-w-md mb-10 font-light leading-relaxed">
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
            className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white text-sm font-semibold uppercase tracking-widest rounded-md hover:border-accent hover:text-accent transition-colors"
          >
            Book a Show
          </a>
        </div>
      </div>
    </section>
  );
}
