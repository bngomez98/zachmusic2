import React, { useState, lazy, Suspense, useEffect } from 'react';
import Header from '@/components/design/Header';
import Hero from '@/components/design/Hero';
import About from '@/components/design/About';
import Player from '@/components/design/Player';
import ShowsSection from '@/components/ShowsSection';
import BookingSection from '@/components/BookingSection';
import CookieConsent from '@/components/CookieConsent';
import LegalModal, { type LegalDoc } from '@/components/LegalModal';
import TipJar from '@/components/TipJar';
import Footer from '@/components/Footer';
import ReleasesSection from '@/components/design/Releases';

export default function App() {
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [audioSrc, setAudioSrc] = useState('/loveandmadness.mp3');

  const openConsent = () => window.dispatchEvent(new Event('zw:open-consent'));

  useEffect(() => {
    const onOpenPlayer = (e: Event) => {
      const detail = (e as CustomEvent)?.detail || {};
      const src = detail.src || '/loveandmadness.mp3';
      setAudioSrc(src);
      setAudioOpen(true);
    };
    window.addEventListener('zw:open-player', onOpenPlayer as EventListener);
    return () => window.removeEventListener('zw:open-player', onOpenPlayer as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-base text-text-main">
      <Header
        onOpenTip={() => setTipOpen(true)}
      />

      <main>
        <Hero />
        <ReleasesSection />
        <About />
        <ShowsSection />
        <BookingSection />
      </main>

      <Footer
        onOpenLegal={setLegalDoc}
        onOpenTip={() => setTipOpen(true)}
        onOpenConsent={openConsent}
      />

      {audioOpen && (
        <Player src={audioSrc} onClose={() => setAudioOpen(false)} />
      )}

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} onOpenConsent={openConsent} />
      <TipJar open={tipOpen} onClose={() => setTipOpen(false)} />
      <CookieConsent onOpenPolicy={() => setLegalDoc('cookies')} />
    </div>
  );
}
