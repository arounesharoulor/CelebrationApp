'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import styles from './page.module.css';
import { TextRevealByChar, FadeIn, ScaleIn, DrawLine } from '@/components/animations/TextReveal';
import CountdownTimer from '@/components/invite/CountdownTimer';
import MusicPlayer from '@/components/invite/MusicPlayer';
import SaveToCalendar from '@/components/invite/SaveToCalendar';
import Watermark from '@/components/invite/Watermark';
import EinviteTemplate1 from '@/components/templates/EinviteTemplate1';
import { useAuth } from '@/components/providers/AuthProvider';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return dateStr; }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  } catch { return timeStr; }
}

// ─── 60-second free countdown hook ───────────────────────────────────────────
function useFreeCountdown(expiresAt, onExpire) {
  const [secsLeft, setSecsLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;
    const end = new Date(expiresAt).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecsLeft(remaining);
      if (remaining === 0) onExpire?.();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  return secsLeft;
}

export default function InvitePage() {
  const params = useParams();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [expiredInvitationId, setExpiredInvitationId] = useState(null);
  const [expiredTemplateId, setExpiredTemplateId] = useState(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');

  const scrollContainerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start start', 'end end'],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const sTextOpacity = useSpring(textOpacity, { stiffness: 100, damping: 30 });
  const cornersScale = useTransform(scrollYProgress, [0.1, 0.4], [1, 2.5]);
  const cornersOpacity = useTransform(scrollYProgress, [0.3, 0.45], [1, 0]);
  const sCornersScale = useSpring(cornersScale, { stiffness: 50, damping: 22 });
  const sCornersOpacity = useSpring(cornersOpacity, { stiffness: 80, damping: 30 });
  const leftX = useTransform(scrollYProgress, [0.1, 0.4], ['0%', '-60%']);
  const sLeftX = useSpring(leftX, { stiffness: 50, damping: 22 });
  const rightX = useTransform(scrollYProgress, [0.1, 0.4], ['0%', '60%']);
  const sRightX = useSpring(rightX, { stiffness: 50, damping: 22 });
  const templeScale = useTransform(scrollYProgress, [0.1, 0.5], [1, 5]);
  const templeOpacity = useTransform(scrollYProgress, [0.4, 0.55], [1, 0]);
  const sTempleScale = useSpring(templeScale, { stiffness: 40, damping: 20 });
  const sTempleOpacity = useSpring(templeOpacity, { stiffness: 80, damping: 30 });
  const bgOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0]);
  const sBgOpacity = useSpring(bgOpacity, { stiffness: 80, damping: 30 });
  const page2Opacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  const sPage2Opacity = useSpring(page2Opacity, { stiffness: 60, damping: 25 });
  const elephantOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const elephantScale = useTransform(scrollYProgress, [0.55, 0.7], [0.5, 1]);
  const sElephantOpacity = useSpring(elephantOpacity, { stiffness: 60, damping: 25 });
  const sElephantScale = useSpring(elephantScale, { stiffness: 50, damping: 20 });
  const p2ContentOpacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1]);
  const sP2ContentOpacity = useSpring(p2ContentOpacity, { stiffness: 60, damping: 25 });
  const scrollIndOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  const fetchInvitation = useCallback(async () => {
    try {
      const res = await fetch(`/api/invitations?slug=${params.slug}`);
      const data = await res.json();
      if (data.success) {
        setInvitation(data.invitation);
        setExpired(false);
      } else if (data.expired) {
        setExpired(true);
        setExpiredInvitationId(data.invitationId);
        setExpiredTemplateId(data.templateId);
      } else {
        setError('Invitation not found');
      }
    } catch { setError('Could not load invitation'); }
    finally { setLoading(false); }
  }, [params.slug]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  // Handle free 60-second expiry on the client side
  const handleExpire = async () => {
    setExpired(true);
  };

  // Sample invitations never expire; unpaid non-sample invitations use the countdown
  const isSample = invitation?.isSample;
  const [showBanner, setShowBanner] = useState(true);

  // ─── Buy Now handler ──────────────────────────────────────────
  const handleBuyNow = async () => {
    if (!user) {
      // Redirect to login with return URL
      window.location.href = `/login?redirect=/invite/${params.slug}`;
      return;
    }

    setBuying(true);
    setBuyError('');

    try {
      const templateId = expiredTemplateId || invitation?.templateId;
      const invId = expiredInvitationId || invitation?._id;

      if (!templateId) {
        setBuyError('Template information missing.');
        return;
      }

      // Step 1: Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, invitationId: invId }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setBuyError(orderData.error || 'Failed to create order.');
        return;
      }

      if (orderData.free) {
        // Free template — just reactivate
        await fetch('/api/invitations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationId: invId, isPaid: true }),
        });
        // Reload invitation
        setLoading(true);
        await fetchInvitation();
        return;
      }

      // Step 2: Verify payment (mock or will open Razorpay for real)
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.order.id,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          invitationId: invId,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        // Reload invitation — it's now paid and active
        setLoading(true);
        await fetchInvitation();
      } else {
        setBuyError(verifyData.error || 'Payment failed.');
      }
    } catch (err) {
      console.error(err);
      setBuyError('Something went wrong. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <motion.div className={styles.loadingSpinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Opening your invitation...
        </motion.span>
      </div>
    );
  }

  // Expired / deactivated state
  if (expired) {
    return (
      <div className={styles.errorPage}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 500 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
          <h1 className={styles.errorTitle}>Free Preview Expired</h1>
          <p className={styles.errorDesc}>
            Your free preview has ended.<br />
            Upgrade to get permanent access with no watermark.
          </p>

          {buyError && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}>
              ⚠️ {buyError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <button
              onClick={handleBuyNow}
              disabled={buying}
              className="btn-primary"
              style={{ minWidth: 160, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {buying ? '⏳ Processing...' : '💳 Buy Now'}
            </button>
            {!user && (
              <Link href={`/login?redirect=/invite/${params.slug}`} className="btn-secondary">
                Login to Buy →
              </Link>
            )}
            <Link href="/" className="btn-secondary">Go Home</Link>
          </div>

          {user && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
              Logged in as <strong>{user.username}</strong>
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className={styles.errorPage}>
        <h1 className={styles.errorTitle}>Invitation Not Found</h1>
        <p className={styles.errorDesc}>This invitation link may be invalid or has been removed.</p>
        <Link href="/" className="btn-primary">Go to CelebrationApp</Link>
      </div>
    );
  }

  const { groomName, brideName, weddingDate, tagline, coupleStory, events, groomParents, brideParents, isPaid } = invitation;
  const showWatermark = !isPaid;

  // ─── Login gate for free (non-sample) previews ────────────────────────────
  // If the invitation is not paid, not a sample, and user is not logged in,
  // require login before allowing the free preview (so we capture the session)
  if (!isPaid && !isSample && !user) {
    return (
      <div className={styles.errorPage}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 500 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
          <h1 className={styles.errorTitle}>Login to Preview</h1>
          <p className={styles.errorDesc}>
            Please log in to view this free preview invitation.<br />
            Your session helps us personalize your experience.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link
              href={`/login?redirect=/invite/${params.slug}`}
              className="btn-primary"
              style={{ minWidth: 160 }}
            >
              Login to View ✨
            </Link>
            <Link
              href={`/signup?redirect=/invite/${params.slug}`}
              className="btn-secondary"
            >
              Create Account →
            </Link>
            <Link href="/" className="btn-secondary">Go Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── EinviteTemplate1 ────────────────────────────────────────────────────────
  if (invitation.templateId === 'einvite-1') {
    return (
      <div style={{ position: 'relative' }}>
        <EinviteTemplate1 invitation={invitation} />
        {showWatermark && <Watermark />}
        {showWatermark && showBanner && !expired && (
          <FreePreviewBanner slug={params.slug} user={user} onBuy={handleBuyNow} buying={buying} onClose={() => setShowBanner(false)} />
        )}
      </div>
    );
  }

  // ─── Default template ────────────────────────────────────────────────────────
  return (
    <div className={styles.invitePage} style={{ position: 'relative' }}>
      {showWatermark && <Watermark />}
      {showWatermark && showBanner && !expired && (
        <FreePreviewBanner slug={params.slug} user={user} onBuy={handleBuyNow} buying={buying} onClose={() => setShowBanner(false)} />
      )}

      <MusicPlayer src={null} />

      <div ref={scrollContainerRef} className={styles.scrollContainer}>
        <div className={styles.stickyViewport}>
          <motion.img src="/assets/hindu-royal/page1/background.svg" alt="" className={styles.svgLayer} style={{ opacity: sBgOpacity, zIndex: 1 }} />
          <motion.img src="/assets/hindu-royal/page2/temple-background.svg" alt="" className={styles.svgLayer} style={{ opacity: sPage2Opacity, zIndex: 2 }} />
          <motion.img src="/assets/hindu-royal/page1/temple.svg" alt="Temple" className={`${styles.svgLayer} ${styles.templeOrigin}`} style={{ scale: sTempleScale, opacity: sTempleOpacity, zIndex: 3 }} />
          <motion.img src="/assets/hindu-royal/page1/left-corner.svg" alt="" className={`${styles.svgLayer} ${styles.originTopLeft}`} style={{ scale: sCornersScale, x: sLeftX, opacity: sCornersOpacity, zIndex: 4 }} />
          <motion.img src="/assets/hindu-royal/page1/right-corner.svg" alt="" className={`${styles.svgLayer} ${styles.originTopRight}`} style={{ scale: sCornersScale, x: sRightX, opacity: sCornersOpacity, zIndex: 5 }} />
          <motion.img src="/assets/hindu-royal/page1/peacock-left.svg" alt="Peacock" className={`${styles.svgLayer} ${styles.originBottomLeft}`} style={{ scale: sCornersScale, x: sLeftX, opacity: sCornersOpacity, zIndex: 6 }} />
          <motion.img src="/assets/hindu-royal/page1/peacock-right.svg" alt="Peacock" className={`${styles.svgLayer} ${styles.originBottomRight}`} style={{ scale: sCornersScale, x: sRightX, opacity: sCornersOpacity, zIndex: 7 }} />
          <motion.img src="/assets/hindu-royal/page2/Elephant.svg" alt="Elephant" className={styles.svgLayer} style={{ opacity: sElephantOpacity, scale: sElephantScale, zIndex: 8 }} />

          <motion.div className={styles.textLayer} style={{ opacity: sTextOpacity }}>
            <motion.div className={styles.inviteLabel} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
              ॐ श्री गणेशाय नमः
            </motion.div>
            <div className={styles.coupleNameBlock}>
              <TextRevealByChar text={groomName} className={styles.heroName} delay={0.8} stagger={0.06} />
              <motion.span className={styles.heroAmpersand} initial={{ opacity: 0, scale: 0, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}>&</motion.span>
              <TextRevealByChar text={brideName} className={styles.heroName} delay={1.6} stagger={0.06} />
            </div>
            {tagline && (<FadeIn delay={2.2} blur><p className={styles.heroTagline}>{tagline}</p></FadeIn>)}
            <FadeIn delay={2.5} blur><p className={styles.heroDate}>{formatDate(weddingDate)}</p></FadeIn>
          </motion.div>

          <motion.div className={styles.page2Content} style={{ opacity: sP2ContentOpacity }}>
            <div className={styles.blessingText}>Together with their families</div>
            {(groomParents || brideParents) && (
              <div className={styles.familyBlessings}>
                {groomParents && <span>{groomParents}</span>}
                {groomParents && brideParents && <span className={styles.blessingDivider}>——</span>}
                {brideParents && <span>{brideParents}</span>}
              </div>
            )}
            <div className={styles.page2Names}>
              <span className={styles.page2NameText}>{groomName}</span>
              <span className={styles.page2Ampersand}>&</span>
              <span className={styles.page2NameText}>{brideName}</span>
            </div>
          </motion.div>

          <motion.div className={styles.scrollIndicator} style={{ opacity: scrollIndOpacity }}>
            <span>Scroll to Unveil</span>
            <motion.div className={styles.scrollArrow} animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>↓</motion.div>
          </motion.div>
        </div>
      </div>

      <section className={styles.contentSection}>
        <FadeIn blur><span className={styles.sectionLabel}>Save the Date</span></FadeIn>
        <FadeIn delay={0.1}><h2 className={styles.sectionTitle}>Counting the <span className={styles.goldText}>Days</span></h2></FadeIn>
        <FadeIn delay={0.2}><CountdownTimer targetDate={weddingDate} /></FadeIn>
      </section>

      <div className={styles.sectionDivider}>
        <DrawLine width="80px" color="rgba(197, 165, 90, 0.5)" />
        <ScaleIn delay={0.2}><span className={styles.dividerIcon}>✦</span></ScaleIn>
        <DrawLine width="80px" delay={0.4} color="rgba(197, 165, 90, 0.5)" />
      </div>

      {coupleStory && (
        <>
          <section className={styles.contentSection}>
            <FadeIn blur><span className={styles.sectionLabel}>Our Story</span></FadeIn>
            <FadeIn delay={0.1}><h2 className={styles.sectionTitle}>How It All <span className={styles.goldText}>Began</span></h2></FadeIn>
            <FadeIn delay={0.2} blur><p className={styles.storyText}>{coupleStory}</p></FadeIn>
          </section>
          <div className={styles.sectionDivider}>
            <DrawLine width="80px" color="rgba(197, 165, 90, 0.5)" />
            <ScaleIn delay={0.2}><span className={styles.dividerIcon}>❧</span></ScaleIn>
            <DrawLine width="80px" delay={0.4} color="rgba(197, 165, 90, 0.5)" />
          </div>
        </>
      )}

      {events && events.length > 0 && (
        <section className={styles.contentSection}>
          <FadeIn blur><span className={styles.sectionLabel}>Celebrations</span></FadeIn>
          <FadeIn delay={0.1}><h2 className={styles.sectionTitle}>Wedding <span className={styles.goldText}>Events</span></h2></FadeIn>
          <div className={styles.eventsGrid}>
            {events.map((event, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className={styles.eventCard}>
                  <div className={styles.eventCardFloral}>❀</div>
                  <h3 className={styles.eventCardTitle}>{event.name}</h3>
                  {event.date && <div className={styles.eventCardDetail}><span>📅</span> {formatDate(event.date)}</div>}
                  {event.time && <div className={styles.eventCardDetail}><span>🕐</span> {formatTime(event.time)}</div>}
                  {event.venue && <div className={styles.eventCardDetail}><span>📍</span> {event.venue}</div>}
                  {event.mapLink && <a href={event.mapLink} target="_blank" rel="noopener noreferrer" className={styles.eventMapLink}>See the route →</a>}
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <SaveToCalendar events={events} groomName={groomName} brideName={brideName} />
            </div>
          </FadeIn>
        </section>
      )}

      <section className={styles.closingSection}>
        <FadeIn><span className={styles.closingScript}>We can&apos;t wait to celebrate with you!</span></FadeIn>
        <FadeIn delay={0.2}><div className={styles.closingNames}>{groomName} <span className={styles.goldText}>&</span> {brideName}</div></FadeIn>
        <FadeIn delay={0.4} blur>
          <div className={styles.closingHashtag}>#{groomName.replace(/\s/g, '')}Weds{brideName.replace(/\s/g, '')}</div>
        </FadeIn>
      </section>

      <footer className={styles.inviteFooter}>
        <p className={styles.footerText}>Created with <span className={styles.footerBrand}>CelebrationApp</span></p>
      </footer>
    </div>
  );
}

// ─── Free Preview Banner ──────────────────────────────────────────────────────
function FreePreviewBanner({ slug, user, onBuy, buying, onClose }) {
  return (
    <motion.div
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99998,
        background: 'linear-gradient(90deg, rgba(10,10,10,0.97), rgba(30,10,10,0.97))',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        padding: '0.7rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{ fontSize: '1.2rem' }}>✨</span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}>
          This is a <strong style={{ color: '#D4AF37' }}>Free Preview</strong>
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={onBuy}
          disabled={buying}
          style={{
            padding: '0.4rem 1.1rem',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '700',
            fontSize: '0.8rem',
            border: 'none',
            cursor: buying ? 'wait' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {buying ? '⏳...' : '💳 Buy Now'}
        </button>
        {!user && (
          <Link
            href={`/login?redirect=/invite/${slug}`}
            style={{
              padding: '0.4rem 1.1rem',
              background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
              borderRadius: '8px',
              color: '#0a0a0a',
              fontWeight: '700',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Login to Buy ✨
          </Link>
        )}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.2rem',
            marginLeft: '0.5rem',
          }}
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
