// Template definitions - seed data for available templates
// Classified by event type (top-level) and style (sub-level)

export const templates = [
  {
    id: 'einvite-1',
    name: 'Temple Template',
    category: 'Marriage Events',
    style: 'Temple',
    description: 'A beautifully scrolling invitation template with traditional temple motifs, warm gold accents, and elegant Figma-sourced design.',
    thumbnail: '/assets/templates/hindu-royal-thumb.jpg',
    previewImages: [],
    price: 0,
    features: ['Figma Sourced Assets', 'Smooth Scrolling', 'Parallax', 'Add Events'],
    colors: {
      primary: '#D4AF37',
      secondary: '#1C1C1C',
      accent: '#FFD700',
      background: '#FCF9F2',
    },
    sampleSlug: 'sathish-kumar-weds-priya-loganathan-mnk00gmc',
    sampleSlug: 'sathish-kumar-weds-priya-loganathan-mnk00gmc',
  },
  {
    id: 'hindu-royal',
    name: 'Royal Temple',
    category: 'Marriage Events',
    style: 'Temple',
    description: 'A majestic temple-style wedding template with traditional motifs, warm gold accents, and elegant scroll animations. Perfect for grand celebrations.',
    thumbnail: '/assets/templates/hindu-royal-thumb.jpg',
    previewImages: [
      '/assets/templates/hindu-royal-1.jpg',
      '/assets/templates/hindu-royal-2.jpg',
    ],
    price: 0,
    features: ['Scroll Animations', 'Event Timeline', 'Gallery', 'Venue Map', 'RSVP'],
    colors: {
      primary: '#B8860B',
      secondary: '#8B0000',
      accent: '#FFD700',
      background: '#FFF8F0',
    },
    sampleSlug: null,
  },
  {
    id: 'church-elegant',
    name: 'Church Template',
    category: 'Marriage Events',
    style: 'Church',
    description: 'A sophisticated church-style wedding template with soft pastels, floral elements, and graceful typography.',
    thumbnail: '/assets/templates/christian-elegant-thumb.jpg',
    previewImages: [],
    price: 0,
    features: ['Scroll Animations', 'Event Timeline', 'Gallery', 'Church Details'],
    colors: {
      primary: '#4A6741',
      secondary: '#8B7355',
      accent: '#D4AF37',
      background: '#FAF9F6',
    },
    comingSoon: true,
    sampleSlug: null,
  },
  {
    id: 'regal-arch',
    name: 'Regal Arch Template',
    category: 'Marriage Events',
    style: 'Regal Arch',
    description: 'A regal wedding invitation with rich emerald and gold tones, intricate geometric arch patterns, and smooth animations.',
    thumbnail: '/assets/templates/muslim-regal-thumb.jpg',
    previewImages: [],
    price: 0,
    features: ['Scroll Animations', 'Event Timeline', 'Gallery', 'Venue Map'],
    colors: {
      primary: '#006400',
      secondary: '#1C1C1C',
      accent: '#FFD700',
      background: '#F5F5F0',
    },
    comingSoon: true,
    sampleSlug: null,
  },
  {
    id: 'golden-grandeur',
    name: 'Golden Grandeur Template',
    category: 'Marriage Events',
    style: 'Golden Grandeur',
    description: 'A grand wedding template celebrating vibrant traditions with festive colors, bold typography, and joyful animations.',
    thumbnail: '/assets/templates/sikh-grandeur-thumb.jpg',
    previewImages: [],
    price: 0,
    features: ['Scroll Animations', 'Event Timeline', 'Gallery', 'Venue Map'],
    colors: {
      primary: '#FF8C00',
      secondary: '#4169E1',
      accent: '#FFD700',
      background: '#FFFAF0',
    },
    comingSoon: true,
    sampleSlug: null,
  },
  {
    id: 'classic-mandapam',
    name: 'Classic Mandapam Template',
    category: 'Marriage Events',
    style: 'Classic Mandapam',
    description: 'A traditional mandapam-style wedding template with temple motifs, silk-inspired colors, and divine aesthetics.',
    thumbnail: '/assets/templates/south-indian-thumb.jpg',
    previewImages: [],
    price: 0,
    features: ['Scroll Animations', 'Event Timeline', 'Gallery', 'Venue Map'],
    colors: {
      primary: '#8B0000',
      secondary: '#DAA520',
      accent: '#FF6347',
      background: '#FFF5EE',
    },
    comingSoon: true,
    sampleSlug: null,
  },
];

// Top-level event categories
export const categories = [
  'All',
  'Marriage Events',
  'Birthday Celebrations',
  'Corporate Events',
];

// Template styles within each category (for sub-filtering)
export const stylesByCategory = {
  'Marriage Events': ['Temple', 'Church', 'Regal Arch', 'Golden Grandeur', 'Classic Mandapam'],
  'Birthday Celebrations': [],
  'Corporate Events': [],
};

export function getTemplateById(id) {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category) {
  if (category === 'All') return templates;
  return templates.filter(t => t.category === category);
}

export function getTemplatesByStyle(style) {
  return templates.filter(t => t.style === style);
}
