import React from 'react';

export default function About() {
  return (
    <section id="about" className="bg-base py-24 text-text-main">
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
            Topeka, Kansas. Acoustic guitar, honest vocals, original songs and
            covers that actually fit the room. Folk, rock, indie, pop — whatever
            the set calls for.
          </p>
          <p>
            Currently holding a recurring residency at B&amp;B Theatres Topeka
            Wheatfield 9 and playing venues across northeast Kansas.
          </p>
          <p>
            First original release: <em className="text-text-main">Love and Madness</em> (2023).
            More on the way.
          </p>
          <p>
            Open for private events, weddings, bar and restaurant gigs, house
            concerts, festivals, and session work.
          </p>
          <p>
            <a className="text-accent hover:underline" href="mailto:booking@zacharywalkermusic.com">
              booking@zacharywalkermusic.com
            </a>{' '}
            ·{' '}
            <a className="text-accent hover:underline" href="#booking">
              booking form
            </a>
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-text-muted/10 max-w-2xl mx-auto">
          <Fact label="Based" value="Topeka, KS" />
          <Fact label="Genre" value="Folk · Rock · Indie · Pop" />
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
