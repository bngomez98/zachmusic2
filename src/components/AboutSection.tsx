'use client';

import { Link as LinkIcon } from 'lucide-react';
import { LINKS } from '@/lib/data';

export default function AboutSection() {
  return (
    <section id="contact" className="bg-[#0A0A0A] text-[#F5F0E8] py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-[1px] bg-[#D4A853]/60"></span>
          <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4A853' }}>
            About the Artist
          </span>
        </div>
        
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontFamily: 'var(--font-cormorant)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '32px' }}>
          Zachary Walker
        </h2>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Profile Image */}
          <div className="rounded-lg overflow-hidden border border-[#3a3a3a] hover:border-[#D4A853] transition-all duration-300">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/zach_love_and_madness-LAG0M2e7VGe50QC3ZER97EaNZjOGCk.jpg"
              alt="Zachary Walker portrait"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* About Text */}
          <div className="space-y-6">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', lineHeight: 1.65, color: 'rgba(245, 240, 232, 0.9)' }}>
              Hi, I&apos;m Zachary Walker—an acoustic singer-songwriter from Topeka, Kansas. Music has always been my way of expressing the complexities of life, love, and everything in between.
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', lineHeight: 1.65, color: 'rgba(245, 240, 232, 0.8)' }}>
              I grew up with a guitar in my hands and a story in my heart. My journey combines original compositions with thoughtfully arranged covers, all performed with raw authenticity. Every song I play is a reflection of real experiences and genuine emotion.
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', lineHeight: 1.65, color: 'rgba(245, 240, 232, 0.8)' }}>
              When I&apos;m not performing or writing, I&apos;m balancing life as a working musician and family man in Topeka. You can find me live every Friday and Saturday evening at B&B Theatres Topeka Wheatfield 9 lounge, where I create intimate acoustic sessions that connect with listeners on a personal level.
            </p>

            <div className="flex flex-wrap gap-4 pt-6">
              <a 
                href={LINKS.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 transition-all duration-300 hover:bg-[#D4A853] hover:text-[#0A0A0A] hover:border-[#D4A853]"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#F5F0E8',
                  border: '1px solid rgba(245,240,232,0.2)',
                  borderRadius: '6px',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                }}
              >
                <LinkIcon size={16} />
                Instagram
              </a>
              <a 
                href={LINKS.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 transition-all duration-300 hover:bg-[#D4A853] hover:text-[#0A0A0A] hover:border-[#D4A853]"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#F5F0E8',
                  border: '1px solid rgba(245,240,232,0.2)',
                  borderRadius: '6px',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                }}
              >
                <LinkIcon size={16} />
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
