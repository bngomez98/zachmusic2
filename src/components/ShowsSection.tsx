import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SHOWS } from '../data';

export default function ShowsSection() {
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    // Compare at start-of-day local so a show on the current day still counts as upcoming.
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const u: typeof SHOWS = [];
    const p: typeof SHOWS = [];

    for (const s of SHOWS) {
      const showDate = new Date(s.dateISO + 'T00:00:00');
      (showDate >= today ? u : p).push(s);
    }

    // Upcoming sorted soonest first; past newest first.
    u.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    p.sort((a, b) => b.dateISO.localeCompare(a.dateISO));

    return { upcoming: u, past: p };
  }, []);

  return (
    <section id="shows" className="bg-surface py-32 text-text-main border-y border-text-muted/10">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent mb-2 leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60"></span>
            Live
            <span className="w-4 h-[1px] bg-accent/60"></span>
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">
            {upcoming.length > 0 ? 'Upcoming Shows' : 'Shows'}
          </h2>
          <div className="w-10 h-[1px] bg-accent/40" />
        </div>

        <div className="flex flex-col mb-24 border-t border-text-muted/10">
          {upcoming.length === 0 && (
            <div className="py-16 text-center text-text-muted text-sm">
              No upcoming shows scheduled — check back soon or{' '}
              <Link to="/booking" className="text-accent hover:underline">book a private event</Link>.
            </div>
          )}
          {upcoming.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-text-muted/10 hover:bg-white/[0.02] transition-colors gap-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/[0.03] to-accent/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-500 ease-out" />
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16 w-full md:w-2/3 relative z-10">
                <div className="flex md:flex-col items-baseline md:items-center gap-3 md:gap-0 min-w-[100px]">
                  <span className="text-accent font-light tracking-[0.2em] uppercase text-xs sm:text-sm">
                    {show.date.split(' ')[0]}
                  </span>
                  <span className="text-text-main font-display font-medium text-4xl sm:text-5xl tracking-tighter group-hover:text-accent transition-colors duration-500">
                    {show.date.split(' ')[1]}
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-semibold font-display tracking-tight mb-3 text-text-main group-hover:text-white transition-colors">
                    {show.title}
                  </h3>
                  <div className="text-text-muted text-sm tracking-wide font-light flex items-center gap-2 mb-2">
                    <span className="w-4 h-[1px] bg-text-muted/40 inline-block"></span>
                    {show.location}
                  </div>
                  {show.amenities && (
                    <div className="text-text-muted/60 text-xs tracking-wide font-light flex items-center gap-2 mb-2">
                      <span className="w-4 h-[1px] bg-transparent inline-block"></span>
                      * {show.amenities}
                    </div>
                  )}
                  <div className="text-text-muted/70 text-xs tracking-wide font-light flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-transparent inline-block"></span>
                    {show.time}
                  </div>
                </div>
              </div>

              <div className="md:text-right relative z-10 mt-4 md:mt-0">
                {show.isAvailable ? (
                  <a
                    href={show.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center border border-accent/40 text-text-main px-8 py-4 text-[10px] sm:text-xs tracking-[0.2em] font-semibold uppercase hover:border-accent hover:bg-accent hover:text-base transition-all duration-300 rounded-full"
                  >
                    Details
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center px-8 py-4 text-[10px] sm:text-xs tracking-[0.2em] font-semibold uppercase border border-base bg-base/50 text-text-muted/40 rounded-full cursor-not-allowed">
                    Sold Out
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {past.length > 0 && (
            <>
              <div className="pt-12 pb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted/50 font-mono">Past</span>
              </div>
              {past.map((show) => (
                <div
                  key={show.id}
                  className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-text-muted/5 gap-4 opacity-40"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                    <div className="flex md:flex-col items-baseline md:items-center gap-3 md:gap-0 min-w-[100px]">
                      <span className="text-text-muted/60 font-light tracking-[0.2em] uppercase text-xs">
                        {show.date.split(' ')[0]}
                      </span>
                      <span className="text-text-muted font-display font-medium text-3xl tracking-tighter">
                        {show.date.split(' ')[1]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-display tracking-tight text-text-muted">{show.title}</h3>
                      <p className="text-text-muted/60 text-xs tracking-wide">{show.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="text-center pt-8">
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-accent font-semibold hover:gap-3 transition-all duration-300"
          >
            Want to book? Get in touch →
          </Link>
        </div>
      </div>
    </section>
  );
}
