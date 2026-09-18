'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './page.module.css';
import { getTemplateById } from '@/lib/data/templates';
import { useAuth } from '@/components/providers/AuthProvider';
import RazorpayCheckout from '@/components/payment/RazorpayCheckout';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import TamilInput from '@/components/ui/TamilInput';

import { showToast } from '@/lib/toast';
import {
  FiCheck, FiLock, FiClock, FiShield, FiHeart, FiCalendar,
  FiUser, FiImage, FiGlobe, FiAlertCircle, FiCopy, FiExternalLink,
  FiPlus, FiTrash2, FiUploadCloud, FiUpload, FiStar, FiCheckCircle, FiInfo,
  FiArrowRight, FiArrowLeft, FiCreditCard, FiX
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const defaultEvent = {
  name: '',
  date: '',
  time: '',
  venue: '',
  venueAddress: '',
  mapLink: '',
  description: '',
  muhurtham: '',
};

const SUGGESTED_EVENTS = {
  'Temple': ['Haldi', 'Mehendi', 'Sangeet', 'Wedding Ceremony', 'Reception'],
  'Church': ['Rehearsal Dinner', 'Wedding Ceremony', 'Reception'],
  'Regal Arch': ['Nikah', 'Walima', 'Reception'],
  'Golden Grandeur': ['Anand Karaj', 'Reception'],
  'Classic Mandapam': ['Nischayam', 'Muhurtham', 'Reception'],
};

const PREDEFINED_TAGLINES = [
  "Two souls, one beautiful journey",
  "Together is a beautiful place to be",
  "Once in a while, right in the middle of an ordinary life, love gives us a fairy tale",
  "Cordially Invite You To Join The Occasion"
];

const TAGLINE_TRANSLATIONS = {
  "Two souls, one beautiful journey": "இரு மனங்கள், ஒரு அழகிய பயணம்",
  "Together is a beautiful place to be": "ஒன்றாக இருப்பது ஒரு அழகான இடம்",
  "Once in a while, right in the middle of an ordinary life, love gives us a fairy tale": "சாதாரண வாழ்க்கையின் நடுவே, காதல் நமக்கு ஒரு தேவதை கதையைத் தருகிறது",
  "Cordially Invite You To Join The Occasion": "இந்த இனிய திருமண விழாவிற்கு தங்களை அன்புடன் அழைக்கிறோம்"
};

const FORM_STORAGE_KEY = 'celebrationapp_draft_form';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = getTemplateById(params.templateId);
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Payment state
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [formRestored, setFormRestored] = useState(false);

  // Pre-purchase state — user bought the template upfront before filling details
  const [prePurchased, setPrePurchased] = useState(false);
  const [prePurchasing, setPrePurchasing] = useState(false);
  const [prePurchaseError, setPrePurchaseError] = useState('');

  const [formData, setFormData] = useState({
    groomName: '',
    brideName: '',
    groomParents: '',
    brideParents: '',
    groomFamily: '',
    brideFamily: '',
    weddingDate: '',
    tagline: '',
    coupleStory: '',
    coupleTimeline: [],
    preferredLanguage: 'both',
    galleryImages: [],
    events: [
      { ...defaultEvent, name: 'Wedding Ceremony' },
      { ...defaultEvent, name: 'Reception' },
    ],
  });

  // Restore form data from sessionStorage after login redirect
  useEffect(() => {
    if (searchParams.get('restore') === 'true' && !formRestored) {
      try {
        const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.templateId === params.templateId) {
            setFormData(parsed.formData);
            setStep(parsed.step || 1);
            sessionStorage.removeItem(FORM_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error('Failed to restore form data:', err);
      }
      setFormRestored(true);
    }
  }, [searchParams, params.templateId, formRestored]);

  // Check if user pre-purchased this template via query param
  useEffect(() => {
    if (searchParams.get('purchased') === 'true') {
      setPrePurchased(true);
    }
  }, [searchParams]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - formData.galleryImages.length;
    if (files.length > remaining) {
      showToast.warning(`You can upload up to ${remaining} more image(s). Max 5 total.`);
      return;
    }
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          showToast.error(`${file.name} is too large. Max 5MB per image.`);
          continue;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          showToast.error(`${file.name} is not a supported format. Use JPEG, PNG, or WebP.`);
          continue;
        }
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          uploaded.push(data.url);
        } else {
          showToast.error(`Failed to upload ${file.name}: ${data.error}`);
        }
      }
      if (uploaded.length > 0) {
        showToast.success(`Uploaded ${uploaded.length} photo(s) successfully.`);
        setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...uploaded] }));
      }
    } catch (err) {
      console.error(err);
      showToast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
    showToast.info('Photo removed.');
  };

  const handleTimelineImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showToast.error(`${file.name} is too large. Max 5MB per image.`);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast.error(`${file.name} is not a supported format. Use JPEG, PNG, or WebP.`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        showToast.success(`Uploaded photo successfully.`);
        updateTimelineEvent(index, 'image', data.url);
      } else {
        showToast.error(`Failed to upload ${file.name}: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      showToast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeTimelineImage = (index) => {
    updateTimelineEvent(index, 'image', '');
    showToast.info('Photo removed from timeline.');
  };

  if (!template) {
    return (
      <div className={`${styles.dashboard} container`}>
        <h1>Template not found</h1>
        <Link href="/templates" className="btn-primary">Browse Templates</Link>
      </div>
    );
  }

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateEvent = (index, field, value) => {
    setFormData((prev) => {
      const events = [...prev.events];
      events[index] = { ...events[index], [field]: value };
      return { ...prev, events };
    });
  };

  const addEvent = () => {
    setFormData((prev) => ({
      ...prev,
      events: [...prev.events, { ...defaultEvent }],
    }));
  };

  const removeEvent = (index) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  };

  const addTimelineEvent = () => {
    setFormData((prev) => ({
      ...prev,
      coupleTimeline: [...(prev.coupleTimeline || []), { date: '', title: '', description: '' }],
    }));
  };

  const updateTimelineEvent = (index, field, value) => {
    setFormData((prev) => {
      const timeline = [...(prev.coupleTimeline || [])];
      timeline[index] = { ...timeline[index], [field]: value };
      return { ...prev, coupleTimeline: timeline };
    });
  };

  const removeTimelineEvent = (index) => {
    setFormData((prev) => ({
      ...prev,
      coupleTimeline: (prev.coupleTimeline || []).filter((_, i) => i !== index),
    }));
  };

  const getLabel = (en, ta) => formData.preferredLanguage === 'ta' ? ta : en;

  const validateTamilInput = (str) => {
    if (formData.preferredLanguage !== 'ta') return true;
    if (!str) return true;
    // Check if the string contains any English alphabets
    return !/[a-zA-Z]/.test(str);
  };

  const generateSlug = () => {
    const groom = formData.groomName.trim().toLowerCase().replace(/\s+/g, '-');
    const bride = formData.brideName.trim().toLowerCase().replace(/\s+/g, '-');
    return `${groom}-weds-${bride}-${Date.now().toString(36)}`;
  };

  const createInvitation = async (payload) => {
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create invitation');
    const data = await res.json();
    return data.invitation;
  };

  // ─── Buy template upfront (before filling form) ───────────────────────────
  const handleBuyUpfront = async () => {
    setPrePurchasing(true);
    setPrePurchaseError('');
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: params.templateId }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setPrePurchaseError(orderData.error || 'Failed to create order.');
        return;
      }

      if (orderData.free) {
        // Template is free — mark as pre-purchased
        setPrePurchased(true);
        return;
      }

      if (orderData.mock) {
        // Mock mode — simulate instant payment
        await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.order.id,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            razorpay_signature: 'mock_signature',
          }),
        });
        setPrePurchased(true);
        return;
      }

      // Real Razorpay — open checkout
      setPendingPayload(null); // no invitation yet
      setRazorpayOrder(orderData.order);
    } catch (err) {
      console.error(err);
      setPrePurchaseError('Something went wrong. Please try again.');
    } finally {
      setPrePurchasing(false);
    }
  };

  // ─── Submit: create invitation ────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setPaymentError('');
    try {
      const slug = generateSlug();
      const payload = {
        ...formData,
        slug,
        templateId: params.templateId,
      };

      // If user pre-purchased, create as paid directly
      if (prePurchased) {
        const inv = await createInvitation({ ...payload, isPaid: true });
        setInviteUrl(`${window.location.origin}/invite/${inv.slug}`);
        setSuccess(true);
        return;
      }

      // Otherwise, check template pricing & handle payment flow
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: params.templateId }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        // If pricing not configured, proceed as free
        const inv = await createInvitation(payload);
        setInviteUrl(`${window.location.origin}/invite/${inv.slug}`);
        setSuccess(true);
        return;
      }

      if (orderData.free) {
        // Template is free — create directly
        const inv = await createInvitation(payload);
        setInviteUrl(`${window.location.origin}/invite/${inv.slug}`);
        setSuccess(true);
        return;
      }

      if (orderData.mock) {
        // ─── Mock mode: simulate instant payment ──────────────────
        setPaymentProcessing(true);
        const inv = await createInvitation({ ...payload, isPaid: true });

        // Verify (mock) & link payment to invitation
        await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.order.id,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            razorpay_signature: 'mock_signature',
            invitationId: inv._id,
          }),
        });

        setInviteUrl(`${window.location.origin}/invite/${inv.slug}`);
        setSuccess(true);
        setPaymentProcessing(false);
        return;
      }

      // ─── Real Razorpay: open checkout ─────────────────────────
      setPendingPayload(payload);
      setRazorpayOrder(orderData.order);
    } catch (err) {
      console.error(err);
      setPaymentError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Create free preview (60-sec self-destructing link) ───────────────────
  const handleCreateFreePreview = async () => {
    setLoading(true);
    setPaymentError('');
    try {
      const slug = generateSlug();
      const payload = {
        ...formData,
        slug,
        templateId: params.templateId,
        // isPaid is NOT set — will default to false → 60-sec preview
      };
      const inv = await createInvitation(payload);
      setInviteUrl(`${window.location.origin}/invite/${inv.slug}`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setPaymentError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      setLoading(true);

      // If this was a pre-purchase (no pendingPayload), just mark as purchased
      if (!pendingPayload) {
        await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentResponse),
        });
        setPrePurchased(true);
        setRazorpayOrder(null);
        return;
      }

      const inv = await createInvitation({ ...pendingPayload, isPaid: true });
      await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentResponse, invitationId: inv._id }),
      });
      setInviteUrl(`${window.location.origin}/invite/${inv.slug}`);
      setSuccess(true);
      setRazorpayOrder(null);
      setPendingPayload(null);
      showToast.success('Invitation created successfully!');
    } catch (err) {
      console.error(err);
      showToast.error('Payment verified but invitation creation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (reason) => {
    const errorMsg = reason || 'Payment was cancelled or failed.';
    setPaymentError(errorMsg);
    showToast.error(errorMsg);
    setRazorpayOrder(null);
    setPendingPayload(null);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    showToast.success('Invitation link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSteps = 4;

  const suggestedEvents = SUGGESTED_EVENTS[template.style] || SUGGESTED_EVENTS['Temple'];

  // ─── SUCCESS SCREEN ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={`${styles.dashboard} container`}>
        <motion.div
          className={`${styles.formCard} ${styles.successCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.successIcon}>
            <FiStar style={{ fontSize: '3rem', color: 'var(--color-accent)' }} />
          </div>
          <h2 className={styles.successTitle}>
            Your Invitation is <span className="gradient-text">Ready!</span>
          </h2>
          <p className={styles.successDesc}>
            Share this link with your guests. They&apos;ll see a beautiful animated
            invitation with all your details.
          </p>
          <div className={styles.inviteLink}>
            <span className={styles.inviteLinkText}>{inviteUrl}</span>
            <button onClick={copyLink} className={styles.copyBtn}>
              {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy</>}
            </button>
          </div>
          <div className={styles.successActions}>
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              View Invitation <FiExternalLink />
            </a>
            <Link href="/subscriptions" className="btn-secondary">
              My Subscriptions
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── AUTH LOADING ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className={`${styles.dashboard} container`}>
        <div className={styles.authGateCard}>
          <div className={styles.authGateSpinner} />
        </div>
      </div>
    );
  }

  // ─── LOGIN GATE — shown before Step 1 if user is NOT logged in ──────────
  if (!user) {
    const redirectUrl = `/dashboard/${params.templateId}`;
    return (
      <div className={`${styles.dashboard} container`}>
        {/* Navbar */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 0', background: 'rgba(253,248,246,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(210,138,140,0.12)', boxShadow: '0 2px 20px rgba(210,138,140,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.8rem', color: '#D28A8C' }}>
              CelebrationApp
            </Link>
          </div>
        </nav>

        <motion.div
          className={styles.authGateCard}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.authGateIcon}>
            <FiLock style={{ fontSize: '2.5rem', color: 'var(--color-accent)' }} />
          </div>
          <h1 className={styles.authGateTitle}>
            Login to <span className="gradient-text">Get Started</span>
          </h1>
          <p className={styles.authGateDesc}>
            Sign in or create an account to start customizing your
            <strong> {template.name}</strong> invitation. Your progress will be saved to your account.
          </p>

          <div className={styles.authGateFeatures}>
            <div className={styles.authGateFeature}>
              <span className={styles.authGateFeatureIcon}><FiClock style={{ color: 'var(--color-accent)' }} /></span>
              <div>
                <div className={styles.authGateFeatureTitle}>Free Preview</div>
                <div className={styles.authGateFeatureDesc}>Try it free with a 60-second preview link</div>
              </div>
            </div>
            <div className={styles.authGateFeature}>
              <span className={styles.authGateFeatureIcon}><FiShield style={{ color: 'var(--color-accent)' }} /></span>
              <div>
                <div className={styles.authGateFeatureTitle}>Upgrade Anytime</div>
                <div className={styles.authGateFeatureDesc}>Pay to get a permanent, watermark-free link</div>
              </div>
            </div>
            <div className={styles.authGateFeature}>
              <span className={styles.authGateFeatureIcon}><FiCheckCircle style={{ color: 'var(--color-accent)' }} /></span>
              <div>
                <div className={styles.authGateFeatureTitle}>Data Saved</div>
                <div className={styles.authGateFeatureDesc}>Your details are tied to your account</div>
              </div>
            </div>
          </div>

          <div className={styles.authGateActions}>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className={styles.authGatePrimaryBtn}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Login to Continue <FiStar />
            </Link>
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
              className={styles.authGateSecondaryBtn}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Create Account <FiArrowRight />
            </Link>
          </div>

          <div className={styles.authGateDivider}>
            <span>or</span>
          </div>

          <p className={styles.authGateBuyHint}>
            Want to skip the free preview? Buy the template now and create your invitation directly after login.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl + '?purchased=true')}`}
            className={styles.authGateBuyBtn}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FiCreditCard /> Login &amp; Buy Template
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN WIZARD (user is logged in) ──────────────────────────────────────
  return (
    <div className={`${styles.dashboard} container`}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 0', background: 'rgba(253,248,246,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(210,138,140,0.12)', boxShadow: '0 2px 20px rgba(210,138,140,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.8rem', color: '#D28A8C' }}>
            CelebrationApp
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/subscriptions" style={{ fontSize: '0.85rem', color: '#D28A8C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }} title="My Subscriptions">
              <FiUser /> {user.username}
            </Link>
          </div>
        </div>
      </nav>

      <Link href="/templates" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <FiArrowLeft /> Back to Templates
      </Link>

      <motion.div className={styles.header} initial="hidden" animate="visible" variants={fadeUp}>
        <div className={styles.templateLabel}>{template.style || template.category}</div>
        <h1 className={styles.pageTitle}>
          Customize <span className="gradient-text">{template.name}</span>
        </h1>
        <p className={styles.pageSubtitle}>
          Fill in your details below to create your personalized wedding invitation.
        </p>
        {/* Status badges */}
        <div className={styles.statusRow}>
          <span className={styles.loggedInBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FiCheck /> Logged in as {user.username}
          </span>
          {prePurchased && (
            <span className={styles.purchasedBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiShield /> Template Purchased
            </span>
          )}
        </div>
      </motion.div>

      {/* Buy Upfront banner — only if NOT already pre-purchased */}
      {!prePurchased && (
        <motion.div
          className={styles.buyUpfrontBanner}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={styles.buyUpfrontText}>
            <span className={styles.buyUpfrontIcon}><FiShield style={{ color: 'var(--color-accent)' }} /></span>
            <div>
              <strong>Want permanent access?</strong> Buy this template now to skip the 60-sec free preview limit.
            </div>
          </div>
          <button
            className={styles.buyUpfrontBtn}
            onClick={handleBuyUpfront}
            disabled={prePurchasing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {prePurchasing ? <><FiClock /> Processing...</> : <><FiCreditCard /> Buy Now</>}
          </button>
          {prePurchaseError && (
            <div className={styles.buyUpfrontError} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiAlertCircle /> {prePurchaseError}
            </div>
          )}
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={styles.progressStep}>
            <div
              className={`${styles.progressDot} ${step === s ? styles.progressDotActive : ''} ${step > s ? styles.progressDotCompleted : ''}`}
            >
              {step > s ? <FiCheck /> : s}
            </div>
            {s < totalSteps && (
              <div className={`${styles.progressLine} ${step > s ? styles.progressLineActive : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className={styles.formSection}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Couple Details</h2>
                <p className={styles.formDesc}>Tell us about the beautiful couple.</p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Groom's Name", "மணமகன் பெயர்")} <span style={{ color: 'red' }}>*</span></label>
                    <TamilInput
                      className={styles.formInput}
                      placeholder="e.g. Rahul Sharma"
                      value={formData.groomName}
                      onChange={(e) => updateField('groomName', e.target.value)}
                      isTamil={formData.preferredLanguage === 'ta'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Bride's Name", "மணமகள் பெயர்")} <span style={{ color: 'red' }}>*</span></label>
                    <TamilInput
                      className={styles.formInput}
                      placeholder="e.g. Priya Patel"
                      value={formData.brideName}
                      onChange={(e) => updateField('brideName', e.target.value)}
                      isTamil={formData.preferredLanguage === 'ta'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Groom's Parents", "மணமகன் பெற்றோர்")}</label>
                    <TamilInput
                      className={styles.formInput}
                      placeholder="e.g. Mr. & Mrs. Sharma"
                      value={formData.groomParents}
                      onChange={(e) => updateField('groomParents', e.target.value)}
                      isTamil={formData.preferredLanguage === 'ta'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Bride's Parents", "மணமகள் பெற்றோர்")}</label>
                    <TamilInput
                      className={styles.formInput}
                      placeholder="e.g. Mr. & Mrs. Patel"
                      value={formData.brideParents}
                      onChange={(e) => updateField('brideParents', e.target.value)}
                      isTamil={formData.preferredLanguage === 'ta'}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                    <label className={styles.formLabel}>{getLabel("Wedding Date", "திருமண தேதி")} <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={formData.weddingDate}
                      onChange={(e) => updateField('weddingDate', e.target.value)}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                    <label className={styles.formLabel}>
                      <FiGlobe style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle', color: 'var(--color-accent)' }} />
                      Invitation Language Preference
                    </label>
                    <select
                      className={styles.formInput}
                      value={formData.preferredLanguage || 'both'}
                      onChange={(e) => updateField('preferredLanguage', e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="both">Both English &amp; Tamil</option>
                      <option value="en">English Only</option>
                      <option value="ta">Tamil Only</option>
                    </select>
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                    <label className={styles.formLabel}>{getLabel("Tagline", "வார்த்தைகள்")}</label>
                    <select
                      className={styles.formInput}
                      value={PREDEFINED_TAGLINES.includes(formData.tagline) ? formData.tagline : (formData.tagline ? 'Custom' : '')}
                      onChange={(e) => {
                        if (e.target.value !== 'Custom') {
                          updateField('tagline', e.target.value);
                        } else {
                          updateField('tagline', ' ');
                        }
                      }}
                    >
                      <option value="">{getLabel("Select a tagline...", "வார்த்தைகளைத் தேர்ந்தெடுக்கவும்...")}</option>
                      {PREDEFINED_TAGLINES.map(t => (
                        <option key={t} value={t}>{getLabel(t, TAGLINE_TRANSLATIONS[t] || t)}</option>
                      ))}
                      <option value="Custom">{getLabel("Custom", "தனிப்பயன்")}</option>
                    </select>
                    {(!PREDEFINED_TAGLINES.includes(formData.tagline) && formData.tagline !== '') && (
                      <TamilInput
                        className={styles.formInput}
                        style={{ marginTop: '8px' }}
                        placeholder={getLabel("Type your custom tagline...", "உங்கள் தனிப்பயன் வார்த்தைகளைத் தட்டச்சு செய்க...")}
                        value={formData.tagline === ' ' ? '' : formData.tagline}
                        onChange={(e) => updateField('tagline', e.target.value)}
                        isTamil={formData.preferredLanguage === 'ta'}
                      />
                    )}
                  </div>

                  <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                    <label className={styles.formLabel}>{getLabel("Couple's Timeline", "காதல் பயணம்")}</label>
                    {(formData.coupleTimeline || []).map((event, i) => (
                      <div key={i} className={styles.eventCard} style={{ marginTop: '10px', marginBottom: '10px' }}>
                        <div className={styles.eventHeader}>
                          <span className={styles.eventTitle}>{getLabel("Event", "நிகழ்வு")} {i + 1}</span>
                          <button
                            className={styles.removeEventBtn}
                            onClick={() => removeTimelineEvent(i)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FiTrash2 /> {getLabel("Remove", "அகற்று")}
                          </button>
                        </div>
                        <div className={styles.formGrid} style={{ marginTop: '10px' }}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{getLabel("Date", "தேதி")}</label>
                            <input className={styles.formInput} type="date" value={event.date} onChange={(e) => updateTimelineEvent(i, 'date', e.target.value)} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{getLabel("Title", "தலைப்பு")} <span style={{color: 'red'}}>*</span></label>
                            <TamilInput className={styles.formInput} placeholder={getLabel("e.g. First Met", "உதாரணமாக: முதல் சந்திப்பு")} value={event.title} onChange={(e) => updateTimelineEvent(i, 'title', e.target.value)} isTamil={formData.preferredLanguage === 'ta'} />
                          </div>
                          <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                            <label className={styles.formLabel}>{getLabel("Description", "விளக்கம்")}</label>
                            <TamilInput isTextArea className={`${styles.formInput} ${styles.formTextarea}`} value={event.description} onChange={(e) => updateTimelineEvent(i, 'description', e.target.value)} isTamil={formData.preferredLanguage === 'ta'} />
                          </div>
                          <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                            <label className={styles.formLabel}>{getLabel("Photo Memory (Optional)", "புகைப்பட நினைவகம் (விரும்பினால்)")}</label>
                            {event.image ? (
                              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                <img src={event.image} alt="Timeline memory" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                <button
                                  className={styles.removeImageBtn}
                                  onClick={() => removeTimelineImage(i)}
                                  style={{ position: 'absolute', top: '5px', right: '5px' }}
                                >
                                  <FiX />
                                </button>
                              </div>
                            ) : (
                              <div className={styles.uploadArea}>
                                <input
                                  type="file"
                                  accept="image/jpeg, image/png, image/webp"
                                  className={styles.fileInput}
                                  onChange={(e) => handleTimelineImageUpload(i, e)}
                                  disabled={uploading}
                                />
                                <div className={styles.uploadContent}>
                                  <FiUpload className={styles.uploadIcon} />
                                  <p>{getLabel("Click to upload a photo", "புகைப்படம் பதிவேற்ற கிளிக் செய்யவும்")}</p>
                                  <span className={styles.uploadSub}>Max 5MB (JPEG, PNG, WebP)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      className={styles.addEventBtn}
                      onClick={addTimelineEvent}
                      style={{ marginTop: '10px' }}
                    >
                      <FiPlus /> {getLabel("Add Timeline Event", "காதல் பயண நிகழ்வைச் சேர்")}
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.formActions}>
                <span />
                <button
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => {
                    if (!formData.groomName || !formData.brideName || !formData.weddingDate) {
                      showToast.warning('Please fill in required fields (names and date).');
                      return;
                    }
                    if (formData.preferredLanguage === 'ta') {
                      const allText = `${formData.groomName} ${formData.brideName} ${formData.groomParents} ${formData.brideParents}`;
                      if (!validateTamilInput(allText)) {
                        showToast.warning('Please enter all text in Tamil language only (English letters found).');
                        return;
                      }
                    }
                    setStep(2);
                  }}
                >
                  Next: Events <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Wedding Events</h2>
                <p className={styles.formDesc}>
                  Add the events for your celebration. Suggested for {template.style || template.name}:{' '}
                  <span style={{ color: 'var(--color-accent)' }}>{suggestedEvents.join(', ')}</span>
                </p>

                {formData.events.map((event, i) => (
                  <div key={i} className={styles.eventCard}>
                    <div className={styles.eventHeader}>
                      <span className={styles.eventTitle}>Event {i + 1}</span>
                      {formData.events.length > 1 && (
                        <button
                          className={styles.removeEventBtn}
                          onClick={() => removeEvent(i)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FiTrash2 /> Remove
                        </button>
                      )}
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Event Name *</label>
                        <TamilInput
                          className={styles.formInput}
                          placeholder="e.g. Mehendi Ceremony"
                          value={event.name}
                          onChange={(e) => updateEvent(i, 'name', e.target.value)}
                          isTamil={formData.preferredLanguage === 'ta'}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Date *</label>
                        <input
                          type="date"
                          className={styles.formInput}
                          value={event.date}
                          onChange={(e) => updateEvent(i, 'date', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Time</label>
                        <input
                          type="time"
                          className={styles.formInput}
                          value={event.time}
                          onChange={(e) => updateEvent(i, 'time', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Venue *</label>
                        <TamilInput
                          className={styles.formInput}
                          placeholder="e.g. The Grand Palace"
                          value={event.venue}
                          onChange={(e) => updateEvent(i, 'venue', e.target.value)}
                          isTamil={formData.preferredLanguage === 'ta'}
                        />
                      </div>
                      <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                        <label className={styles.formLabel}>Venue Address</label>
                        <AddressAutocomplete
                          className={styles.formInput}
                          placeholder="Full address"
                          value={event.venueAddress}
                          onChange={(val) => {
                            updateEvent(i, 'venueAddress', val);
                            if (val && (!event.mapLink || event.mapLink.includes('google.com/maps/search/?api=1&query='))) {
                              updateEvent(i, 'mapLink', `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`);
                            } else if (!val) {
                              updateEvent(i, 'mapLink', '');
                            }
                          }}
                          onSelect={(address) => {
                            updateEvent(i, 'venueAddress', address);
                            updateEvent(i, 'mapLink', `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
                          }}
                        />
                      </div>
                      <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                        <label className={styles.formLabel}>Google Maps Link</label>
                        <input
                          className={styles.formInput}
                          placeholder="https://maps.google.com/..."
                          value={event.mapLink}
                          onChange={(e) => updateEvent(i, 'mapLink', e.target.value)}
                        />
                      </div>
                      <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                        <label className={styles.formLabel}>Alternative Map Image (Optional)</label>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>If the venue is not showing on Google Maps, upload a route map image instead.</p>
                        {event.mapImage ? (
                          <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                            <img src={event.mapImage} alt="Map Image" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            <button
                              className={styles.removeImageBtn}
                              onClick={() => updateEvent(i, 'mapImage', '')}
                              style={{ position: 'absolute', top: '5px', right: '5px' }}
                            >
                              <FiX />
                            </button>
                          </div>
                        ) : (
                          <div className={styles.uploadArea}>
                            <input
                              type="file"
                              accept="image/jpeg, image/png, image/webp"
                              className={styles.fileInput}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                  const fd = new FormData();
                                  fd.append('file', file);
                                  const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                  const data = await res.json();
                                  if (data.success) {
                                    updateEvent(i, 'mapImage', data.url);
                                    showToast.success('Map image uploaded successfully.');
                                  } else {
                                    showToast.error(`Failed to upload map: ${data.error}`);
                                  }
                                } catch (err) {
                                  showToast.error('Upload failed.');
                                } finally {
                                  setUploading(false);
                                }
                              }}
                              disabled={uploading}
                            />
                            <div className={styles.uploadContent}>
                              <FiUpload className={styles.uploadIcon} />
                              <p>Click to upload map image</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                        {(event.venueAddress || event.venue) && (
                          <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Google Map Preview</div>
                            <iframe 
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venueAddress || event.venue)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                              width="100%" 
                              height="200" 
                              style={{ border: 0, display: 'block' }}
                              allowFullScreen="" 
                              loading="lazy" 
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Muhurtham / Auspicious Time</label>
                        <input
                          className={styles.formInput}
                          placeholder="e.g., 10:15 AM - Siddha Yogam"
                          value={event.muhurtham}
                          onChange={(e) => updateEvent(i, 'muhurtham', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button className={styles.addEventBtn} onClick={addEvent} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiPlus /> Add Another Event
                </button>
              </div>
              <div className={styles.formActions}>
                <button className="btn-secondary" onClick={() => setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiArrowLeft /> Back
                </button>
                <button className="btn-primary" onClick={() => setStep(3)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Next: Photos <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Photos</h2>
                <p className={styles.formDesc}>
                  Add up to 5 photos for the &quot;Introducing the Groom &amp; Bride&quot; gallery section.
                  You can skip this step — the section will be removed from the invitation.
                </p>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(212,175,55,0.08)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiInfo /> Image Requirements
                  </div>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                    <li>Format: <strong>JPEG, PNG, or WebP</strong></li>
                    <li>Max size: <strong>5MB</strong> per image</li>
                    <li>Recommended: <strong>800×800px</strong> (square crop works best)</li>
                    <li>Max images: <strong>5</strong></li>
                  </ul>
                </div>

                {/* Thumbnails */}
                {formData.galleryImages.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {formData.galleryImages.map((url, i) => (
                      <div key={i} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', border: '2px solid rgba(255,255,255,0.1)' }}>
                        <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <button
                          onClick={() => removeImage(i)}
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'rgba(220, 50, 50, 0.9)', color: '#fff',
                            border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <FiX />
                        </button>
                        <div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.65rem', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                          {i + 1}/{formData.galleryImages.length}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {formData.galleryImages.length < 5 && (
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '1.5rem', border: '2px dashed rgba(255,255,255,0.15)',
                    borderRadius: '12px', cursor: uploading ? 'wait' : 'pointer',
                    color: 'var(--color-text-secondary)', fontSize: '0.9rem',
                    transition: 'all 0.3s', background: 'rgba(255,255,255,0.02)',
                  }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <><span className={styles.loadingSpinner} /> Uploading...</>
                    ) : (
                      <><FiUploadCloud style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }} /> Click to upload photos ({formData.galleryImages.length}/5)</>
                    )}
                  </label>
                )}

                {formData.galleryImages.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
                    No photos added. The &quot;Introducing Groom &amp; Bride&quot; section will be skipped.
                  </p>
                )}
              </div>
              <div className={styles.formActions}>
                <button className="btn-secondary" onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiArrowLeft /> Back
                </button>
                <button className="btn-primary" onClick={() => setStep(4)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Next: Preview <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Review &amp; Create</h2>
                <p className={styles.formDesc}>
                  Review your details below. You can always edit later.
                </p>

                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiHeart /> Couple
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                    <strong>{formData.groomName}</strong> &amp; <strong>{formData.brideName}</strong>
                  </p>
                  {formData.tagline && (
                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                      &quot;{formData.tagline}&quot;
                    </p>
                  )}
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                    Date: {formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    Language Mode: <strong>{formData.preferredLanguage === 'ta' ? 'Tamil Only' : formData.preferredLanguage === 'en' ? 'English Only' : 'Both English & Tamil'}</strong>
                  </p>
                </div>

                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar /> Events ({formData.events.length})
                  </h3>
                  {formData.events.map((event, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--color-bg)',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <strong>{event.name || `Event ${i + 1}`}</strong>
                      {event.venue && <span style={{ color: 'var(--color-text-muted)' }}> · {event.venue}</span>}
                      {event.date && <span style={{ color: 'var(--color-text-muted)' }}> · {event.date}</span>}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'var(--space-xl)' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiImage /> Photos ({formData.galleryImages.length})
                  </h3>
                  {formData.galleryImages.length > 0 ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {formData.galleryImages.map((url, i) => (
                        <img key={i} src={url} alt={`Photo ${i+1}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      No photos — &quot;Introducing Groom &amp; Bride&quot; section will be hidden.
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.formActions}>
                <button className="btn-secondary" onClick={() => setStep(3)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiArrowLeft /> Back
                </button>
                {paymentError && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.85rem', padding: '0.5rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FiAlertCircle /> {paymentError}
                  </div>
                )}
                <div className={styles.step4Actions}>
                  {!prePurchased && (
                    <button
                      className={styles.freePreviewBtn}
                      onClick={handleCreateFreePreview}
                      disabled={loading || paymentProcessing}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {loading ? (
                        <><span className={styles.loadingSpinner} /> Creating...</>
                      ) : (
                        <><FiClock /> Create Free Preview (60s)</>
                      )}
                    </button>
                  )}
                  <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={loading || paymentProcessing}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {loading || paymentProcessing ? (
                      <>
                        <span className={styles.loadingSpinner} /> {paymentProcessing ? 'Processing Payment...' : 'Processing...'}
                      </>
                    ) : prePurchased ? (
                      <><FiStar /> Create Invitation</>
                    ) : (
                      <><FiCreditCard /> Create &amp; Pay</>
                    )}
                  </button>
                </div>
              </div>

              {/* Info callout for free preview */}
              {!prePurchased && (
                <motion.div
                  className={styles.previewInfoCard}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={styles.previewInfoIcon}><FiInfo style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }} /></div>
                  <div className={styles.previewInfoText}>
                    <strong>Free Preview</strong> creates a 60-second self-destructing link with a watermark.
                    Choose <strong>&quot;Create &amp; Pay&quot;</strong> for permanent access with no watermark.
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Razorpay Checkout — only mounts in real Razorpay mode */}
      {razorpayOrder && !razorpayOrder.id?.startsWith('mock_') && (
        <RazorpayCheckout
          order={razorpayOrder}
          userData={user}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
}
