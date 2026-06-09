import { motion } from 'motion/react';
import { Instagram, Link as LinkIcon } from 'lucide-react';
import { LINKS } from '../data';
import aboutImage from '../assets/images/regenerated_image_1781019033978.jpg';

export default function AboutSection() {
  return (
    <section id="about" className="bg-surface py-32 text-text-main">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 md:order-1 order-2 mt-8 md:mt-0">
          <span className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent mb-6 leading-relaxed">
            <span className="w-8 h-[1px] bg-accent/60"></span>
            About the Artist
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-display font-semibold tracking-tighter leading-[1.1] text-text-main mb-10">
            Acoustic Singer-Songwriter from Topeka, Kansas
          </h2>
          <div className="space-y-6 text-text-muted text-base leading-relaxed font-light">
            <p className="text-text-main font-normal text-lg sm:text-xl leading-relaxed">
              I am Zachary Walker, an acoustic singer-songwriter based in Topeka, Kansas. I balance family work with writing and performing music.
            </p>
            <p className="text-[15px]">
              My sets focus on simple acoustic arrangements and straightforward performances. You can hear me playing a mix of originals and covers on select upcoming dates from 6:30pm to 10:30pm in the lounge at B&B Theatres Topeka Wheatfield 9.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-baseline sm:items-center gap-6 mt-12 pt-8 border-t border-text-muted/10">
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-all duration-300 hover:text-accent text-[13px] tracking-wide uppercase font-semibold text-text-muted hover:translate-x-1">
              <Instagram size={16} />
              @za.chary5068
            </a>
            <a href={LINKS.facebookMusicPage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-all duration-300 hover:text-accent text-[13px] tracking-wide uppercase font-semibold text-text-muted hover:translate-x-1">
              <LinkIcon size={16} />
              Facebook Music Page
            </a>
          </div>
        </div>
        
        <div className="flex-1 md:order-2 order-1 w-full relative">
          <div className="absolute -inset-4 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay z-10 pointer-events-none" />
            <img 
              src={aboutImage} 
              alt="Zachary Walker Acoustic Setup"
              className="w-full h-auto object-cover aspect-[4/5] group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
