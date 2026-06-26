import { motion } from 'motion/react';
import {
  Instagram,
  Facebook,
  Youtube,
  Radio,
  Music,
  CalendarDays,
  Coffee,
  ExternalLink,
} from 'lucide-react';
import { LINKS } from '../data';

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  );
}

function SpotifyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function PayPalIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.477z" />
    </svg>
  );
}

const socialLinks = [
  { label: 'Instagram', handle: '@za.chary5068', href: LINKS.instagram, Icon: Instagram, hover: 'hover:border-pink-500/40 hover:bg-pink-500/5', iconHover: 'group-hover:text-pink-400' },
  { label: 'TikTok', handle: '@fullmetalzcw', href: LINKS.tiktok, Icon: TikTokIcon, hover: 'hover:border-white/30 hover:bg-white/5', iconHover: 'group-hover:text-white' },
  { label: 'YouTube', handle: '@fullmetalzcw', href: LINKS.youtube, Icon: Youtube, hover: 'hover:border-red-500/40 hover:bg-red-500/5', iconHover: 'group-hover:text-red-400' },
  { label: 'Facebook', handle: 'Topcityzachary', href: LINKS.facebookMusicPage, Icon: Facebook, hover: 'hover:border-blue-500/40 hover:bg-blue-500/5', iconHover: 'group-hover:text-blue-400' },
  { label: 'Twitch', handle: 'fullmetalzcw', href: LINKS.twitch, Icon: Radio, hover: 'hover:border-purple-500/40 hover:bg-purple-500/5', iconHover: 'group-hover:text-purple-400' },
  { label: 'Spotify', handle: 'fullmetalzcw', href: LINKS.spotify, Icon: SpotifyIcon, hover: 'hover:border-green-500/40 hover:bg-green-500/5', iconHover: 'group-hover:text-green-400' },
] as const;

const quickLinks = [
  { label: 'Upcoming Shows', description: 'Live dates at B&B Theatres Topeka and more', href: '#shows', Icon: CalendarDays },
  { label: 'Book a Performance', description: 'Weddings, private events, venues & gigs', href: '#booking', Icon: Music },
];

const supportLinks = [
  { label: 'PayPal', href: LINKS.paypal, Icon: PayPalIcon },
  { label: 'Venmo', href: LINKS.venmo, Icon: Coffee },
  { label: 'Cash App', href: LINKS.cashapp, Icon: Coffee },
];

export default function LinktreeSection() {
  return (
    <section id="links" className="bg-surface py-32 text-text-main border-t border-text-muted/10">
      <div className="max-w-2xl mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="w-20 h-20 flex items-center justify-center border border-accent/40 rounded-full mb-5 bg-accent/5">
            <span className="font-display text-accent text-4xl leading-none mt-1">Z</span>
          </div>
          <h2 className="text-3xl font-display font-semibold tracking-tight text-text-main mb-1">Zachary Walker</h2>
          <p className="text-text-muted text-sm font-light">Singer-Songwriter &mdash; Topeka, KS</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-8 h-[1px] bg-accent/40" />
            <span className="text-[10px] uppercase tracking-widest text-accent font-mono">All My Links</span>
            <span className="w-8 h-[1px] bg-accent/40" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="mb-10"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted/60 font-mono mb-4 text-center">Follow Along</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialLinks.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`group flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 bg-base/40 transition-all duration-300 ${s.hover}`}
              >
                <s.Icon size={22} className={`text-text-muted transition-colors duration-300 ${s.iconHover}`} />
                <span className="text-text-main text-sm font-semibold">{s.label}</span>
                <span className="text-text-muted/60 text-[10px] font-mono">{s.handle}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-10 flex flex-col gap-3"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted/60 font-mono mb-1 text-center">Quick Access</p>
          {quickLinks.map((q, i) => (
            <motion.a
              key={q.label}
              href={q.href}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-base/40 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full border border-accent/20 bg-accent/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors duration-500">
                <q.Icon size={16} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-text-main text-sm font-semibold mb-0.5">{q.label}</p>
                <p className="text-text-muted text-[12px] font-light">{q.description}</p>
              </div>
              <ExternalLink size={14} className="text-text-muted/40 group-hover:text-accent transition-colors flex-shrink-0" />
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="border border-accent/20 rounded-2xl p-8 bg-accent/5 text-center"
        >
          <Coffee size={28} className="text-accent mx-auto mb-3" />
          <h3 className="font-display text-xl font-semibold tracking-tight mb-2">Buy Me a Coffee</h3>
          <p className="text-text-muted text-sm font-light leading-relaxed mb-6 max-w-xs mx-auto">
            If my music means something to you, consider leaving a tip. Every bit goes straight toward gear, recording time, and keeping the music alive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {supportLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 border border-accent/30 hover:border-accent hover:bg-accent hover:text-base text-text-main px-6 py-3 rounded-full text-[12px] font-semibold uppercase tracking-wider transition-all duration-300"
              >
                <s.Icon size={14} />
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
