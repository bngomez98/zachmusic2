import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, Copyright } from 'lucide-react';

export type LegalDoc = 'privacy' | 'terms' | 'copyright' | null;

interface Props {
  doc: LegalDoc;
  onClose: () => void;
}

const SITE = 'zacharywalkermusic.com';
const OWNER = 'Zachary Walker';
const CONTACT = 'mgmt@zacharywalkermusic.com';
const EFFECTIVE = 'June 13, 2026';

export default function LegalModal({ doc, onClose }: Props) {
  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [doc, onClose]);

  const title =
    doc === 'privacy' ? 'Privacy Policy' :
    doc === 'terms' ? 'Terms & Conditions' :
    doc === 'copyright' ? 'Copyright & Licensing' : '';

  const Icon = doc === 'privacy' ? Shield : doc === 'terms' ? FileText : Copyright;

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/5 sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-accent/40 flex items-center justify-center">
                  <Icon size={16} className="text-accent" />
                </div>
                <div>
                  <h2 id="legal-title" className="font-display text-xl md:text-2xl text-text-main tracking-tight">{title}</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted/70 font-mono">Effective {EFFECTIVE}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-text-muted hover:text-accent transition-colors p-2 rounded-full hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 md:px-8 py-8 text-text-muted text-sm leading-relaxed space-y-5 font-light">
              {doc === 'privacy' && <PrivacyContent />}
              {doc === 'terms' && <TermsContent />}
              {doc === 'copyright' && <CopyrightContent />}
            </div>

            <div className="px-6 md:px-8 py-4 border-t border-white/5 bg-base/40 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-text-muted/60 font-mono">
              <span>&copy; {new Date().getFullYear()} {OWNER}</span>
              <a href={`mailto:${CONTACT}`} className="hover:text-accent transition-colors">Contact</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg text-accent mt-6 first:mt-0 mb-2 tracking-tight">{children}</h3>;
}

function PrivacyContent() {
  return (
    <>
      <p>
        This Privacy Policy describes how {OWNER} ("we," "us," or "our") collects, uses, and protects
        information when you visit <span className="text-text-main">{SITE}</span> (the "Site"). By using the Site you
        consent to the practices described below.
      </p>

      <H>Information We Collect</H>
      <p>
        <span className="text-text-main">Information you provide.</span> When you subscribe to the newsletter, email us,
        or otherwise contact us, you may provide your name, email address, and any content you choose to share.
      </p>
      <p>
        <span className="text-text-main">Automatically collected information.</span> When you visit the Site, our hosting
        provider and analytics tools may collect standard log data such as IP address, browser type, device type, pages
        visited, referring URLs, and timestamps. This data is used to operate, secure, and improve the Site.
      </p>

      <H>How We Use Information</H>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>To send newsletter updates, show announcements, and release information you requested.</li>
        <li>To respond to bookings, inquiries, and other messages.</li>
        <li>To operate, maintain, secure, and improve the Site.</li>
        <li>To comply with applicable law and enforce our Terms.</li>
      </ul>

      <H>Sharing of Information</H>
      <p>
        We do not sell your personal information. We share information only with service providers that help us run the
        Site (for example, hosting, email delivery, and analytics) under confidentiality obligations, or when required
        by law.
      </p>

      <H>Cookies & Tracking</H>
      <p>
        The Site may use cookies and similar technologies for essential functionality and basic analytics. You can
        configure your browser to refuse cookies, though some features may not work as intended.
      </p>

      <H>Third-Party Links & Embeds</H>
      <p>
        The Site links to and embeds third-party services (Instagram, Facebook, streaming platforms). Their privacy
        practices are governed by their own policies and we are not responsible for their content.
      </p>

      <H>Data Retention & Security</H>
      <p>
        We retain personal information only as long as necessary for the purposes described above. We use reasonable
        administrative and technical safeguards, but no system can be guaranteed 100% secure.
      </p>

      <H>Your Rights</H>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or restrict use of your personal
        information, and to unsubscribe from communications at any time. To exercise these rights, email{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>

      <H>Children</H>
      <p>The Site is not directed to children under 13, and we do not knowingly collect their personal information.</p>

      <H>Changes to This Policy</H>
      <p>
        We may update this Privacy Policy from time to time. The "Effective" date above indicates the latest revision.
        Continued use of the Site after changes constitutes acceptance.
      </p>

      <H>Contact</H>
      <p>
        Questions or requests about this Policy can be sent to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p>
        These Terms & Conditions ("Terms") govern your access to and use of <span className="text-text-main">{SITE}</span>{' '}
        (the "Site"), operated by {OWNER}. By accessing the Site you agree to these Terms. If you do not agree, please
        do not use the Site.
      </p>

      <H>Eligibility & Acceptable Use</H>
      <p>You agree to use the Site only for lawful purposes and not to:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Violate any applicable law or third-party rights;</li>
        <li>Reproduce, distribute, modify, or create derivative works from any content without written permission;</li>
        <li>Use automated systems (bots, scrapers) to access the Site without consent;</li>
        <li>Attempt to interfere with, disable, or compromise the Site's security or operation;</li>
        <li>Upload or transmit any malicious code or harmful content.</li>
      </ul>

      <H>Intellectual Property</H>
      <p>
        All content on the Site — including original musical compositions, sound recordings, lyrics, performances,
        photography, video, artwork, graphics, the "Zachary Walker" name and stylized mark, and the Site's design and
        code — is the exclusive property of {OWNER} and is protected by United States and international copyright,
        trademark, and other intellectual property laws. All rights are reserved. See the{' '}
        <span className="text-text-main">Copyright & Licensing</span> notice for full details.
      </p>

      <H>Permitted Personal Use</H>
      <p>
        You may stream and view content on the Site for personal, non-commercial enjoyment. You may share links to the
        Site on social media in their unmodified form. Any other use — including downloading, recording, broadcasting,
        sampling, remixing, reuploading, AI training, or commercial use — requires prior written permission.
      </p>

      <H>Bookings, Newsletter & Communications</H>
      <p>
        Booking inquiries and newsletter sign-ups are non-binding until confirmed in writing. You may unsubscribe from
        the newsletter at any time using the link provided in any email, or by contacting{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>

      <H>Third-Party Services</H>
      <p>
        The Site links to third-party platforms (Instagram, Facebook, streaming services, payment processors). We are
        not responsible for their content, terms, or availability.
      </p>

      <H>Disclaimer</H>
      <p>
        The Site is provided on an "as is" and "as available" basis without warranties of any kind, express or implied,
        including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the
        Site will be uninterrupted, secure, or error-free.
      </p>

      <H>Limitation of Liability</H>
      <p>
        To the fullest extent permitted by law, {OWNER} shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages, or any loss of profits or revenues, arising out of your use of the Site.
      </p>

      <H>Indemnification</H>
      <p>
        You agree to indemnify and hold harmless {OWNER} from any claims, damages, or expenses arising out of your
        misuse of the Site or violation of these Terms.
      </p>

      <H>Governing Law</H>
      <p>
        These Terms are governed by the laws of the State of Kansas, United States, without regard to its conflict-of-law
        rules. Any disputes shall be resolved exclusively in the state or federal courts located in Shawnee County, Kansas.
      </p>

      <H>Changes to These Terms</H>
      <p>
        We may revise these Terms at any time. Continued use of the Site after changes constitutes acceptance.
      </p>

      <H>Contact</H>
      <p>
        Questions about these Terms can be sent to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>
    </>
  );
}

function CopyrightContent() {
  const year = new Date().getFullYear();
  return (
    <>
      <p className="border border-accent/30 bg-accent/5 rounded-lg p-4">
        <span className="text-text-main font-medium">&copy; 2023&ndash;{year} {OWNER}. All Rights Reserved.</span>
        <br />
        All original musical works, sound recordings, lyrics, performances, photography, video, artwork, and website
        design appearing on this Site are the exclusive property of {OWNER} and are protected by United States and
        international copyright law.
      </p>

      <H>Ownership of Works</H>
      <p>
        {OWNER} is the sole author, composer, performer, and copyright owner of all original songs, including but not
        limited to <em>"Love and Madness"</em> and any forthcoming releases ("the Works"). All master recordings,
        underlying musical compositions, and lyrics are owned 100% by {OWNER} unless otherwise expressly stated.
      </p>

      <H>Trademarks</H>
      <p>
        The name "Zachary Walker," the stylized "Z" mark, and related logos, taglines, and visual identity are
        trademarks of {OWNER}. Unauthorized use is prohibited.
      </p>

      <H>Reservation of Rights</H>
      <p>
        No license — express or implied — is granted by the display of any content on the Site. All rights not
        expressly granted are reserved, including without limitation:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Reproduction, duplication, or downloading of audio, video, lyrics, or images;</li>
        <li>Public performance, broadcast, or synchronization;</li>
        <li>Sampling, remixing, mashups, or derivative works;</li>
        <li>Re-uploading to any streaming, social, or AI platform;</li>
        <li>Use of any content (including lyrics and audio) to train, fine-tune, or evaluate machine-learning or
          generative AI models;</li>
        <li>Commercial use of any kind.</li>
      </ul>

      <H>Permission Requests & Licensing</H>
      <p>
        For sync licensing, cover song clearance, press use, interviews, or any other licensing inquiry, contact{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>. Requests are reviewed on a
        case-by-case basis and are not granted by silence or non-response.
      </p>

      <H>Cover Songs</H>
      <p>
        Cover performances of third-party compositions appearing on the Site or affiliated platforms are performed
        under applicable licensing arrangements with the respective rights holders. The underlying compositions remain
        the property of their original copyright owners; the recorded performances are owned by {OWNER}.
      </p>

      <H>DMCA & Infringement Notices</H>
      <p>
        To report content on the Site that infringes your copyright, or to report unauthorized use of {OWNER}'s
        copyrighted works elsewhere, send a written notice including: (a) identification of the work; (b) the URL or
        location of the alleged infringement; (c) your contact information; (d) a good-faith statement; and (e) your
        signature. Send notices to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>

      <H>Enforcement</H>
      <p>
        {OWNER} actively monitors and enforces these rights. Infringement may result in takedown requests, content
        claims, civil litigation, and statutory damages up to $150,000 per work under 17 U.S.C. &sect; 504.
      </p>

      <p className="text-xs text-text-muted/70 pt-4 border-t border-white/5 mt-6">
        This notice is provided for informational purposes and does not constitute legal advice.
      </p>
    </>
  );
}
