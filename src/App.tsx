import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import LegalModal, { type LegalDoc } from '@/components/LegalModal';
import TipJar from '@/components/TipJar';
import SearchModal from '@/components/SearchModal';
import StickyBookingCTA from '@/components/StickyBookingCTA';
import AudioPlayer from '@/components/AudioPlayer';
import ScrollToTop from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import MusicPage from '@/pages/MusicPage';
import ShowsPage from '@/pages/ShowsPage';
import BookingPage from '@/pages/BookingPage';
import ContactPage from '@/pages/ContactPage';

export default function App() {
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openConsent = () => window.dispatchEvent(new Event('zw:open-consent'));

  return (
    <div className="min-h-screen bg-base text-text-main">
      <ScrollToTop />
      <Nav
        onOpenSearch={() => setSearchOpen(true)}
        onOpenTip={() => setTipOpen(true)}
      />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/shows" element={<ShowsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <Footer
        onOpenLegal={setLegalDoc}
        onOpenConsent={openConsent}
        onOpenTip={() => setTipOpen(true)}
      />

      <StickyBookingCTA />
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} onOpenConsent={openConsent} />
      <TipJar open={tipOpen} onClose={() => setTipOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onOpenLegal={setLegalDoc} onOpenTip={() => setTipOpen(true)} />
      <AudioPlayer />
      <CookieConsent onOpenPolicy={() => setLegalDoc('cookies')} />
    </div>
  );
}
