'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './EinviteTemplate1.module.css';

/**
 * EinviteTemplate1 — Full pages 1-7 layout
 */

const dict = {
  en: {
    omShree: 'Om Shree Ganeshay Namah',
    togetherWith: 'Together With Their Families',
    cordiallyInvite1: 'Cordially Invite You To Join The Occasion',
    cordiallyInvite2: 'Of Their Joyous Commitment On',
    sonOf: 'Son Of',
    daughterOf: 'Daughter Of',
    weds: 'WEDS',
    introducingLine1: 'Introducing The',
    introducingLine2: 'Groom And Bride',
    whereStoryBegins: 'WHERE OUR STORY BEGINS!',
    saveTheDate: 'Save the Date',
    venue: 'Venue',
    thankYou: 'Thank You',
    thanksLine1: 'For being a part of our joyous union.',
    thanksLine2: 'Your presence and blessings mean the world to us.',
    withLove: 'With love,',
    countdownHeading: 'Counting down to',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    arrived: 'The Big Day Has Arrived! 🎊'
  },
  ta: {
    omShree: 'ஓம் ஸ்ரீ கணேசாய நமஹ',
    togetherWith: 'தங்கள் குடும்பத்தினருடன் இணைந்து',
    cordiallyInvite1: 'இந்த இனிய திருமண விழாவிற்கு',
    cordiallyInvite2: 'தங்களை அன்புடன் அழைக்கிறோம்',
    sonOf: 'இவர்களின் மகன்',
    daughterOf: 'இவர்களின் மகள்',
    weds: 'மற்றும்',
    introducingLine1: 'அறிமுகப்படுத்துகிறோம்',
    introducingLine2: 'மணமகன் மற்றும் மணமகள்',
    whereStoryBegins: 'எங்கள் காதல் பயணம்!',
    saveTheDate: 'தேதியை குறித்துக்கொள்ளுங்கள்',
    venue: 'இடம்',
    thankYou: 'நன்றி',
    thanksLine1: 'எங்கள் திருமணத்தில் கலந்துகொண்டதற்கு',
    thanksLine2: 'தங்கள் வருகையும் ஆசியும் எங்களுக்கு மிகவும் முக்கியம்.',
    withLove: 'அன்புடன்,',
    countdownHeading: 'திருமணத்திற்கு இன்னும்',
    days: 'நாட்கள்',
    hours: 'மணி',
    minutes: 'நிமிடம்',
    seconds: 'வினாடி',
    arrived: 'திருமண நாள் வந்துவிட்டது! 🎊'
  }
};

const nameMap = {
  'Saravanan': 'சரவணன்',
  'Meenakshi': 'மீனாட்சி',
  'Mr. & Mrs. Jayakumar': 'திரு. & திருமதி. ஜெயக்குமார்',
  'Mr. & Mrs. Kumar': 'திரு. & திருமதி. குமார்',
  'Sathish Kumar': 'சதீஷ் குமார்',
  'Priya Loganathan': 'பிரியா லோகநாதன்',
  'Mr. Loganathan & Mrs. Meenakshi': 'திரு. லோகநாதன் & திருமதி. மீனாட்சி',
  'Mr. Rajesh Kumar & Mrs. Lakshmi': 'திரு. ராஜேஷ் குமார் & திருமதி. லட்சுமி',
  'Haldi Ceremony': 'ஹல்தி விழா',
  'Mehendi & Sangeet': 'மெஹந்தி & சங்கீத்',
  'Wedding Ceremony': 'திருமண விழா',
  'Reception': 'வரவேற்பு',
  'Lakshmi Mahal': 'லட்சுமி மகால்',
  '12, Temple Street, Mylapore, Chennai - 600004': '12, கோயில் தெரு, மயிலாப்பூர், சென்னை - 600004',
  'Two souls, one beautiful journey': 'இரு மனங்கள், ஒரு அழகிய பயணம்',
  'Together is a beautiful place to be': 'ஒன்றாக இருப்பது ஒரு அழகான இடம்',
  'Once in a while, right in the middle of an ordinary life, love gives us a fairy tale': 'சாதாரண வாழ்க்கையின் நடுவே, காதல் நமக்கு ஒரு தேவதை கதையைத் தருகிறது',
  '08:15 AM — Siddha Yogam': 'காலை 08:15 — சித்த யோகம்'
};

function translateName(name, lang) {
  if (!name) return '';
  if (lang === 'en') return name;
  return nameMap[name] || name;
}

function FadeText({ text, lang, className, style }) {
  return (
    <motion.span
      key={lang + text}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{ display: 'inline-block', ...style }}
    >
      {text}
    </motion.span>
  );
}

function LanguageSelector({ lang, setLang }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSetLang = (l) => {
    setLang(l);
    setIsOpen(false);
    const params = new URLSearchParams(searchParams);
    params.set('lang', l);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '30px',
          background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #D4AF37',
          backdropFilter: 'blur(10px)', color: '#1C1C1C',
          fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span style={{ whiteSpace: 'nowrap' }}>{lang === 'en' ? 'English' : 'தமிழ்'}</span>
        <motion.svg animate={{ rotate: isOpen ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></motion.svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              background: '#fff', borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)', minWidth: '120px'
            }}
          >
            {['en', 'ta'].map((l) => (
              <div 
                key={l}
                onClick={() => handleSetLang(l)}
                style={{
                  padding: '10px 16px', cursor: 'pointer',
                  background: lang === l ? '#FCF9F2' : 'transparent',
                  color: lang === l ? '#D4AF37' : '#1C1C1C',
                  fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: lang === l ? 600 : 400
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#FCF9F2'}
                onMouseOut={(e) => e.currentTarget.style.background = lang === l ? '#FCF9F2' : 'transparent'}
              >
                {l === 'en' ? 'English' : 'தமிழ்'}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Countdown hook ─────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { done: true };
    return {
      done: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calc);

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

// ─── Countdown UI ────────────────────────────────────────────────────────────
function CountdownTimer({ weddingDate, t }) {
  const timeLeft = useCountdown(weddingDate);
  if (!timeLeft) return null;

  if (timeLeft.done) {
    return (
      <div className={styles.countdownWrapper}>
        <div className={styles.countdownDone}>{t.arrived}</div>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');
  const units = [
    { label: t.days, value: pad(timeLeft.days) },
    { label: t.hours, value: pad(timeLeft.hours) },
    { label: t.minutes, value: pad(timeLeft.minutes) },
    { label: t.seconds, value: pad(timeLeft.seconds) },
  ];

  return (
    <div className={styles.countdownWrapper}>
      <div className={styles.countdownHeading}>{t.countdownHeading}</div>
      <div className={styles.countdownRow}>
        {units.map((unit, i) => (
          <React.Fragment key={unit.label}>
            {i > 0 && <span className={styles.countdownSeparator}>:</span>}
            <div className={styles.countdownBox}>
              <div className={styles.countdownNumber}>{unit.value}</div>
              <div className={styles.countdownLabel}>{unit.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EinviteTemplate1({ invitation = {} }) {
  const {
    groomName = 'Saravanan',
    brideName = 'Meenakshi',
    groomParents = 'Mr. & Mrs. Jayakumar',
    brideParents = 'Mr. & Mrs. Kumar',
    galleryImages = [],
    events = [],
    weddingDate = '',
    tagline = '',
    coupleStory = '',
    coupleTimeline = [],
    preferredLanguage = 'both',
  } = invitation;

  const hasPhotos = galleryImages && galleryImages.length > 0;

  const searchParams = useSearchParams();
  const urlLang = searchParams.get('lang');
  const initialLang = urlLang || (preferredLanguage === 'ta' ? 'ta' : 'en');
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    if (!urlLang && preferredLanguage) {
      setLang(preferredLanguage === 'ta' ? 'ta' : 'en');
    }
  }, [preferredLanguage, urlLang]);
  const t = dict[lang] || dict['en'];

  // Mobile detection for responsive layout
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-detect if all events share the same venue
  const allVenues = events.filter(e => e.venue).map(e => e.venue.trim().toLowerCase());
  const sameVenue = allVenues.length > 1 && allVenues.every(v => v === allVenues[0]);
  const sharedVenue = sameVenue ? events.find(e => e.venue)?.venue : null;
  const sharedVenueAddress = sameVenue ? events.find(e => e.venueAddress)?.venueAddress : null;

  // Formatted wedding date for Page 3
  const formattedWeddingDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const canvasRef = useRef(null);

  // Reference dimensions: mobile uses portrait Figma frames (393×852)
  const PW = isMobile ? 393 : 1440;   // canvas reference width
  const PH = isMobile ? 852 : 760;     // per-page reference height

  // Page 6 height adapts to event count: compact on mobile, dynamic on desktop
  const page6Height = isMobile ? 852 : (events.length <= 2 ? 760 : 960);
  const page6Top = hasPhotos
    ? (isMobile ? 3758 : 3804)
    : (isMobile ? 2906 : 3039);
  const page7Top = page6Top + page6Height;

  // Canvas total height adjusts with dynamic page 6
  const totalHeight = page7Top + PH;

  const { scrollYProgress } = useScroll({
    target: canvasRef,
    offset: ['start start', 'end start'],
  });

  // Temple rises as the user scrolls into Page 2
  const templeStartPct = isMobile
    ? (hasPhotos ? '5%' : '6%')
    : (hasPhotos ? '7.42%' : '8.62%');
  const templeEndPct = isMobile
    ? (hasPhotos ? '12%' : '14%')
    : (hasPhotos ? '11.77%' : '13.7%');
  const templeScrollEnd = isMobile ? 1202 : 1490;
  const templeTop = useTransform(
    scrollYProgress,
    [0, templeScrollEnd / totalHeight],
    [templeStartPct, templeEndPct]
  );

  // Carpet unrolls as Page 3 enters the viewport
  const carpetStart = isMobile ? 745 : 1064;
  const carpetEnd = isMobile ? 1384 : 1703;
  const carpetClipPath = useTransform(
    scrollYProgress,
    [carpetStart / totalHeight, carpetEnd / totalHeight],
    ['inset(0 0 100% 0)', 'inset(0 0 0% 0)']
  );

  // Page 3 text fades in WHILE the carpet is unrolling
  const carpetTextStart = isMobile ? 900 : 1200;
  const carpetTextOpacity = useTransform(
    scrollYProgress,
    [carpetTextStart / totalHeight, carpetEnd / totalHeight],
    [0, 1]
  );
  const carpetTextY = useTransform(
    scrollYProgress,
    [carpetTextStart / totalHeight, carpetEnd / totalHeight],
    [30, 0]
  );

  return (
    <div className={styles.wrapper}>
      {/* Floating Language Toggle */}
      {(preferredLanguage === 'both' || !preferredLanguage) && <LanguageSelector lang={lang} setLang={setLang} />}

      <div
        className={styles.canvas}
        ref={canvasRef}
        style={{ aspectRatio: `${PW} / ${totalHeight}` }}
      >

        {/* ========== PAGE 1: SKY & NAMES ========== */}
        <div className={`${styles.sectionBlock} ${styles.page1}`}>
          <div className={`${styles.fillBlock} ${styles.skyGradient}`} />
          
          {/* Desktop Background */}
          <div className={styles.page1Bg}>
            <img src="/assets/einvite-template1/fresh/page1-bg.png" alt="Sky bg" className={styles.imgCover} />
          </div>

          {/* Mobile Split Background (Arch + Peacocks) */}
          <div className={styles.mobileArch} />
          <div className={styles.mobilePeacocks} />

          <div className={styles.garlandTop} />
          <motion.div
            className={styles.heroNames}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          >
            <h1 className={styles.groomName}><FadeText text={translateName(groomName, lang)} lang={lang} /></h1>
            <span className={styles.ampersand}>&</span>
            <h1 className={styles.brideName}><FadeText text={translateName(brideName, lang)} lang={lang} /></h1>
            {tagline && (
              <motion.div
                className={styles.taglineText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                ✦ <FadeText text={translateName(tagline, lang)} lang={lang} /> ✦
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ========== PAGE 2: TEMPLE COURTYARD ========== */}
        <div className={`${styles.sectionBlock} ${styles.page2}`}>
          <div className={styles.page2Bg}>
            <img src="/assets/einvite-template1/fresh/page2-bg.png" alt="Temple courtyard" className={styles.imgCover} />
          </div>
        </div>

        {/* ========== ANIMATED TEMPLE ========== */}
        <motion.div className={styles.templeContainer} style={{ top: templeTop }}>
          <img src="/assets/einvite-template1/fresh/temple.png" alt="Temple" />
        </motion.div>

        {/* ========== PAGE 3: RED CARPET ========== */}
        <div className={`${styles.sectionBlock} ${styles.page3}`}>
          <div className={`${styles.fillBlock} ${styles.page3Gradient}`} />
          <div className={`${styles.fillBlock} ${styles.page3Pattern}`}>
            <img src="/assets/einvite-template1/fresh/page3-pattern.png" alt="Pattern overlay" className={styles.imgCover} />
          </div>
          <motion.div className={styles.carpetContainer} style={{ clipPath: carpetClipPath }}>
            <img src="/assets/einvite-template1/fresh/carpet.png" alt="Red carpet" className={styles.imgCover} />
          </motion.div>
          <div className={styles.elephantsOverlay}>
            <img src="/assets/einvite-template1/fresh/elephants.png" alt="Elephants" className={styles.imgContain} />
          </div>
          {/* Text reveals only after carpet is fully scrolled into view */}
          <motion.div className={styles.page3Content} style={{ opacity: carpetTextOpacity, y: carpetTextY }}>
            <div className={`${styles.headingMaiandra} ${styles.textLine1}`}><FadeText text={t.omShree} lang={lang} /></div>
            <img src="/assets/einvite-template1/page2/Object.png" alt="Ganesha" className={styles.textImgCenter} />
            <div className={`${styles.headingMaiandra} ${styles.textLine2}`}><FadeText text={t.togetherWith} lang={lang} /></div>
            <div className={`${styles.smallMaiandra} ${styles.textLine4}`}>
              {tagline ? (
                <FadeText text={tagline} lang={lang} />
              ) : (
                <>
                  <FadeText text={t.cordiallyInvite1} lang={lang} /><br />
                  <FadeText text={t.cordiallyInvite2} lang={lang} />
                </>
              )}
            </div>
            {formattedWeddingDate && (
              <div className={styles.weddingDateDisplay}><FadeText text={formattedWeddingDate} lang={lang} /></div>
            )}
          </motion.div>
        </div>

        {/* ========== PAGE 4: FAMILY & NAMES ========== */}
        <div className={`${styles.sectionBlock} ${styles.page4}`}>
          <div className={`${styles.fillBlock} ${styles.page4Gradient}`} />
          <div className={`${styles.fillBlock} ${styles.page4Pattern}`}>
            <img src="/assets/einvite-template1/fresh/page4-pattern.png" alt="Orange pattern" className={styles.imgCover} />
          </div>

          <div className={styles.page4Border}>
            <img src="/assets/einvite-template1/fresh/page4-border-clean.png" alt="Golden Border" />
          </div>

          {/* Lamps */}
          <div className={styles.lampLeft}>
            <div className={`${styles.garlandStr} ${styles.garlandStr1}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr2}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr3}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr4}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr5}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr6}`} />
          </div>
          <div className={styles.lampRight}>
            <div className={`${styles.garlandStr} ${styles.garlandStr1}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr2}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr3}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr4}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr5}`} />
            <div className={`${styles.garlandStr} ${styles.garlandStr6}`} />
          </div>

          {/* Text Overlay — staggered fade-up on scroll */}
          <div className={styles.page4Content}>
            {[  
              { cls: styles.page4SubText, content: t.sonOf, delay: 0 },
              { cls: styles.page4Parents, content: translateName(groomParents || 'Mr. & Mrs. Jayakumar', lang), delay: 0.1 },
              { cls: styles.page4Name, content: translateName(groomName, lang), delay: 0.2 },
              { cls: styles.page4Weds, content: t.weds, delay: 0.35 },
              { cls: styles.page4Name, content: translateName(brideName, lang), delay: 0.5 },
              { cls: styles.page4SubText, content: t.daughterOf, delay: 0.65 },
              { cls: styles.page4Parents, content: translateName(brideParents || 'Mr. & Mrs. Kumar', lang), delay: 0.75 },
            ].map(({ cls, content, delay }, i) => (
              <motion.div
                key={i}
                className={cls}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-40px' }}
                transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
              >
                <FadeText text={content} lang={lang} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========== PAGE 5: INTRODUCING POLAROID (only if photos) ========== */}
        {hasPhotos && (
        <div className={`${styles.sectionBlock} ${styles.page5}`}>
          <div className={`${styles.fillBlock} ${styles.page5Gradient}`} />
          <div className={`${styles.fillBlock} ${styles.page5Pattern}`}>
            <img src="/assets/einvite-template1/fresh/page5-pattern.png" alt="Page 5 Pattern" className={styles.imgCover} />
          </div>

          <div className={styles.polaroidBg}>
            <img src="/assets/einvite-template1/fresh/page5-polaroid-clean.png" alt="Paper" className={styles.imgContain} />
          </div>

          {/* Text fade up */}
          <motion.div
            className={styles.introText}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-40px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.introTextLine1}><FadeText text={t.introducingLine1} lang={lang} /></div>
            <div className={styles.introTextLine2}><FadeText text={t.introducingLine2} lang={lang} /></div>
          </motion.div>

          {/* Rose falls after 15% of section is visible */}
          <motion.div
            className={styles.carnations}
            initial={{ y: -300, opacity: 0, rotate: -5 }}
            whileInView={{ y: 0, opacity: 1, rotate: 0 }}
            viewport={{ margin: '0px 0px -85% 0px' }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src="/assets/einvite-template1/page3/4th-page-flower.png" alt="Rose Carnations" className={styles.imgContain} />
          </motion.div>

          {/* Photo Gallery */}
          <div className={styles.photoGallery}>
            <motion.div
              className={styles.photoGalleryHeader}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-40px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            ><FadeText text={t.whereStoryBegins} lang={lang} /></motion.div>
            


            {coupleTimeline && coupleTimeline.length > 0 && (
              <div className={styles.timelineContainer}>
                <div className={styles.timelineLine}></div>
                {coupleTimeline.map((event, i) => (
                  <motion.div
                    key={i}
                    className={`${styles.timelineItem} ${i % 2 === 0 ? styles.timelineLeft : styles.timelineRight}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: '-40px' }}
                    transition={{ duration: 0.6, delay: 0.1 * i }}
                  >
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineContent}>
                      {event.image && (
                        <div className={styles.timelineImageWrapper}>
                          <img src={event.image} alt={event.title} className={styles.timelineImage} />
                        </div>
                      )}
                      {event.date && <div className={styles.timelineDate}><FadeText text={translateName(event.date, lang)} lang={lang} /></div>}
                      <h4 className={styles.timelineTitle}><FadeText text={translateName(event.title, lang)} lang={lang} /></h4>
                      {event.description && <p className={styles.timelineDesc}><FadeText text={translateName(event.description, lang)} lang={lang} /></p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className={`${styles.photoGrid} ${styles[`photoCount${Math.min(galleryImages.length, 5)}`]}`}>
              {galleryImages.slice(0, 5).map((src, i) => (
                <motion.div
                  key={i}
                  className={styles.photoBox}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ amount: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 * i, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src={src} alt={`Gallery ${i + 1}`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ========== PAGE 6: SAVE THE DATE ========== */}
        <div
          className={`${styles.sectionBlock} ${styles.page6}`}
          style={{ top: `calc(${page6Top} / ${PW} * 100cqw)`, height: `calc(${page6Height} / ${PW} * 100cqw)` }}
        >
          <div className={`${styles.fillBlock} ${styles.page6Gradient}`} />
          <div className={`${styles.fillBlock} ${styles.page6Pattern}`}>
            <img src="/assets/einvite-template1/fresh/page6-pattern.png" alt="Page 6 Pattern" className={styles.imgCover} />
          </div>

          <div className={styles.ambientLightPage6} />

          <div className={styles.lotusLeft}>
            <img src="/assets/einvite-template1/fresh/page4-flowers-left.svg" alt="Left Lotus Leaves" className={styles.imgContain} />
          </div>
          <div className={styles.lotusCenter}>
            <img src="/assets/einvite-template1/fresh/page4-flowers-left.svg" alt="Center Arch" className={styles.imgContain} />
          </div>
          <div className={styles.lotusRight}>
            <img src="/assets/einvite-template1/fresh/page4-flowers-right.svg" alt="Right Lotus Leaves" className={styles.imgContain} />
          </div>

          {/* Save The Date Content */}
          <div className={styles.page6Content}>
            <motion.div
              className={styles.saveTheDateTitle}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-60px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            ><FadeText text={t.saveTheDate} lang={lang} /></motion.div>

            {events.length > 0 && (
              <div className={styles.eventsRow}>
                {events.map((event, i) => (
                  <motion.div
                    key={i}
                    className={styles.eventCard6}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: '-40px' }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={styles.eventName6}><FadeText text={translateName(event.name, lang)} lang={lang} /></div>
                    {event.date && (
                      <div className={styles.eventDetail6}>
                        <FadeText text={new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} lang={lang} />
                      </div>
                    )}
                    {event.time && <div className={styles.eventDetail6}><FadeText text={translateName(event.time, lang)} lang={lang} /></div>}
                    {event.muhurtham && <div className={styles.eventMuhurtham6}><FadeText text={translateName(event.muhurtham, lang)} lang={lang} /></div>}
                    {!sameVenue && event.venue && (
                      <div style={{ marginTop: '10px' }}>
                        <a 
                          href={event.mapImage || event.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venueAddress || event.venue)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.glitterHover}
                        >
                          <div className={styles.eventVenue6}><FadeText text={translateName(event.venue, lang)} lang={lang} /></div>
                          {event.venueAddress && <div className={styles.eventVenueAddr6}><FadeText text={translateName(event.venueAddress, lang)} lang={lang} /></div>}
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {sameVenue && (
              <motion.div
                className={styles.sharedVenue}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-40px' }}
                transition={{ duration: 0.8, delay: events.length * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.sharedVenueLabel}><FadeText text={t.venue} lang={lang} /></div>
                <a 
                  href={events[0]?.mapImage || events[0]?.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sharedVenueAddress || sharedVenue)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.glitterHover}
                >
                  <div className={styles.sharedVenueName}><FadeText text={translateName(sharedVenue, lang)} lang={lang} /></div>
                  {sharedVenueAddress && <div className={styles.sharedVenueAddr}><FadeText text={translateName(sharedVenueAddress, lang)} lang={lang} /></div>}
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* ========== PAGE 7: ROUND FRAME, THANK YOU & COUNTDOWN ========== */}
        <div
          className={`${styles.sectionBlock} ${styles.page7}`}
          style={{ top: `calc(${page7Top} / ${PW} * 100cqw)` }}
        >
          <div className={`${styles.fillBlock} ${styles.page7Gradient}`} />
          <div className={`${styles.fillBlock} ${styles.page7Pattern}`}>
            <img src="/assets/einvite-template1/fresh/page7-pattern.png" alt="Page 7 Pattern" className={styles.imgCover} />
          </div>

          <div className={styles.page7Border}>
            <img src="/assets/einvite-template1/fresh/page7-border-clean.png" alt="Golden Border" />
          </div>

          {/* Circular photo frame with couple image */}
          <div className={styles.roundFrameContainer}>
            <img src="/assets/einvite-template1/fresh/Bride-groom.png" alt="Bride and Groom" className={styles.roundFrameInnerImage} />
            <img src="/assets/einvite-template1/fresh/page7-round-frame.png" alt="Photo frame" className={styles.roundFrameOverlay} />
          </div>

          {/* Right panel: Thank You + Countdown */}
          <motion.div
            className={styles.page7RightPanel}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-60px' }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.thanksTitle}><FadeText text={t.thankYou} lang={lang} /></div>
            <div className={styles.thanksText}>
              <FadeText text={t.thanksLine1} lang={lang} /><br />
              <FadeText text={t.thanksLine2} lang={lang} /><br /><br />
              <FadeText text={t.withLove} lang={lang} /><br />
              <span style={{ fontWeight: 700, fontSize: isMobile ? '5.5cqw' : '2.8cqw' }}>
                <FadeText text={translateName(groomName, lang)} lang={lang} /> & <FadeText text={translateName(brideName, lang)} lang={lang} />
              </span>
            </div>

            {weddingDate && (
              <motion.div
                className={styles.countdownContainerBottom}
                onViewportEnter={() => {
                  const diff = new Date(weddingDate).getTime() - Date.now();
                  if (diff <= 0) {
                    import('canvas-confetti').then((confetti) => {
                      confetti.default({
                        particleCount: 150,
                        spread: 90,
                        origin: { y: 0.8 },
                        colors: ['#D4AF37', '#FFD700', '#FF69B4', '#8A2BE2']
                      });
                    });
                  }
                }}
              >
                <CountdownTimer weddingDate={weddingDate} t={t} />
              </motion.div>
            )}
          </motion.div>

          <div className={styles.page7BottomBorder}>
            <img src="/assets/einvite-template1/page5/Rectangle.png" alt="Bottom Border" />
          </div>
        </div>

      </div>
    </div>
  );
}
