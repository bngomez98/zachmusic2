import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, Copyright, Cookie } from 'lucide-react';

export type LegalDoc = 'privacy' | 'terms' | 'copyright' | 'cookies' | null;

interface Props {
  doc: LegalDoc;
  onClose: () => void;
  onOpenConsent?: () => void;
}

const SITE = 'zacharywalkermusic.com';
const OWNER = 'Zachary Walker';
const CONTACT = 'mgmt@zacharywalkermusic.com';
const EFFECTIVE = 'June 13, 2026';
const JURISDICTION = 'State of Kansas, United States';

export default function LegalModal({ doc, onClose, onOpenConsent }: Props) {
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
    doc === 'copyright' ? 'Copyright & Licensing' :
    doc === 'cookies' ? 'Cookie Policy' : '';

  const Icon =
    doc === 'privacy' ? Shield :
    doc === 'terms' ? FileText :
    doc === 'copyright' ? Copyright :
    doc === 'cookies' ? Cookie : FileText;

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
              {doc === 'cookies' && <CookiesContent onOpenConsent={onOpenConsent} />}
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

/* ---------------------------- PRIVACY ---------------------------- */

function PrivacyContent() {
  return (
    <>
      <p>
        This Privacy Policy ("Policy") explains how {OWNER} ("we," "us," or "our") collects, uses, discloses, and
        protects personal information when you access or interact with <span className="text-text-main">{SITE}</span>{' '}
        and any related pages or forms (collectively, the "Site"). By using the Site you acknowledge that you have
        read this Policy. If you do not agree, please discontinue use of the Site.
      </p>

      <H>1. Information We Collect</H>
      <p><span className="text-text-main">a. Information you voluntarily provide.</span> When you subscribe to the
        newsletter, submit a booking inquiry, contact us, or otherwise interact with a form, you may provide:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Identifiers: name, email address, telephone number;</li>
        <li>Event details: venue, location, date, type of event, budget, and free-form notes;</li>
        <li>Any other content you choose to include in messages to us.</li>
      </ul>
      <p>
        <span className="text-text-main">b. Information collected automatically.</span> Our hosting and analytics
        providers may collect standard log data including IP address, approximate geolocation, device and browser
        type, operating system, referring URL, language preference, pages viewed, and time stamps. We use this
        information to operate, secure, and improve the Site.
      </p>
      <p>
        <span className="text-text-main">c. Cookies and similar technologies.</span> See our Cookie Policy for a full
        description of cookies, local storage, and pixels used on the Site, including how to manage your preferences.
      </p>
      <p>
        <span className="text-text-main">d. Information from third parties.</span> If you interact with embedded
        third-party content (Instagram, Facebook, YouTube, streaming services), those platforms may share information
        with us in accordance with their own policies.
      </p>
      <p>
        <span className="text-text-main">e. Sensitive information.</span> We do not request or knowingly collect
        sensitive categories of personal information (e.g., government IDs, financial account numbers, health data).
        Please do not submit such data through the Site.
      </p>

      <H>2. How We Use Information</H>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>To send newsletter updates, show announcements, and release information you have requested;</li>
        <li>To respond to booking inquiries, contact form messages, and other communications;</li>
        <li>To prepare quotes, contracts, invoices, and other materials related to booked performances;</li>
        <li>To operate, maintain, secure, debug, and improve the Site;</li>
        <li>To prevent abuse, enforce our Terms, and comply with applicable law;</li>
        <li>To produce aggregated, de-identified analytics that do not identify any individual.</li>
      </ul>

      <H>3. Legal Bases for Processing (EEA/UK Visitors)</H>
      <p>
        Where the EU General Data Protection Regulation ("GDPR") or UK GDPR applies, we rely on the following lawful
        bases: <em>consent</em> (e.g., newsletter sign-up and non-essential cookies); <em>performance of a contract or
        steps prior to a contract</em> (e.g., booking inquiries); <em>legitimate interests</em> (e.g., securing and
        improving the Site, responding to messages); and <em>legal obligation</em> (e.g., responding to lawful
        requests).
      </p>

      <H>4. Sharing of Information</H>
      <p>We do not sell personal information for monetary consideration. We share information only as follows:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><span className="text-text-main">Service providers</span> that help us run the Site — hosting, content
          delivery, email delivery, analytics, payment processors, and form storage — bound by confidentiality and
          data-protection obligations and authorized to use information only to provide their services to us;</li>
        <li><span className="text-text-main">Promoters, venues, or co-performers</span> in connection with confirmed
          bookings, limited to what is necessary to fulfill the engagement;</li>
        <li><span className="text-text-main">Legal & safety</span> — where required by law, subpoena, court order,
          or to protect rights, property, or safety of {OWNER}, users, or others;</li>
        <li><span className="text-text-main">Business transfers</span> — in connection with a sale, merger, or
          restructuring of the music business, subject to this Policy or notice of any material change.</li>
      </ul>

      <H>5. Data Retention</H>
      <p>
        We keep personal information only as long as needed for the purposes described above, then delete or
        de-identify it. Indicative retention periods:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Newsletter subscribers: until you unsubscribe, plus up to 30 days for removal logs;</li>
        <li>Booking inquiries: up to 24 months for follow-up, business records, and tax/accounting purposes;</li>
        <li>Server and security logs: up to 12 months;</li>
        <li>Records required by law (e.g., financial records): for the legally required retention period.</li>
      </ul>

      <H>6. Security</H>
      <p>
        We implement reasonable administrative, technical, and physical safeguards designed to protect personal
        information against unauthorized access, alteration, disclosure, or destruction. No system is 100% secure;
        you are responsible for keeping the credentials and devices you use to access the Site secure.
      </p>

      <H>7. Your Rights</H>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Know, access, or receive a copy of the personal information we hold about you;</li>
        <li>Correct inaccurate personal information;</li>
        <li>Delete personal information;</li>
        <li>Restrict or object to certain processing;</li>
        <li>Withdraw consent at any time where processing is based on consent;</li>
        <li>Unsubscribe from marketing communications;</li>
        <li>Lodge a complaint with your local data-protection authority;</li>
        <li>For California residents, opt out of "sharing" of personal information for cross-context behavioral
          advertising (we do not currently engage in such sharing) and exercise rights under the CCPA/CPRA without
          discriminatory treatment.</li>
      </ul>
      <p>
        To exercise any right, email{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>. We will respond within the
        timeframe required by applicable law and may need to verify your identity before fulfilling the request.
      </p>

      <H>8. International Transfers</H>
      <p>
        We operate from the United States. If you access the Site from outside the U.S., your information may be
        transferred to, processed, and stored in the U.S. or other countries where our service providers operate. By
        using the Site you consent to such transfer where lawful.
      </p>

      <H>9. Third-Party Links & Embeds</H>
      <p>
        The Site links to and embeds third-party services (Instagram, Facebook, streaming platforms, payment
        processors). Their privacy practices are governed by their own policies and we are not responsible for their
        content or practices.
      </p>

      <H>10. Children's Privacy</H>
      <p>
        The Site is not directed to children under 13 (or under 16 in the EEA/UK). We do not knowingly collect
        personal information from minors. If you believe a child has provided us personal information, contact us
        and we will delete it.
      </p>

      <H>11. "Do Not Track" & Global Privacy Control</H>
      <p>
        Our Site honors recognized opt-out signals such as the Global Privacy Control ("GPC") to the extent required
        by applicable law. Because there is no industry standard for "Do Not Track" browser signals, we do not
        respond to those signals separately.
      </p>

      <H>12. Changes to This Policy</H>
      <p>
        We may update this Policy from time to time. The "Effective" date above indicates the latest revision.
        Material changes will be communicated by a prominent notice on the Site or by email where appropriate.
      </p>

      <H>13. Contact</H>
      <p>
        Questions, requests, or complaints about this Policy can be sent to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>
    </>
  );
}

/* ---------------------------- TERMS ---------------------------- */

function TermsContent() {
  return (
    <>
      <p>
        These Terms &amp; Conditions ("Terms") form a binding agreement between you and {OWNER} ("we," "us," "our")
        governing your access to and use of <span className="text-text-main">{SITE}</span> and any related pages,
        forms, embeds, and services (collectively, the "Site"). By accessing the Site you agree to these Terms. If
        you do not agree, do not use the Site.
      </p>

      <H>1. Eligibility</H>
      <p>
        You must be at least 13 years old (16 in the EEA/UK) to use the Site. By using the Site you represent that
        you meet this requirement and have the legal capacity to enter into these Terms.
      </p>

      <H>2. Acceptable Use</H>
      <p>You agree not to:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Violate any applicable law, regulation, or third-party right;</li>
        <li>Reproduce, distribute, publicly perform, broadcast, modify, or create derivative works from any content
          on the Site without prior written permission, except as expressly permitted herein;</li>
        <li>Use any automated system (including bots, crawlers, scrapers, and headless browsers) to access, copy, or
          index the Site or its content, except for well-behaved search-engine indexing in accordance with our
          robots directives;</li>
        <li>Use any content on the Site — including text, lyrics, audio, video, or images — to train, fine-tune,
          evaluate, benchmark, or otherwise feed any machine-learning model, generative AI, or similar system;</li>
        <li>Probe, scan, or test the vulnerability of the Site or attempt to bypass any access controls;</li>
        <li>Upload or transmit viruses, malware, or any malicious code;</li>
        <li>Interfere with, disable, or compromise the Site's security, availability, or operation;</li>
        <li>Misrepresent your identity or impersonate {OWNER} or any other person;</li>
        <li>Use the Site to send unsolicited communications, spam, or harassment.</li>
      </ul>

      <H>3. Permitted Personal Use</H>
      <p>You may:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Stream and view content on the Site for personal, non-commercial enjoyment;</li>
        <li>Share unmodified links to the Site on social media;</li>
        <li>Quote brief excerpts of text on the Site for the purpose of news reporting, commentary, or review with
          attribution to "{OWNER} — {SITE}".</li>
      </ul>
      <p>
        Any other use — including downloading audio or video, screen recording, broadcasting, sampling, remixing,
        synchronization with other media, re-uploading, or any commercial use — requires our prior written permission.
      </p>

      <H>4. Intellectual Property</H>
      <p>
        All content on the Site — including original musical compositions, sound recordings, lyrics, performances,
        photography, video, artwork, graphics, the "Zachary Walker" name and stylized mark, and the Site's design and
        source code — is the exclusive property of {OWNER} or its licensors, and is protected by United States and
        international copyright, trademark, trade dress, publicity, and other laws. See the
        <span className="text-text-main"> Copyright &amp; Licensing</span> notice for the full reservation of rights.
      </p>

      <H>5. User Submissions (Forms, Requests, Newsletter)</H>
      <p>
        When you submit content through a form on the Site (including booking inquiries, contact messages, song
        requests, or newsletter sign-ups), you represent that:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>The information you provide is accurate and your own;</li>
        <li>You have all rights necessary to provide it;</li>
        <li>Your submission does not violate any law or third-party right.</li>
      </ul>
      <p>
        You grant us a non-exclusive, worldwide, royalty-free license to use your submission for the limited purpose
        of responding to it and operating the Site. Submitting a song request does not guarantee performance.
      </p>

      <H>6. Bookings &amp; Engagements</H>
      <p>
        Submitting a booking inquiry creates no contract. Bookings are non-binding until confirmed in a signed
        written agreement (including via email) specifying date, location, fee, and other material terms. Quoted
        rates exclude travel, lodging, sound reinforcement, and applicable taxes unless explicitly stated.
        Cancellation, deposit, and force-majeure terms apply as set forth in the signed booking agreement.
      </p>

      <H>7. Newsletter &amp; Communications</H>
      <p>
        By submitting your email to the newsletter, you consent to receive periodic emails about releases, shows, and
        related news. You may unsubscribe at any time via the link in any newsletter email or by contacting{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>. Transactional emails
        (e.g., replies to booking inquiries) are not part of the newsletter and are sent regardless of marketing
        preferences.
      </p>

      <H>8. Third-Party Services &amp; Payments</H>
      <p>
        The Site links to and integrates with third-party services such as Instagram, Facebook, PayPal, Cash App,
        Venmo, and streaming platforms. Your use of those services is governed by their own terms and privacy
        policies, and we are not responsible for their content, availability, or practices. Payments and tips made
        through third-party services are processed solely by those services; {OWNER} does not directly handle your
        payment-card data.
      </p>

      <H>9. Disclaimer of Warranties</H>
      <p>
        THE SITE AND ALL CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND,
        EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. {OWNER} DOES NOT
        WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR HARMFUL CODE.
      </p>

      <H>10. Limitation of Liability</H>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, {OWNER.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, OR ANY LOSS OF PROFITS, REVENUES, DATA,
        GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE. IN NO EVENT WILL OUR
        TOTAL CUMULATIVE LIABILITY ARISING OUT OF THE SITE EXCEED ONE HUNDRED U.S. DOLLARS (US $100). SOME
        JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, IN WHICH CASE THE ABOVE
        LIMITATIONS APPLY TO THE FULLEST EXTENT PERMITTED.
      </p>

      <H>11. Indemnification</H>
      <p>
        You agree to defend, indemnify, and hold harmless {OWNER}, his agents, and affiliates from and against any
        claims, damages, liabilities, losses, costs, and expenses (including reasonable attorneys' fees) arising out
        of or related to (a) your misuse of the Site, (b) your violation of these Terms, or (c) your violation of any
        third-party right.
      </p>

      <H>12. Termination</H>
      <p>
        We may suspend or terminate your access to the Site, in whole or in part, at any time, with or without
        notice, for any reason, including breach of these Terms. Sections of these Terms that by their nature should
        survive termination will survive.
      </p>

      <H>13. Governing Law &amp; Venue</H>
      <p>
        These Terms are governed by the laws of the {JURISDICTION}, without regard to conflict-of-law principles. Any
        dispute arising out of or relating to these Terms or the Site shall be resolved exclusively in the state or
        federal courts located in Shawnee County, Kansas, and you submit to the personal jurisdiction of those
        courts. The United Nations Convention on Contracts for the International Sale of Goods does not apply.
      </p>

      <H>14. Informal Dispute Resolution</H>
      <p>
        Before filing a claim, you agree to first contact us at{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a> and attempt in good faith
        to resolve the dispute informally for at least 30 days.
      </p>

      <H>15. Severability &amp; Waiver</H>
      <p>
        If any provision of these Terms is held invalid or unenforceable, the remaining provisions will remain in
        full force. Our failure to enforce a provision is not a waiver of our right to do so later.
      </p>

      <H>16. Entire Agreement</H>
      <p>
        These Terms, together with the Privacy Policy, Cookie Policy, and Copyright &amp; Licensing notice, constitute
        the entire agreement between you and {OWNER} regarding the Site and supersede any prior agreements.
      </p>

      <H>17. Changes</H>
      <p>
        We may revise these Terms at any time by posting a revised version on the Site. Material changes will be
        noted by updating the "Effective" date and, where appropriate, by additional notice. Continued use of the
        Site after changes constitutes acceptance.
      </p>

      <H>18. Contact</H>
      <p>
        Questions about these Terms can be sent to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>
    </>
  );
}

/* ---------------------------- COPYRIGHT ---------------------------- */

function CopyrightContent() {
  const year = new Date().getFullYear();
  return (
    <>
      <p className="border border-accent/30 bg-accent/5 rounded-lg p-4">
        <span className="text-text-main font-medium">&copy; 2023&ndash;{year} {OWNER}. All Rights Reserved.</span>
        <br />
        All original musical works, sound recordings, lyrics, performances, photography, video, artwork, and website
        design and source code appearing on this Site are the exclusive property of {OWNER} and are protected by
        United States and international copyright, trademark, and related laws.
      </p>

      <H>1. Ownership of Musical Works</H>
      <p>
        {OWNER} is the sole author, composer, performer, and copyright owner of the original songs published or
        performed under the "Zachary Walker" name, including but not limited to <em>"Love and Madness"</em> (2023)
        and any forthcoming releases (collectively, the "Works"). Unless otherwise expressly stated, both the
        underlying musical composition (words and music) and the master sound recording for each Work are owned
        100% by {OWNER}. All publishing rights are administered self-directly by {OWNER} (sole publisher) unless a
        separate publishing agreement is in effect.
      </p>

      <H>2. Cover Songs</H>
      <p>
        Where the Site references or showcases performances of compositions written by third parties (i.e., cover
        songs), the underlying compositions remain the property of their respective writers and publishers and any
        public performance is conducted under applicable performing-rights licensing (e.g., ASCAP, BMI, or SESAC, as
        administered by the venue), and any reproduction is conducted under a compulsory mechanical license under
        17 U.S.C. § 115 or applicable streaming-platform clearance. The recorded performances by {OWNER} of such
        cover songs are owned by {OWNER}.
      </p>

      <H>3. Trademarks &amp; Trade Dress</H>
      <p>
        "Zachary Walker," the stylized "Z" mark, the typographic identity, and the look-and-feel of this Site are
        unregistered common-law trademarks and trade dress of {OWNER}. Unauthorized use, including in band names,
        merchandise, domain names, or AI-generated content, is prohibited and may constitute trademark infringement,
        unfair competition, or passing off.
      </p>

      <H>4. Photography, Video, &amp; Artwork</H>
      <p>
        All photography, video, and artwork on the Site are owned by {OWNER} or used with permission of the rights
        holder. No grant of license is given by their display.
      </p>

      <H>5. Reservation of Rights</H>
      <p>
        No license — express or implied — is granted by the display, transmission, or distribution of any content on
        the Site. All rights not expressly granted are reserved, including without limitation:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Reproduction, duplication, downloading, or storage of audio, video, lyrics, or images;</li>
        <li>Public performance, broadcast, webcast, or simulcast;</li>
        <li>Synchronization with audiovisual works;</li>
        <li>Sampling, looping, remixing, mashups, edits, or derivative works;</li>
        <li>Re-uploading to any streaming, social, or user-generated-content platform;</li>
        <li>Use of any content (including audio, video, lyrics, and images) to train, fine-tune, evaluate, or
          benchmark any machine-learning model, large language model, generative audio/image model, or similar
          AI system;</li>
        <li>Use of voice or likeness to create deepfakes, voice clones, or AI vocal models;</li>
        <li>Commercial use of any kind, including NFTs or other blockchain-based reproductions.</li>
      </ul>

      <H>6. AI &amp; Machine-Learning Opt-Out</H>
      <p>
        For the avoidance of doubt, no use of any content on this Site for training, fine-tuning, retrieval-augmented
        generation, or evaluation of machine-learning models is authorized. This opt-out is asserted in the Site's
        robots and meta directives (including <code className="text-text-main font-mono text-xs">noai</code> and{' '}
        <code className="text-text-main font-mono text-xs">noimageai</code>), in our <code className="text-text-main font-mono text-xs">robots.txt</code>,
        and in the Terms.
      </p>

      <H>7. Permitted Personal Use</H>
      <p>
        Visitors may stream and view content for personal, non-commercial enjoyment and share unmodified links to
        the Site on social media. Any other use requires prior written permission.
      </p>

      <H>8. Licensing Inquiries</H>
      <p>
        Inquiries for sync licensing, master-use, mechanical licensing, press use, interviews, cover-song clearance,
        publishing, or any other licensing arrangement should be directed to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>. Each request is
        reviewed individually. Silence or non-response does not constitute consent. Standard licensing terms
        typically include: scope of use, term, territory, media, exclusivity, credit, and fee.
      </p>

      <H>9. DMCA / Infringement Notices</H>
      <p>
        To report material on the Site that allegedly infringes your copyright, or to report unauthorized use of
        {OWNER}'s copyrighted works elsewhere, send a written DMCA notice including:
      </p>
      <ol className="list-decimal pl-5 space-y-1.5">
        <li>Identification of the copyrighted work claimed to have been infringed;</li>
        <li>Identification of the material claimed to be infringing and its URL or location;</li>
        <li>Your contact information (name, address, phone, email);</li>
        <li>A statement that you have a good-faith belief that the use is not authorized by the rights holder,
          its agent, or the law;</li>
        <li>A statement under penalty of perjury that the information is accurate and that you are authorized to
          act on behalf of the rights holder;</li>
        <li>Your physical or electronic signature.</li>
      </ol>
      <p>
        Send notices to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a> with subject line
        "DMCA Notice".
      </p>

      <H>10. Counter-Notice</H>
      <p>
        If your content was removed in response to a DMCA notice and you believe the removal was a mistake, you may
        submit a counter-notice that includes (a) identification of the material removed and its prior location;
        (b) a statement under penalty of perjury that you have a good-faith belief the material was removed by
        mistake or misidentification; (c) your contact information and consent to jurisdiction; and (d) your
        signature.
      </p>

      <H>11. Repeat-Infringer Policy</H>
      <p>
        It is our policy, in appropriate circumstances, to terminate access for users or visitors who are repeat
        infringers of intellectual-property rights.
      </p>

      <H>12. Enforcement &amp; Statutory Damages</H>
      <p>
        {OWNER} actively monitors and enforces these rights through takedown requests, platform content claims,
        cease-and-desist letters, and civil litigation. Under U.S. law (17 U.S.C. § 504(c)), willful infringement may
        result in statutory damages of up to <span className="text-text-main">$150,000 per work infringed</span>,
        plus costs and attorneys' fees.
      </p>

      <H>13. Performing-Rights Organizations</H>
      <p>
        Public performances of {OWNER}'s original Works should be reported to the venue's performing-rights
        organization (ASCAP, BMI, or SESAC, as applicable). Unauthorized public performance may give rise to
        infringement liability.
      </p>

      <H>14. Right of Publicity</H>
      <p>
        The name, image, voice, signature, and likeness of {OWNER} are protected by the right of publicity. Use of
        any of the foregoing for commercial purposes, endorsements, merchandise, or AI-generated content without
        prior written authorization is prohibited.
      </p>

      <H>15. Press Use</H>
      <p>
        Journalists and reviewers may quote brief excerpts of text and embed official streams from authorized
        platforms with attribution. For high-resolution photos, EPK, or interview requests, contact{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>

      <p className="text-xs text-text-muted/70 pt-4 border-t border-white/5 mt-6">
        This notice is provided for informational purposes and is not legal advice. Specific situations may require
        consultation with qualified legal counsel.
      </p>
    </>
  );
}

/* ---------------------------- COOKIES ---------------------------- */

function CookiesContent({ onOpenConsent }: { onOpenConsent?: () => void }) {
  return (
    <>
      <p>
        This Cookie Policy explains how {OWNER} uses cookies and similar technologies on{' '}
        <span className="text-text-main">{SITE}</span> (the "Site"). It should be read together with our Privacy
        Policy and Terms &amp; Conditions.
      </p>

      <H>1. What Are Cookies?</H>
      <p>
        "Cookies" are small text files stored on your device when you visit a website. We use the term broadly to
        cover related browser-storage technologies including <em>localStorage</em>, <em>sessionStorage</em>, and
        tracking pixels. Cookies can be set by us ("first-party") or by third-party services we embed
        ("third-party"). They can be temporary ("session") or persistent.
      </p>

      <H>2. Categories of Cookies We Use</H>

      <p><span className="text-text-main">a. Strictly Necessary (Always On).</span> Required for the Site to function
        — for example, remembering your cookie-consent choices, securing form submissions, and basic load balancing.
        These cannot be disabled.</p>
      <ul className="list-disc pl-5 space-y-1 text-xs">
        <li><code className="text-text-main font-mono">zw_consent</code> (localStorage) — stores your consent preferences and the timestamp.</li>
        <li><code className="text-text-main font-mono">zw_setlist</code>, <code className="text-text-main font-mono">zw_voted_ids</code>, <code className="text-text-main font-mono">zw_custom_requests</code> (localStorage) — store your song-request and voting activity locally on your device only.</li>
      </ul>

      <p><span className="text-text-main">b. Analytics (Optional).</span> Help us understand how visitors use the
        Site so we can improve it (e.g., aggregated page views, referrer, device type). Loaded only with your
        consent.</p>

      <p><span className="text-text-main">c. Marketing (Optional).</span> Used to measure the performance of
        newsletter campaigns and, where applicable, to support remarketing. Loaded only with your consent.</p>

      <p><span className="text-text-main">d. Third-Party Embeds.</span> Embedded content (Instagram, Facebook,
        YouTube, streaming services, PayPal, Cash App, Venmo) may set their own cookies under their own policies
        when you interact with that content. We do not control these cookies.</p>

      <H>3. Your Choices</H>
      <p>
        On your first visit, you will be presented with a consent banner allowing you to: (i) accept all categories,
        (ii) reject all non-essential categories, or (iii) manage each category individually. Your choice is saved
        locally and respected on return visits.
      </p>
      {onOpenConsent && (
        <p>
          You can change your choice at any time by{' '}
          <button onClick={onOpenConsent} className="text-accent hover:underline">opening your cookie preferences</button>.
        </p>
      )}

      <H>4. Browser Controls</H>
      <p>
        Most browsers let you block or delete cookies through their settings. Blocking strictly-necessary cookies may
        break parts of the Site. For information specific to your browser, see your browser's help documentation.
      </p>

      <H>5. Global Privacy Control</H>
      <p>
        Where required by applicable law, we honor recognized opt-out signals such as Global Privacy Control ("GPC")
        for non-essential cookies categorized as "sharing" or "sale" under that law.
      </p>

      <H>6. Changes</H>
      <p>
        We may update this Cookie Policy from time to time. Material changes will be communicated by updating the
        "Effective" date above.
      </p>

      <H>7. Contact</H>
      <p>
        Questions about this Cookie Policy can be sent to{' '}
        <a href={`mailto:${CONTACT}`} className="text-accent hover:underline">{CONTACT}</a>.
      </p>
    </>
  );
}
