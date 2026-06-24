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
            Zachary Walker&rsquo;s relationship with music began in his local church, where he first sang in the
            congregation. By middle school, he had taken up guitar and begun performing publicly. In high school,
            he co-led worship and performed solo sets, using songwriting as a way to process daily life and faith.
            Early exposure to live audiences gave him a sense of comfort and confidence on stage.
          </p>
          <p>
            Under the mentorship of Dr. John Leavitt, Zachary began shaping his natural vocal ability into more
            intentional and expressive performances. That growth helped earn him a scholarship to MidAmerica
            Nazarene University, where he joined the Heritage Choir as a freshman &mdash; a rare achievement so
            early in his training.             There, he refined his technique, expanded his versatility, and deepened his
            expressive range as a vocalist.
          </p>
          <p>
            After college, Zachary went through a difficult period that included homelessness. He spent time
            busking, relying on the generosity of strangers while continuing to stay connected to music. That
            experience strengthened his resilience and reinforced his belief in music&rsquo;s ability to connect
            and uplift. He later returned to Topeka and performed with the band Story Through Storms. In the same
            year, he faced the loss of his father and the birth of his daughter, and he stepped away from music
            for a time as he adjusted to grief and new fatherhood.
          </p>
          <p>
            He later formed Black Sheep Sirens, an acoustic duo project that ended when his music partner moved
            away. Zachary has said this remains one of his favorite projects, and he hopes to revisit it in the
            future.
          </p>
          <p>
            Now, Zachary is returning fully to his craft with his first solo debut. He brings experience in solo
            performance, band settings, ensembles, and worship, along with a vocal style shaped by classic rock,
            metal, pop, Americana, indie, country, and soul&nbsp;/&nbsp;R&amp;B. His songs draw from personal
            experience and are intended to create an honest, intimate connection with listeners. His first
            studio-recorded EP is expected in late 2026.
          </p>
          <p>
            Booking inquiries:{' '}
            <a className="text-accent hover:underline" href="mailto:booking@zacharywalkermusic.com">
              booking@zacharywalkermusic.com
            </a>{' '}
            or{' '}
            <a className="text-accent hover:underline" href="#booking">
              use the booking form
            </a>
            . Standard reply within two business days.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-text-muted/10 max-w-2xl mx-auto">
          <Fact label="Based" value="Topeka, KS" />
          <Fact label="Style" value="Singer-Songwriter" />
          <Fact label="Format" value="Solo Acoustic" />
          <Fact label="EP Expected" value="Late 2026" />
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
