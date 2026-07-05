import React, { useState } from 'react';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import MusicSection from '@/components/MusicSection';
import ShowsSection from '@/components/ShowsSection';
import BookingSection from '@/components/BookingSection';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import LegalModal, { type LegalDoc } from '@/components/LegalModal';
import TipJar from '@/components/TipJar';
import SearchModal from '@/components/SearchModal';
import StickyBookingCTA from '@/components/StickyBookingCTA';

export default function App() {
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openConsent = () => window.dispatchEvent(new Event('zw:open-consent'));

  return (
    <div className="min-h-screen bg-base text-text-main">
      <Nav
        onOpenSearch={() => setSearchOpen(true)}
        onOpenTip={() => setTipOpen(true)}
      />

      <main>
        <Hero />
        <AboutSection />
        <MusicSection />
        <ShowsSection />
        <BookingSection />
      </main>

      <Footer
        onOpenLegal={setLegalDoc}
        onOpenTip={() => setTipOpen(true)}
        onOpenConsent={openConsent}
      />

      <StickyBookingCTA />
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} onOpenConsent={openConsent} />
      <TipJar open={tipOpen} onClose={() => setTipOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onOpenLegal={setLegalDoc} onOpenTip={() => setTipOpen(true)} />
      <CookieConsent onOpenPolicy={() => setLegalDoc('cookies')} />
    </div>
  );
}
