/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import LegalModal, { LegalDoc } from './components/LegalModal';
import CookieConsent from './components/CookieConsent';
import StickyBookingCTA from './components/StickyBookingCTA';

const MusicSection = lazy(() => import('./components/MusicSection'));
const ShowsSection = lazy(() => import('./components/ShowsSection'));
const BookingSection = lazy(() => import('./components/BookingSection'));
const GallerySection = lazy(() => import('./components/GallerySection'));
const LinktreeSection = lazy(() => import('./components/LinktreeSection'));
const Footer = lazy(() => import('./components/Footer'));
const TipJar = lazy(() => import('./components/TipJar'));
const SearchModal = lazy(() => import('./components/SearchModal'));

function SectionFallback() {
  return (
    <div className="py-32 flex justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  const openConsent = () => window.dispatchEvent(new CustomEvent('zw:open-consent'));

  return (
    <div className="min-h-screen bg-base text-text-main selection:bg-accent/30 selection:text-white overflow-x-hidden font-sans relative">
      <div
        className="fixed inset-0 z-[100] pointer-events-none opacity-[0.025] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <Nav onOpenSearch={() => setSearchOpen(true)} onOpenTip={() => setTipOpen(true)} />
      <Hero />
      <AboutSection />
      <Suspense fallback={<SectionFallback />}>
        <MusicSection />
        <ShowsSection />
        <BookingSection />
        <GallerySection />
        <LinktreeSection />
        <Footer
          onOpenLegal={(d) => setLegalDoc(d)}
          onOpenTip={() => setTipOpen(true)}
          onOpenConsent={openConsent}
        />
      </Suspense>

      <LegalModal
        doc={legalDoc}
        onClose={() => setLegalDoc(null)}
        onOpenConsent={openConsent}
      />

      <Suspense fallback={null}>
        <TipJar open={tipOpen} onClose={() => setTipOpen(false)} />
        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onOpenLegal={(d) => setLegalDoc(d)}
          onOpenTip={() => setTipOpen(true)}
        />
      </Suspense>

      <CookieConsent onOpenPolicy={() => setLegalDoc('cookies')} />
      <StickyBookingCTA />
    </div>
  );
}
