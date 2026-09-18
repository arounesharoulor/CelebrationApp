import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String },
  time: { type: String },
  venue: { type: String },
  venueAddress: { type: String },
  mapLink: { type: String },
  description: { type: String },
  muhurtham: { type: String },
});

const TimelineEventSchema = new mongoose.Schema({
  date: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String }
});

const InvitationSchema = new mongoose.Schema({
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
  },
  templateId: { type: String, required: true },
  
  // Owner
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Couple Details
  groomName: { type: String, required: true },
  brideName: { type: String, required: true },
  groomParents: { type: String },
  brideParents: { type: String },
  groomFamily: { type: String },
  brideFamily: { type: String },
  
  // Wedding Details
  weddingDate: { type: String, required: true },
  
  // Events
  events: [EventSchema],
  
  // Story & Language
  coupleStory: { type: String },
  coupleTimeline: [TimelineEventSchema],
  tagline: { type: String },
  preferredLanguage: { type: String, default: 'both' },
  
  // Media
  heroImage: { type: String },
  couplePhoto: { type: String },
  galleryImages: [{ type: String }],
  
  // Payment & Status
  isPaid: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  isSample: { type: Boolean, default: false },  // sample invitations are permanent & read-only
  freeViewedAt: { type: Date },       // when first free preview was opened
  expiresAt: { type: Date },          // freeViewedAt + 60s for unpaid
  paidAt: { type: Date },
  paidExpiresAt: { type: Date },      // paidAt + 20 days: when guest view actively expires
  deletionAt: { type: Date, index: { expires: '0s' } }, // paidAt + 24 days: automatically runs database hard-delete
  
  // Edit tracking — paid users get exactly 1 edit after creation
  editCount: { type: Number, default: 0 },
  lastEditedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

InvitationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Invitation || mongoose.model('Invitation', InvitationSchema);
