#!/usr/bin/env node

/**
 * Seed script — creates the sample invitation for Einvite Template 1
 * 
 * Usage:
 *   node scripts/seed-sample.js
 * 
 * Requires MONGODB_URI in .env
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load .env manually (no dotenv dependency needed)
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// Inline schema to avoid ESM import issues
const EventSchema = new mongoose.Schema({
  name: String,
  date: String,
  time: String,
  venue: String,
  venueAddress: String,
  mapLink: String,
  description: String,
  muhurtham: String,
});

const InvitationSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  templateId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groomName: { type: String, required: true },
  brideName: { type: String, required: true },
  groomParents: String,
  brideParents: String,
  groomFamily: String,
  brideFamily: String,
  weddingDate: { type: String, required: true },
  events: [EventSchema],
  coupleStory: String,
  tagline: String,
  heroImage: String,
  couplePhoto: String,
  galleryImages: [String],
  isPaid: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  isSample: { type: Boolean, default: false },
  freeViewedAt: Date,
  expiresAt: Date,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', InvitationSchema);

const SAMPLE_DATA = {
  slug: 'sathish-kumar-weds-priya-loganathan-mnk00gmc',
  templateId: 'einvite-1',
  groomName: 'Sathish Kumar',
  brideName: 'Priya Loganathan',
  groomParents: 'Mr. Loganathan & Mrs. Meenakshi',
  brideParents: 'Mr. Rajesh Kumar & Mrs. Lakshmi',
  weddingDate: '2026-06-15',
  tagline: 'Two souls, one beautiful journey',
  coupleStory: 'Sathish and Priya met during their college days at Anna University. What started as a friendship over shared notes in the library blossomed into a beautiful love story. After 5 years of knowing each other, they decided to embark on this beautiful journey together.',
  events: [
    {
      name: 'Haldi Ceremony',
      date: '2026-06-13',
      time: '09:00',
      venue: 'Lakshmi Mahal',
      venueAddress: '12, Temple Street, Mylapore, Chennai - 600004',
      mapLink: 'https://maps.google.com',
      muhurtham: '',
    },
    {
      name: 'Mehendi & Sangeet',
      date: '2026-06-14',
      time: '17:00',
      venue: 'Lakshmi Mahal',
      venueAddress: '12, Temple Street, Mylapore, Chennai - 600004',
      mapLink: 'https://maps.google.com',
      muhurtham: '',
    },
    {
      name: 'Wedding Ceremony',
      date: '2026-06-15',
      time: '07:30',
      venue: 'Lakshmi Mahal',
      venueAddress: '12, Temple Street, Mylapore, Chennai - 600004',
      mapLink: 'https://maps.google.com',
      muhurtham: '08:15 AM — Siddha Yogam',
    },
    {
      name: 'Reception',
      date: '2026-06-15',
      time: '18:00',
      venue: 'Lakshmi Mahal',
      venueAddress: '12, Temple Street, Mylapore, Chennai - 600004',
      mapLink: 'https://maps.google.com',
      muhurtham: '',
    },
  ],
  galleryImages: [],
  isPaid: false,
  isActive: true,
  isPublished: true,
  isSample: true,
};

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    // Upsert — update if exists, create if not
    const result = await Invitation.findOneAndUpdate(
      { slug: SAMPLE_DATA.slug },
      SAMPLE_DATA,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const tamilSampleData = {
      ...SAMPLE_DATA,
      slug: 'sathish-kumar-weds-priya-loganathan-tamil',
      templateId: 'einvite-1-ta'
    };

    const resultTa = await Invitation.findOneAndUpdate(
      { slug: tamilSampleData.slug },
      tamilSampleData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Sample invitation seeded:`);
    console.log(`   Slug: ${result.slug}`);
    console.log(`   Template: ${result.templateId}`);
    console.log(`   URL: /invite/${result.slug}`);

    console.log(`✅ Tamil Sample invitation seeded:`);
    console.log(`   Slug: ${resultTa.slug}`);
    console.log(`   Template: ${resultTa.templateId}`);
    console.log(`   URL: /invite/${resultTa.slug}`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

seed();
