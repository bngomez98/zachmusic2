import { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Play, ChevronDown, Volume2, VolumeX } from 'lucide-react';

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 350]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative w-full h-screen h-[100svh] flex flex-col justify-between overflow-hidden bg-base">
      {/* Background Media */}
      <motion.div className="absolute inset-0 z-0 bg-black" style={{ y, opacity }}>
        <div className="absolute inset-0 bg-gradient-to-t from-base/90 via-base/20 to-base/90 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-base/40 z-10 pointer-events-none" />
        <video 
          autoPlay 
          muted={isMuted} 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-60 mix-blend-screen"
        >
          <source src="/highlight.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-between h-full pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mt-12"
        >
          <span className="text-[11px] font-semibold tracking-[0.2em] shadow-sm uppercase text-accent leading-relaxed flex items-center gap-3 before:content-[''] before:block before:w-8 before:h-[1px] before:bg-accent/60">
            Singer-Songwriter — Topeka, KS
          </span>
        </motion.div>
        
        <div className="flex flex-col relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <h1 className="text-[4.5rem] sm:text-[6.5rem] md:text-[9rem] lg:text-[11rem] font-display font-semibold tracking-tighter text-[#F5F0E8] leading-[0.8] drop-shadow-2xl uppercase relative z-10 mix-blend-plus-lighter">
              Zachary
            </h1>
            <h1 className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[12rem] font-sans font-light italic tracking-tighter text-accent leading-[0.8] drop-shadow-2xl ml-8 sm:ml-16 md:ml-32 lowercase relative z-20 opacity-90" style={{ fontFamily: 'Inter' }}>
              Walker
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            className="text-lg text-text-main/80 font-light tracking-wide mt-10 max-w-[480px] leading-relaxed relative pl-4 border-l border-accent/40"
          >
            Acoustic covers and original songs.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className="mt-8"
          >
            <a href="https://www.instagram.com/reel/CVGU0RfpJSL/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 border border-text-main/20 hover:border-accent text-text-main px-8 py-4 font-normal text-[15px] hover:bg-accent transition-all duration-300">
              <Play size={18} className="fill-current group-hover:text-base opacity-90" />
              <span className="group-hover:text-base transition-colors duration-300">Watch Latest Reel</span>
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-text-muted/60">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-accent/50" />
        </motion.div>
      </motion.div>

      {/* Audio Control */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-8 right-6 lg:right-12 z-30 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/40 hover:text-white transition-all cursor-pointer"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </motion.button>
    </section>
  );
}
