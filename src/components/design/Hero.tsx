import React, { useRef, useEffect } from 'react';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      // Autoplay blocked silently.
    });
  }, []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-base min-h-screen flex items-end"
    >
      {/* Background video — cropped to show performer and crowd engagement */}
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
        style={{ objectPosition: '50% 68%' }}
      />

      {/* Radial vignette — darkens edges, keeps performer area bright */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 50% 40%, transparent 30%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* Bottom gradient fades into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-base via-base/80 to-transparent pointer-events-none" />

      {/* Top gradient keeps header legible */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      {/* Content — anchored to the bottom so text sits above the crowd */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24 md:pb-36 w-full">
        <p className="text-[12px] font-medium tracking-[0.2em] uppercase text-accent mb-6 flex items-center gap-2">
          <span className="w-6 h-[1px] bg-accent/60" />
          Singer-Songwriter — Topeka, KS
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-display font-semibold tracking-tight leading-[0.92] mb-6 text-white">
          Zachary<br />Walker
        </h1>
        <p className="text-base md:text-lg text-white/70 max-w-md mb-10 font-light leading-relaxed">
          Acoustic originals and covers. Performing across northeast Kansas —
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
