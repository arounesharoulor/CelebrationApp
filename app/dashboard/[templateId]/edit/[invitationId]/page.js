'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from '../../page.module.css';
import { getTemplateById } from '@/lib/data/templates';
import { useAuth } from '@/components/providers/AuthProvider';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { showToast } from '@/lib/toast';
import {
  FiCheck, FiLock, FiClock, FiShield, FiHeart, FiCalendar,
  FiUser, FiImage, FiGlobe, FiAlertCircle, FiCopy, FiExternalLink,
  FiPlus, FiTrash2, FiUploadCloud, FiUpload, FiStar, FiCheckCircle, FiInfo,
  FiArrowRight, FiArrowLeft, FiX, FiAlertTriangle
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

export default function EditInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [template, setTemplate] = useState(null);

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
    events: [],
  });

  // Fetch existing invitation data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/dashboard/${params.templateId}/edit/${params.invitationId}`);
      return;
    }
    fetchInvitation();
  }, [user, authLoading]);

  const fetchInvitation = async () => {
    try {
      const res = await fetch(`/api/invitations/${params.invitationId}`);
      if (res.status === 401) {
        router.push(`/login?redirect=/dashboard/${params.templateId}/edit/${params.invitationId}`);
        return;
      }
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to load invitation.');
        showToast.error(data.error || 'Failed to load invitation.');
        setLoading(false);
        return;
      }

      const inv = data.invitation;
      setInvitation(inv);
      setTemplate(getTemplateById(inv.templateId));

      // Check if already edited
      if (inv.editCount >= 1) {
        setError('Edit limit reached. You have already used your one-time edit. Please contact admin for further changes.');
        setLoading(false);
        return;
      }

      // Pre-fill form with existing data
      setFormData({
        groomName: inv.groomName || '',
        brideName: inv.brideName || '',
        groomParents: inv.groomParents || '',
        brideParents: inv.brideParents || '',
        groomFamily: inv.groomFamily || '',
        brideFamily: inv.brideFamily || '',
        weddingDate: inv.weddingDate || '',
        tagline: inv.tagline || '',
        coupleStory: inv.coupleStory || '',
        coupleTimeline: inv.coupleTimeline || [],
        preferredLanguage: inv.preferredLanguage || 'both',
        galleryImages: inv.galleryImages || [],
        events: inv.events && inv.events.length > 0
          ? inv.events.map(e => ({
            name: e.name || '',
            date: e.date || '',
            time: e.time || '',
            venue: e.venue || '',
            venueAddress: e.venueAddress || '',
            mapLink: e.mapLink || '',
            description: e.description || '',
            muhurtham: e.muhurtham || '',
          }))
          : [{ ...defaultEvent }],
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load invitation.');
      showToast.error('Failed to load invitation.');
      setLoading(false);
    }
  };

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

  // ─── Save edit ────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/invitations/${params.invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setInvitation(data.invitation);
        showToast.success('Invitation updated successfully!');
      } else {
        setError(data.error || 'Failed to save changes.');
        showToast.error(data.error || 'Failed to save changes.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      showToast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 4;

  // ─── LOADING STATE ────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className={`${styles.dashboard} container`}>
        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div className={styles.loadingSpinner} style={{ width: 32, height: 32, margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading your invitation...</p>
        </div>
      </div>
    );
  }

  // ─── ERROR STATE (e.g. edit limit reached) ────────────────────────────────
  if (error && !invitation) {
    return (
      <div className={`${styles.dashboard} container`}>
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 0', background: 'rgba(253,248,246,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(210,138,140,0.12)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.8rem', color: '#D28A8C' }}>CelebrationApp</Link>
          </div>
        </nav>
        <motion.div
          className={`${styles.formCard} ${styles.successCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={styles.successIcon}>
            <FiAlertCircle style={{ fontSize: '2.5rem', color: '#DC2626' }} />
          </div>
          <h2 className={styles.successTitle}>Cannot Edit</h2>
          <p className={styles.successDesc}>{error}</p>
          <div className={styles.successActions}>
            <Link href="/subscriptions" className="btn-primary">My Subscriptions</Link>
            <Link href="/" className="btn-secondary">Go Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── EDIT LIMIT REACHED (invitation loaded but editCount >= 1) ──────────
  if (invitation && invitation.editCount >= 1) {
    return (
      <div className={`${styles.dashboard} container`}>
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 0', background: 'rgba(253,248,246,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(210,138,140,0.12)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.8rem', color: '#D28A8C' }}>CelebrationApp</Link>
          </div>
        </nav>
        <motion.div
          className={`${styles.formCard} ${styles.successCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={styles.successIcon}>
            <FiLock style={{ fontSize: '2.5rem', color: 'var(--color-accent)' }} />
          </div>
          <h2 className={styles.successTitle}>Edit Limit <span className="gradient-text">Reached</span></h2>
          <p className={styles.successDesc}>
            You have already used your one-time edit for this invitation.<br />
            For any further changes, please contact our admin team.
          </p>
          <div style={{ margin: '1.5rem 0', padding: '1rem 1.5rem', background: 'rgba(210,138,140,0.06)', borderRadius: '12px', border: '1px solid rgba(210,138,140,0.15)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiInfo style={{ color: 'var(--color-accent)' }} /> Email: <strong>support@celebrationapp.in</strong><br />
              Include your invitation ID: <code style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{invitation._id}</code>
            </p>
          </div>
          <div className={styles.successActions}>
            <Link href="/subscriptions" className="btn-primary">My Subscriptions</Link>
            <a href={`/invite/${invitation.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              View Invitation <FiExternalLink />
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── SUCCESS STATE ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={`${styles.dashboard} container`}>
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 0', background: 'rgba(253,248,246,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(210,138,140,0.12)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.8rem', color: '#D28A8C' }}>CelebrationApp</Link>
          </div>
        </nav>
        <motion.div
          className={`${styles.formCard} ${styles.successCard}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.successIcon}>
            <FiCheckCircle style={{ fontSize: '2.5rem', color: '#16A34A' }} />
          </div>
          <h2 className={styles.successTitle}>
            Changes <span className="gradient-text">Saved!</span>
          </h2>
          <p className={styles.successDesc}>
            Your invitation has been updated successfully. The changes are live immediately.
          </p>
          <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', background: 'rgba(234,179,8,0.08)', borderRadius: '10px', border: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle style={{ color: '#92400e', fontSize: '1.2rem', flexShrink: 0 }} />
            <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0 }}>
              This was your one-time edit. No further edits can be made. Contact admin for additional changes.
            </p>
          </div>
          <div className={styles.successActions}>
            <a href={`/invite/${invitation.slug}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              View Updated Invitation <FiExternalLink />
            </a>
            <Link href="/subscriptions" className="btn-secondary">
              My Subscriptions
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const tpl = template || {};

  // ─── EDIT WIZARD ──────────────────────────────────────────────────────────
  return (
    <div className={`${styles.dashboard} container`}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 0', background: 'rgba(253,248,246,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(210,138,140,0.12)', boxShadow: '0 2px 20px rgba(210,138,140,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.8rem', color: '#D28A8C' }}>
            CelebrationApp
          </Link>
          <Link href="/subscriptions" style={{ fontSize: '0.85rem', color: '#D28A8C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FiUser /> {user?.username}
          </Link>
        </div>
      </nav>

      <Link href="/subscriptions" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <FiArrowLeft /> Back to Subscriptions
      </Link>

      <motion.div className={styles.header} initial="hidden" animate="visible" variants={fadeUp}>
        <div className={styles.templateLabel}>Editing · {tpl.style || tpl.name || 'Template'}</div>
        <h1 className={styles.pageTitle}>
          Edit Your <span className="gradient-text">Invitation</span>
        </h1>
        <p className={styles.pageSubtitle}>
          Update your details below. You can make changes <strong>once</strong> — make sure everything is correct before saving.
        </p>

        {/* Warning banner */}
        <div style={{ marginTop: '1rem', padding: '0.75rem 1.25rem', background: 'rgba(234,179,8,0.08)', borderRadius: '10px', border: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiAlertTriangle style={{ color: '#92400e', fontSize: '1.2rem', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: '#92400e' }}>
            <strong>One-time edit:</strong> After saving, you cannot make further changes without contacting admin.
          </span>
        </div>
      </motion.div>

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
                <p className={styles.formDesc}>Update the couple&apos;s information.</p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Groom's Name", "மணமகன் பெயர்")} <span style={{ color: 'red' }}>*</span></label>
                    <input className={styles.formInput} value={formData.groomName} onChange={(e) => updateField('groomName', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Bride's Name", "மணமகள் பெயர்")} <span style={{ color: 'red' }}>*</span></label>
                    <input className={styles.formInput} value={formData.brideName} onChange={(e) => updateField('brideName', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Groom's Parents", "மணமகன் பெற்றோர்")}</label>
                    <input className={styles.formInput} value={formData.groomParents} onChange={(e) => updateField('groomParents', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{getLabel("Bride's Parents", "மணமகள் பெற்றோர்")}</label>
                    <input className={styles.formInput} value={formData.brideParents} onChange={(e) => updateField('brideParents', e.target.value)} />
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                    <label className={styles.formLabel}>{getLabel("Wedding Date", "திருமண தேதி")} <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" className={styles.formInput} value={formData.weddingDate} onChange={(e) => updateField('weddingDate', e.target.value)} />
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
                      <input
                        className={styles.formInput}
                        style={{ marginTop: '8px' }}
                        placeholder={getLabel("Type your custom tagline...", "உங்கள் தனிப்பயன் வார்த்தைகளைத் தட்டச்சு செய்க...")}
                        value={formData.tagline === ' ' ? '' : formData.tagline}
                        onChange={(e) => updateField('tagline', e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                    <label className={styles.formLabel}>{getLabel("Couple Story", "காதல் கதை")}</label>
                    <textarea
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      placeholder={getLabel("Share your beautiful story...", "உங்கள் அழகான கதையைப் பகிரவும்...")}
                      value={formData.coupleStory}
                      onChange={(e) => updateField('coupleStory', e.target.value)}
                    />
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
                            <input className={styles.formInput} placeholder={getLabel("e.g. First Met", "உதாரணமாக: முதல் சந்திப்பு")} value={event.title} onChange={(e) => updateTimelineEvent(i, 'title', e.target.value)} />
                          </div>
                          <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                            <label className={styles.formLabel}>{getLabel("Description", "விளக்கம்")}</label>
                            <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={event.description} onChange={(e) => updateTimelineEvent(i, 'description', e.target.value)} />
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
                <Link href="/subscriptions" className="btn-secondary">Cancel</Link>
                <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => {
                  if (!formData.groomName || !formData.brideName || !formData.weddingDate) {
                    showToast.warning('Please fill in required fields.'); return;
                  }
                  setStep(2);
                }}>
                  Next: Events <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Wedding Events</h2>
                <p className={styles.formDesc}>Update your celebration events.</p>

                {formData.events.map((event, i) => (
                  <div key={i} className={styles.eventCard}>
                    <div className={styles.eventHeader}>
                      <span className={styles.eventTitle}>Event {i + 1}</span>
                      {formData.events.length > 1 && (
                        <button className={styles.removeEventBtn} onClick={() => removeEvent(i)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiTrash2 /> Remove
                        </button>
                      )}
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Event Name *</label>
                        <input className={styles.formInput} value={event.name} onChange={(e) => updateEvent(i, 'name', e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Date *</label>
                        <input type="date" className={styles.formInput} value={event.date} onChange={(e) => updateEvent(i, 'date', e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Time</label>
                        <input type="time" className={styles.formInput} value={event.time} onChange={(e) => updateEvent(i, 'time', e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Venue *</label>
                        <input className={styles.formInput} value={event.venue} onChange={(e) => updateEvent(i, 'venue', e.target.value)} />
                      </div>
                      <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                        <label className={styles.formLabel}>Venue Address</label>
                        <AddressAutocomplete
                          className={styles.formInput}
                          placeholder="Full address"
                          value={event.venueAddress}
                          onChange={(val) => {
                            updateEvent(i, 'venueAddress', val);
                            if (val) {
                              updateEvent(i, 'mapLink', `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`);
                            } else {
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
                        <input className={styles.formInput} value={event.mapLink} onChange={(e) => updateEvent(i, 'mapLink', e.target.value)} />
                        {(event.venueAddress || event.venue) && (
                          <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Map Preview</div>
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
                        <input className={styles.formInput} value={event.muhurtham} onChange={(e) => updateEvent(i, 'muhurtham', e.target.value)} />
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
                <p className={styles.formDesc}>Update your gallery photos (max 5).</p>

                {/* Existing + uploaded thumbnails */}
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
              </div>
              <div className={styles.formActions}>
                <button className="btn-secondary" onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiArrowLeft /> Back
                </button>
                <button className="btn-primary" onClick={() => setStep(4)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Next: Review <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Review Changes</h2>
                <p className={styles.formDesc}>
                  Confirm your changes. This is your <strong>one-time edit</strong> — after saving, no further edits are allowed.
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
                    <div key={i} style={{ padding: '0.75rem 1rem', background: 'var(--color-bg)', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--color-border)' }}>
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
                      No photos.
                    </p>
                  )}
                </div>
              </div>

              {/* Warning before save */}
              <div style={{ maxWidth: 700, margin: '1rem auto', padding: '0.75rem 1.25rem', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <FiAlertTriangle style={{ color: '#dc2626', fontSize: '1.2rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.6 }}>
                  <strong>Final confirmation:</strong> Once you save, this invitation cannot be edited again. Make sure all details are correct before proceeding.
                </span>
              </div>

              <div className={styles.formActions}>
                <button className="btn-secondary" onClick={() => setStep(3)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FiArrowLeft /> Back
                </button>
                {error && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.85rem', padding: '0.5rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FiAlertCircle /> {error}
                  </div>
                )}
                <button
                  className="btn-primary"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? (
                    <><span className={styles.loadingSpinner} /> Saving...</>
                  ) : (
                    <><FiCheckCircle /> Save Changes (Final)</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
