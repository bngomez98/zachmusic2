import React from 'react';

export default function About() {
  return (
    <section id="about" className="bg-base py-32 border-t border-text-muted/10">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60" />
            About
            <span className="w-4 h-[1px] bg-accent/60" />
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">
            Zachary Walker
          </h2>
          <div className="w-10 h-[1px] bg-accent/40" />
        </div>

        <div className="space-y-5 text-sm md:text-[15px] leading-relaxed text-text-muted max-w-2xl mx-auto">
          <p>
            Zachary Walker is an independent singer-songwriter based in Topeka, Kansas.
            His work centers on acoustic guitar and vocal performance, with material that
            spans original songs and a curated selection of covers across folk, country,
            and singer-songwriter Americana.
          </p>
          <p>
            He performs regularly in northeast Kansas, including a recurring lounge
            residency at B&amp;B Theatres Topeka Wheatfield 9. Sets are configured for the
            room — typically 60, 90, or 180 minutes — and arranged for venues that need
            attentive background music or a focused listening environment.
          </p>
          <p>
            Released material includes the original recording <em className="text-text-main">Love and Madness</em>{' '}
            (2023). Additional originals and live recordings are in development.
          </p>
          <p>
            Available for: private events, weddings and ceremonies, restaurant and bar
            residencies, corporate engagements, house concerts, festival and public-show
            programming, and select collaboration, co-writing, and session work.
          </p>
          <p>
            Booking inquiries:{' '}
            <a className="text-accent hover:underline" href="mailto:booking@zacharywalkermusic.com">
              booking@zacharywalkermusic.com
            </a>{' '}
            or{' '}
            <a className="text-accent hover:underline" href="#booking">
              booking form
            </a>
            . Standard reply within two business days.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-text-muted/10 max-w-2xl mx-auto">
          <Fact label="Based" value="Topeka, KS" />
          <Fact label="Genre" value="Folk · Country" />
          <Fact label="Format" value="Solo Acoustic" />
          <Fact label="Active Since" value="2023" />
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono mb-1">
        {label}
      </dt>
      <dd className="text-sm text-text-main font-medium">{value}</dd>
    </div>
  );
}
