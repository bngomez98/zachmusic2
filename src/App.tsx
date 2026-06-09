/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Nav from './components/Nav';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import MusicSection from './components/MusicSection';
import ShowsSection from './components/ShowsSection';
import GallerySection from './components/GallerySection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-base text-text-main selection:bg-accent/30 selection:text-white overflow-x-hidden font-sans relative">
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.025] mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <Nav />
      <Hero />
      <AboutSection />
      <MusicSection />
      <ShowsSection />
      <GallerySection />
      <Footer />
    </div>
  );
}

