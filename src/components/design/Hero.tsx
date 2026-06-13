import React from 'react';
import Button from './Button';

export default function Hero() {
  return (
    <section
      id="hero"
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 md:p-12 flex flex-col justify-center gap-5">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Singer-Songwriter — Topeka, KS
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            Zachary Walker
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md">
            Acoustic originals and covers. Available for bookings, live shows, and
            licensing inquiries.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="#releases">
              <Button variant="primary">Listen</Button>
            </a>
            <a href="#contact">
              <Button variant="outline">Book a show</Button>
            </a>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] min-h-[220px] md:min-h-0" />
      </div>
    </section>
  );
}
