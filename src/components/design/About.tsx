import React from 'react';

export default function About() {
  return (
    <section id="about" className="rounded-lg p-6 md:p-8 bg-card border border-border">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold mb-2">About</h2>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Singer-Songwriter · Topeka, KS · Active since 2023
        </p>

        <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-muted-foreground">
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
            Released material includes the original recording <em>Love and Madness</em>{' '}
            (2023). Additional originals and live recordings are in development.
          </p>
          <p>
            Available for: private events, weddings and ceremonies, restaurant and bar
            residencies, corporate engagements, house concerts, festival and public-show
            programming, and select collaboration, co-writing, and session work.
          </p>
          <p>
            Booking inquiries:{' '}
            <a className="text-foreground underline underline-offset-4" href="#contact">
              contact form
            </a>{' '}
            or{' '}
            <a
              className="text-foreground underline underline-offset-4"
              href="mailto:mgmt@zacharywalkermusic.com"
            >
              mgmt@zacharywalkermusic.com
            </a>
            . Standard reply within two business days.
          </p>
        </div>

        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
          <Fact label="Based" value="Topeka, KS" />
          <Fact label="Genre" value="Folk · Country" />
          <Fact label="Format" value="Solo Acoustic" />
          <Fact label="Active Since" value="2023" />
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Book a show
          </a>
          <a
            href="#releases"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm"
          >
            Listen to releases
          </a>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="text-sm text-foreground font-medium">{value}</dd>
    </div>
  );
}
