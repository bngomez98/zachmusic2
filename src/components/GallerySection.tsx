import { Instagram, ExternalLink, Facebook } from 'lucide-react';
import { LINKS } from '../data';

export default function GallerySection() {
  return (
    <section id="gallery" className="bg-surface py-32 text-text-main border-y border-text-muted/10 relative overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <span className="flex items-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent mb-4 leading-relaxed">
          <span className="w-6 h-[1px] bg-accent/60"></span>
          Social Updates
        </span>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-text-main">
            Latest from Facebook
          </h2>
          <div className="flex items-center gap-6 flex-wrap">
            <a 
              href={LINKS.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-accent hover:text-text-main transition-colors duration-300 border-b border-accent/20 pb-1"
            >
              Visit Facebook
              <Facebook size={14} className="group-hover:-rotate-12 transition-transform duration-300" />
            </a>
            <a 
              href={LINKS.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-accent hover:text-text-main transition-colors duration-300 border-b border-accent/20 pb-1"
            >
              Visit Instagram
              <Instagram size={14} className="group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>
        </div>

        <div className="flex justify-center w-full bg-base/30 p-4 md:p-8 rounded-xl border border-white/5">
          <iframe 
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fp%2FTopcityzachary-61565838372447%2F&tabs=timeline&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
            width="500" 
            height="800"
            className="border-none overflow-hidden rounded-lg max-w-full shadow-2xl"
            scrolling="no" 
            frameBorder="0" 
            allowFullScreen={true} 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
          </iframe>
        </div>
      </div>
    </section>
  );
}
